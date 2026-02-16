import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * usePresence — online/offline status, typing indicators, last seen.
 * Uses Supabase Realtime Presence for ephemeral state (typing),
 * and database updates for persistent state (online, last_seen).
 *
 * @param {string|null} userId - current user ID
 * @param {string|null} conversationId - active conversation (for typing)
 */
export function usePresence(userId, conversationId = null) {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState({});
    const heartbeatRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ── Go online + heartbeat ─────────────────────────────────
    useEffect(() => {
        if (!userId) return;

        const goOnline = async () => {
            await supabase.from('profiles').update({
                is_online: true,
                last_seen: new Date().toISOString(),
            }).eq('id', userId);
        };

        goOnline();

        // Heartbeat every 30s to keep online status fresh
        heartbeatRef.current = setInterval(goOnline, 30000);

        // Go offline on unmount
        return () => {
            clearInterval(heartbeatRef.current);
            supabase.from('profiles').update({
                is_online: false,
                last_seen: new Date().toISOString(),
            }).eq('id', userId);
        };
    }, [userId]);

    // ── Listen for profile online status changes ──────────────
    useEffect(() => {
        if (!userId) return;

        // Fetch initial online users
        const fetchOnline = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('is_online', true);
            if (data) setOnlineUsers(new Set(data.map(p => p.id)));
        };
        fetchOnline();

        const channel = supabase
            .channel('online-presence')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
            }, (payload) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    if (payload.new.is_online) {
                        next.add(payload.new.id);
                    } else {
                        next.delete(payload.new.id);
                    }
                    return next;
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // ── Typing indicator via Realtime Broadcast ───────────────
    useEffect(() => {
        if (!conversationId || !userId) return;

        const channel = supabase
            .channel(`typing:${conversationId}`)
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { userId: typerId, isTyping } = payload.payload;
                if (typerId === userId) return; // ignore own typing

                setTypingUsers(prev => {
                    const next = { ...prev };
                    if (!next[conversationId]) next[conversationId] = new Set();
                    else next[conversationId] = new Set(next[conversationId]);

                    if (isTyping) {
                        next[conversationId].add(typerId);
                    } else {
                        next[conversationId].delete(typerId);
                    }
                    return next;
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationId, userId]);

    // ── Send typing state ─────────────────────────────────────
    const setTyping = useCallback((convId, isTyping) => {
        if (!userId || !convId) return;

        supabase.channel(`typing:${convId}`).send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, isTyping },
        });

        // Auto-stop typing after 3s
        if (isTyping) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                supabase.channel(`typing:${convId}`).send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId, isTyping: false },
                });
            }, 3000);
        }
    }, [userId]);

    const isUserOnline = useCallback((uid) => onlineUsers.has(uid), [onlineUsers]);

    const getTypingInConversation = useCallback((convId) => {
        const set = typingUsers[convId];
        return set ? Array.from(set) : [];
    }, [typingUsers]);

    return { onlineUsers, isUserOnline, typingUsers, getTypingInConversation, setTyping };
}
