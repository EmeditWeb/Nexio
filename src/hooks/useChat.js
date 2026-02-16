import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useChat — messages for a single conversation.
 * Handles fetching history, Realtime subscription, sending (text + image + replies),
 * optimistic updates, delete, and read receipts.
 *
 * @param {string|null} conversationId
 * @param {string|null} userId - current user ID
 */
export function useChat(conversationId, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // ── Fetch message history ─────────────────────────────────
  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    let cancelled = false;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('messages')
        .select(`
          *,
          reply_message:reply_to (
            id, content, user_id, message_type
          ),
          sender:user_id (
            id, username, display_name, avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (cancelled) return;

      if (fetchErr) {
        setError('Failed to load messages');
        console.error(fetchErr);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [conversationId]);

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        // Fetch the full message with sender profile
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
            // Deduplicate (optimistic update may already have it)
            const filtered = prev.filter(m => m.id !== fullMsg.id && m.id !== payload.new.id);
            return [...filtered, fullMsg];
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
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
      sender: null, // will be filled by Realtime
      reply_message: null,
      _optimistic: true,
    };

    setMessages(prev => [...prev, optimistic]);

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
    // "Delete for me" just removes from local state
    setMessages(prev => forEveryone
      ? prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: '' } : m)
      : prev.filter(m => m.id !== messageId)
    );
  }, [userId]);

  // ── Mark messages as read ─────────────────────────────────
  const markAsRead = useCallback(async (messageIds) => {
    if (!userId || !messageIds.length) return;

    const reads = messageIds.map(id => ({
      message_id: id,
      user_id: userId,
    }));

    await supabase.from('message_reads').upsert(reads, { onConflict: 'message_id,user_id' });
  }, [userId]);

  return { messages, loading, error, sendMessage, sendImage, deleteMessage, markAsRead };
}
