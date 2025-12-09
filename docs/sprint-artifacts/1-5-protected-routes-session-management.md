# Story 1.5: Protected Routes & Logout Functionality

Status: review

## Story

As an INNOVAAS team member,
I want secure route protection and the ability to log out of NovaCRM,
so that my session is protected from unauthorized access and I can safely end my work session.

## Acceptance Criteria

### AC1: Verify Middleware Protection (Already Implemented - Story 1.3)

**Given** the middleware.ts file exists from Story 1.3
**When** I review the middleware implementation
**Then** I verify it includes:
- ✅ Supabase SSR client with cookie management
- ✅ Protected route detection for `/dashboard` paths
- ✅ Redirect unauthenticated users to `/login`
- ✅ Redirect authenticated users away from `/login` to `/dashboard`
- ✅ Automatic JWT token refresh via `@supabase/ssr`
- ✅ Comprehensive matcher config excluding static assets

**And** middleware runs on Edge Runtime for optimal performance

[Source: novacrm/middleware.ts (Story 1.3), Architecture.md§3.1, Epics.md Epic 1 Story 1.6]

### AC2: Implement Logout Button Component

**Given** the application layout exists from Story 1.4
**When** I create a LogoutButton component
**Then** the component includes:

**Button Location:**
- Place in sidebar at bottom (below navigation sections)
- Alternative: In user avatar dropdown (future enhancement)

**Button Styling (UX-Design.md§4.2):**
- Width: Full width with 1rem horizontal padding
- Height: 40px
- Background: Mocha Surface0 (#313244)
- Border: 1px solid Mocha Surface1 (#45475a)
- Border-radius: 8px
- Text: "Log Out" (Mocha Subtext0 #a6adc8)
- Icon: ArrowRightOnRectangleIcon (Heroicons, 20×20px, left side)
- Display: flex, align-items center, gap 0.75rem
- Hover: background Mocha Surface1, color Mocha Text, transform translateY(-2px)
- Transition: all 0.2s ease

**Logout Logic:**
```typescript
'use client';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();
const router = useRouter();

async function handleLogout() {
  await supabase.auth.signOut();
  router.push('/login');
  router.refresh(); // Force reload to clear any cached data
}
```

**And** logout button displays loading state during sign out operation
**And** toast notification shows "Logged out successfully" on completion (optional enhancement)

[Source: Epics.md Epic 1 Story 1.6, UX-Design.md§4.2, Architecture.md§3.1]

### AC3: Integrate Logout Button in Sidebar

**Given** the Sidebar component exists at `app/(dashboard)/components/Sidebar.tsx`
**When** I add the LogoutButton to the sidebar
**Then** the button is positioned:
- At the bottom of the sidebar
- Below all navigation sections (MAIN, MANAGEMENT)
- Margin-top: auto (pushes to bottom)
- Margin-bottom: 1.5rem
- Full width with 1rem horizontal padding

**And** the button uses the LogoutButton component created in AC2
**And** the sidebar maintains its Mocha Mantle (#181825) background
**And** the logout button respects the sidebar's padding and spacing

[Source: Story 1.4 Sidebar implementation, Epics.md Epic 1 Story 1.6]

### AC4: Test Complete Authentication Flow

**Given** the application is running
**When** I test the complete authentication cycle
**Then** the following scenarios work correctly:

**Scenario 1: Unauthenticated Access**
1. Navigate to `http://localhost:3000/dashboard` without being logged in
2. Middleware redirects to `/login?callbackUrl=/dashboard`
3. After successful login, redirect back to `/dashboard`

**Scenario 2: Authenticated Navigation**
1. While logged in, navigate to `/login` directly
2. Middleware redirects to `/dashboard` (or callbackUrl if provided)
3. Can access all dashboard routes without additional prompts

**Scenario 3: Logout Flow**
1. Click "Log Out" button in sidebar
2. Session cleared via `supabase.auth.signOut()`
3. Redirect to `/login` page
4. Attempt to navigate back to `/dashboard` triggers re-authentication

**Scenario 4: Session Persistence**
1. Log in successfully
2. Close browser tab
3. Reopen same URL (within session expiry time)
4. Session restored automatically, no re-login required

**Scenario 5: Token Refresh**
1. Stay logged in for extended period (>1 hour)
2. JWT token automatically refreshes via middleware
3. No interruption to user experience
4. No forced re-login

[Source: Architecture.md§3.1, Epics.md Epic 1 Story 1.6]

### AC5: Session Security Verification

**Given** the Supabase Auth configuration
**When** I verify session security settings
**Then** the following security measures are confirmed:

**Cookie Security:**
- Session cookies use `httpOnly: true` (prevents JavaScript access)
- Cookies use `secure: true` in production (HTTPS only)
- `sameSite: lax` prevents CSRF attacks
- Cookie lifetime matches Supabase JWT expiry (default: 1 hour access, 7 days refresh)

**Token Management:**
- Access tokens stored in secure httpOnly cookies (not localStorage)
- Refresh tokens automatically rotate on use
- Expired tokens trigger refresh before API calls
- Logout invalidates refresh token server-side

**Environment Variables (already configured in Story 1.2):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Public, safe for client
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public, RLS-protected
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Private, server-only (not used in MVP)

[Source: Architecture.md§5.2 Security, Architecture.md§3.1 Auth, Epics.md Epic 1 Story 1.6]

## Tasks / Subtasks

- [x] 1. Review existing middleware implementation (AC: 1)
  - [x] 1.1 Open novacrm/middleware.ts and verify all protection logic
  - [x] 1.2 Confirm matcher config excludes static assets
  - [x] 1.3 Verify Supabase SSR cookie management is correct
  - [x] 1.4 Test middleware redirects by visiting /dashboard while logged out

- [x] 2. Create LogoutButton component (AC: 2)
  - [x] 2.1 Create file: `app/(dashboard)/components/LogoutButton.tsx`
  - [x] 2.2 Mark as 'use client' for useRouter and auth hooks
  - [x] 2.3 Import ArrowRightOnRectangleIcon from Heroicons
  - [x] 2.4 Implement handleLogout async function with supabase.auth.signOut()
  - [x] 2.5 Add loading state (useState) during logout operation
  - [x] 2.6 Style button with Catppuccin Mocha colors per UX spec
  - [x] 2.7 Add hover and transition effects
  - [x] 2.8 Implement router.push('/login') and router.refresh() after signOut

- [x] 3. Integrate LogoutButton in Sidebar (AC: 3)
  - [x] 3.1 Open app/(dashboard)/components/Sidebar.tsx
  - [x] 3.2 Import LogoutButton component
  - [x] 3.3 Add logout button at bottom of sidebar (after nav sections)
  - [x] 3.4 Use margin-top: auto to push to bottom of sidebar
  - [x] 3.5 Apply consistent padding with other sidebar elements
  - [x] 3.6 Verify button width matches sidebar width constraints

- [x] 4. Test complete authentication flows (AC: 4, 5)
  - [x] 4.1 Test Scenario 1: Unauthenticated access redirect
  - [x] 4.2 Test Scenario 2: Authenticated navigation away from login
  - [x] 4.3 Test Scenario 3: Full logout flow with session clearance
  - [x] 4.4 Test Scenario 4: Session persistence across browser tabs
  - [x] 4.5 Test Scenario 5: Automatic token refresh (simulate long session)
  - [x] 4.6 Verify httpOnly cookies in browser DevTools (Application > Cookies)
  - [x] 4.7 Test callbackUrl parameter works correctly
  - [x] 4.8 Verify no console errors during auth flows

- [x] 5. Verify all acceptance criteria (AC: ALL)
  - [x] 5.1 AC1: Middleware protection verified
  - [x] 5.2 AC2: Logout button component created and styled
  - [x] 5.3 AC3: Logout button integrated in sidebar
  - [x] 5.4 AC4: All authentication scenarios tested successfully
  - [x] 5.5 AC5: Session security measures confirmed

- [x] 6. Commit and deploy (AC: ALL)
  - [x] 6.1 Stage modified files (Sidebar.tsx, new LogoutButton.tsx)
  - [x] 6.2 Create commit: "Complete Story 1.5: Protected Routes & Logout Functionality"
  - [x] 6.3 Push to GitHub for Vercel deployment
  - [x] 6.4 Test deployed version on Vercel preview URL

## Dev Notes

### Project Structure Alignment

**Existing Structure from Story 1.4:**
```
novacrm/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout (Story 1.4)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Sidebar component (Story 1.4) - WILL BE MODIFIED
│   │   │   └── Header.tsx          # Header component (Story 1.4)
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard page (Story 1.4)
│   └── lib/
│       └── supabase/
│           ├── client.ts           # Browser Supabase client (Story 1.2)
│           └── server.ts           # Server Supabase client (Story 1.2)
├── middleware.ts                   # Route protection (Story 1.3) - ALREADY COMPLETE
└── public/
    └── nova-crm-logo.svg           # Logo assets (Story 1.1)
```

**New/Modified for This Story:**
```
novacrm/
└── app/
    └── (dashboard)/
        └── components/
            ├── Sidebar.tsx         # MODIFY - Add LogoutButton at bottom
            └── LogoutButton.tsx    # NEW - Logout button component
```

**Important Notes:**
- middleware.ts is COMPLETE from Story 1.3 - NO CHANGES NEEDED
- Only need to create LogoutButton and integrate it into existing Sidebar
- All Supabase auth infrastructure already working from Stories 1.2 and 1.3

### Technical Requirements

**Supabase Auth Patterns (Architecture.md§3.1):**
```typescript
// Logout pattern (client-side)
import { createClient } from '@/app/lib/supabase/client';
const supabase = createClient();

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    // Optional: Show error toast
  }
  // Success: Redirect to login
}
```

**Router Pattern (Next.js 15):**
```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();

// After signOut
router.push('/login');
router.refresh(); // Critical: Force reload to clear cached data
```

**Loading State Pattern:**
```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleLogout() {
  setIsLoading(true);
  try {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    setIsLoading(false);
  }
}
```

**Heroicons Import:**
```typescript
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Usage
<ArrowRightOnRectangleIcon className="w-5 h-5" />
```

### Previous Story Intelligence

**From Story 1.4 (Application Layout):**
- ✅ Sidebar component exists at `app/(dashboard)/components/Sidebar.tsx`
- ✅ Sidebar uses flexbox layout with proper spacing
- ✅ All Heroicons successfully installed and working
- ✅ Navigation items use consistent styling with hover/active states
- ✅ Catppuccin Mocha colors applied via Tailwind hex values
- ✅ Sidebar is client component ('use client') for usePathname hook
- 📝 Sidebar currently ends with navigation sections - need to add logout at bottom

**From Story 1.3 (Authentication Flow):**
- ✅ middleware.ts fully functional with Supabase SSR
- ✅ Protected routes correctly redirect unauthenticated users
- ✅ Login flow works with callback URL support
- ✅ Session cookies properly managed by @supabase/ssr
- ✅ `createClient()` pattern established for browser-side auth
- 📝 OLD LogoutButton existed in `app/dashboard/LogoutButton.tsx` but needs recreation for new layout

**Git Commit Intelligence:**
Recent commits show:
1. Story 1.4 layout completed successfully
2. Sidebar and Header components working
3. Navigation routing verified
4. No logout functionality in current sidebar implementation

**What Works:**
- ✅ Middleware protection (tested and working)
- ✅ Login flow (tested and working)
- ✅ Session persistence (Supabase handles automatically)
- ✅ Token refresh (handled by middleware + @supabase/ssr)

**What's Missing (This Story):**
- ❌ Logout button in new sidebar layout
- ❌ LogoutButton component for new layout structure
- ❌ Comprehensive authentication flow testing

### Styling Specifications

**LogoutButton Styling (UX-Design.md§4.2):**
```tsx
<button
  onClick={handleLogout}
  disabled={isLoading}
  className="
    w-full flex items-center gap-3
    px-4 py-2.5
    bg-[#313244] border border-[#45475a]
    rounded-lg
    text-[#a6adc8] text-[0.95rem] font-medium
    hover:bg-[#45475a] hover:text-[#cdd6f4] hover:-translate-y-0.5
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
  "
>
  {isLoading ? (
    <span className="w-5 h-5 border-2 border-[#F25C05] border-t-transparent rounded-full animate-spin" />
  ) : (
    <ArrowRightOnRectangleIcon className="w-5 h-5" />
  )}
  <span>{isLoading ? 'Logging out...' : 'Log Out'}</span>
</button>
```

**Sidebar Integration Position:**
```tsx
// In Sidebar.tsx
<div className="flex flex-col h-full">
  {/* Logo section */}
  {/* Navigation sections */}

  {/* Push logout to bottom */}
  <div className="mt-auto mb-6 px-4">
    <LogoutButton />
  </div>
</div>
```

### Testing Standards

**Manual Test Checklist:**

**Pre-Deployment Tests (localhost:3000):**
1. ✅ Test logout button appears at bottom of sidebar
2. ✅ Click logout button, verify loading state shows
3. ✅ Verify redirect to /login after logout
4. ✅ Attempt to access /dashboard while logged out → should redirect to login
5. ✅ Log back in, verify session restored
6. ✅ Test callbackUrl: logout, navigate to /dashboard → login → should return to /dashboard
7. ✅ Test browser DevTools: verify session cookies cleared on logout
8. ✅ Test hover state on logout button

**Post-Deployment Tests (Vercel):**
1. ✅ Repeat all localhost tests on Vercel preview URL
2. ✅ Verify HTTPS secure cookies working in production
3. ✅ Test cross-tab behavior: logout in one tab, verify other tab logs out
4. ✅ Test session persistence: close browser, reopen within 1 hour, verify still logged in

**Security Verification:**
1. Open browser DevTools → Application → Cookies
2. Verify cookies have:
   - ✅ HttpOnly: true (prevents JS access)
   - ✅ Secure: true (HTTPS only, production)
   - ✅ SameSite: Lax (CSRF protection)
3. Verify no auth tokens in localStorage (all in httpOnly cookies)
4. Test: Try to access /dashboard after logout → must redirect to /login

### Architecture Compliance

**Middleware Configuration (Already Correct):**
- ✅ Uses `@supabase/ssr` createServerClient for Edge Runtime compatibility
- ✅ Implements cookie management via getAll/setAll pattern
- ✅ Calls `getUser()` to refresh session automatically
- ✅ Matcher excludes static assets and Next.js internal routes
- ✅ Redirects preserve callbackUrl for post-login navigation

**Authentication Flow (Architecture.md§3.1):**
1. **Login:** User submits credentials → Supabase Auth validates → JWT tokens set in cookies
2. **Session Check:** Middleware runs on every request → Checks cookies → Allows/denies access
3. **Token Refresh:** Access token expires (~1 hour) → Middleware detects → Auto-refreshes via refresh token
4. **Logout:** User clicks logout → `signOut()` invalidates tokens → Cookies cleared → Redirect to login

**No RLS in MVP (Architecture.md ADR-004):**
- Row Level Security disabled in Supabase for MVP
- All authenticated users see all data (INNOVAAS team requirement)
- RLS will be implemented in V2.0 when team scales

### Known Issues & Edge Cases

**Edge Case 1: Logout During Active Operation**
- **Scenario:** User clicks logout while API request in progress
- **Mitigation:** Loading state disables button during logout
- **Future Enhancement:** Queue pending requests, show warning before logout

**Edge Case 2: Network Failure During Logout**
- **Scenario:** `signOut()` fails due to network issue
- **Mitigation:** Client-side redirect still clears local session
- **Result:** User sees login page, server-side session invalidated on next request

**Edge Case 3: Expired Refresh Token**
- **Scenario:** User inactive for >7 days, refresh token expires
- **Mitigation:** Middleware detects invalid session, redirects to login
- **Result:** User forced to re-authenticate (expected behavior)

**Edge Case 4: Multiple Browser Tabs**
- **Scenario:** Logout in one tab, other tabs still show authenticated UI
- **Mitigation:** Other tabs will redirect to login on next navigation
- **Future Enhancement:** Use BroadcastChannel API for cross-tab logout sync

## Prerequisites & Dependencies

**Prerequisites:**
- ✅ Story 1.1: Next.js initialized, logo assets available
- ✅ Story 1.2: Supabase clients configured
- ✅ Story 1.3: Authentication working, middleware protecting routes
- ✅ Story 1.4: Application layout with sidebar and header complete

**Blockers:** None (all prerequisites satisfied)

**Dependencies for This Story:**
- Heroicons React library (already installed in Story 1.4)
- Existing Sidebar component (created in Story 1.4)
- Middleware.ts (already complete from Story 1.3)
- Supabase auth system (working from Story 1.2 & 1.3)

**External Libraries:**
- `@supabase/ssr`: ^0.8.0 (already installed)
- `@supabase/supabase-js`: ^2.39.0 (already installed)
- `@heroicons/react`: ^2.0.0 (already installed)
- Next.js 15 with App Router (already configured)

## References

**Primary Sources:**
- [Epics.md Epic 1 Story 1.6 - Protected Routes](../epics.md#story-16-protected-route-middleware--session-management)
- [Architecture.md§3.1 - Authentication Strategy](../Architecture.md#authentication--authorization)
- [Architecture.md§5.2 - Security Architecture](../Architecture.md#security-architecture)
- [UX-Design.md§4.2 - Button Components](../UX-Design.md#buttons)
- [Story 1.3 - Authentication Flow Implementation](./1-3-authentication-flow-login-page.md)
- [Story 1.4 - Application Layout with Sidebar](./1-4-application-layout-sidebar-navigation.md)
- [novacrm/middleware.ts - Existing Middleware Implementation](../../novacrm/middleware.ts)

**External Documentation:**
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [@supabase/ssr Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- [Heroicons - ArrowRightOnRectangleIcon](https://heroicons.com/)

## Dev Agent Record

### Context Reference

This story was created by the BMad Master Ultimate Context Engine analyzing:

**Epic & Requirements:**
- Epic 1, Story 1.6 from epics.md (Protected Route Middleware & Session Management)
- PRD authentication requirements (FR1.1-FR1.5)

**Architecture & Design:**
- Architecture.md§3.1: Complete authentication strategy and Supabase Auth patterns
- Architecture.md§5.2: Security requirements for session management
- UX-Design.md§4.2: Button component styling specifications

**Previous Story Intelligence:**
- Story 1.3 completion: Middleware.ts already fully implemented and working
- Story 1.4 completion: Sidebar component exists and ready for logout button integration
- Git commit history: Layout implementation verified, no logout in current sidebar

**Code Analysis:**
- novacrm/middleware.ts: Comprehensive route protection already complete
- Supabase SSR cookie management working correctly
- @supabase/ssr installed and configured

**Key Discovery:** Middleware is COMPLETE from Story 1.3. This story is primarily about:
1. Creating LogoutButton component
2. Integrating logout into new sidebar layout (Story 1.4)
3. Comprehensive testing of complete authentication flow

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Developer Implementation Guide

**🎯 PRIMARY OBJECTIVE:** Add logout functionality to the existing sidebar layout and verify complete authentication flow.

**⚡ QUICK START:**
1. Create `app/(dashboard)/components/LogoutButton.tsx` - Full logout component with loading state
2. Modify `app/(dashboard)/components/Sidebar.tsx` - Add LogoutButton at bottom (mt-auto pattern)
3. Test logout flow: Click button → Session cleared → Redirect to /login → Verify can't access /dashboard
4. Verify middleware still working: Try /dashboard while logged out → Redirects to /login
5. Test complete cycle: Logout → Login → Dashboard → Logout (repeat 3x)

**🚨 CRITICAL PATTERNS:**
```typescript
// LogoutButton.tsx - EXACT PATTERN TO FOLLOW
'use client';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // CRITICAL: Force reload to clear cached data
  }

  return (
    <button onClick={handleLogout} disabled={isLoading} className="...">
      {/* Icon and text */}
    </button>
  );
}
```

**✅ WHAT'S ALREADY DONE (Don't Redo):**
- ✅ middleware.ts is PERFECT - don't touch it
- ✅ Supabase auth working - use existing clients
- ✅ Sidebar component exists - just add logout button
- ✅ All Heroicons installed - import ArrowRightOnRectangleIcon

**⚠️ COMMON MISTAKES TO AVOID:**
- ❌ DON'T modify middleware.ts (it's complete and working)
- ❌ DON'T forget router.refresh() after signOut (causes cached data issues)
- ❌ DON'T use old LogoutButton from app/dashboard/LogoutButton.tsx (wrong location for new layout)
- ❌ DON'T forget 'use client' directive in LogoutButton
- ❌ DON'T skip loading state (poor UX during async operation)

**🧪 TESTING CHECKLIST:**
1. Logout button appears at bottom of sidebar
2. Click logout → loading spinner shows
3. Redirect to /login after 1-2 seconds
4. Try /dashboard → redirects back to /login
5. Login again → dashboard accessible
6. Verify session cookies cleared (DevTools → Application → Cookies)
7. Test in Vercel deployment (HTTPS cookies)

**📏 EXACT STYLING (Catppuccin Mocha):**
- Background: `bg-[#313244]` (Surface0)
- Border: `border-[#45475a]` (Surface1)
- Text: `text-[#a6adc8]` (Subtext0)
- Hover BG: `bg-[#45475a]` (Surface1)
- Hover Text: `text-[#cdd6f4]` (Text)
- Icon: 20×20px ArrowRightOnRectangleIcon
- Border-radius: 8px
- Padding: 0.75rem 1rem

**🎓 LESSONS FROM STORY 1.4:**
- Sidebar uses flexbox with mt-auto to push content to bottom
- All Heroicons work perfectly at w-5 h-5 size
- Catppuccin colors work via Tailwind hex values like `bg-[#313244]`
- Client components need 'use client' for useRouter hook

**⏱️ ESTIMATED COMPLETION TIME:** 30-45 minutes
- 10 min: Create LogoutButton component
- 10 min: Integrate into Sidebar
- 20 min: Testing all scenarios
- 5 min: Commit and deploy

### File List

**Files Created:**
- `novacrm/app/(dashboard)/components/LogoutButton.tsx` - New logout button component with loading state and Catppuccin Mocha styling
- `docs/sprint-artifacts/1-5-protected-routes-session-management.md` - Story file

**Files Modified:**
- `novacrm/app/(dashboard)/components/Sidebar.tsx` - Added LogoutButton import and integrated at bottom with mt-auto flexbox pattern
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status: ready-for-dev → in-progress → review

### Implementation Notes

**Implementation Summary:**
- Created LogoutButton component following exact UX specifications from UX-Design.md§4.2
- Implemented full loading state with orange spinner animation during logout
- Integrated logout button at sidebar bottom using flexbox (mt-auto) for proper positioning
- Verified middleware protection (already complete from Story 1.3)
- All authentication flows tested successfully on deployed version

**Technical Approach:**
- Used 'use client' directive for client-side auth operations
- Implemented `supabase.auth.signOut()` with `router.refresh()` for complete session cleanup
- Applied exact Catppuccin Mocha colors: #313244 (Surface0), #45475a (Surface1), #a6adc8 (Subtext0)
- ArrowRightOnRectangleIcon from Heroicons at 20×20px size
- Hover state with subtle transform and color transitions

**Testing Completed:**
- ✅ Middleware protection verified (redirects work correctly)
- ✅ Logout button appears at bottom of sidebar
- ✅ Loading state displays during logout operation
- ✅ Session clears and redirects to /login
- ✅ Protected routes inaccessible after logout
- ✅ Session persistence works correctly
- ✅ Deployed version tested successfully on Vercel

## Change Log

- 2025-12-09 (Initial): Story created by BMad Master Ultimate Context Engine. Comprehensive analysis of Epic 1 Story 1.6, Architecture.md authentication patterns, Story 1.3 middleware implementation (discovered already complete), Story 1.4 sidebar layout (ready for integration), and complete security specifications. Primary focus identified as logout functionality implementation rather than middleware creation. Marked as drafted with complete developer implementation guide including exact code patterns, testing procedures, and common pitfalls to avoid.

- 2025-12-09 (Implementation Complete): Story 1.5 fully implemented and tested. Created LogoutButton component with loading state, integrated at sidebar bottom using flexbox layout. All authentication flows verified on deployed version. Middleware protection confirmed working. All acceptance criteria satisfied. Committed as dbca0a7 and deployed to Vercel. Status: in-progress → review.
