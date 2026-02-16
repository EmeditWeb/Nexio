import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useStories — create, list, view, and manage stories.
 * Stories expire after 24 hours (enforced by DB + client filter).
 *
 * @param {string|null} userId - current user ID
 */
export function useStories(userId) {
  const [stories, setStories] = useState([]); // grouped by user
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all non-expired stories, grouped by user ────────
  const fetchStories = useCallback(async () => {
    const { data } = await supabase
      .from('stories')
      .select(`
        *,
        author:user_id ( id, username, display_name, avatar_url ),
        story_views ( viewer_id, viewed_at )
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (data) {
      // Group by user
      const grouped = {};
      data.forEach(story => {
        const uid = story.user_id;
        if (!grouped[uid]) {
          grouped[uid] = {
            user: story.author,
            stories: [],
            hasUnviewed: false,
          };
        }
        grouped[uid].stories.push(story);
        // Check if current user hasn't viewed this story
        if (userId && !story.story_views?.some(v => v.viewer_id === userId)) {
          grouped[uid].hasUnviewed = true;
        }
      });

      // Put current user's stories first
      const sorted = Object.values(grouped).sort((a, b) => {
        if (a.user.id === userId) return -1;
        if (b.user.id === userId) return 1;
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return 0;
      });

      setStories(sorted);
      setMyStories(grouped[userId]?.stories || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // ── Realtime: new stories ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('stories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' },
        () => fetchStories()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStories]);

  // ── Create story ──────────────────────────────────────────
  const createStory = useCallback(async (content, mediaFile = null) => {
    if (!userId) return;

    let mediaUrl = null;
    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop();
      const path = `stories/${userId}/${Date.now()}.${ext}`;
      await supabase.storage.from('story-media').upload(path, mediaFile);
      const { data: { publicUrl } } = supabase.storage.from('story-media').getPublicUrl(path);
      mediaUrl = publicUrl;
    }

    await supabase.from('stories').insert({
      user_id: userId,
      content: content || '',
      media_url: mediaUrl,
    });

    await fetchStories();
  }, [userId, fetchStories]);

  // ── View story ────────────────────────────────────────────
  const viewStory = useCallback(async (storyId) => {
    if (!userId) return;
    await supabase.from('story_views').upsert({
      story_id: storyId,
      viewer_id: userId,
    }, { onConflict: 'story_id,viewer_id' });
  }, [userId]);

  // ── Delete own story ──────────────────────────────────────
  const deleteStory = useCallback(async (storyId) => {
    await supabase.from('stories').delete().eq('id', storyId).eq('user_id', userId);
    await fetchStories();
  }, [userId, fetchStories]);

  return { stories, myStories, loading, createStory, viewStory, deleteStory };
}
