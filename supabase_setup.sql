-- ============================================================
-- Aul ChatApp (WhatsApp Clone) — Complete Supabase Setup
-- ============================================================
-- Run this entire script in Supabase Dashboard → SQL Editor.
-- After running, verify Realtime is enabled on:
--   profiles, conversations, messages, stories
-- ============================================================

-- ─── 1. PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  about TEXT DEFAULT 'Hey there! I am New User',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ─── 2. CONVERSATIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see conversations they are a member of
CREATE POLICY "Members can view conversations"
  ON conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
      AND conversation_members.is_admin = true
    )
  );

CREATE POLICY "Group admins can delete conversations"
  ON conversations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
      AND conversation_members.is_admin = true
    )
  );

-- ─── 3. CONVERSATION MEMBERS ───────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view conversation members"
  ON conversation_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert members"
  ON conversation_members FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can remove members"
  ON conversation_members FOR DELETE TO authenticated
  USING (
    -- User can remove themselves (leave) or admins can remove others
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.is_admin = true
    )
  );

-- ─── 4. MESSAGES ────────────────────────────────────────────
-- Drop old messages table if it exists from previous setup
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  media_url TEXT,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages in their conversations"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages to their conversations"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ─── 5. MESSAGE READS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reads for messages in their conversations"
  ON message_reads FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_reads.message_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_reads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─── 6. STORIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view non-expired stories"
  ON stories FOR SELECT TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can create own stories"
  ON stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ─── 7. STORY VIEWS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS story_views (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story owners can view who viewed their stories"
  ON story_views FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_views.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can record story views"
  ON story_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- ─── 8. HELPER FUNCTION: Update conversation updated_at ─────
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ─── 9. ENABLE REALTIME ─────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;

-- ─── 10. DROP OLD USERS TABLE IF MIGRATING ──────────────────
-- The old 'users' table from the previous app version is no longer needed.
-- Uncomment the line below ONLY if you want to drop it:
-- DROP TABLE IF EXISTS users;
