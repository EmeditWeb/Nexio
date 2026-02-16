import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { MESSAGES_PER_PAGE } from '../utils/constants';

/**
 * useChat — messages for a single conversation.
 * Now with pagination (50 msgs at a time), optimistic updates, and better error handling.
 */
export function useChat(conversationId, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const channelRef = useRef(null);
  const oldestRef = useRef(null);

  // ── Fetch initial messages (latest page) ──────────────────
  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); setHasMore(true); return; }
    let cancelled = false;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      setHasMore(true);
      oldestRef.current = null;

      const { data, error: fetchErr } = await supabase
        .from('messages')
        .select(`
          *,
          reply_message:reply_to ( id, content, user_id, message_type ),
          sender:user_id ( id, username, display_name, avatar_url )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (cancelled) return;

      if (fetchErr) {
        setError('Failed to load messages');
        console.error(fetchErr);
      } else {
        const sorted = (data || []).reverse();
        setMessages(sorted);
        setHasMore((data || []).length >= MESSAGES_PER_PAGE);
        if (sorted.length > 0) {
          oldestRef.current = sorted[0].created_at;
        }
      }
      setLoading(false);
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [conversationId]);

  // ── Load older messages (pagination) ──────────────────────
  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMore || !oldestRef.current) return;

    setLoadingMore(true);

    const { data, error: fetchErr } = await supabase
      .from('messages')
      .select(`
        *,
        reply_message:reply_to ( id, content, user_id, message_type ),
        sender:user_id ( id, username, display_name, avatar_url )
      `)
      .eq('conversation_id', conversationId)
      .lt('created_at', oldestRef.current)
      .order('created_at', { ascending: false })
      .limit(MESSAGES_PER_PAGE);

    if (fetchErr) {
      console.error(fetchErr);
    } else {
      const older = (data || []).reverse();
      if (older.length > 0) {
        oldestRef.current = older[0].created_at;
        setMessages(prev => [...older, ...prev]);
      }
      setHasMore((data || []).length >= MESSAGES_PER_PAGE);
    }
    setLoadingMore(false);
  }, [conversationId, hasMore, loadingMore]);

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const { data: fullMsg } = await supabase
          .from('messages')
          .select(`
            *,
            reply_message:reply_to ( id, content, user_id, message_type ),
            sender:user_id ( id, username, display_name, avatar_url )
          `)
          .eq('id', payload.new.id)
          .single();

        if (fullMsg) {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== fullMsg.id && m.id !== payload.new.id);
            return [...filtered, fullMsg];
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.map(m =>
          m.id === payload.new.id ? { ...m, ...payload.new } : m
        ));
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback(async (content, type = 'text', mediaUrl = null, replyToId = null) => {
    if (!conversationId || !userId) return;
    if (type === 'text' && (!content || !content.trim())) return;

    const optimistic = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: userId,
      content: content?.trim() || '',
      message_type: type,
      media_url: mediaUrl,
      reply_to: replyToId,
      is_deleted: false,
      created_at: new Date().toISOString(),
      sender: null,
      reply_message: null,
      _optimistic: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setSending(true);

    const { error: insertErr } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: userId,
      content: content?.trim() || '',
      message_type: type,
      media_url: mediaUrl,
      reply_to: replyToId,
    });

    if (insertErr) {
      console.error('Failed to send:', insertErr);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setError('Failed to send message');
    }
    setSending(false);
  }, [conversationId, userId]);

  // ── Upload and send image ─────────────────────────────────
  const sendImage = useCallback(async (file, replyToId = null) => {
    if (!conversationId || !userId || !file) return;

    const ext = file.name.split('.').pop();
    const path = `messages/${conversationId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('chat-media')
      .upload(path, file);

    if (upErr) { setError('Failed to upload image'); return; }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    await sendMessage('', 'image', publicUrl, replyToId);
  }, [conversationId, userId, sendMessage]);

  // ── Delete message ────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId, forEveryone = false) => {
    if (forEveryone) {
      await supabase.from('messages')
        .update({ is_deleted: true, content: '' })
        .eq('id', messageId)
        .eq('user_id', userId);
    }
    setMessages(prev => forEveryone
      ? prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: '' } : m)
      : prev.filter(m => m.id !== messageId)
    );
  }, [userId]);

  // ── Mark messages as read ─────────────────────────────────
  const markAsRead = useCallback(async (messageIds) => {
    if (!userId || !messageIds.length) return;
    const reads = messageIds.map(id => ({ message_id: id, user_id: userId }));
    await supabase.from('message_reads').upsert(reads, { onConflict: 'message_id,user_id' });
  }, [userId]);

  return {
    messages, loading, loadingMore, hasMore, error, sending,
    sendMessage, sendImage, deleteMessage, markAsRead, loadMore,
  };
}
