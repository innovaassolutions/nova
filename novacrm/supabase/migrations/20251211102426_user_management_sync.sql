-- Migration: User Management & Auth Sync
-- Story 1.7: User Management & Team Onboarding
-- Dependencies: auth.users (Supabase system table), public.users (Story 1.2)
-- Purpose: Auto-sync auth.users to public.users and backfill existing users

-- ============================================================
-- SECTION 1: Backfill Existing Users
-- ============================================================

-- Sync all existing auth.users to public.users
-- This resolves the foreign key constraint error for deals.owner_id
INSERT INTO public.users (id, email, name, role, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as name,
  COALESCE(raw_user_meta_data->>'role', 'sales_rep') as role,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: Create Auto-Sync Trigger
-- ============================================================

-- Function: Sync new auth users to public.users
-- This trigger automatically creates public.users records when Supabase Auth creates users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'sales_rep'),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute on auth user creation
-- Fires automatically when admin invites user via Supabase Admin API
-- Drop existing trigger if it exists (idempotent migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 3: Verify Sync
-- ============================================================

-- Check that all auth users now exist in public.users
-- Expected: 0 rows returned (all users synced)
-- If rows returned, indicates users that failed to sync
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
