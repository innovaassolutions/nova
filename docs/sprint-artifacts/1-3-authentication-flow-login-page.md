# Story 1.3: Authentication Flow & Login Page

Status: ready-for-dev

## Story

As an INNOVAAS team member,
I want to securely log in with my email and password through a modern dark-themed login page,
so that I can access NovaCRM with my individual account and begin using the system.

## Acceptance Criteria

### AC1: Supabase Auth Configuration

**Given** Supabase Auth needs to be configured for the project
**When** I set up email/password authentication in Supabase dashboard
**Then** the following configuration is applied:
- Email provider enabled in Supabase Auth settings
- Password requirements: minimum 8 characters
- Email confirmation **disabled** (internal tool, manual user creation by admin)
- JWT expiration: 3600 seconds (1 hour) for access token
- Refresh token rotation enabled
- User records created in both `auth.users` (Supabase managed) and `users` table (app data)

[Source: Architecture.md§3.1, Epics.md Epic 1 Story 1.3]

### AC2: Login Page UI with Catppuccin Mocha Theme

**Given** I navigate to the NovaCRM root URL without being authenticated
**When** the login page loads
**Then** I see a beautifully designed dark-themed login interface with:

**Page Structure:**
- Full-viewport height background: Mocha Base (#1e1e2e)
- Vertically and horizontally centered login card
- Login card background: Mocha Mantle (#181825)
- Card border: 1px solid Mocha Surface0 (#313244)
- Card border-radius: 16px
- Card padding: 2rem (32px)
- Card max-width: 400px
- Subtle box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)

**Logo Display:**
- NovaCRM horizontal logo SVG at top of card (200×60px)
- Logo source: `/nova-crm-logo.svg`
- Margin-bottom: 2rem below logo

**Form Fields:**
- Email input field with label "Email" (0.875rem, weight 600, Mocha Subtext0 #a6adc8)
- Password input field with label "Password" (same label styling)
- Input styling per UX design system:
  - Background: Mocha Surface0 (#313244)
  - Border: 1px solid Mocha Surface1 (#45475a)
  - Border-radius: 10px
  - Padding: 0.75rem (12px)
  - Text color: Mocha Text (#cdd6f4)
  - Font-size: 1rem (16px)
  - Width: 100%
  - Margin-bottom: 1.5rem between fields

**Focus States:**
- Orange focus ring: border-color #F25C05
- Box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1)
- Smooth transition: 200ms ease

**Sign In Button:**
- Background: Innovaas Orange (#F25C05)
- Text: "Sign In" (white #ffffff, weight 600, 1rem)
- Width: 100%
- Padding: 0.75rem vertical
- Border-radius: 10px
- Border: none
- Cursor: pointer

**Button Hover State:**
- Background: Darker Orange (#D94C04)
- Transform: translateY(-2px)
- Box-shadow: 0 6px 16px rgba(242, 92, 5, 0.3)
- Transition: all 200ms ease

**Button Loading State:**
- Text changes to "Signing in..."
- Disabled state (cursor: not-allowed, opacity: 0.6)
- Optional: Add spinning loader icon

[Source: Epics.md Epic 1 Story 1.4, UX-Design.md§2]

### AC3: Authentication Form Submission & Error Handling

**Given** the login form is displayed
**When** I submit the form with valid credentials
**Then** the following authentication flow executes:
- Form calls `supabase.auth.signInWithPassword({ email, password })`
- Button enters loading state immediately
- On success: JWT tokens stored in secure httpOnly cookies via @supabase/ssr
- On success: User redirected to `/dashboard` using Next.js `redirect()`
- On auth error: Red toast notification appears with error message
- On auth error: Form re-enables for retry

**And** when form validation fails before submission
**Then** inline error messages appear below respective fields:
- Empty email: "Email is required"
- Invalid email format: "Please enter a valid email address"
- Empty password: "Password is required"
- Error text styling: Mocha Red (#f38ba8), 0.875rem, weight 400

**And** when network errors occur
**Then** a toast notification displays: "Network error. Please check your connection and try again."

[Source: Epics.md Epic 1 Story 1.4, Architecture.md§3.1]

### AC4: Session Management & Protected Routes

**Given** user successfully logs in
**When** authentication completes
**Then** the following session state is established:
- JWT access token stored in httpOnly cookie
- Refresh token stored in httpOnly cookie
- Automatic token refresh handled by @supabase/ssr before expiration
- User session accessible via `supabase.auth.getSession()` on server
- User session accessible via `supabase.auth.getUser()` on client

**And** when I navigate to `/dashboard` or other protected routes
**Then** middleware or route-level checks verify authenticated session
- If authenticated: page renders normally
- If not authenticated: redirect to `/login`

**And** when access token expires
**Then** @supabase/ssr automatically:
- Uses refresh token to obtain new access token
- Updates httpOnly cookies with new tokens
- User remains logged in seamlessly

[Source: Architecture.md§3.1]

### AC5: Manual Test User Creation

**Given** Supabase Auth is configured
**When** an admin creates test users via Supabase dashboard
**Then** 2-3 test users are created for development with:
- Email addresses: todd@innovaas.com, test@innovaas.com, demo@innovaas.com
- Passwords: Minimum 8 characters (not stored in code)
- Email confirmation bypassed (set confirmed_at manually if needed)

**And** corresponding user records are created in `users` table with:
- Same email as auth.users
- Name field populated
- Role set to 'sales_rep' (default) or 'admin'
- ID matching auth.users.id (UUID)

[Source: Epics.md Epic 1 Story 1.3]

## Tasks / Subtasks

- [ ] 1. Configure Supabase Auth settings (AC: 1)
  - [ ] 1.1 Enable email provider in Supabase Auth dashboard
  - [ ] 1.2 Set password policy: minimum 8 characters
  - [ ] 1.3 Disable email confirmation for MVP
  - [ ] 1.4 Configure JWT expiration to 3600 seconds
  - [ ] 1.5 Enable refresh token rotation
  - [ ] 1.6 Verify auth.users table exists and is managed by Supabase
  - [ ] 1.7 Test auth configuration with Supabase dashboard test users panel

- [ ] 2. Verify Supabase client utilities from Story 1.2 (AC: 1, 4)
  - [ ] 2.1 Confirm app/lib/supabase/client.ts exists with createBrowserClient
  - [ ] 2.2 Confirm app/lib/supabase/server.ts exists with createServerClient
  - [ ] 2.3 Verify cookie helpers implemented (get, set, remove)
  - [ ] 2.4 Verify environment variables loaded: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] 2.5 Note: These files were created in Story 1.2, should already be functional

- [ ] 3. Create login page route and layout (AC: 2)
  - [ ] 3.1 Create app/(auth)/login/page.tsx with TypeScript
  - [ ] 3.2 Create (auth) route group layout if needed
  - [ ] 3.3 Mark page as client component with 'use client' directive
  - [ ] 3.4 Import necessary dependencies: Next.js navigation, Supabase client, React hooks

- [ ] 4. Implement login page UI structure (AC: 2)
  - [ ] 4.1 Create full-viewport container with Mocha Base background (#1e1e2e)
  - [ ] 4.2 Center login card using Flexbox (justify-center, items-center, min-h-screen)
  - [ ] 4.3 Style login card: Mocha Mantle background, border, border-radius 16px, padding 2rem
  - [ ] 4.4 Set card max-width to 400px
  - [ ] 4.5 Add subtle box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)

- [ ] 5. Add logo and form elements (AC: 2)
  - [ ] 5.1 Add NovaCRM logo at top of card using Image component (200×60px)
  - [ ] 5.2 Verify logo file exists at public/nova-crm-logo.svg (created in Story 1.1)
  - [ ] 5.3 Add email input with label ("Email", styled per UX specs)
  - [ ] 5.4 Add password input with label ("Password", styled per UX specs)
  - [ ] 5.5 Style labels: 0.875rem, weight 600, Mocha Subtext0 (#a6adc8), margin-bottom 0.5rem
  - [ ] 5.6 Style inputs: Surface0 background, Surface1 border, 10px radius, full width
  - [ ] 5.7 Implement orange focus states with box-shadow
  - [ ] 5.8 Add "Sign In" button with Innovaas Orange background, white text, full width

- [ ] 6. Implement form state management (AC: 3)
  - [ ] 6.1 Create React state for email, password, loading, and error
  - [ ] 6.2 Bind input values to state with onChange handlers
  - [ ] 6.3 Create handleSubmit function to process form submission
  - [ ] 6.4 Prevent default form submission (preventDefault)
  - [ ] 6.5 Implement client-side validation (required fields, email format)
  - [ ] 6.6 Display inline error messages below fields with Mocha Red (#f38ba8)

- [ ] 7. Implement authentication logic (AC: 3, 4)
  - [ ] 7.1 Import createClient from '@/app/lib/supabase/client'
  - [ ] 7.2 Call supabase.auth.signInWithPassword({ email, password }) on submit
  - [ ] 7.3 Set loading state to true before auth call
  - [ ] 7.4 Handle auth response: check for error or user data
  - [ ] 7.5 On success: store session in httpOnly cookies (handled by @supabase/ssr)
  - [ ] 7.6 On success: redirect to '/dashboard' using Next.js redirect() or router.push()
  - [ ] 7.7 On error: display error message in toast notification
  - [ ] 7.8 On error: reset loading state and allow retry

- [ ] 8. Create toast notification component (AC: 3)
  - [ ] 8.1 Create app/components/ui/Toast.tsx component
  - [ ] 8.2 Style toast with Mocha Mantle background, white text, Mocha Red border for errors
  - [ ] 8.3 Position toast: fixed bottom-right, z-index 9999
  - [ ] 8.4 Implement auto-dismiss after 5 seconds
  - [ ] 8.5 Add fade-in/fade-out animations
  - [ ] 8.6 Export toast trigger function for use in login page

- [ ] 9. Implement button loading and hover states (AC: 2, 3)
  - [ ] 9.1 Conditionally render button text: "Sign In" or "Signing in..." based on loading state
  - [ ] 9.2 Disable button when loading: disabled={loading}
  - [ ] 9.3 Apply hover styles: darker orange, translateY(-2px), increased shadow
  - [ ] 9.4 Add CSS transitions: all 200ms ease
  - [ ] 9.5 Change cursor to not-allowed when loading

- [ ] 10. Create manual test users via Supabase dashboard (AC: 5)
  - [ ] 10.1 Navigate to Supabase dashboard → Authentication → Users
  - [ ] 10.2 Create user: todd@innovaas.com with secure password
  - [ ] 10.3 Create user: test@innovaas.com with secure password
  - [ ] 10.4 Create user: demo@innovaas.com with secure password
  - [ ] 10.5 Verify users appear in auth.users table
  - [ ] 10.6 Manually insert corresponding records in users table via SQL:
    ```sql
    INSERT INTO users (id, email, name, role) VALUES
      ('{auth_user_id}', 'todd@innovaas.com', 'Todd Abraham', 'admin'),
      ('{auth_user_id}', 'test@innovaas.com', 'Test User', 'sales_rep'),
      ('{auth_user_id}', 'demo@innovaas.com', 'Demo User', 'sales_rep');
    ```
  - [ ] 10.7 Verify ID values match between auth.users and users table

- [ ] 11. Test authentication flow end-to-end (AC: 1, 2, 3, 4, 5)
  - [ ] 11.1 Start dev server and navigate to http://localhost:3000/login
  - [ ] 11.2 Verify login page renders with correct Catppuccin Mocha styling
  - [ ] 11.3 Test form validation: submit empty form, verify error messages
  - [ ] 11.4 Test invalid email format, verify validation error
  - [ ] 11.5 Test invalid credentials, verify auth error toast appears
  - [ ] 11.6 Test valid credentials (todd@innovaas.com), verify successful login
  - [ ] 11.7 Verify redirect to /dashboard occurs after successful login
  - [ ] 11.8 Open browser DevTools → Application → Cookies, verify httpOnly cookies set
  - [ ] 11.9 Verify session persists on page refresh
  - [ ] 11.10 Test automatic token refresh (wait near token expiration if possible)

- [ ] 12. Implement basic protected route logic for /dashboard (AC: 4)
  - [ ] 12.1 Create app/dashboard/page.tsx as placeholder
  - [ ] 12.2 Add server-side session check using createClient from '@/app/lib/supabase/server'
  - [ ] 12.3 Call const { data: { user } } = await supabase.auth.getUser()
  - [ ] 12.4 If no user: redirect to '/login' using Next.js redirect()
  - [ ] 12.5 If user exists: render dashboard with "Welcome, {user.email}"
  - [ ] 12.6 Test: access /dashboard without login, verify redirect to /login
  - [ ] 12.7 Test: access /dashboard after login, verify page renders

- [ ] 13. Verify all acceptance criteria satisfied (AC: All)
  - [ ] 13.1 AC1: Supabase Auth configured with email/password, JWT settings verified
  - [ ] 13.2 AC2: Login page UI matches Catppuccin Mocha design specs exactly
  - [ ] 13.3 AC3: Form submission works, error handling displays toast notifications
  - [ ] 13.4 AC4: Session management working, tokens in httpOnly cookies, auto-refresh enabled
  - [ ] 13.5 AC5: Test users created in both auth.users and users table
  - [ ] 13.6 Test all user flows: validation errors, auth errors, successful login, protected routes
  - [ ] 13.7 Verify no TypeScript errors, all imports resolved

- [ ] 14. Commit authentication implementation to repository (AC: All)
  - [ ] 14.1 Stage files: login page, toast component, dashboard placeholder
  - [ ] 14.2 Commit with message: "Complete Story 1.3: Authentication Flow & Login Page"
  - [ ] 14.3 Include detailed commit body describing auth configuration and UI implementation
  - [ ] 14.4 Update sprint-status.yaml: mark 1-3-authentication-flow-login-page as "done"
  - [ ] 14.5 Push to repository

## Dev Notes

### Previous Story Learnings (Story 1.2)

**Key Accomplishments from Story 1.2:**
- ✅ Supabase client utilities **already created** at app/lib/supabase/client.ts and server.ts
- ✅ TypeScript types generated from database schema at app/lib/types/database.ts
- ✅ Row Level Security (RLS) **ENABLED** on all 7 tables with permissive policies
- ✅ Database health check endpoint created at app/api/health/db/route.ts
- ✅ Environment variables configured (.env.local with Supabase URL and keys)

**Important Context:**
The Supabase client utilities were created in Story 1.2, so you do NOT need to create them again. Simply import and use:
- `import { createClient } from '@/app/lib/supabase/client'` for client-side auth
- `import { createClient } from '@/app/lib/supabase/server'` for server-side session checks

**RLS Status Update:**
Note that Architecture.md§3.1 states "RLS disabled in MVP" but this is now OUTDATED. As of Story 1.2 (completed 2025-12-09), RLS is ENABLED with permissive policies allowing all authenticated users full access. This provides defense-in-depth security while maintaining MVP team visibility requirements.

[Source: docs/sprint-artifacts/1-2-supabase-database-setup-core-tables.md]

### Architecture Requirements

**Authentication Implementation** [Source: Architecture.md§3]
- **Provider:** Supabase Auth with email/password
- **Token Type:** JWT (JSON Web Tokens)
- **Token Storage:** Secure httpOnly cookies (NOT localStorage)
- **Session Management:** Automatic refresh token rotation via @supabase/ssr
- **Password Security:** bcrypt hashing with cost factor 10 (handled by Supabase)
- **Token Expiration:** 3600 seconds (1 hour) for access tokens

**Authentication Flow Sequence:**
1. User submits email/password via login form
2. Supabase Auth validates credentials against auth.users table
3. JWT access token + refresh token returned on success
4. @supabase/ssr stores tokens in httpOnly cookies
5. Client-side SDK automatically handles token refresh before expiration
6. User redirected to /dashboard on successful authentication

**Supabase Client Usage:**
```typescript
// Client-side (login page, client components)
import { createClient } from '@/app/lib/supabase/client'
const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Server-side (protected routes, server components)
import { createClient } from '@/app/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Key Security Features:**
- httpOnly cookies prevent XSS attacks (JavaScript cannot access tokens)
- Automatic token refresh prevents session expiration during active use
- Refresh token rotation prevents token replay attacks
- RLS policies (enabled in Story 1.2) provide database-level access control
- HTTPS-only in production (enforced by Vercel)

### UX Design System Requirements

**Color Palette (Catppuccin Mocha)** [Source: UX-Design.md§2.1]
```css
/* Backgrounds */
--mocha-base: #1e1e2e         /* Page background */
--mocha-mantle: #181825       /* Card/elevated surfaces */
--mocha-surface0: #313244     /* Input fields, buttons */
--mocha-surface1: #45475a     /* Input borders, hover states */

/* Text Colors */
--mocha-text: #cdd6f4         /* Primary text */
--mocha-subtext0: #a6adc8     /* Labels, secondary text */

/* Brand & Accent Colors */
--innovaas-orange: #F25C05    /* Primary CTAs, active states */
--innovaas-orange-hover: #D94C04  /* Hover states */
--mocha-red: #f38ba8          /* Error messages */
```

**Typography** [Source: UX-Design.md§2.2]
- **Font Family:** Plus Jakarta Sans (loaded via Google Fonts in Story 1.1)
- **Button Text:** 1rem (16px), weight 600
- **Input Labels:** 0.875rem (14px), weight 600
- **Error Messages:** 0.875rem (14px), weight 400, Mocha Red (#f38ba8)
- **Logo:** Horizontal SVG, 200×60px

**Interactive Element Styling** [Source: UX-Design.md§4]
- **Border Radius:** 10px for inputs/buttons, 16px for cards
- **Focus States:** Orange border (#F25C05) + box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1)
- **Hover States:** Darker color + translateY(-2px) + increased shadow
- **Transitions:** all 200ms ease for smooth interactions
- **Shadows:**
  - Card: 0 4px 20px rgba(0, 0, 0, 0.3)
  - Button hover: 0 6px 16px rgba(242, 92, 5, 0.3)

### File Structure Context

**Expected File Locations:**
```
novacrm/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              ← LOGIN PAGE (create this)
│   ├── dashboard/
│   │   └── page.tsx                  ← PROTECTED ROUTE (create placeholder)
│   ├── components/
│   │   └── ui/
│   │       └── Toast.tsx             ← TOAST NOTIFICATION (create this)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← ALREADY EXISTS (Story 1.2)
│   │   │   └── server.ts             ← ALREADY EXISTS (Story 1.2)
│   │   └── types/
│   │       └── database.ts           ← ALREADY EXISTS (Story 1.2)
│   └── api/
│       └── health/
│           └── db/
│               └── route.ts          ← ALREADY EXISTS (Story 1.2)
├── public/
│   └── nova-crm-logo.svg             ← ALREADY EXISTS (Story 1.1)
└── .env.local                        ← ALREADY EXISTS (Story 1.1)
```

**Dependencies Already Installed:** [Source: Architecture.md§1.1]
- ✅ @supabase/supabase-js@^2.39.0
- ✅ @supabase/ssr@^0.8.0
- ✅ next@^15.0.0
- ✅ react@^19.0.0
- ✅ typescript@^5.3.0

### Testing Requirements

**Manual Testing Checklist:**
1. **Form Validation:**
   - Empty email → error message appears
   - Invalid email format → error message appears
   - Empty password → error message appears
   - All errors clear when fields are corrected

2. **Authentication Flow:**
   - Invalid credentials → toast error appears
   - Valid credentials → successful login, redirect to /dashboard
   - Session persists on page refresh
   - httpOnly cookies visible in browser DevTools

3. **UI/UX Verification:**
   - Login page matches Catppuccin Mocha color specs exactly
   - Logo displays correctly (200×60px)
   - Inputs have orange focus states
   - Button has hover effects (darker orange, lift, shadow)
   - Button loading state shows "Signing in..." and is disabled

4. **Protected Route Testing:**
   - Access /dashboard without login → redirect to /login
   - Login → access /dashboard → page renders with user email
   - Logout (future story) → access /dashboard → redirect to /login

5. **Token Management:**
   - Verify tokens stored in httpOnly cookies (not localStorage)
   - Verify automatic token refresh near expiration
   - Verify session survives page refresh

### Known Gotchas & Common Mistakes

**🚫 DO NOT:**
- ❌ Store JWT tokens in localStorage (security risk - use httpOnly cookies via @supabase/ssr)
- ❌ Create client.ts and server.ts again (they already exist from Story 1.2)
- ❌ Forget 'use client' directive on login page (needs client-side state for form)
- ❌ Use createServerClient on client components (causes hydration errors)
- ❌ Hardcode passwords in test user creation code (create via Supabase dashboard)
- ❌ Skip manual users table insertion after creating auth.users (tables must stay in sync)

**✅ DO:**
- ✓ Use `await createClient()` for server components (async function from Story 1.2)
- ✓ Use `createClient()` for client components (synchronous function from Story 1.2)
- ✓ Import redirect from 'next/navigation' for server-side redirects
- ✓ Use Next.js Image component for logo optimization
- ✓ Test with real Supabase auth (don't mock in development)
- ✓ Verify cookie names match Supabase's expected format (sb-{project-ref}-auth-token)

**TypeScript Type Safety:**
```typescript
// Use generated types from Story 1.2
import { Database } from '@/app/lib/types/database'
import { createClient } from '@/app/lib/supabase/client'

const supabase = createClient<Database>()
// Now TypeScript knows the shape of all database tables
```

### Recent Git Context

**Last 5 Commits:** [Source: git log --oneline -5]
```
2dfaeeb Mark Story 1.2 complete - Database setup with RLS security
0e15c48 Complete Story 1.2: Supabase Database Setup & Core Tables
92d279f Mark Story 1.1 complete - Next.js initialization and Vercel deployment
a301424 Integrate Nova CRM logo and favicon from design guidance
3af4ce1 Configure Catppuccin Mocha design system and Plus Jakarta Sans font
```

**Key Patterns from Recent Commits:**
1. **Commit Message Format:** "Complete Story X.Y: [Title]" followed by detailed body
2. **Files Created in Story 1.1:**
   - Logo assets: public/nova-crm-logo.svg
   - TailwindCSS configuration with Catppuccin Mocha colors
   - Plus Jakarta Sans font integration via next/font/google

3. **Files Created in Story 1.2:**
   - Supabase client utilities: app/lib/supabase/client.ts, server.ts
   - TypeScript types: app/lib/types/database.ts
   - Database health check: app/api/health/db/route.ts
   - Migration file: novacrm/supabase/migrations/001_initial_schema.sql

**Established Code Patterns:**
- ✓ TypeScript strict mode enabled
- ✓ @/ path alias configured for app directory
- ✓ Environment variables prefixed with NEXT_PUBLIC_ for client-side access
- ✓ Comprehensive JSDoc comments in utility files
- ✓ Error handling with try/catch and user-friendly messages

### Prerequisites & Dependencies

**Prerequisites:**
- ✅ Story 1.1 complete: Next.js initialized, Vercel deployed, logo assets available
- ✅ Story 1.2 complete: Database setup, Supabase clients created, RLS enabled

**Blockers:** None (all prerequisites satisfied)

**Dependencies for This Story:**
- Supabase project must be accessible (URL: https://uavqmlqkuvjhgnuwcsqx.supabase.co)
- Environment variables must be set in .env.local (already configured in Story 1.1)
- Logo asset must exist at public/nova-crm-logo.svg (already exists from Story 1.1)

## References

**Primary Sources:**
- [Architecture.md§3 - Authentication & Authorization](../Architecture.md#authentication--authorization)
- [UX-Design.md§2 - Design System Foundation](../UX-Design.md#design-system-foundation)
- [Epics.md Epic 1 Story 1.3](../epics.md#story-13-supabase-authentication-configuration)
- [Epics.md Epic 1 Story 1.4](../epics.md#story-14-login-page-with-dark-theme-ui)
- [Story 1.2 Completion Notes](./1-2-supabase-database-setup-core-tables.md)

**External Documentation:**
- [@supabase/ssr Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Catppuccin Mocha Color Palette](https://github.com/catppuccin/catppuccin)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Plan

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes List

<!-- Will be populated during dev-story execution -->

### File List

<!-- Will be populated during dev-story execution -->

## Change Log

- 2025-12-09 (Initial): Story created with comprehensive context from Epic 1 Stories 1.3 & 1.4, Architecture.md, UX-Design.md, and previous story learnings from Story 1.2. Combined authentication configuration and login page UI into single implementable story. Marked as ready-for-dev with full developer context.