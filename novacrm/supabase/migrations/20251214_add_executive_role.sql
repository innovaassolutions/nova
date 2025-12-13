-- Migration: add_executive_role
-- Description: Add 'executive' role support to users table with CHECK constraint
-- Story: 6.5 - Executive Read-Only Dashboard View
-- Date: 2025-12-14
--
-- This migration adds validation for user roles including the new 'executive' role
-- which provides read-only access to the dashboard and pipeline data.
--
-- Valid roles:
-- - 'sales_rep': Regular sales team member (full CRUD access)
-- - 'admin': Administrator (full access + user management)
-- - 'executive': Read-only dashboard access (no CRUD operations)
--
-- ROLLBACK (if needed):
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add CHECK constraint to validate role values
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('sales_rep', 'admin', 'executive'));

-- Update any existing NULL roles to 'sales_rep' (should not exist, but defensive)
UPDATE users
SET role = 'sales_rep'
WHERE role IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Summary of changes:
-- - Added CHECK constraint to users.role column
-- - Valid roles: 'sales_rep', 'admin', 'executive'
-- - Existing records validated (NULL → 'sales_rep' if any)
--
-- Usage:
-- - Set user role to 'executive' for read-only dashboard access:
--   UPDATE users SET role = 'executive' WHERE id = '<user_id>';
--
-- Next Steps:
-- - Implement UI conditional rendering based on user.role
-- - Add middleware checks for executive role restrictions
-- - Create Executive Insights dashboard component
