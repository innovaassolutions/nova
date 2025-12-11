-- Migration: Role-Based RLS for Contacts
-- Description: Enforce proper access control - admins see all, non-admins see only assigned
-- Date: 2025-12-11
--
-- ROLLBACK (if needed):
-- DROP POLICY "contacts_admin_all_access" ON contacts;
-- DROP POLICY "contacts_user_assigned_access" ON contacts;
-- DROP FUNCTION IF EXISTS is_admin();
-- CREATE POLICY "authenticated_users_all_access" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 1: Helper Function to Check Admin Role
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 2: Drop Existing Permissive Policy
-- ============================================================================

DROP POLICY IF EXISTS "authenticated_users_all_access" ON contacts;

-- ============================================================================
-- SECTION 3: Create Role-Based Policies
-- ============================================================================

-- Policy 1: Admin users can see/modify ALL contacts
CREATE POLICY "contacts_admin_all_access" ON contacts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 2: Non-admin users can see/modify ONLY their assigned contacts
CREATE POLICY "contacts_user_assigned_access" ON contacts
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Summary of changes:
-- - Created is_admin() helper function
-- - Dropped permissive "authenticated_users_all_access" policy on contacts
-- - Created "contacts_admin_all_access" policy (admins see all contacts)
-- - Created "contacts_user_assigned_access" policy (users see only assigned contacts)
--
-- Security Impact:
-- - Admin users (role='admin'): Full access to all contacts
-- - Non-admin users: Can only access contacts where owner_id = their user ID
-- - Unassigned contacts (owner_id IS NULL): Only visible to admins
