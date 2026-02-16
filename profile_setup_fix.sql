-- ════════════════════════════════════════════════════════════════
-- Nexio — Profile Setup Fixes
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- 1. Add is_profile_complete column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- 2. Backfill existing profiles
-- Mark profiles as complete if they have a valid username and display_name
UPDATE profiles 
SET is_profile_complete = true 
WHERE username IS NOT NULL 
  AND display_name IS NOT NULL 
  AND LENGTH(username) >= 3;

-- 3. Verification (Optional)
-- select count(*) from profiles where is_profile_complete = true;
