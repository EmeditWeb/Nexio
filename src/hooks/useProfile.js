import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useProfile — manage user profiles (setup, update, search).
 * @param {string|null} userId - The user ID to load profile for
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch profile on mount ────────────────────────────────
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!cancelled) {
        setProfile(data || null);
        setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [userId]);

  // ── First-time profile setup ──────────────────────────────
  const setupProfile = useCallback(async ({ username, displayName, avatarFile, about }) => {
    if (!userId) return { error: 'Not authenticated' };

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existing) return { error: 'Username already taken' };

    let avatarUrl = null;

    // Upload avatar if provided
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${userId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('profile-images')
        .upload(path, avatarFile, { upsert: true });
      if (upErr) return { error: upErr.message };

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(path);
      avatarUrl = publicUrl;
    }

    const profileData = {
      id: userId,
      username: username.toLowerCase(),
      display_name: displayName,
      avatar_url: avatarUrl,
      about: about || 'Hey there! I am using Nexio',
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) return { error: error.message };
    setProfile(data);
    return { data };
  }, [userId]);

  // ── Update profile ────────────────────────────────────────
  const updateProfile = useCallback(async (fields) => {
    if (!userId) return { error: 'Not authenticated' };

    // Handle avatar upload if a file is provided
    if (fields.avatarFile) {
      const ext = fields.avatarFile.name.split('.').pop();
      const path = `${userId}.${ext}`;
      await supabase.storage
        .from('profile-images')
        .upload(path, fields.avatarFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(path);
      fields.avatar_url = publicUrl;
      delete fields.avatarFile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId)
      .select()
      .single();

    if (error) return { error: error.message };
    setProfile(data);
    return { data };
  }, [userId]);

  // ── Search users by username ──────────────────────────────
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) return [];
    const searchTerm = query.toLowerCase().replace('@', '');

    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_online')
      .ilike('username', `%${searchTerm}%`)
      .neq('id', userId)
      .limit(20);

    return data || [];
  }, [userId]);

  // ── Get a specific user profile ───────────────────────────
  const getUserProfile = useCallback(async (targetId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();
    return data;
  }, []);

  return { profile, loading, setupProfile, updateProfile, searchUsers, getUserProfile };
}
