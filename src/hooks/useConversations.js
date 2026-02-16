import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useConversations — list, create, update, delete conversations.
 * Subscribes to Realtime for new conversations and updates.
 * @param {string|null} userId - current user ID
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all conversations with last message + unread count ──
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    // Get all conversation IDs the user is a member of
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

    // Fetch conversations with their members' profiles
    const { data: convos } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_members (
          user_id,
          is_admin,
          profiles:user_id ( id, username, display_name, avatar_url, is_online, last_seen )
        )
      `)
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (!convos) { setConversations([]); setLoading(false); return; }

    // Fetch last message for each conversation
    const enriched = await Promise.all(convos.map(async (conv) => {
      // Last message
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, content, message_type, created_at, user_id, is_deleted')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMessage = msgs?.[0] || null;

      // Unread count: messages after the user's last read in this conversation
      const { data: lastRead } = await supabase
        .from('message_reads')
        .select('read_at')
        .eq('user_id', userId)
        .in('message_id', (await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conv.id)
        ).data?.map(m => m.id) || [])
        .order('read_at', { ascending: false })
        .limit(1);

      const lastReadAt = lastRead?.[0]?.read_at || '1970-01-01';

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('user_id', userId)
        .gt('created_at', lastReadAt);

      // For DMs, get the other user's profile
      let dmPartner = null;
      if (conv.type === 'direct') {
        const otherMember = conv.conversation_members?.find(m => m.user_id !== userId);
        dmPartner = otherMember?.profiles || null;
      }

      const membership = memberships.find(m => m.conversation_id === conv.id);

      return {
        ...conv,
        lastMessage,
        unreadCount: count || 0,
        dmPartner,
        isAdmin: membership?.is_admin || false,
        memberCount: conv.conversation_members?.length || 0,
      };
    }));

    setConversations(enriched);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Realtime: refresh on conversation changes ─────────────
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
    // Check if DM already exists
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
        if (conv) return conv; // existing DM found
      }
    }

    // Create new DM
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: userId })
      .select()
      .single();

    if (error) return null;

    // Add both members
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
      .insert({
        type: 'group',
        name,
        description,
        avatar_url: avatarUrl,
        created_by: userId,
      })
      .select()
      .single();

    if (error) return null;

    // Add creator as admin + all members
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

  // ── Add / Remove members ──────────────────────────────────
  const addMember = useCallback(async (convId, memberId) => {
    await supabase.from('conversation_members')
      .insert({ conversation_id: convId, user_id: memberId });
    await fetchConversations();
  }, [fetchConversations]);

  const removeMember = useCallback(async (convId, memberId) => {
    await supabase.from('conversation_members')
      .delete()
      .eq('conversation_id', convId)
      .eq('user_id', memberId);
    await fetchConversations();
  }, [fetchConversations]);

  const leaveGroup = useCallback(async (convId) => {
    await supabase.from('conversation_members')
      .delete()
      .eq('conversation_id', convId)
      .eq('user_id', userId);
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
