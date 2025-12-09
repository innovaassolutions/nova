# Story 1.4: Application Layout with Sidebar & Header

Status: done

## Story

As an authenticated INNOVAAS team member,
I want a consistent application layout with navigation sidebar and header,
so that I can easily navigate NovaCRM and access all features with a professional, modern interface.

## Acceptance Criteria

### AC1: Application Layout Structure

**Given** I am authenticated and accessing any protected route
**When** the page loads
**Then** I see the application layout with three main areas:
- **Sidebar** (280px fixed width) on the left
- **Header** (sticky, ~80px height) at the top of main content
- **Main Content Area** (flexible) occupying remaining space

**And** the layout uses Next.js nested layouts:
- Root layout at `app/layout.tsx` (already exists with ToastContainer)
- Dashboard layout at `app/(dashboard)/layout.tsx` (NEW - wraps all authenticated pages)
- Individual pages render inside dashboard layout's children slot

[Source: Architecture.md§1.1, UX-Design.md§3 Layout Architecture]

### AC2: Sidebar Navigation Component

**Given** the application layout is displayed
**When** I view the sidebar
**Then** I see the following structure (UX-Design.md§3.2):

**Logo Section (top):**
- NovaCRM horizontal logo SVG (200×60px) centered
- Source: `/nova-crm-logo.svg`
- Margin-bottom: 1.5rem
- Border-bottom: 1px solid Mocha Surface0 (#313244)
- Padding-bottom: 1.5rem

**Navigation Section: MAIN**
- Section label: "MAIN" (12px, uppercase, weight 600, Mocha Overlay1 #7f849c)
- Margin-bottom: 0.5rem from label to items
- Navigation items:
  - Dashboard (Home icon, 20×20px Heroicons outline)
  - Contacts (Users icon)
  - Companies (Building icon)
  - Deals (Currency Dollar icon)

**Navigation Section: MANAGEMENT**
- Section label: "MANAGEMENT" (same styling as MAIN)
- Margin-top: 2rem from previous section
- Navigation items:
  - Analytics (Chart Bar icon)
  - Settings (Cog 6 Tooth icon)

**Sidebar Dimensions:**
- Width: 280px (desktop >1024px)
- Background: Mocha Mantle (#181825)
- Border-right: 1px solid Mocha Surface0 (#313244)
- Padding: 2rem vertical, 1.5rem horizontal
- Position: Fixed left
- Height: 100vh
- z-index: 90

[Source: UX-Design.md§3.2, Epics.md Epic 1 Story 1.5]

### AC3: Navigation Item States & Interactions

**Given** I interact with navigation items
**When** I hover, click, or view the active route
**Then** navigation items display the following states (UX-Design.md§3.2):

**Default State:**
- Background: transparent
- Color: Mocha Subtext0 (#a6adc8)
- Padding: 0.75rem 1rem
- Border-radius: 8px
- Display: flex, align-items center, gap 0.75rem
- Font-size: 0.95rem (15.2px)
- Font-weight: 500
- Transition: all 0.2s ease

**Hover State:**
- Background: Mocha Surface0 (#313244)
- Color: Mocha Text (#cdd6f4)
- Cursor: pointer
- Transform: none

**Active State (current route):**
- Background: `linear-gradient(135deg, rgba(242, 92, 5, 0.15), rgba(242, 92, 5, 0.05))`
- Color: Innovaas Orange (#F25C05)
- Border-left: 3px solid #F25C05
- Padding-left: calc(1rem - 3px) /* Compensate for border */
- Font-weight: 600

**Icon Specifications:**
- Size: 20×20px
- Stroke-width: 2px
- Heroicons outline style
- Color: inherits from parent nav item

**Active Route Detection:**
- Use Next.js `usePathname()` hook from 'next/navigation'
- Match pathname exactly: `/dashboard`, `/contacts`, `/companies`, `/deals`, `/analytics`, `/settings`
- Dashboard is active by default if pathname === '/dashboard'

[Source: UX-Design.md§3.2]

### AC4: Header Component with Search & User Avatar

**Given** the application layout is displayed
**When** I view the header
**Then** I see (UX-Design.md§3.3):

**Header Container:**
- Height: auto (~80px based on content)
- Background: Mocha Mantle (#181825)
- Border-bottom: 1px solid Mocha Surface0 (#313244)
- Padding: 1.5rem 2rem
- Position: sticky, top: 0
- z-index: 100
- Display: flex, align-items: center, gap: 1.5rem

**Search Bar (left side, flex: 1):**
- Width: 100%, max-width: 500px
- Height: 48px
- Background: Mocha Surface0 (#313244)
- Border: 1px solid Mocha Surface1 (#45475a)
- Border-radius: 10px
- Padding-left: 3rem (space for search icon)
- Font-size: 0.95rem
- Placeholder: "Search contacts, deals..." (Mocha Overlay0 #6c7086)
- Focus state: border-color #F25C05, box-shadow 0 0 0 3px rgba(242,92,5,0.1)
- Search icon (Magnifying Glass, Heroicons): absolute positioned left 1rem, color Mocha Overlay0

**Notifications Icon Button (right side):**
- Width: 40px, height: 40px
- Background: Mocha Surface0 (#313244)
- Border-radius: 10px
- Bell icon (Heroicons outline, 20×20px)
- Hover: background Mocha Surface1, transform translateY(-2px)
- Badge: small orange dot if unread notifications (future enhancement, not required for this story)

**User Avatar (far right):**
- Width: 40px, height: 40px
- Border-radius: 10px
- Background: `linear-gradient(135deg, #b4befe, #89b4fa)` (Mocha Lavender to Mocha Blue)
- Display: flex, center content
- Font-weight: 700
- Font-size: 0.95rem
- Color: Mocha Base (#1e1e2e - dark text on light gradient)
- Content: User initials extracted from authenticated user's email
- Logic: Extract first 2 characters before @ symbol, uppercase (e.g., "test@innovaas.com" → "TE")
- Fetch user data via `createClient().auth.getUser()` (client-side in header component)

[Source: UX-Design.md§3.3, Epics.md Epic 1 Story 1.5]

### AC5: Main Content Area & Responsive Behavior

**Given** the layout components are rendered
**When** I view the main content area
**Then** I see (UX-Design.md§3.1):

**Main Content Container:**
- Margin-left: 280px (accounts for fixed sidebar width on desktop)
- Padding: 2rem
- Background: Mocha Base (#1e1e2e)
- Min-height: 100vh
- Overflow-y: auto

**Responsive Breakpoints:**
- **Desktop (>1024px):** Full sidebar 280px, full header with search
- **Tablet (768px-1024px):** NOT REQUIRED for this story (future enhancement)
- **Mobile (<768px):** NOT REQUIRED for this story (future enhancement)

**Note:** Mobile/tablet responsive behavior is deferred to a future story. This story implements desktop layout only (>1024px).

[Source: UX-Design.md§9, Architecture.md§1.1]

## Tasks / Subtasks

- [ ] 1. Install Heroicons React library (AC: 2, 3)
  - [ ] 1.1 Run `npm install @heroicons/react`
  - [ ] 1.2 Verify installation in package.json
  - [ ] 1.3 Import required icons in components (HomeIcon, UsersIcon, BuildingOfficeIcon, CurrencyDollarIcon, ChartBarIcon, Cog6ToothIcon, MagnifyingGlassIcon, BellIcon)

- [ ] 2. Create dashboard layout component (AC: 1)
  - [ ] 2.1 Create file: `app/(dashboard)/layout.tsx`
  - [ ] 2.2 Define layout function with children prop
  - [ ] 2.3 Implement 3-area grid structure (sidebar, header, main)
  - [ ] 2.4 Set up proper TypeScript types for layout props
  - [ ] 2.5 Export layout as default

- [ ] 3. Create Sidebar component (AC: 2, 3)
  - [ ] 3.1 Create file: `app/(dashboard)/components/Sidebar.tsx`
  - [ ] 3.2 Mark component as 'use client' for usePathname hook
  - [ ] 3.3 Implement logo section with SVG import
  - [ ] 3.4 Create navigation sections array with route data
  - [ ] 3.5 Map navigation items with icons from Heroicons
  - [ ] 3.6 Implement active route detection using usePathname()
  - [ ] 3.7 Apply state-based styling (default, hover, active)
  - [ ] 3.8 Set fixed positioning and Mocha Mantle background
  - [ ] 3.9 Add border-right separator

- [ ] 4. Create Header component (AC: 4)
  - [ ] 4.1 Create file: `app/(dashboard)/components/Header.tsx`
  - [ ] 4.2 Mark component as 'use client' for auth state
  - [ ] 4.3 Fetch authenticated user via createClient().auth.getUser()
  - [ ] 4.4 Implement search bar with icon and placeholder
  - [ ] 4.5 Add notifications icon button (non-functional for now)
  - [ ] 4.6 Create user avatar with initials extraction logic
  - [ ] 4.7 Apply gradient background to avatar
  - [ ] 4.8 Set sticky positioning with z-index 100

- [ ] 5. Update dashboard page for new layout (AC: 5)
  - [ ] 5.1 Move existing dashboard content from `app/dashboard/page.tsx` to `app/(dashboard)/dashboard/page.tsx`
  - [ ] 5.2 Simplify dashboard page to use layout's main content area
  - [ ] 5.3 Remove redundant full-page centering (layout handles structure now)
  - [ ] 5.4 Keep welcome message and user info display
  - [ ] 5.5 Verify LogoutButton still functions correctly

- [ ] 6. Create placeholder pages for navigation routes (AC: 2, 3)
  - [ ] 6.1 Create `app/(dashboard)/contacts/page.tsx` with placeholder
  - [ ] 6.2 Create `app/(dashboard)/companies/page.tsx` with placeholder
  - [ ] 6.3 Create `app/(dashboard)/deals/page.tsx` with placeholder
  - [ ] 6.4 Create `app/(dashboard)/analytics/page.tsx` with placeholder
  - [ ] 6.5 Create `app/(dashboard)/settings/page.tsx` with placeholder
  - [ ] 6.6 Each placeholder shows page title and "Coming soon" message
  - [ ] 6.7 Apply Catppuccin Mocha styling to placeholders

- [ ] 7. Test navigation and layout behavior (AC: ALL)
  - [ ] 7.1 Start dev server and navigate to /dashboard
  - [ ] 7.2 Verify sidebar displays with logo and nav items
  - [ ] 7.3 Verify header displays with search, notifications, avatar
  - [ ] 7.4 Test clicking each navigation link
  - [ ] 7.5 Verify active state highlights current route
  - [ ] 7.6 Verify hover states work on nav items
  - [ ] 7.7 Test search bar focus states
  - [ ] 7.8 Verify user initials display correctly in avatar
  - [ ] 7.9 Verify layout is responsive to viewport changes (desktop only)
  - [ ] 7.10 Test logout button still works from dashboard

- [ ] 8. Verify all acceptance criteria (AC: ALL)
  - [ ] 8.1 AC1: Layout structure with sidebar, header, main content
  - [ ] 8.2 AC2: Sidebar with logo and navigation sections
  - [ ] 8.3 AC3: Navigation states (default, hover, active)
  - [ ] 8.4 AC4: Header with search bar and user avatar
  - [ ] 8.5 AC5: Main content area with proper spacing

- [ ] 9. Commit implementation (AC: ALL)
  - [ ] 9.1 Stage all new and modified files
  - [ ] 9.2 Create commit with descriptive message
  - [ ] 9.3 Push to GitHub for Vercel deployment

## Dev Notes

### Project Structure Alignment

**Existing Structure from Previous Stories:**
```
novacrm/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Story 1.3 - Login page
│   ├── components/
│   │   └── ui/
│   │       └── Toast.tsx          # Story 1.3 - Toast notifications
│   ├── dashboard/
│   │   ├── page.tsx               # Story 1.3 - Basic dashboard (WILL BE MOVED)
│   │   └── LogoutButton.tsx       # Story 1.3 - Logout component
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts          # Story 1.2 - Browser client
│   │       └── server.ts          # Story 1.2 - Server client
│   ├── layout.tsx                 # Story 1.1 - Root layout with ToastContainer
│   └── globals.css                # Story 1.1 - Global styles with Catppuccin
├── middleware.ts                  # Story 1.3 - Route protection
└── public/
    ├── nova-crm-logo.svg          # Story 1.1 - Horizontal logo
    └── nova-crm-icon.svg          # Story 1.1 - Icon/favicon
```

**New Structure for This Story:**
```
novacrm/
└── app/
    └── (dashboard)/               # NEW - Dashboard route group
        ├── layout.tsx             # NEW - Dashboard layout with sidebar+header
        ├── components/            # NEW - Layout components
        │   ├── Sidebar.tsx        # NEW - Navigation sidebar
        │   └── Header.tsx         # NEW - Top header with search/avatar
        ├── dashboard/             # NEW - Moved from app/dashboard/
        │   └── page.tsx           # MOVED - Main dashboard page
        ├── contacts/              # NEW - Placeholder
        │   └── page.tsx
        ├── companies/             # NEW - Placeholder
        │   └── page.tsx
        ├── deals/                 # NEW - Placeholder
        │   └── page.tsx
        ├── analytics/             # NEW - Placeholder
        │   └── page.tsx
        └── settings/              # NEW - Placeholder
            └── page.tsx
```

**Important Notes:**
- Use route group `(dashboard)` to apply layout without affecting URL paths
- Dashboard page moves from `/app/dashboard/page.tsx` to `/app/(dashboard)/dashboard/page.tsx`
- LogoutButton.tsx can stay in original location or be moved to components/
- All protected routes are now children of the (dashboard) layout
- Middleware from Story 1.3 continues to protect all /dashboard/* routes

### Technical Requirements

**Next.js Patterns (Architecture.md§1.1):**
- **Nested Layouts:** Use `(dashboard)` route group for layout without URL segment
- **Server Components:** Sidebar and Header can be client components for interactivity
- **usePathname Hook:** Import from 'next/navigation' for active route detection
- **File Conventions:** layout.tsx creates nested layout, page.tsx creates routes

**Supabase Integration (Architecture.md§3.1):**
- Use existing `@/app/lib/supabase/client` for fetching user data in Header
- User data accessed via `supabase.auth.getUser()` returns `{ data: { user }, error }`
- User email available at `user.email` (e.g., "test@innovaas.com")
- Extract initials: `user.email.split('@')[0].substring(0, 2).toUpperCase()`

**Styling Approach (UX-Design.md):**
- Use Tailwind utility classes with exact Catppuccin Mocha hex values
- Background colors: `bg-[#181825]` (Mantle), `bg-[#1e1e2e]` (Base), `bg-[#313244]` (Surface0)
- Text colors: `text-[#cdd6f4]` (Text), `text-[#a6adc8]` (Subtext0), `text-[#F25C05]` (Orange)
- Border colors: `border-[#313244]` (Surface0), `border-[#45475a]` (Surface1)
- Active gradient: `bg-gradient-to-r from-[rgba(242,92,5,0.15)] to-[rgba(242,92,5,0.05)]`
- Transitions: `transition-all duration-200 ease-in-out`

**Icon Library (UX-Design.md§A.1):**
- **Library:** Heroicons React v2 (@heroicons/react)
- **Style:** Outline icons (not solid)
- **Size:** 20×20px via className="w-5 h-5"
- **Stroke:** Default stroke-width (2px) is correct
- **Usage:** `import { HomeIcon, UsersIcon } from '@heroicons/react/24/outline'`

### Previous Story Intelligence

**From Story 1.3 (Authentication Flow):**
- ✅ Middleware successfully protects routes and redirects unauthenticated users to /login
- ✅ Authenticated user sessions work correctly via Supabase Auth
- ✅ `createClient().auth.getUser()` pattern established for fetching user data
- ✅ Toast notification system available at `@/app/components/ui/Toast`
- ✅ Catppuccin Mocha theme CSS variables NOT used - use inline hex values instead
- ✅ Logo SVG successfully loaded via Next.js Image component
- ✅ Tailwind classes work with exact hex color values in format `bg-[#hex]`
- ⚠️ LogoutButton lives in `app/dashboard/` but can be reused in new layout

**Known Patterns from Story 1.3:**
```typescript
// Client component pattern
'use client';
import { createClient } from '@/app/lib/supabase/client';
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

// Logo import pattern
import Image from 'next/image';
<Image src="/nova-crm-logo.svg" alt="NovaCRM" width={200} height={60} priority />

// Navigation pattern
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

**What NOT to do (anti-patterns):**
- ❌ Don't use CSS variables (--mocha-base) - Tailwind doesn't recognize them without config
- ❌ Don't use Next.js Link component without proper pathname detection for active states
- ❌ Don't create server components when you need client hooks (useState, usePathname, useRouter)
- ❌ Don't forget 'use client' directive at top of file for client components

### Testing Standards

**Manual Testing Checklist:**
1. Navigate to https://nova-cyan-mu.vercel.app/dashboard (or localhost:3000/dashboard)
2. Verify sidebar displays on left with 280px width
3. Verify header displays at top with search bar and avatar
4. Click each navigation link and verify:
   - URL updates correctly
   - Active state highlights current route with orange background
   - Hover states work smoothly
5. Test search bar focus (orange border should appear)
6. Verify user initials display in avatar (should extract from email)
7. Test logout button still works
8. Resize browser window to ensure desktop layout remains stable (no mobile required yet)

**Visual Regression Check:**
- Compare sidebar colors to Figma/design specs (if available)
- Verify all Catppuccin Mocha colors match UX-Design.md specifications
- Check icon sizes are exactly 20×20px
- Verify spacing matches UX specs (padding, margins, gaps)

## Prerequisites & Dependencies

**Prerequisites:**
- ✅ Story 1.1 complete: Next.js initialized, logo assets available
- ✅ Story 1.2 complete: Supabase clients created
- ✅ Story 1.3 complete: Authentication working, middleware protecting routes

**Blockers:** None (all prerequisites satisfied)

**Dependencies for This Story:**
- Heroicons React library (will be installed in task 1.1)
- Logo asset at `/nova-crm-logo.svg` (already exists from Story 1.1)
- Authenticated user sessions (working from Story 1.3)
- Protected routes middleware (working from Story 1.3)

## References

**Primary Sources:**
- [UX-Design.md§3 - Layout Architecture](../UX-Design.md#layout-architecture)
- [UX-Design.md§3.2 - Sidebar Navigation](../UX-Design.md#sidebar-navigation)
- [UX-Design.md§3.3 - Header Component](../UX-Design.md#header-top-bar)
- [Architecture.md§1.1 - Next.js App Router](../Architecture.md#frontend-stack)
- [Epics.md Epic 1 Story 1.5](../epics.md#story-15-application-layout-with-sidebar--header)
- [Story 1.3 Completion Notes](./1-3-authentication-flow-login-page.md)

**External Documentation:**
- [Next.js 15 Layouts Documentation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Heroicons React Documentation](https://heroicons.com/)
- [usePathname Hook](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
- [Catppuccin Mocha Palette Reference](https://github.com/catppuccin/catppuccin)

## Dev Agent Record

### Context Reference

This story was created by analyzing:
- Epic 1 from epics.md (Foundation & Team Authentication)
- UX-Design.md comprehensive layout specifications
- Architecture.md Next.js patterns and component structure
- Story 1.3 completion notes and implementation patterns
- Git commit history showing established file structure

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### File List

<!-- Will be populated during dev-story execution -->

## Change Log

- 2025-12-09 (Initial): Story created with comprehensive context from Epic 1 Story 1.5 (labeled as 1.4 in sprint), UX-Design.md layout specifications, Architecture.md Next.js patterns, and Story 1.3 learnings. Includes detailed navigation states, header components, and responsive behavior specs. Marked as ready-for-dev with complete developer implementation guide.
