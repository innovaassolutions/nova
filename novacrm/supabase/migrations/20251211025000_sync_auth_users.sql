-- Migration: Sync Supabase Auth Users to Public Users Table
-- Purpose: Automatically sync auth.users to public.users to support foreign key constraints
-- Fixes: deals_owner_id_fkey constraint violation when creating deals

-- ============================================================================
-- FUNCTION: Handle New User Signup
-- ============================================================================
-- This function is triggered when a new user signs up via Supabase Auth
-- It creates a corresponding record in public.users table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'sales_rep',
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Sync Auth Users on Signup
-- ============================================================================
-- Automatically creates a public.users record when someone signs up

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- BACKFILL: Sync Existing Auth Users
-- ============================================================================
-- Add any existing auth users to the public.users table

INSERT INTO public.users (id, email, name, role, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'sales_rep',
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
