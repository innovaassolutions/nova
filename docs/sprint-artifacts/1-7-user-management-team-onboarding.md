# Story 1.7: User Management & Team Onboarding

Status: Ready for Development

## Story

As an admin user,
I want to invite team members to NovaCRM and manage their accounts,
so that the sales team can securely access the system with proper role assignments and our public.users table stays in sync with Supabase auth.users.

## Acceptance Criteria

**AC1: Create Database Trigger for Auth User Sync**
**Given** I need to sync Supabase auth.users to public.users automatically [Source: Architecture §3.1, Story 1.2]
**When** I create the user sync trigger
**Then** the following trigger function and trigger are created:

```sql
-- Function to sync newly created auth users to public.users
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

-- Trigger to execute on new auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Technical specifications:**
- `SECURITY DEFINER`: Executes with privileges of function creator (bypasses RLS for system operations)
- `COALESCE` fallbacks: Use email as name if full_name not provided, default role to 'sales_rep'
- `ON CONFLICT` clause: Update email/name if user already exists in public.users (handles edge cases)
- `raw_user_meta_data`: Supabase stores user metadata as JSONB during invitation
- Trigger fires AFTER INSERT to ensure auth.users record is committed first

**User metadata structure during invitation:**
```typescript
{
  full_name: string,  // Required during invitation
  role: 'admin' | 'sales_rep' | 'executive'  // Set by admin inviting user
}
```

**AC2: Backfill Existing Auth Users**
**Given** the trigger is created but existing auth.users don't exist in public.users [Source: Root cause of foreign key error]
**When** I run the backfill migration
**Then** sync all existing auth users to public.users:

```sql
-- One-time backfill of existing auth users to public.users
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
```

**Backfill purpose:**
- Resolves immediate foreign key constraint error (deals.owner_id references missing users)
- Creates public.users records for all existing auth.users
- Idempotent: Can be run multiple times safely (ON CONFLICT DO NOTHING)

**AC3: Create Admin Settings Page Structure**
**Given** I need a centralized admin configuration area [Source: FR11.4 Admin Settings]
**When** I create the Admin Settings page
**Then** implement the following structure:

**File:** `app/(dashboard)/settings/page.tsx`

**Page layout:**
```typescript
// Tab structure (TailwindCSS component pattern)
interface SettingsTab {
  id: 'users' | 'campaigns' | 'pipeline-stages'
  label: string
  icon: React.ComponentType
  adminOnly: boolean
}

const tabs: SettingsTab[] = [
  { id: 'users', label: 'User Management', icon: UserGroupIcon, adminOnly: true },
  { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon, adminOnly: false },
  { id: 'pipeline-stages', label: 'Pipeline Stages', icon: ChartBarIcon, adminOnly: true }
]
```

**Access control:**
- Check current user role via `supabase.auth.getUser()` + `public.users` lookup
- Show only tabs matching user permissions (adminOnly: false for non-admins)
- Redirect non-admins attempting to access admin-only tabs

**UI specifications (UX §3.1, Catppuccin Mocha theme):**
- Page header: "Settings" (text-3xl font-800)
- Tab bar: Horizontal tabs with underline indicator (Orange #F25C05)
- Tab content area: Padding 2rem, background Mocha Mantle
- Active tab: Orange text, 2px bottom border
- Inactive tab: Mocha Subtext0 text, hover Mocha Text

**AC4: Create User Management Tab Component**
**Given** I am on the Admin Settings page [Source: FR11.4]
**When** I select the "User Management" tab
**Then** display the user management interface:

**Component:** `app/(dashboard)/settings/components/UserManagementTab.tsx`

**Layout sections:**

**1. Header with Invite Button:**
```typescript
// Header layout (flex justify-between)
<div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-800 text-mocha-text">Team Members</h2>
  <button
    onClick={handleInviteUser}
    className="bg-innovaas-orange hover:bg-innovaas-orange-soft
               text-white px-4 py-2 rounded-lg font-600
               transition-colors duration-200">
    + Invite User
  </button>
</div>
```

**2. User List Table:**
```typescript
// Table structure (responsive, mobile-friendly)
interface UserRecord {
  id: string  // UUID
  email: string
  name: string
  role: 'admin' | 'sales_rep' | 'executive'
  status: 'active' | 'pending'  // Derived from auth.users.email_confirmed_at
  created_at: Date
  last_sign_in_at: Date | null  // From auth.users
}
```

**Table columns:**
- **Name** (text-mocha-text font-600): Display user.name
- **Email** (text-mocha-subtext0 text-sm): user.email
- **Role** (Badge component): Color-coded (admin: Orange, sales_rep: Blue, executive: Green)
- **Status** (Badge component):
  - "Active" (Green badge) if email_confirmed_at is not null
  - "Pending Invitation" (Yellow badge) if email_confirmed_at is null
- **Last Login** (text-mocha-subtext0 text-sm): Relative time (e.g., "2 days ago") or "Never"
- **Actions** (Dropdown menu): Edit Role, Resend Invitation (if pending), Reset Password, Delete User

**Query to fetch users:**
```sql
-- Join auth.users with public.users for complete user info
SELECT
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at,
  CASE
    WHEN au.email_confirmed_at IS NULL THEN 'pending'
    ELSE 'active'
  END as status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
```

**Empty state:**
- Show when no users exist
- Message: "No team members yet. Invite your first user to get started!"
- Display Invite User button prominently

**AC5: Create Invite User Modal**
**Given** I click "Invite User" button [Source: FR11.4]
**When** the Invite User modal opens
**Then** display the following form:

**Component:** `app/(dashboard)/settings/components/InviteUserModal.tsx`

**Form fields:**

**1. Full Name (required):**
```typescript
<input
  type="text"
  name="full_name"
  placeholder="Enter full name"
  required
  className="w-full px-4 py-3 bg-mocha-surface0 border border-mocha-surface1
             rounded-lg text-mocha-text placeholder-mocha-overlay0
             focus:border-innovaas-orange focus:ring-2 focus:ring-innovaas-orange/20"
/>
```

**2. Email Address (required):**
```typescript
<input
  type="email"
  name="email"
  placeholder="user@innovaas.com"
  required
  className="[same classes as full_name]"
/>
```

**3. Role (required, dropdown):**
```typescript
<select name="role" required className="[same classes]">
  <option value="sales_rep">Sales Representative</option>
  <option value="admin">Administrator</option>
  <option value="executive">Executive (Read-Only)</option>
</select>
```

**Role descriptions (shown below dropdown):**
- **Sales Representative:** Can create/edit contacts, deals, and activities
- **Administrator:** Full access including user management and settings
- **Executive:** Read-only access to dashboard and reports (future V2.0)

**4. Send Welcome Email (checkbox, checked by default):**
```typescript
<label className="flex items-center gap-2">
  <input type="checkbox" name="send_email" defaultChecked />
  <span className="text-mocha-text">Send invitation email with password setup link</span>
</label>
```

**Form actions:**
- **Cancel button:** Close modal, clear form
- **Invite User button:** Submit form, trigger invitation

**AC6: Implement User Invitation API Endpoint**
**Given** the Invite User form is submitted [Source: Supabase Admin API]
**When** I submit the invitation
**Then** execute the following backend logic:

**File:** `app/api/users/invite/route.ts`

**API endpoint:** `POST /api/users/invite`

**Request body:**
```typescript
{
  email: string
  full_name: string
  role: 'admin' | 'sales_rep' | 'executive'
  send_email: boolean
}
```

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // 1. Check if current user is admin
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (currentUserData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  // 2. Parse request body
  const { email, full_name, role, send_email } = await request.json()

  // 3. Validate inputs
  if (!email || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['admin', 'sales_rep', 'executive'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // 4. Create user via Supabase Admin API
  const { data: newUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name,
        role
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  )

  if (inviteError) {
    console.error('Invitation error:', inviteError)
    return NextResponse.json({
      error: 'Failed to invite user',
      details: inviteError.message
    }, { status: 500 })
  }

  // 5. User is automatically created in public.users via trigger
  // Trigger: on_auth_user_created (from AC1)

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      status: 'pending'
    }
  })
}
```

**Supabase Admin API notes:**
- `inviteUserByEmail()` requires service role key (server-side only)
- Sends magic link email to user for password setup
- Sets `email_confirmed_at` to null (pending state)
- User metadata stored in `raw_user_meta_data` JSONB field
- Trigger `on_auth_user_created` automatically creates public.users record

**Error handling:**
- 401: Not authenticated
- 403: Not admin role
- 400: Invalid input data
- 500: Supabase API error (show user-friendly message)

**AC7: Implement Resend Invitation Functionality**
**Given** a user has pending invitation status [Source: FR11.4]
**When** I click "Resend Invitation" in the actions menu
**Then** send a new invitation email:

**API endpoint:** `POST /api/users/[id]/resend-invitation`

**Implementation:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // 1. Verify admin access (same as AC6)
  // ... (omitted for brevity)

  // 2. Check if user exists and is pending
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', params.id)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(params.id)

  if (authUser?.user.email_confirmed_at !== null) {
    return NextResponse.json({
      error: 'User already accepted invitation'
    }, { status: 400 })
  }

  // 3. Resend invitation
  const { error } = await supabase.auth.admin.inviteUserByEmail(
    user.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  )

  if (error) {
    return NextResponse.json({
      error: 'Failed to resend invitation'
    }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**UI feedback:**
- Show toast notification: "Invitation resent to [email]"
- Disable "Resend Invitation" button for 60 seconds (prevent spam)

**AC8: Implement Password Reset Functionality**
**Given** a user needs to reset their password [Source: FR11.4]
**When** I click "Reset Password" in the actions menu
**Then** trigger password reset email:

**API endpoint:** `POST /api/users/[id]/reset-password`

**Implementation:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // 1. Verify admin access
  // ... (omitted for brevity)

  // 2. Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', params.id)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 3. Trigger password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(
    user.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    }
  )

  if (error) {
    return NextResponse.json({
      error: 'Failed to send reset email'
    }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**Password reset flow:**
1. Admin triggers reset → Supabase sends email with magic link
2. User clicks link → Redirected to `/auth/reset-password` page
3. User enters new password → Supabase updates auth.users
4. User redirected to dashboard with success message

**Create password reset page:** `app/auth/reset-password/page.tsx`

**Page form:**
```typescript
<form onSubmit={handleResetPassword}>
  <input
    type="password"
    name="new_password"
    placeholder="New password (min 8 characters)"
    minLength={8}
    required
  />
  <input
    type="password"
    name="confirm_password"
    placeholder="Confirm new password"
    required
  />
  <button type="submit">Reset Password</button>
</form>
```

**Form submission:**
```typescript
const handleResetPassword = async (e: FormEvent) => {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match')
    return
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    setError('Failed to reset password')
  } else {
    router.push('/dashboard?message=Password reset successful')
  }
}
```

**AC9: Implement Role Assignment/Edit**
**Given** I need to change a user's role [Source: FR11.4]
**When** I click "Edit Role" in the actions menu
**Then** display role edit modal:

**Component:** `app/(dashboard)/settings/components/EditRoleModal.tsx`

**Modal structure:**
```typescript
interface EditRoleModalProps {
  userId: string
  currentRole: 'admin' | 'sales_rep' | 'executive'
  userName: string
  onClose: () => void
  onUpdate: () => void
}
```

**Modal content:**
- Display user name and current role
- Dropdown select with all three role options
- Save button to commit change
- Cancel button to close modal

**API endpoint:** `PATCH /api/users/[id]/role`

**Implementation:**
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // 1. Verify admin access
  // ... (omitted for brevity)

  // 2. Parse new role
  const { role } = await request.json()

  if (!['admin', 'sales_rep', 'executive'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // 3. Update public.users table
  const { error: updateError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({
      error: 'Failed to update role'
    }, { status: 500 })
  }

  // 4. Update auth.users metadata (for consistency)
  const { error: metadataError } = await supabase.auth.admin.updateUserById(
    params.id,
    {
      user_metadata: { role }
    }
  )

  if (metadataError) {
    console.error('Failed to update auth metadata:', metadataError)
    // Not critical - public.users is source of truth
  }

  return NextResponse.json({ success: true })
}
```

**UI feedback:**
- Show toast: "Role updated to [new_role] for [user_name]"
- Refresh user list to reflect change
- Update badge color immediately

**AC10: Implement User Deletion**
**Given** I need to remove a user from the system [Source: FR11.4]
**When** I click "Delete User" in the actions menu
**Then** display confirmation dialog and delete user:

**Confirmation dialog:**
```typescript
<Dialog>
  <DialogTitle>Delete User?</DialogTitle>
  <DialogContent>
    <p>Are you sure you want to delete <strong>{userName}</strong>?</p>
    <p className="text-red-500 font-600">This action cannot be undone.</p>
    <ul className="text-sm text-mocha-subtext0 mt-4">
      <li>• Contacts and deals owned by this user will remain (owner set to null)</li>
      <li>• Activities logged by this user will be preserved</li>
      <li>• User will lose access to NovaCRM immediately</li>
    </ul>
  </DialogContent>
  <DialogActions>
    <button onClick={onCancel}>Cancel</button>
    <button onClick={handleDelete} className="bg-red-500">Delete User</button>
  </DialogActions>
</Dialog>
```

**API endpoint:** `DELETE /api/users/[id]`

**Implementation:**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // 1. Verify admin access
  // ... (omitted for brevity)

  // 2. Prevent self-deletion
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (currentUser?.id === params.id) {
    return NextResponse.json({
      error: 'Cannot delete your own account'
    }, { status: 400 })
  }

  // 3. Delete from auth.users (cascade to public.users via ON DELETE CASCADE)
  const { error } = await supabase.auth.admin.deleteUser(params.id)

  if (error) {
    return NextResponse.json({
      error: 'Failed to delete user'
    }, { status: 500 })
  }

  // Note: Foreign key constraints ensure data integrity:
  // - contacts.owner_id → SET NULL (contacts preserved)
  // - deals.owner_id → SET NULL (deals preserved)
  // - activities.user_id → SET NULL (activities preserved)

  return NextResponse.json({ success: true })
}
```

**Data cleanup notes:**
- All foreign keys to users table use `ON DELETE SET NULL` (Architecture §2.1)
- No orphaned records created
- Historical data preserved for reporting

**AC11: Update Migration File**
**Given** all database changes are validated [Source: Story 1.2 pattern]
**When** I save the migration
**Then** store as: `novacrm/supabase/migrations/YYYYMMDDHHMMSS_user_management_sync.sql`

**Migration file structure:**
```sql
-- Migration: User Management & Auth Sync
-- Story 1.7: User Management & Team Onboarding
-- Dependencies: auth.users (Supabase system table), public.users (Story 1.2)

-- ============================================================
-- SECTION 1: Backfill Existing Users
-- ============================================================

-- Sync all existing auth.users to public.users
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 3: Verify Sync
-- ============================================================

-- Check that all auth users now exist in public.users
-- Expected: 0 rows returned
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

**Migration testing:**
1. Run migration on development Supabase project
2. Create test user via Supabase dashboard → Verify appears in public.users
3. Invite test user via API → Verify trigger executes correctly
4. Check query performance: Verify backfill completes in <1 second

**AC12: Create Auth Callback Handler**
**Given** users receive invitation emails with magic links [Source: Supabase Auth flow]
**When** users click the magic link
**Then** handle the authentication callback:

**File:** `app/auth/callback/route.ts`

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or password setup page
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
```

**Flow for new users:**
1. User receives invitation email
2. User clicks magic link → Redirected to `/auth/callback?code=...`
3. Callback exchanges code for session
4. User redirected to dashboard (first-time users may need to set password)

**AC13: Add User Count Display**
**Given** I am viewing the User Management tab [Source: UX best practice]
**When** the page loads
**Then** display user count summary:

**Component addition to UserManagementTab:**
```typescript
<div className="flex gap-4 mb-6">
  <StatCard
    label="Total Users"
    value={totalUsers}
    icon={UserGroupIcon}
    color="blue"
  />
  <StatCard
    label="Active Users"
    value={activeUsers}
    icon={CheckCircleIcon}
    color="green"
  />
  <StatCard
    label="Pending Invitations"
    value={pendingUsers}
    icon={ClockIcon}
    color="yellow"
  />
</div>
```

**StatCard component:** (reusable)
```typescript
interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-4 px-6 py-4 bg-mocha-mantle border border-mocha-surface0 rounded-lg">
    <div className={`p-3 rounded-lg bg-${color}-500/10`}>
      <Icon className={`w-6 h-6 text-${color}-500`} />
    </div>
    <div>
      <p className="text-sm text-mocha-subtext0">{label}</p>
      <p className="text-2xl font-800 text-mocha-text">{value}</p>
    </div>
  </div>
)
```

**Query for counts:**
```sql
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 END) as active_users,
  COUNT(CASE WHEN au.email_confirmed_at IS NULL THEN 1 END) as pending_users
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id;
```

## Implementation Tasks

### Task 1: Database Migration & Trigger Setup
- [ ] 1.1 Create migration file: `YYYYMMDDHHMMSS_user_management_sync.sql`
- [ ] 1.2 Write `handle_new_user()` function (AC1)
- [ ] 1.3 Create `on_auth_user_created` trigger (AC1)
- [ ] 1.4 Write backfill SQL for existing users (AC2)
- [ ] 1.5 Test migration on local Supabase project
- [ ] 1.6 Verify trigger fires correctly with test user creation
- [ ] 1.7 Apply migration to production Supabase via SQL Editor or MCP
- [ ] 1.8 Verify all auth.users now exist in public.users (query from AC11)

### Task 2: Admin Settings Page Structure
- [ ] 2.1 Create `app/(dashboard)/settings/page.tsx` (AC3)
- [ ] 2.2 Implement tab navigation component (AC3)
- [ ] 2.3 Add role-based tab visibility logic (AC3)
- [ ] 2.4 Style with Catppuccin Mocha theme (AC3)
- [ ] 2.5 Add Settings link to sidebar navigation (Story 1.5 integration)
- [ ] 2.6 Test tab switching and active state indicators

### Task 3: User Management Tab Component
- [ ] 3.1 Create `app/(dashboard)/settings/components/UserManagementTab.tsx` (AC4)
- [ ] 3.2 Implement user list table with columns (AC4)
- [ ] 3.3 Create SQL query to join auth.users + public.users (AC4)
- [ ] 3.4 Add status badge component (Active/Pending) (AC4)
- [ ] 3.5 Add role badge component with color coding (AC4)
- [ ] 3.6 Implement actions dropdown menu (AC4)
- [ ] 3.7 Add empty state for no users (AC4)
- [ ] 3.8 Implement user count stat cards (AC13)
- [ ] 3.9 Test table rendering with mock data

### Task 4: Invite User Modal
- [ ] 4.1 Create `app/(dashboard)/settings/components/InviteUserModal.tsx` (AC5)
- [ ] 4.2 Build form with full_name, email, role fields (AC5)
- [ ] 4.3 Add role descriptions below dropdown (AC5)
- [ ] 4.4 Implement "Send Welcome Email" checkbox (AC5)
- [ ] 4.5 Add form validation (required fields, email format) (AC5)
- [ ] 4.6 Style modal with Catppuccin Mocha theme (AC5)
- [ ] 4.7 Test modal open/close and form submission

### Task 5: User Invitation API
- [ ] 5.1 Create `app/api/users/invite/route.ts` (AC6)
- [ ] 5.2 Implement admin role check middleware (AC6)
- [ ] 5.3 Add input validation logic (AC6)
- [ ] 5.4 Integrate Supabase `inviteUserByEmail()` API (AC6)
- [ ] 5.5 Add error handling for API failures (AC6)
- [ ] 5.6 Test invitation flow end-to-end (AC6)
- [ ] 5.7 Verify trigger creates public.users record automatically (AC6)
- [ ] 5.8 Test error cases (duplicate email, invalid role, non-admin access)

### Task 6: Resend Invitation
- [ ] 6.1 Create `app/api/users/[id]/resend-invitation/route.ts` (AC7)
- [ ] 6.2 Add pending status check before resending (AC7)
- [ ] 6.3 Implement rate limiting (60 second cooldown) (AC7)
- [ ] 6.4 Add UI toast notification on success (AC7)
- [ ] 6.5 Test resend for pending users
- [ ] 6.6 Verify error handling for already-active users

### Task 7: Password Reset
- [ ] 7.1 Create `app/api/users/[id]/reset-password/route.ts` (AC8)
- [ ] 7.2 Implement password reset email trigger (AC8)
- [ ] 7.3 Create `app/auth/reset-password/page.tsx` (AC8)
- [ ] 7.4 Build password reset form with validation (AC8)
- [ ] 7.5 Implement password update logic via Supabase (AC8)
- [ ] 7.6 Add success/error messages (AC8)
- [ ] 7.7 Test full password reset flow

### Task 8: Role Management
- [ ] 8.1 Create `app/(dashboard)/settings/components/EditRoleModal.tsx` (AC9)
- [ ] 8.2 Create `app/api/users/[id]/role/route.ts` (AC9)
- [ ] 8.3 Implement role update in public.users table (AC9)
- [ ] 8.4 Update auth.users metadata for consistency (AC9)
- [ ] 8.5 Add UI toast notification on role change (AC9)
- [ ] 8.6 Test role changes reflect immediately in user list

### Task 9: User Deletion
- [ ] 9.1 Create delete confirmation dialog component (AC10)
- [ ] 9.2 Create `app/api/users/[id]/route.ts` with DELETE method (AC10)
- [ ] 9.3 Add self-deletion prevention logic (AC10)
- [ ] 9.4 Implement Supabase admin deleteUser() (AC10)
- [ ] 9.5 Verify foreign key constraints preserve data (AC10)
- [ ] 9.6 Test user deletion flow and data integrity

### Task 10: Auth Callback Handler
- [ ] 10.1 Create `app/auth/callback/route.ts` (AC12)
- [ ] 10.2 Implement code-to-session exchange (AC12)
- [ ] 10.3 Add redirect logic to dashboard (AC12)
- [ ] 10.4 Test magic link flow from invitation email

### Task 11: Integration & Testing
- [ ] 11.1 Test complete user invitation flow (invite → email → accept → login)
- [ ] 11.2 Verify public.users stays in sync with auth.users via trigger
- [ ] 11.3 Test all user actions (invite, resend, reset password, edit role, delete)
- [ ] 11.4 Verify foreign key constraints work correctly (deals.owner_id references users)
- [ ] 11.5 Test admin-only access restrictions for Settings page
- [ ] 11.6 Verify UI responsiveness on mobile/tablet breakpoints
- [ ] 11.7 Run through complete smoke test with real Supabase invitation emails

## Previous Story Learnings

**From Story 1.2 (Database Setup):**
- Use `CREATE OR REPLACE FUNCTION` for idempotent migrations
- Apply `SECURITY DEFINER` for system functions that need elevated privileges
- Test migrations on development Supabase project before production
- Document all foreign key constraints and their ON DELETE behaviors

**From Story 1.3 (Authentication):**
- Supabase auth.users is separate from public.users (critical for this story)
- Use `@supabase/ssr` for server-side Supabase client with cookie management
- Store JWT tokens in httpOnly cookies for security
- Test authentication flows with actual email sending enabled

**From Story 4.1 (Deals Schema):**
- Foreign keys to users should use `ON DELETE SET NULL` to preserve historical data
- Always create indexes for foreign key columns (performance optimization)
- Enable RLS even if MVP uses permissive policies (framework for future)

**From Story 4.2 (Create Deal Form):**
- Modal components should be self-contained with open/close state management
- API routes should validate user permissions before executing operations
- Return user-friendly error messages (not raw database errors)

## Architecture Compliance Notes

**Database Architecture (§2):**
- ✅ Uses trigger-based automation for auth.users → public.users sync
- ✅ Maintains referential integrity with proper foreign key constraints
- ✅ Follows UUID primary key standard for all user records
- ✅ Implements RLS framework (permissive policies for MVP, restrictive for V2.0)

**Authentication & Authorization (§3):**
- ✅ Leverages Supabase Auth for user invitation and password management
- ✅ Implements role-based access control (admin/sales_rep/executive)
- ✅ Uses JWT tokens with httpOnly cookie storage for security
- ✅ Admin-only routes protected via server-side permission checks

**API Architecture (§4):**
- ✅ RESTful API endpoints using Next.js App Router route handlers
- ✅ Consistent error handling with proper HTTP status codes
- ✅ Input validation before database operations
- ✅ Server-side Supabase client for secure admin operations

**Security (§5):**
- ✅ Prevents self-deletion by admin users (data integrity)
- ✅ Validates all user inputs before processing
- ✅ Uses Supabase Admin API via service role key (server-side only)
- ✅ Implements confirmation dialogs for destructive actions

## Technical Dependencies

**Required Packages (already installed):**
- `@supabase/supabase-js` ^2.39.0 - Supabase client library
- `@supabase/ssr` ^0.8.0 - Server-side rendering utilities
- `next` ^15.0.0 - Next.js framework
- `react` ^19.0.0 - React library

**New Dependencies:**
- `@heroicons/react` ^2.0.0 - Icon library for UI (if not already installed)

**Environment Variables (required):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uavqmlqkuvjhgnuwcsqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]  # Server-side only, for admin API
NEXT_PUBLIC_APP_URL=https://novacrm.vercel.app  # For email redirects
```

## API Reference

### POST /api/users/invite
Invite a new user to the system (admin only)

**Request:**
```json
{
  "email": "newuser@innovaas.com",
  "full_name": "New User",
  "role": "sales_rep",
  "send_email": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "newuser@innovaas.com",
    "status": "pending"
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to invite user",
  "details": "User already exists"
}
```

### POST /api/users/[id]/resend-invitation
Resend invitation email to pending user (admin only)

**Response (Success):**
```json
{
  "success": true
}
```

### POST /api/users/[id]/reset-password
Trigger password reset email for user (admin only)

**Response (Success):**
```json
{
  "success": true
}
```

### PATCH /api/users/[id]/role
Update user's role (admin only)

**Request:**
```json
{
  "role": "admin"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

### DELETE /api/users/[id]
Delete user from system (admin only, cannot delete self)

**Response (Success):**
```json
{
  "success": true
}
```

## Database Schema Changes

### New Trigger Function
```sql
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
```

### New Trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### No Table Structure Changes
This story adds automation to existing tables (users) but does not modify table structure.

## UI Components

### New Components
1. **InviteUserModal** - Modal for inviting new users
2. **EditRoleModal** - Modal for changing user roles
3. **UserManagementTab** - Tab content for user list and management
4. **StatCard** - Reusable card component for displaying counts
5. **Delete Confirmation Dialog** - Confirmation dialog for user deletion

### Updated Components
1. **Sidebar Navigation** - Add "Settings" link (Settings icon)
2. **Settings Page** - New page with tab navigation

## Testing Checklist

- [ ] Database trigger creates public.users record when auth.users created
- [ ] Backfill migration syncs all existing auth.users to public.users
- [ ] Invite User modal sends invitation email via Supabase
- [ ] Pending users show "Pending Invitation" status badge
- [ ] Active users show "Active" status badge
- [ ] Resend Invitation works for pending users only
- [ ] Password reset email sent and flow works end-to-end
- [ ] Role change reflects immediately in UI and database
- [ ] User deletion prevents self-deletion
- [ ] User deletion preserves contacts/deals (owner set to null)
- [ ] Admin-only routes return 403 for non-admin users
- [ ] Magic link from invitation email completes authentication
- [ ] User count stat cards show correct totals

## Definition of Done

- [ ] Migration applied to Supabase (trigger + backfill)
- [ ] All API endpoints created and tested
- [ ] All UI components implemented and styled
- [ ] User invitation flow works end-to-end with real emails
- [ ] Password reset flow tested with real emails
- [ ] Admin Settings page accessible from sidebar
- [ ] User Management tab shows accurate user list
- [ ] All user actions (invite, resend, reset, edit, delete) functional
- [ ] Foreign key constraint error resolved (deals.owner_id references valid users)
- [ ] Code committed to git with descriptive commit message
- [ ] Story marked as "Ready for Review" in sprint-status.yaml

## References

**Epic & Story Context:**
- [Epic 1: Foundation & Team Authentication](../epics.md#epic-1-foundation--team-authentication)
- [Story 1.2: Supabase Database Setup](../epics.md#story-12-supabase-database-setup--schema-initialization)
- [Story 1.3: Supabase Authentication Configuration](../epics.md#story-13-supabase-authentication-configuration)
- [Story 1.5: Application Layout with Sidebar & Header](../epics.md#story-15-application-layout-with-sidebar--header)

**Architecture Documentation:**
- [Architecture.md](../Architecture.md) - Complete technical architecture
- [Architecture §2: Database Architecture](../Architecture.md#database-architecture)
- [Architecture §3: Authentication & Authorization](../Architecture.md#authentication--authorization)
- [Architecture §4: API Architecture](../Architecture.md#api-architecture)

**Related Artifacts:**
- [Sprint Status](./sprint-status.yaml) - Current sprint progress
- [Story 4.1: Deals Schema](./4-1-deals-database-table-pipeline-stage-relationships.md) - Foreign key constraint pattern
- [Story 4.2: Create Deal Form](./4-2-create-deal-form-contact-linking.md) - Modal component pattern

**External Documentation:**
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api) - User management APIs
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Authentication guide
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - API routes
