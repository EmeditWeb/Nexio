import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useConversations — list, create, update, delete conversations.
 * Optimized: eliminated N+1 queries by batching last-message and unread-count fetches.
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all conversations with enrichment ───────────────
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: memberships } = await supabase
        .from('conversation_members')
        .select('conversation_id, is_admin')
        .eq('user_id', userId);

      if (!memberships || memberships.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = memberships.map(m => m.conversation_id);

      // Fetch conversations with member profiles
      const { data: convos } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_members (
            user_id, is_admin,
            profiles:user_id ( id, username, display_name, avatar_url, is_online, last_seen )
          )
        `)
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      if (!convos) { setConversations([]); setLoading(false); return; }

      // Batch: fetch last message for all conversations at once
      // We fetch recent messages and group them client-side
      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('id, conversation_id, content, message_type, created_at, user_id, is_deleted')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      // Group last messages by conversation
      const lastMsgMap = {};
      (recentMsgs || []).forEach(msg => {
        if (!lastMsgMap[msg.conversation_id]) {
          lastMsgMap[msg.conversation_id] = msg;
        }
      });

      // Batch: get user's read status
      const { data: userReads } = await supabase
        .from('message_reads')
        .select('message_id, read_at')
        .eq('user_id', userId);

      const readMsgIds = new Set((userReads || []).map(r => r.message_id));

      // Enrich conversations
      const enriched = convos.map(conv => {
        const lastMessage = lastMsgMap[conv.id] || null;

        // Count unread: messages from others that aren't read
        const convMsgs = (recentMsgs || []).filter(m =>
          m.conversation_id === conv.id && m.user_id !== userId
        );
        const unreadCount = convMsgs.filter(m => !readMsgIds.has(m.id)).length;

        // DM partner
        let dmPartner = null;
        if (conv.type === 'direct') {
          const otherMember = conv.conversation_members?.find(m => m.user_id !== userId);
          dmPartner = otherMember?.profiles || null;
        }

        const membership = memberships.find(m => m.conversation_id === conv.id);

        return {
          ...conv,
          lastMessage,
          unreadCount: Math.min(unreadCount, 99),
          dmPartner,
          isAdmin: membership?.is_admin || false,
          memberCount: conv.conversation_members?.length || 0,
        };
      });

      setConversations(enriched);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Realtime: refresh on changes ──────────────────────────
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchConversations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchConversations]);

  // ── Create DM ─────────────────────────────────────────────
  const createDM = useCallback(async (otherUserId) => {
    const { data: myConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId);

    const { data: theirConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', otherUserId);

    if (myConvs && theirConvs) {
      const myIds = new Set(myConvs.map(c => c.conversation_id));
      const common = theirConvs.filter(c => myIds.has(c.conversation_id));

      for (const c of common) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', c.conversation_id)
          .eq('type', 'direct')
          .single();
        if (conv) return conv;
      }
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: userId })
      .select()
      .single();

    if (error) return null;

    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: userId, is_admin: false },
      { conversation_id: conv.id, user_id: otherUserId, is_admin: false },
    ]);

    await fetchConversations();
    return conv;
  }, [userId, fetchConversations]);

  // ── Create Group ──────────────────────────────────────────
  const createGroup = useCallback(async ({ name, description, avatarFile, memberIds }) => {
    let avatarUrl = null;

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `groups/${Date.now()}.${ext}`;
      await supabase.storage.from('profile-images').upload(path, avatarFile);
      const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path);
      avatarUrl = publicUrl;
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'group', name, description, avatar_url: avatarUrl, created_by: userId })
      .select()
      .single();

    if (error) return null;

    const members = [
      { conversation_id: conv.id, user_id: userId, is_admin: true },
      ...memberIds.map(id => ({ conversation_id: conv.id, user_id: id, is_admin: false })),
    ];

    await supabase.from('conversation_members').insert(members);
    await fetchConversations();
    return conv;
  }, [userId, fetchConversations]);

  // ── Update Group ──────────────────────────────────────────
  const updateGroup = useCallback(async (convId, fields) => {
    if (fields.avatarFile) {
      const ext = fields.avatarFile.name.split('.').pop();
      const path = `groups/${convId}.${ext}`;
      await supabase.storage.from('profile-images').upload(path, fields.avatarFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path);
      fields.avatar_url = publicUrl;
      delete fields.avatarFile;
    }

    await supabase.from('conversations').update(fields).eq('id', convId);
    await fetchConversations();
  }, [fetchConversations]);

  // ── Member management ─────────────────────────────────────
  const addMember = useCallback(async (convId, memberId) => {
    await supabase.from('conversation_members').insert({ conversation_id: convId, user_id: memberId });
    await fetchConversations();
  }, [fetchConversations]);

  const removeMember = useCallback(async (convId, memberId) => {
    await supabase.from('conversation_members').delete()
      .eq('conversation_id', convId).eq('user_id', memberId);
    await fetchConversations();
  }, [fetchConversations]);

  const leaveGroup = useCallback(async (convId) => {
    await supabase.from('conversation_members').delete()
      .eq('conversation_id', convId).eq('user_id', userId);
    await fetchConversations();
  }, [userId, fetchConversations]);

  const deleteGroup = useCallback(async (convId) => {
    await supabase.from('conversations').delete().eq('id', convId);
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations, loading,
    createDM, createGroup, updateGroup,
    addMember, removeMember, leaveGroup, deleteGroup,
    refresh: fetchConversations,
  };
}
