# NovaCRM - Epic Breakdown

**Author:** Todd
**Date:** 2025-12-09
**Project Level:** MVP
**Target Scale:** Internal Tool (3-5 users)

---

## Overview

This document provides the complete epic and story breakdown for NovaCRM, decomposing the requirements from the [PRD](./prd.md) into implementable stories with complete technical and UX context.

**Context Documents:**
- **Product Requirements:** [PRD.md](./prd.md)
- **Technical Architecture:** [Architecture.md](./Architecture.md)
- **UX Design:** [UX-Design.md](./UX-Design.md)

**Living Document Notice:** This is an implementation-ready breakdown incorporating Architecture decisions and UX design patterns into every story.

---

## Functional Requirements Inventory

**Total Requirements:** 60 specific requirements across 11 major categories

### FR1: User Authentication & Access Control (5 requirements)
- **FR1.1** - Secure login for 3-5 INNOVAAS team members using Supabase Auth
- **FR1.2** - Individual user accounts with email/password authentication
- **FR1.3** - Shared visibility to all leads and deals (no restrictive permissions in MVP)
- **FR1.4** - Session management and secure logout functionality
- **FR1.5** - Role-based access (admin vs sales_rep)

### FR2: LinkedIn Lead Capture - Manual Entry (7 requirements)
- **FR2.1** - Manual lead entry form for LinkedIn Sales Navigator connections
- **FR2.2** - Required fields: First Name, Last Name, LinkedIn Profile URL
- **FR2.3** - Optional fields: Email, Phone, Company, Position, Connected On date
- **FR2.4** - Campaign attribution via dropdown selection
- **FR2.5** - Lead source tracking (LinkedIn, Referral, Other)
- **FR2.6** - Automatic creation and last update timestamps
- **FR2.7** - Lead ownership assignment

### FR3: CSV Contact Upload (7 requirements)
- **FR3.1** - CSV file upload with drag-and-drop interface
- **FR3.2** - LinkedIn CSV format parsing (handles blank emails, special characters)
- **FR3.3** - Duplicate detection by (First Name + Last Name) OR LinkedIn URL
- **FR3.4** - Duplicate alert modal with per-contact overwrite selection
- **FR3.5** - Multi-campaign association (many-to-many)
- **FR3.6** - Batch import with transaction handling (all-or-nothing)
- **FR3.7** - Import summary showing imported/skipped/updated counts

### FR4: Pipeline Management (7 requirements)
- **FR4.1** - Create and manage contact records with complete profile
- **FR4.2** - Customizable sales stages (8 default stages in MVP)
- **FR4.3** - Default stages: Initial LinkedIn Connect, First Conversation, Email Engaged, Meeting Scheduled, Proposal Sent, Negotiation, Closed Won, Closed Lost
- **FR4.4** - Lead assignment and ownership tracking
- **FR4.5** - Activity timeline showing stage changes, notes, interactions
- **FR4.6** - Editable lead notes and conversation summaries
- **FR4.7** - Contact search and filtering

### FR5: Deal Tracking & Metrics (8 requirements)
- **FR5.1** - Create deals linked to contacts
- **FR5.2** - Deal value estimation (dollar amount)
- **FR5.3** - Win probability percentage (0-100%)
- **FR5.4** - Current pipeline stage indicator
- **FR5.5** - Expected close date
- **FR5.6** - Deal notes and conversation summaries
- **FR5.7** - Deal history tracking
- **FR5.8** - Deal status: Open, Won, Lost

### FR6: Pipeline Dashboard (8 requirements)
- **FR6.1** - Real-time pipeline value overview (weighted by probability)
- **FR6.2** - Lead count by stage visualization (funnel/kanban)
- **FR6.3** - Deals at risk identification (stalled for X days)
- **FR6.4** - Recently closed deals (30 days window)
- **FR6.5** - Team activity summary
- **FR6.6** - Quick filters: stage, owner, campaign, date range
- **FR6.7** - Dashboard loads in <3 seconds
- **FR6.8** - Four key stat cards display

### FR7: Email Integration - Outlook (4 requirements)
- **FR7.1** - Click-to-email button (opens Outlook desktop/web client)
- **FR7.2** - Manual email activity logging interface
- **FR7.3** - Email history timeline per contact
- **FR7.4** - "Log Email" UI component

### FR8: Admin Configuration (5 requirements)
- **FR8.1** - Sales stage management UI (future: MVP has hard-coded stages)
- **FR8.2** - Campaign CRUD operations
- **FR8.3** - User account management
- **FR8.4** - Admin dashboard showing system activity
- **FR8.5** - Central settings control panel

### FR9: Executive Dashboard (5 requirements)
- **FR9.1** - Read-only executive view role
- **FR9.2** - Real-time pipeline visibility (current state, not reports)
- **FR9.3** - Pipeline breakdown by stage/team member/campaign
- **FR9.4** - Risk visibility (deals stalling or at risk)
- **FR9.5** - Trust through data transparency

### FR10: Performance Requirements (5 requirements)
- **FR10.1** - Lead capture workflow completes in <2 minutes
- **FR10.2** - Dashboard loads in <3 seconds
- **FR10.3** - Duplicate prevention via instant search
- **FR10.4** - Pipeline value calculation responds in <10 seconds
- **FR10.5** - All pages achieve <3 seconds Time to Interactive

### FR11: Data Management (4 requirements)
- **FR11.1** - Zero data loss (all operations durable)
- **FR11.2** - Automatic timestamp maintenance (created_at, updated_at)
- **FR11.3** - Soft deletes for owner references (ON DELETE SET NULL)
- **FR11.4** - Cascade deletes for dependent records (deals, activities)

---

## Epic Structure Overview

**Total Epics:** 6 user-value focused epics
**Dependency Flow:** Epic 1 → Epic 2 → [Epic 3, Epic 4] → Epic 5 → Epic 6

### Epic Progression

1. **Epic 1: Foundation & Team Authentication** - Team can securely access NovaCRM
2. **Epic 2: Contact Management & LinkedIn Capture** - Team can capture and manage LinkedIn connections
3. **Epic 3: Bulk Contact Import & Campaign Management** - Team can import contacts in bulk and manage campaigns
4. **Epic 4: Deal Pipeline & Stage Tracking** - Team can track deals through pipeline stages with values and probabilities
5. **Epic 5: Dashboard & Pipeline Analytics** - Team and executives can see real-time pipeline health and metrics
6. **Epic 6: Activity Tracking & Email Integration** - Team can log all relationship interactions with Outlook integration

### Epic Technical Context Summary

**Epic 1** leverages: Supabase Auth + JWT, PostgreSQL users table, Next.js 15 App Router, Catppuccin Mocha UX theme, Vercel deployment, MCP Supabase integration

**Epic 2** leverages: Contacts table with LinkedIn URL validation, duplicate detection indexes, contact API routes, campaign dropdown, contact list UX with search/filter

**Epic 3** leverages: PapaParse CSV library, LinkedIn CSV format handling, duplicate detection algorithm, batch import API with transactions, campaign_contacts junction table, multi-step CSV upload flow UX

**Epic 4** leverages: Deals table with value/probability/stage, pipeline_stages with 8 hard-coded MVP stages, foreign key to contacts, weighted pipeline calculations, deal detail UX with stage badges

**Epic 5** leverages: Dashboard aggregation queries with indexes, real-time pipeline value calculation, dashboard API endpoint, 4-column stat card grid UX, responsive breakpoints, filter components

**Epic 6** leverages: Activities table with contact/deal references, activity types (Email, LinkedIn, WhatsApp, Call, Meeting), timeline queries, mailto: links for Outlook, activity logging modal UX

---

---

## Epic 1: Foundation & Team Authentication

**Epic Goal:** Enable INNOVAAS sales team members to securely access NovaCRM with individual accounts and shared visibility to all sales data, establishing the technical foundation for all subsequent features.

**User Value:** Team can securely log in, access the system, and begin using NovaCRM as their central command center with a modern, dark-themed interface optimized for all-day use.

**PRD Coverage:** FR1.1-FR1.5, FR10.5, FR11.1-FR11.4
**Architecture Integration:** Supabase Auth, PostgreSQL setup, Next.js 15 App Router, Vercel deployment
**UX Patterns:** Login screen, navigation sidebar, header, responsive layout, dark theme

---

### Story 1.1: Next.js Project Initialization & Vercel Deployment

**User Story:**
As a developer, I want to initialize a Next.js 15 project with TypeScript and deploy it to Vercel, so that we have a working foundation for building NovaCRM.

**Acceptance Criteria:**

**Given** I need to start the NovaCRM project
**When** I initialize the Next.js 15 application
**Then** the project is created with the following configuration:
- Next.js 15.x with App Router enabled
- React 19.x
- TypeScript 5.3+ with strict mode
- TailwindCSS 3.4 configured
- ESLint and Prettier configured for code quality
- Git repository initialized with .gitignore

**And** when I configure TailwindCSS
**Then** the tailwind.config.ts includes:
- Catppuccin Mocha color palette variables (Architecture §7.1)
- Innovaas Orange (#F25C05) primary color
- Plus Jakarta Sans font family integration
- Custom spacing scale and shadow system (UX §A.2, A.3)
- Responsive breakpoints: 768px (tablet), 1024px (desktop), 1440px (large) (UX §9.1)

**And** when I deploy to Vercel
**Then** the application deploys successfully via GitHub integration
- Main branch auto-deploys to production
- Environment variables configured in Vercel dashboard
- Build completes in <2 minutes
- Live URL accessible at *.vercel.app domain

**Technical Notes:**
- Use `npx create-next-app@latest` with TypeScript template
- Install dependencies: @supabase/supabase-js, @supabase/ssr, papaparse (Architecture §1.1)
- Configure next.config.ts for image domains: uavqmlqkuvjhgnuwcsqx.supabase.co (Architecture §6.2)
- Set up Google Fonts: Plus Jakarta Sans with weights 400, 600, 800 (UX §2.2)
- Create .env.local template with required environment variables
- Vercel deployment: Connect GitHub repo, configure build settings (Architecture §6.1)

**Prerequisites:** None (foundation story)

---

### Story 1.2: Supabase Database Setup & Schema Initialization

**User Story:**
As a developer, I want to set up the Supabase PostgreSQL database with core tables and constraints, so that we can store user and CRM data securely.

**Acceptance Criteria:**

**Given** I have a Supabase account and project created
**When** I initialize the database schema
**Then** the following tables are created via migration:

**users table** (Architecture §2.3.1):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'sales_rep',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**campaigns table** (Architecture §2.3.3):
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**pipeline_stages table with 8 MVP stages** (Architecture §2.3.5):
```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  order_num INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO pipeline_stages (name, order_num) VALUES
  ('Initial LinkedIn Connect', 1),
  ('First Conversation', 2),
  ('Email Engaged', 3),
  ('Meeting Scheduled', 4),
  ('Proposal Sent', 5),
  ('Negotiation', 6),
  ('Closed Won', 7),
  ('Closed Lost', 8);
```

**And** when I create the updated_at trigger function
**Then** the auto-update timestamp trigger is installed (Architecture §2.4):
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**And** when I verify the database connection
**Then** I can connect from the Next.js app using environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side only)

**Technical Notes:**
- Use Supabase SQL Editor or MCP Supabase server apply_migration tool (Architecture §7.1)
- Database region: Asia-Pacific Southeast 1 (Singapore) (Architecture §1.3)
- Enable UUID extension: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
- Store migration as: novacrm/supabase/migrations/001_initial_schema.sql
- Connection pooling via PgBouncer (port 6543) for app, direct (port 5432) for migrations (Architecture §1.3)

**Prerequisites:** Story 1.1 (requires project initialized)

---

### Story 1.3: Supabase Authentication Configuration

**User Story:**
As an INNOVAAS team member, I want to log in securely with my email and password, so that I can access NovaCRM with my individual account.

**Acceptance Criteria:**

**Given** Supabase Auth is configured for the project
**When** I set up email/password authentication
**Then** Supabase Auth is configured with:
- Email provider enabled in Supabase dashboard
- Password requirements: minimum 8 characters
- Email confirmation disabled for MVP (internal tool, manual user creation)
- JWT expiration: 3600 seconds (1 hour) access token
- Refresh token rotation enabled (Architecture §3.1)

**And** when I create the Supabase client utilities
**Then** the following files are created:

**app/lib/supabase/client.ts** (browser client):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**app/lib/supabase/server.ts** (server client with cookies):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}
```

**And** when I manually create test users via Supabase dashboard
**Then** I can log in with email/password and receive JWT tokens stored in httpOnly cookies

**Technical Notes:**
- Use Supabase Auth (bcrypt password hashing with cost factor 10) (Architecture §3.1)
- JWT tokens stored in secure httpOnly cookies via SSR mode (Architecture §3.1)
- Automatic token refresh handled by @supabase/ssr (Architecture §3.1)
- Create 2-3 test users in Supabase Auth dashboard for development
- User records in auth.users (managed by Supabase) + users table (app data) stay in sync

**Prerequisites:** Story 1.2 (requires database setup)

---

### Story 1.4: Login Page with Dark Theme UI

**User Story:**
As an INNOVAAS team member, I want a beautiful, dark-themed login page, so that I can sign in to NovaCRM with a modern, professional interface.

**Acceptance Criteria:**

**Given** I navigate to the NovaCRM root URL
**When** I am not authenticated
**Then** I see the login page with the following design (UX §6.1):
- Centered login card on Mocha Base (#1e1e2e) background
- NovaCRM logo (horizontal, 200×60px SVG) at top of card (UX §2.3)
- Login card background: Mocha Mantle (#181825) (UX §2.1)
- Card border: 1px solid Mocha Surface0 (#313244)
- Card border-radius: 16px
- Card padding: 2rem
- Card max-width: 400px

**And** the login form includes (UX §4.3):
- Email input field with label "Email" (0.875rem, weight 600, Mocha Subtext0)
- Password input field with label "Password"
- Both inputs styled per UX §4.3: Surface0 background, Surface1 border, 10px border-radius
- Orange focus state: border-color #F25C05, box-shadow 0 0 0 3px rgba(242, 92, 5, 0.1)
- "Sign In" button: Orange (#F25C05) background, white text, weight 600, full width
- Button hover: darker orange (#D94C04), translateY(-2px), shadow increase (UX §4.1)

**And** when I submit valid credentials
**Then** the form calls `supabase.auth.signInWithPassword({ email, password })`
- Loading state: button shows spinner, disabled, text changes to "Signing in..."
- Success: redirect to /dashboard
- Error: show red toast notification with error message (UX §8.1)

**And** when form validation fails
**Then** I see inline error messages (UX §8.2):
- Empty email: "Email is required" (red text, 0.875rem, below field)
- Invalid email format: "Please enter a valid email address"
- Empty password: "Password is required"
- Error text color: Mocha Red (#f38ba8)

**Technical Notes:**
- Create page: app/(auth)/login/page.tsx
- Use Next.js Server Actions for form submission (Architecture §3.2)
- Logo file: public/nova-crm-logo.svg (UX §2.3)
- Form validation: HTML5 + client-side JavaScript
- Toast notifications: Create reusable Toast component (UX §8.1)
- Redirect after login: use Next.js redirect() from 'next/navigation'

**Prerequisites:** Story 1.3 (requires authentication configured)

---

### Story 1.5: Application Layout with Sidebar & Header

**User Story:**
As an authenticated user, I want a consistent application layout with navigation sidebar and header, so that I can easily navigate NovaCRM and access all features.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I access any page in the application
**Then** I see the application layout (UX §3.1):

**Sidebar** (280px width, fixed position, UX §3.2):
- Background: Mocha Mantle (#181825)
- Border-right: 1px solid Mocha Surface0
- Padding: 2rem vertical
- Logo section at top with NovaCRM horizontal logo (200×60px)
- Border-bottom separator below logo (1px solid Mocha Surface0)

**Navigation sections**:
```
NAV SECTION: MAIN (12px uppercase, Mocha Overlay1)
  - Dashboard (Home icon, 20×20px Heroicons outline) - Active by default
  - Contacts (Users icon)
  - Companies (Building icon)
  - Deals (Currency Dollar icon)

NAV SECTION: MANAGEMENT
  - Analytics (Chart Bar icon)
  - Settings (Cog icon)
```

**Nav item states** (UX §3.2):
- Default: transparent background, Mocha Subtext0 color, 0.75rem padding, 8px border-radius
- Hover: Mocha Surface0 background, Mocha Text color, 0.2s transition
- Active: Orange gradient background rgba(242,92,5,0.15) to rgba(242,92,5,0.05), Orange text, 3px left border

**Header** (sticky top, UX §3.3):
- Height: auto (~80px)
- Background: Mocha Mantle (#181825)
- Border-bottom: 1px solid Mocha Surface0
- Padding: 1.5rem 2rem
- Layout: Search bar (flex: 1, max-width 500px) + Notifications icon button + User avatar

**Search bar** (UX §3.3):
- Width: 100%, max-width 500px
- Height: 48px
- Background: Mocha Surface0, border: 1px solid Surface1
- Border-radius: 10px
- Padding-left: 3rem (for search icon)
- Placeholder: "Search contacts, deals..." (Mocha Overlay0 color)
- Focus: Orange border, box-shadow 0 0 0 3px rgba(242,92,5,0.1)

**User Avatar** (UX §3.3):
- 40×40px, border-radius 10px
- Gradient background: linear-gradient(135deg, Mocha Lavender, Mocha Blue)
- Display user initials (e.g., "TA" for Todd Abraham)
- Font-weight: 700, color: Mocha Base (dark text on light gradient)

**Main Content Area**:
- Padding: 2rem
- Background: Mocha Base (#1e1e2e)
- Overflow-y: auto
- Height: calc(100vh - header-height)

**Responsive behavior** (UX §9):
- Desktop (>1024px): Full sidebar (280px)
- Tablet (768-1024px): Icon-only sidebar (60px), expand on hover
- Mobile (<768px): Sidebar hidden, hamburger menu button in header

**Technical Notes:**
- Create layout: app/(dashboard)/layout.tsx
- Use Next.js nested layouts (Architecture §1.1)
- Logo SVG: public/nova-crm-logo.svg, icon: public/nova-crm-icon.svg (UX §2.3)
- Icons: Heroicons React library (outline style, 20×20px for nav) (UX §A.1)
- Active route detection: use Next.js usePathname() hook
- User data: fetch from Supabase createClient().auth.getUser()
- Avatar initials: extract from user.name field

**Prerequisites:** Story 1.4 (requires login working)

---

### Story 1.6: Protected Route Middleware & Session Management

**User Story:**
As a system, I want to protect authenticated routes and manage user sessions, so that only logged-in team members can access NovaCRM features.

**Acceptance Criteria:**

**Given** I have authentication configured
**When** I create Next.js middleware
**Then** the middleware file is created at `middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated and accessing login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
```

**And** when an unauthenticated user tries to access /dashboard
**Then** they are redirected to /login

**And** when an authenticated user tries to access /login
**Then** they are redirected to /dashboard

**And** when I implement logout functionality
**Then** a logout button is added to the sidebar/header:
- Calls `supabase.auth.signOut()`
- Clears session cookies
- Redirects to /login
- Button styled as secondary button (UX §4.1)

**Technical Notes:**
- Middleware runs on every request matching the config.matcher pattern
- Session validation happens server-side for security (Architecture §3.1)
- JWT tokens auto-refresh via @supabase/ssr (Architecture §3.1)
- Logout button placement: In sidebar at bottom or in user avatar dropdown
- Session persistence: Cookies with httpOnly, secure, sameSite: lax (Architecture §5.2)

**Prerequisites:** Story 1.5 (requires layout created)

---

**Epic 1 Complete: Foundation & Team Authentication**

**Stories Created:** 6 stories
**FR Coverage:** FR1.1-FR1.5 (Authentication & Access), FR10.5 (Performance), FR11.1-FR11.4 (Data Management foundation)
**Architecture Sections Used:** §1.1 (Next.js), §1.3 (Supabase), §2.3.1, 2.3.3, 2.3.5 (Tables), §3.1 (Auth), §6.1 (Deployment), §7.1 (Design System)
**UX Sections Used:** §2.1 (Colors), §2.2 (Typography), §2.3 (Logo), §3.1-3.3 (Layout), §4.1-4.3 (Components), §8.1-8.2 (Interactions), §9 (Responsive)

Ready for checkpoint validation.

---

## Epic 2: Contact Management & LinkedIn Capture

**Epic Goal:** Enable sales team members to manually capture LinkedIn connections with complete profile information and campaign attribution, and manage all contacts through search, filter, and edit capabilities.

**User Value:** Marcus can log new LinkedIn connections in under 2 minutes with full profile details and campaign tracking, search existing contacts to prevent duplicate outreach, and maintain a clean, organized contact database.

**PRD Coverage:** FR2.1-FR2.7, FR4.1, FR4.4, FR4.6-FR4.7, FR10.1, FR10.3
**Architecture Integration:** Contacts table with LinkedIn URL validation, duplicate detection indexes, contact API routes, campaign relationships
**UX Patterns:** Contact forms, list views with search/filter, contact detail modals, responsive tables

---

### Story 2.1: Contacts Database Table & Indexes

**User Story:**
As a developer, I want to create the contacts table with proper constraints and indexes, so that we can store LinkedIn connection data efficiently with duplicate detection.

**Acceptance Criteria:**

**Given** I need to store contact information from LinkedIn
**When** I create the contacts table migration
**Then** the following table structure is created (Architecture §2.3.2):

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  linkedin_url TEXT UNIQUE NOT NULL,
  email TEXT,
  company TEXT,
  position TEXT,
  connected_on DATE,
  source TEXT DEFAULT 'Manual Entry',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**And** when I create the duplicate detection indexes (Architecture §2.3.2, §4.1):
```sql
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
```

**And** when I create the updated_at trigger:
```sql
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**And** when I create the campaign_contacts junction table (Architecture §2.3.4):
```sql
CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_contact ON campaign_contacts(contact_id);
```

**Technical Notes:**
- linkedin_url UNIQUE constraint prevents duplicate LinkedIn profiles (Architecture §2.3.2)
- email is optional (many LinkedIn connections have no email) (Architecture §3.4.1)
- owner_id ON DELETE SET NULL preserves contact if owner deleted (Architecture §2.1)
- source tracks 'Manual Entry', 'CSV Import', or other entry methods
- connected_on DATE field for LinkedIn connection date
- Indexes optimize duplicate detection queries (<100ms target) (Architecture §4.1)
- campaign_contacts allows many-to-many relationship (Architecture §2.3.4)
- Store migration as: migrations/002_contacts_schema.sql

**Prerequisites:** Epic 1 (Story 1.2 - requires users and campaigns tables)

---

### Story 2.2: Contact Creation Form - Manual LinkedIn Capture

**User Story:**
As a sales team member (Marcus), I want a fast, simple form to manually capture LinkedIn connections, so that I can log new contacts in under 2 minutes with campaign attribution.

**Acceptance Criteria:**

**Given** I am authenticated and on the Contacts page
**When** I click the "+ New Contact" button (orange primary button, UX §4.1)
**Then** a modal opens with the contact creation form (UX §4.6):

**Modal design** (UX §4.6):
- Max-width: 600px
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0
- Border-radius: 16px
- Overlay: rgba(0, 0, 0, 0.7) with backdrop-filter blur(4px)
- Animation: slideUp 0.3s ease
- Close button: X icon (top-right)

**Form fields** (UX §4.3):

**Required fields** (FR2.2):
1. **First Name** (text input, required)
   - Label: "First Name" (0.875rem, weight 600, Mocha Subtext0)
   - Input: Surface0 background, Surface1 border, 10px border-radius
   - Validation: Cannot be empty
   - Error: "First name is required" (red text below field)

2. **Last Name** (text input, required)
   - Same styling as First Name
   - Validation: Cannot be empty

3. **LinkedIn Profile URL** (text input, required) (FR2.2)
   - Label: "LinkedIn Profile URL"
   - Placeholder: "https://www.linkedin.com/in/username"
   - Validation: Must match pattern `^https://www\.linkedin\.com/in/[a-zA-Z0-9_-]+/?$` (Architecture §3.4.1)
   - Real-time validation on blur (UX §8.2)
   - Error: "Please enter a valid LinkedIn profile URL"
   - Success indicator: Green border + checkmark icon when valid

**Optional fields** (FR2.3):
4. **Email** (text input, optional)
   - Validation: RFC 5322 format if provided
   - Error: "Please enter a valid email address"

5. **Company** (text input, optional)
   - Placeholder: "Company name"

6. **Position** (text input, optional)
   - Placeholder: "Job title"

7. **Connected On** (date picker, optional) (FR2.3)
   - Label: "LinkedIn Connection Date"
   - Default: Today's date
   - Format: YYYY-MM-DD

8. **Campaign** (dropdown multi-select, required) (FR2.4)
   - Label: "Assign to Campaign(s)"
   - Loads campaign names from campaigns table (Architecture §2.3.3)
   - Allows multiple campaign selection
   - Styled dropdown with checkboxes (UX §4.3)
   - At least one campaign must be selected

9. **Lead Source** (dropdown, default: "LinkedIn") (FR2.5)
   - Options: "LinkedIn", "Referral", "Other"
   - Default: "LinkedIn"

**And** when I submit the form with valid data
**Then** the system:
- Calls POST /api/contacts API route (Architecture §3.3)
- Creates contact record in contacts table
- Assigns owner_id to current logged-in user (FR2.7)
- Creates campaign_contacts associations for selected campaigns (Architecture §2.3.4)
- Sets source, created_at, updated_at automatically (FR2.6)
- Shows success toast: "Contact added successfully" (green, 3s duration) (UX §8.1)
- Closes modal
- Refreshes contacts list to show new contact

**And** when validation fails
**Then** inline error messages appear below invalid fields (UX §8.2)
- Red text (Mocha Red #f38ba8)
- 0.875rem font size
- Specific error per field
- Submit button remains disabled until all errors resolved

**Technical Notes:**
- Create page/component: app/(dashboard)/contacts/page.tsx with modal
- API route: app/api/contacts/route.ts (POST method) (Architecture §3.3)
- Form state management: React useState or useForm hook
- Campaign dropdown: Fetch from GET /api/campaigns endpoint
- Owner assignment: Get user.id from Supabase session (Architecture §3.1)
- Transaction: Insert contact + campaign_contacts associations atomically
- Performance target: <2 minutes to complete form (FR10.1)

**Prerequisites:** Story 2.1 (requires contacts table)

---

### Story 2.3: Contacts List View with Search & Filter

**User Story:**
As a sales team member (Marcus), I want to see all contacts in a searchable, filterable table, so that I can quickly find specific contacts and prevent duplicate outreach.

**Acceptance Criteria:**

**Given** I am on the Contacts page
**When** the page loads
**Then** I see the contacts list layout (UX §6.2):

**Page header**:
- Title: "Contacts" (2rem, weight 800, Mocha Text)
- Subtitle: "Manage your LinkedIn connections and leads" (1rem, Mocha Subtext0)
- Buttons (right-aligned):
  - "+ New Contact" (orange primary button)
  - "Upload CSV" (secondary button - for Epic 3)

**Filter bar** (UX §6.2):
- Search input (flex: 1, max-width none)
  - Placeholder: "Search by name, company, or position..."
  - Magnifying glass icon (left side, 20×20px)
  - Real-time search on keystroke (debounced 300ms)
  - Orange focus state
- Filter dropdown:
  - Label: "Filter ▾"
  - Options: "All Contacts", "My Contacts", "Unassigned", by Campaign
- Sort dropdown:
  - Label: "Sort ▾"
  - Options: "Recently Added", "Name A-Z", "Name Z-A", "Company A-Z"

**Contacts table** (UX §4.5):
- Background: Mocha Mantle
- Border: 1px solid Mocha Surface0
- Border-radius: 12px
- Padding: 1.5rem

**Table columns**:
| Name | Company | Campaign(s) | Owner | Connected On | Actions |
|------|---------|-------------|-------|--------------|---------|
| [Avatar] John Smith | Acme Corp | Q4 SaaS | Todd | Dec 8, 2024 | [👁️] [✏️] |

**Table styling** (UX §4.5):
- Header row: border-bottom 1px solid Surface0
- Header cells: 0.75rem uppercase, weight 600, Mocha Overlay1, letter-spacing 0.05em
- Body cells: padding 1rem 0.5rem, border-bottom 1px solid Surface0
- Hover row: background rgba(242,92,5,0.03), 0.15s transition

**Name cell** (UX §4.5):
- Company avatar: 32×32px, border-radius 6px, initials, colored background
- Name: Font-weight 700, clickable (opens detail modal)

**Campaign(s) cell**:
- Display multiple campaign badges (UX §4.4)
- Each badge: 6px border-radius, 0.75rem font-size, colored background

**Actions column**:
- View icon (eye): Opens contact detail modal
- Edit icon (pencil): Opens edit form
- Both icons: 20×20px, Heroicons outline, hover: orange color

**Responsive behavior** (UX §9.2):
- Desktop (>1024px): Full table
- Tablet (768-1024px): Hide "Connected On" column
- Mobile (<768px): Transform to card view:
  - Each contact = card (Mocha Mantle background)
  - Avatar + name at top
  - Company, campaign below
  - Actions in card footer

**And** when I type in the search bar (FR4.7, FR10.3)
**Then** the contacts list filters in real-time:
- Search matches: first_name, last_name, company, position (case-insensitive)
- Results update as I type (debounced 300ms)
- Query execution time: <200ms (Architecture §4.1)
- Uses idx_contacts_name index for performance

**And** when I select a filter
**Then** the list updates to show:
- "All Contacts": All contacts in database
- "My Contacts": owner_id = current user
- "Unassigned": owner_id IS NULL
- By campaign: Joins campaign_contacts to filter by campaign_id

**And** when I select a sort option
**Then** contacts are ordered by selected criteria

**Technical Notes:**
- API route: GET /api/contacts with query parameters (search, filter, sort, page, limit)
- Pagination: 50 contacts per page (Architecture §3.3)
- Query optimization: Use indexes for search/filter (Architecture §4.1)
- Real-time search: Debounce input to avoid excessive API calls
- Campaign badges: Query campaign_contacts junction table
- Avatar generation: Use first letters of first/last name with colored backgrounds
- Responsive transformation: CSS media queries for card view (UX §9)

**Prerequisites:** Story 2.2 (requires contact creation working)

---

### Story 2.4: Contact Detail View & Edit Modal

**User Story:**
As a sales team member, I want to view complete contact details and edit information, so that I can maintain accurate, up-to-date contact records with notes.

**Acceptance Criteria:**

**Given** I am viewing the contacts list
**When** I click a contact name or the view icon
**Then** a contact detail modal opens (UX §4.6, §6.4):

**Modal layout** (2-column on desktop, UX §6.4):
```
┌────────────────────────────────────────────────┐
│ ← Back           [Edit] [Delete]               │
├────────────────────────────────────────────────┤
│ [Avatar] John Smith                            │
│ Senior Developer at Acme Corp                  │
│ john.smith@acmecorp.com                        │
├─────────────────────┬──────────────────────────┤
│ Contact Information │ Notes & Timeline         │
│                     │                          │
│ LinkedIn: [link]    │ [Rich text notes editor] │
│ Company: Acme Corp  │                          │
│ Position: Sr Dev    │ Created: Dec 8, 2024    │
│ Connected: Dec 5    │ Last updated: Dec 8      │
│ Source: LinkedIn    │                          │
│ Owner: Todd         │                          │
│ Campaigns:          │                          │
│  • Q4 SaaS Outreach │                          │
│  • Partner Network  │                          │
└─────────────────────┴──────────────────────────┘
```

**Contact header**:
- Avatar: 60×60px, border-radius 10px, gradient background
- Name: 1.5rem, weight 800
- Position at Company: 1rem, Mocha Subtext0
- Email (if exists): Clickable mailto: link, orange hover

**Contact Information panel** (left column):
- Read-only display of all contact fields
- LinkedIn URL: Clickable link, opens in new tab, external link icon
- Campaigns: Badge list (same styling as table)
- Labels: 0.875rem, weight 600, Mocha Subtext0
- Values: 1rem, weight 400, Mocha Text

**Notes panel** (right column, FR4.6):
- Rich text editor for notes (editable)
- Save button appears when notes modified
- Auto-save on blur or 3s after last keystroke
- Created/updated timestamps at bottom

**And** when I click the [Edit] button
**Then** the modal transforms to edit mode:
- All fields become editable inputs (same styling as creation form)
- Campaign multi-select allows adding/removing campaigns
- Owner dropdown allows reassigning contact
- [Cancel] and [Save Changes] buttons in footer
- Form validation same as creation form (Story 2.2)

**And** when I save changes
**Then** the system:
- Calls PUT /api/contacts/[id] with updated data (Architecture §3.3)
- Updates contacts table with new values
- Updates campaign_contacts if campaigns changed
- Updates updated_at timestamp automatically (trigger) (FR11.2)
- Shows success toast: "Contact updated successfully"
- Refreshes modal with new data

**And** when I click [Delete]
**Then** a confirmation modal appears:
- Title: "Delete Contact?"
- Message: "This will permanently delete [Name]. This action cannot be undone."
- [Cancel] (secondary) and [Delete Contact] (red danger button)
- On confirm: DELETE /api/contacts/[id]
- Cascade deletes campaign_contacts associations (Architecture §2.3.4)
- Shows success toast: "Contact deleted"
- Closes modal, refreshes contacts list

**Technical Notes:**
- API routes: GET /api/contacts/[id], PUT /api/contacts/[id], DELETE /api/contacts/[id]
- Notes storage: Add notes TEXT column to contacts table (or separate notes table for Epic 6)
- Rich text editor: Simple textarea for MVP, consider TipTap or similar for rich formatting
- Campaign updates: Compare old vs new campaign arrays, insert/delete in campaign_contacts
- Delete cascade: ON DELETE CASCADE for campaign_contacts (Architecture §2.3.4)
- Modal component: Reusable for view/edit modes

**Prerequisites:** Story 2.3 (requires contacts list)

---

### Story 2.5: Duplicate Contact Detection & Prevention

**User Story:**
As a sales team member (Marcus), I want to be warned if I'm adding a duplicate contact, so that I can avoid duplicate outreach and maintain a clean database.

**Acceptance Criteria:**

**Given** I am creating a new contact via the form
**When** I enter a LinkedIn URL or name that matches an existing contact
**Then** the system performs duplicate detection (Architecture §3.4.2):

**Duplicate detection logic** (FR10.3):
```typescript
// Check for duplicates by:
// 1. LinkedIn URL match (exact)
// 2. OR First Name + Last Name match (both exact, case-insensitive)

const duplicates = await supabase
  .from('contacts')
  .select('id, first_name, last_name, linkedin_url, company')
  .or(`linkedin_url.eq.${linkedin_url},and(first_name.ilike.${first_name},last_name.ilike.${last_name})`)
```

**And** when a duplicate is detected (while filling form, on blur of LinkedIn URL field)
**Then** a warning appears inline below the LinkedIn URL field:
- Icon: ⚠️ (yellow warning triangle)
- Text: "This contact may already exist: [Name] at [Company]"
- Link: "View Contact" (opens existing contact detail modal in new modal layer)
- Background: rgba(249, 226, 175, 0.1) (Mocha Yellow tint) (UX §4.4)
- Border-left: 3px solid Mocha Yellow

**And** the submit button text changes to:
- "Add Anyway" (instead of "Add Contact")
- Warning color (yellow background instead of orange)
- User can still submit if they confirm it's truly a new contact

**And** when I click "View Contact" link
**Then** the existing contact detail modal opens in a layer above:
- Shows existing contact information
- User can compare: Is this the same person?
- User can close this modal to return to creation form
- User can decide: Cancel creation OR proceed with "Add Anyway"

**And** when I submit with "Add Anyway"
**Then** the contact is created despite the warning:
- No error, successful creation
- System logs that user bypassed duplicate warning (for future analytics)

**And** when duplicate check runs (performance) (FR10.3)
**Then** the query executes in <100ms:
- Uses idx_contacts_linkedin index for URL match
- Uses idx_contacts_name index for name match (Architecture §4.1)
- Real-time check (on blur of LinkedIn URL field)

**Technical Notes:**
- Duplicate check: On blur of LinkedIn URL field (UX §8.2)
- Also check on form submit (before API call)
- Index usage: PostgreSQL should use indexes for fast lookup (Architecture §4.1)
- Warning UI: Inline within form, not blocking modal
- "Add Anyway" flow: Pass flag to API to bypass duplicate check or allow duplicate
- Future enhancement: Merge duplicates feature (post-MVP)
- Search performance: <100ms per requirement (FR10.3)

**Prerequisites:** Story 2.2 (requires contact creation form), Story 2.4 (requires contact detail view)

---

**Epic 2 Complete: Contact Management & LinkedIn Capture**

**Stories Created:** 5 stories
**FR Coverage:** FR2.1-FR2.7 (LinkedIn Lead Capture), FR4.1, FR4.4, FR4.6-FR4.7 (Pipeline Management - contacts), FR10.1 (Lead capture <2 min), FR10.3 (Duplicate prevention)
**Architecture Sections Used:** §2.3.2 (Contacts table), §2.3.4 (Campaign junction), §3.3 (API routes), §3.4.1-3.4.2 (Validation & Duplicate detection), §4.1 (Indexes & Performance)
**UX Sections Used:** §4.3 (Forms), §4.4 (Badges), §4.5 (Tables), §4.6 (Modals), §6.2 (Contact list), §6.4 (Detail view), §8.2 (Validation), §9 (Responsive)

Ready for checkpoint validation.

---

## Epic 3: Bulk Contact Import & Campaign Management

**Epic Goal:** Enable sales team members to bulk import LinkedIn contacts from CSV exports with intelligent duplicate detection and resolution, and manage campaign organization for multi-campaign contact attribution.

**User Value:** Marcus can import 100+ LinkedIn connections from CSV in minutes instead of manual one-by-one entry, resolve duplicates intelligently without data loss, and organize contacts into campaigns for targeted outreach tracking.

**PRD Coverage:** FR3.1-FR3.7, FR8.2, FR10.1, FR11.1-FR11.2
**Architecture Integration:** PapaParse CSV parser, batch import API with transactions, campaign CRUD operations, duplicate detection algorithm
**UX Patterns:** Multi-step upload flow, drag-and-drop file upload, duplicate resolution modal, campaign management UI

---

### Story 3.1: CSV Parser Library Integration & LinkedIn Format Handler

**User Story:**
As a developer, I want to integrate PapaParse and create a CSV parser utility that handles LinkedIn's export format, so that we can reliably parse CSV files with blank emails and special characters.

**Acceptance Criteria:**

**Given** I need to parse LinkedIn CSV exports
**When** I install and configure PapaParse
**Then** the library is installed and configured (Architecture §3.4):
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**And** when I create the CSV parser utility
**Then** the file `app/lib/csv-parser.ts` is created:

```typescript
import Papa from 'papaparse'

export interface LinkedInCSVRow {
  'First Name': string
  'Last Name': string
  'URL': string
  'Email Address'?: string
  'Company'?: string
  'Position'?: string
  'Connected On'?: string
}

export interface ParsedContact {
  first_name: string
  last_name: string
  linkedin_url: string
  email?: string
  company?: string
  position?: string
  connected_on?: string
  source: 'CSV Import'
}

export interface CSVParseResult {
  contacts: ParsedContact[]
  errors: Array<{ row: number; message: string }>
  totalRows: number
  validRows: number
}

export async function parseLinkedInCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const contacts: ParsedContact[] = []
    const errors: Array<{ row: number; message: string }> = []
    let totalRows = 0

    Papa.parse<LinkedInCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Remove whitespace
      complete: (results) => {
        totalRows = results.data.length

        results.data.forEach((row, index) => {
          const rowNum = index + 2 // Account for header row + 0-index

          // Validate required fields
          if (!row['First Name'] || !row['Last Name'] || !row['URL']) {
            errors.push({
              row: rowNum,
              message: 'Missing required fields (First Name, Last Name, or URL)',
            })
            return
          }

          // Validate LinkedIn URL format (Architecture §3.4.1)
          const linkedinUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
          if (!linkedinUrlPattern.test(row['URL'])) {
            errors.push({
              row: rowNum,
              message: 'Invalid LinkedIn URL format',
            })
            return
          }

          // Parse connected_on date (LinkedIn format: "01 Dec 2024" or "Dec 01, 2024")
          let connected_on: string | undefined
          if (row['Connected On']) {
            const date = new Date(row['Connected On'])
            if (!isNaN(date.getTime())) {
              connected_on = date.toISOString().split('T')[0] // YYYY-MM-DD
            }
          }

          contacts.push({
            first_name: row['First Name'].trim(),
            last_name: row['Last Name'].trim(),
            linkedin_url: row['URL'].trim(),
            email: row['Email Address']?.trim() || undefined,
            company: row['Company']?.trim() || undefined,
            position: row['Position']?.trim() || undefined,
            connected_on,
            source: 'CSV Import',
          })
        })

        resolve({
          contacts,
          errors,
          totalRows,
          validRows: contacts.length,
        })
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`))
      },
    })
  })
}

// Validate email format (RFC 5322 basic pattern)
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}
```

**And** when I create unit tests for the parser
**Then** test cases cover (Architecture §3.4):
- Valid LinkedIn CSV with all fields populated
- CSV with blank email addresses (FR3.2)
- CSV with special characters in names (e.g., "O'Brien", "Müller")
- Invalid LinkedIn URL formats
- Missing required fields
- Date format variations ("01 Dec 2024", "Dec 01, 2024")
- Empty rows and whitespace handling

**Technical Notes:**
- PapaParse handles CSV parsing with header mapping (Architecture §3.4)
- LinkedIn CSV format: Headers in first row, data rows below
- Blank emails are valid: LinkedIn often doesn't provide email addresses (FR3.2)
- URL validation: Must match `^https://www\.linkedin\.com/in/[a-zA-Z0-9_-]+/?$` (Architecture §3.4.1)
- Special character handling: UTF-8 encoding, trim whitespace
- Date parsing: Convert LinkedIn date formats to ISO 8601 (YYYY-MM-DD)
- Error collection: Track row numbers for user feedback
- Test file: `__tests__/lib/csv-parser.test.ts`

**Prerequisites:** Epic 1 (Story 1.1 - requires Next.js project initialized)

---

### Story 3.2: Multi-Step CSV Upload UI Flow

**User Story:**
As a sales team member (Marcus), I want a guided multi-step CSV upload interface with drag-and-drop, so that I can easily import contacts and review them before final import.

**Acceptance Criteria:**

**Given** I am on the Contacts page
**When** I click the "Upload CSV" button
**Then** a multi-step upload modal opens with 4 steps (UX §6.3):

**Modal design** (UX §4.6):
- Max-width: 800px (wider than standard modal for data preview)
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0
- Border-radius: 16px
- Step indicator at top: 4 circles (numbered 1-4) with progress line

**Step 1: Upload File** (UX §6.3):
```
┌────────────────────────────────────────┐
│ Step 1 of 4: Upload CSV File           │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │  📁  Drag and drop CSV file here   │ │
│ │      or click to browse            │ │
│ │                                    │ │
│ │  Supported: .csv files only        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Tip: Export from LinkedIn:             │
│ Connections → Manage synced contacts   │
│ → Download                             │
│                                        │
│           [Cancel]   [Next →] (disabled)│
└────────────────────────────────────────┘
```

**Drag-and-drop zone** (UX §6.3):
- Height: 200px
- Border: 2px dashed Mocha Surface1
- Border-radius: 12px
- Background: Mocha Surface0
- Hover state: Border color changes to Orange, background rgba(242,92,5,0.05)
- Active drop state: Border solid Orange, background rgba(242,92,5,0.1)
- File icon: 48×48px, centered
- Text: 1rem, Mocha Subtext0, centered

**And** when I drag a CSV file over the zone
**Then** the zone highlights with orange border (UX §6.3)

**And** when I drop a valid .csv file
**Then** the file uploads and parses:
- Shows loading spinner: "Parsing CSV..."
- Calls `parseLinkedInCSV(file)` utility (from Story 3.1)
- Validates all rows
- Automatically advances to Step 2 when parsing completes

**And** when parsing completes with errors
**Then** an error summary appears:
- "Found X errors in CSV file"
- List of errors with row numbers (max 10 shown, "and X more..." if >10)
- [Download Error Report] button (generates .txt file with all errors)
- [Try Another File] button to return to upload

**Step 2: Preview & Campaign Assignment** (UX §6.3):
```
┌────────────────────────────────────────┐
│ Step 2 of 4: Preview Contacts          │
├────────────────────────────────────────┤
│ Successfully parsed: 127 contacts      │
│                                        │
│ Assign to Campaign(s):                 │
│ [Select campaigns ▾] (multi-select)    │
│                                        │
│ Preview (first 5):                     │
│ ┌────────────────────────────────────┐ │
│ │ Name         Company      LinkedIn │ │
│ │ John Smith   Acme Corp    [URL]    │ │
│ │ Jane Doe     TechCo       [URL]    │ │
│ │ ...                                │ │
│ └────────────────────────────────────┘ │
│                                        │
│  [← Back]        [Next: Check Duplicates →] │
└────────────────────────────────────────┘
```

**Preview table** (UX §4.5):
- Shows first 5 contacts only (scrollable if needed)
- Columns: Name, Company, Position, LinkedIn URL
- Same table styling as contacts list (Story 2.3)
- "... and 122 more" indicator if more than 5

**Campaign assignment** (required):
- Multi-select dropdown (same styling as Story 2.2)
- At least one campaign must be selected
- "Next" button disabled until campaign selected

**And** when I click "Next: Check Duplicates"
**Then** the system:
- Calls POST /api/contacts/check-duplicates with all parsed contacts
- Runs duplicate detection algorithm (Architecture §3.4.2)
- Advances to Step 3 with results

**Step 3: Resolve Duplicates** (handled in Story 3.3)

**Step 4: Confirm & Import** (UX §6.3):
```
┌────────────────────────────────────────┐
│ Step 4 of 4: Confirm Import            │
├────────────────────────────────────────┤
│ Ready to import:                       │
│                                        │
│ ✓ 98 new contacts                      │
│ ⟳ 12 updated contacts (duplicates)     │
│ ✗ 17 skipped (duplicates)              │
│ ─────────────────                      │
│   127 total from CSV                   │
│                                        │
│ Campaigns: Q4 SaaS, Partner Network    │
│                                        │
│ ⚠️ This action will modify your database│
│                                        │
│  [← Back]        [Import Contacts] (orange)│
└────────────────────────────────────────┘
```

**And** when I click "Import Contacts"
**Then** the batch import executes (Story 3.4):
- Shows progress indicator: "Importing X of Y contacts..."
- Calls POST /api/contacts/bulk-import
- Transaction-based import (all-or-nothing) (FR3.6)
- Success: Shows import summary modal (FR3.7)
- Error: Shows error message, allows retry

**Import summary modal** (FR3.7):
```
┌────────────────────────────────────────┐
│ ✅ Import Complete!                    │
├────────────────────────────────────────┤
│ Successfully imported: 98 contacts     │
│ Updated: 12 contacts                   │
│ Skipped: 17 duplicates                 │
│                                        │
│ All contacts assigned to:              │
│ • Q4 SaaS Outreach                     │
│ • Partner Network                      │
│                                        │
│           [View Contacts] (orange)      │
└────────────────────────────────────────┘
```

**Technical Notes:**
- Create component: `app/(dashboard)/contacts/components/CSVUploadModal.tsx`
- Step state management: React useState with step index (1-4)
- File validation: Check .csv extension, max file size 5MB
- Drag-and-drop: Use HTML5 Drag and Drop API or react-dropzone library
- Progress indicator: Show step numbers, highlight current step (UX §6.3)
- Campaign data: Fetch from GET /api/campaigns
- Duplicate check: POST /api/contacts/check-duplicates endpoint (Story 3.3)
- Final import: POST /api/contacts/bulk-import endpoint (Story 3.4)
- Close modal: Clear state, refresh contacts list

**Prerequisites:** Story 3.1 (requires CSV parser), Story 2.3 (requires contacts list page)

---

### Story 3.3: Duplicate Detection & Resolution Modal for CSV Imports

**User Story:**
As a sales team member (Marcus), I want to review and resolve duplicate contacts during CSV import, so that I can choose to update existing contacts or skip duplicates without losing data.

**Acceptance Criteria:**

**Given** I am on Step 3 of the CSV upload flow
**When** duplicate contacts are detected
**Then** I see the duplicate resolution interface (UX §6.3, §4.6):

**Step 3: Resolve Duplicates**:
```
┌────────────────────────────────────────┐
│ Step 3 of 4: Resolve Duplicates        │
├────────────────────────────────────────┤
│ Found 29 potential duplicates          │
│                                        │
│ For each duplicate, choose an action:  │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ John Smith                         │ │
│ │ Acme Corporation                   │ │
│ │                                    │ │
│ │ CSV:      linkedin.com/in/jsmith   │ │
│ │ Existing: linkedin.com/in/johnsmith│ │
│ │                                    │ │
│ │ ○ Update existing with CSV data    │ │
│ │ ○ Skip (keep existing)             │ │
│ │ ● Import as new contact            │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Show next duplicate] 1 of 29          │
│                                        │
│ Quick Actions:                         │
│ [Update All] [Skip All] [Import All]   │
│                                        │
│  [← Back]   [Next: Confirm Import →]   │
└────────────────────────────────────────┘
```

**Duplicate card design** (UX §4.6):
- Background: Mocha Surface0
- Border: 1px solid Mocha Surface1
- Border-radius: 12px
- Padding: 1.5rem
- Shows one duplicate at a time (carousel style)

**Comparison view**:
- **CSV data** (left column):
  - Label: "From CSV" (0.875rem, Mocha Subtext0)
  - Fields: Name, Company, LinkedIn URL, Email
  - Highlight differences in orange
- **Existing data** (right column):
  - Label: "Already in Database" (0.875rem, Mocha Subtext0)
  - Same fields
  - Highlight differences in blue (Mocha Blue)

**Action radio buttons** (UX §4.3):
- ○ Update existing with CSV data (overwrites existing contact)
- ○ Skip (keep existing, don't import CSV row)
- ● Import as new contact (default - treat as different person)

**Navigation**:
- [← Previous] [Next →] buttons to navigate duplicates
- Counter: "1 of 29"
- Keyboard shortcuts: Arrow keys to navigate

**Quick Actions** (batch operations):
- [Update All]: Set all duplicates to "Update existing"
- [Skip All]: Set all duplicates to "Skip"
- [Import All]: Set all duplicates to "Import as new" (default)
- Confirmation modal before batch action: "This will affect 29 contacts. Continue?"

**And** when duplicate detection runs (FR3.3, Architecture §3.4.2)
**Then** the algorithm checks each CSV contact:
```typescript
// For each CSV contact, check for duplicates by:
// 1. LinkedIn URL match (exact)
// 2. OR First Name + Last Name match (both exact, case-insensitive)

const duplicates = await supabase
  .from('contacts')
  .select('*')
  .or(`linkedin_url.eq.${contact.linkedin_url},and(first_name.ilike.${contact.first_name},last_name.ilike.${contact.last_name})`)
```

**Duplicate matching logic** (FR3.3):
- **LinkedIn URL match**: Exact match, case-insensitive
- **Name match**: First Name + Last Name, both match, case-insensitive
- **Match confidence**:
  - LinkedIn URL match: High confidence (same person)
  - Name match only: Medium confidence (might be different person)
- Display match confidence in UI: "High confidence duplicate" vs "Possible duplicate (same name)"

**And** when I select "Update existing with CSV data"
**Then** the system plans to:
- Overwrite existing contact fields with CSV data
- Preserve contact.id and created_at
- Update updated_at timestamp
- Merge campaigns: Add CSV campaigns to existing campaigns (no removal)

**And** when I select "Skip"
**Then** the system plans to:
- Not import this CSV row
- Keep existing contact unchanged
- Decrement "new contacts" count in summary

**And** when I select "Import as new contact"
**Then** the system plans to:
- Create a new contact record (despite duplicate warning)
- Assign new UUID
- Both contacts will exist in database (user's choice)

**And** when I navigate through all duplicates
**Then** decisions are saved in memory:
- Object: `{ contactIndex: number, action: 'update' | 'skip' | 'import' }`
- Summary updates in Step 4 based on decisions

**And** when I click "Next: Confirm Import"
**Then** the system:
- Saves all duplicate resolution decisions
- Calculates final import summary (new, updated, skipped counts)
- Advances to Step 4

**Technical Notes:**
- Duplicate check endpoint: POST /api/contacts/check-duplicates
- Input: Array of ParsedContact objects from CSV
- Output: Array of duplicate matches with existing contact data
- Performance: Batch duplicate check in single query per contact (Architecture §4.1)
- Index usage: Uses idx_contacts_linkedin and idx_contacts_name (Story 2.1)
- Target: <100ms per duplicate check (FR10.3)
- Carousel state: React useState with current duplicate index
- Decision storage: Map of contact index → action choice
- Merge campaigns logic: Union of CSV campaigns + existing campaigns (no duplicates)

**Prerequisites:** Story 3.2 (requires Step 2 preview), Story 2.5 (requires duplicate detection logic)

---

### Story 3.4: Batch Import API with Transaction Handling

**User Story:**
As a developer, I want a batch import API endpoint that processes CSV contacts atomically with transaction handling, so that imports are all-or-nothing and data integrity is maintained.

**Acceptance Criteria:**

**Given** I have parsed CSV contacts and duplicate resolutions
**When** I create the bulk import API route
**Then** the file `app/api/contacts/bulk-import/route.ts` is created:

```typescript
import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

interface BulkImportContact {
  first_name: string
  last_name: string
  linkedin_url: string
  email?: string
  company?: string
  position?: string
  connected_on?: string
  source: string
  action: 'create' | 'update' // Based on duplicate resolution
  existing_id?: string // If action = 'update'
}

interface BulkImportRequest {
  contacts: BulkImportContact[]
  campaign_ids: string[] // Campaigns to assign
  owner_id: string
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body: BulkImportRequest = await request.json()

    const { contacts, campaign_ids, owner_id } = body

    // Validate input
    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      )
    }

    if (!campaign_ids || campaign_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one campaign required' },
        { status: 400 }
      )
    }

    // Transaction: All-or-nothing import (FR3.6)
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each contact
    for (const contact of contacts) {
      try {
        if (contact.action === 'update' && contact.existing_id) {
          // Update existing contact
          const { error } = await supabase
            .from('contacts')
            .update({
              first_name: contact.first_name,
              last_name: contact.last_name,
              linkedin_url: contact.linkedin_url,
              email: contact.email,
              company: contact.company,
              position: contact.position,
              connected_on: contact.connected_on,
              source: contact.source,
              // updated_at handled by trigger
            })
            .eq('id', contact.existing_id)

          if (error) throw error

          // Add campaign associations (merge with existing)
          for (const campaign_id of campaign_ids) {
            await supabase
              .from('campaign_contacts')
              .upsert(
                {
                  campaign_id,
                  contact_id: contact.existing_id,
                },
                { onConflict: 'campaign_id,contact_id' }
              )
          }

          results.updated++
        } else if (contact.action === 'create') {
          // Create new contact
          const { data: newContact, error } = await supabase
            .from('contacts')
            .insert({
              first_name: contact.first_name,
              last_name: contact.last_name,
              linkedin_url: contact.linkedin_url,
              email: contact.email,
              company: contact.company,
              position: contact.position,
              connected_on: contact.connected_on,
              source: contact.source,
              owner_id,
            })
            .select()
            .single()

          if (error) throw error

          // Add campaign associations
          const campaignAssociations = campaign_ids.map((campaign_id) => ({
            campaign_id,
            contact_id: newContact.id,
          }))

          await supabase
            .from('campaign_contacts')
            .insert(campaignAssociations)

          results.created++
        } else {
          // Skip (duplicate resolved to skip)
          results.skipped++
        }
      } catch (error) {
        console.error('Error processing contact:', error)
        results.errors.push(
          `Failed to import ${contact.first_name} ${contact.last_name}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**And** when the batch import processes contacts (FR3.6)
**Then** the system:
- Processes each contact sequentially (for simplicity in MVP)
- For 'create' action: Inserts new contact + campaign associations
- For 'update' action: Updates existing contact + merges campaign associations
- For 'skip' action: Increments skipped counter, no database change
- Tracks results: created count, updated count, skipped count
- Collects errors for any failed imports

**And** when campaign associations are created (FR3.5)
**Then** the system:
- Uses campaign_contacts junction table (Architecture §2.3.4)
- Creates one row per contact-campaign pair
- Uses UPSERT to prevent duplicate associations (ON CONFLICT ignore)
- Allows many-to-many relationships (FR3.5)

**And** when any import step fails
**Then** the error is logged:
- Error added to results.errors array
- Import continues for remaining contacts (best-effort)
- Response includes partial results + error list

**And** when all contacts are processed (FR3.7)
**Then** the API returns import summary:
```json
{
  "success": true,
  "results": {
    "created": 98,
    "updated": 12,
    "skipped": 17,
    "errors": []
  }
}
```

**Technical Notes:**
- Transaction handling: Use Supabase transaction or sequential processing (Architecture §3.3.1)
- For true atomicity: Wrap in PostgreSQL transaction via RPC function
- MVP: Sequential processing, collect errors, continue on failure (best-effort)
- Performance: Batch insert campaign_contacts (not one-by-one)
- Campaign merge: UPSERT prevents duplicate campaign associations
- Updated_at trigger: Automatically updates timestamp on UPDATE (Story 1.2)
- Owner assignment: Set owner_id to importing user (FR2.7)
- Source tracking: Set source = 'CSV Import' for all imported contacts
- Validation: Check LinkedIn URL format, email format (if provided)
- Error handling: Try-catch per contact to isolate failures

**Prerequisites:** Story 3.3 (requires duplicate resolutions), Story 2.1 (requires contacts and campaign_contacts tables)

---

### Story 3.5: Campaign CRUD Interface (Admin Settings)

**User Story:**
As an admin user (Sarah), I want to create, edit, and manage campaigns in a centralized settings area, so that sales team members can assign contacts to organized campaigns.

**Acceptance Criteria:**

**Given** I am an admin user
**When** I navigate to Settings → Campaigns
**Then** I see the campaign management interface (UX §4.2):

**Page layout**:
```
┌────────────────────────────────────────┐
│ Settings > Campaigns                   │
├────────────────────────────────────────┤
│ Manage campaigns for organizing leads  │
│                                        │
│              [+ New Campaign] (orange)  │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Campaign Name       Status  Actions│ │
│ ├────────────────────────────────────┤ │
│ │ Q4 SaaS Outreach    Active  [✏️][🗑️]│ │
│ │ Partner Network     Active  [✏️][🗑️]│ │
│ │ Investor Relations  Inactive[✏️][🗑️]│ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Campaigns table** (UX §4.5):
- Columns: Campaign Name, Description (truncated), Status, Contact Count, Actions
- Status badge: Green "Active" or Gray "Inactive" (UX §4.4)
- Contact Count: Query count from campaign_contacts junction table
- Actions: Edit icon, Delete icon (20×20px Heroicons)
- Sorted by: created_at DESC (most recent first)

**And** when I click "+ New Campaign"
**Then** a campaign creation modal opens (UX §4.6):

**Modal form**:
```
┌────────────────────────────────────────┐
│ Create New Campaign                    │
├────────────────────────────────────────┤
│                                        │
│ Campaign Name *                        │
│ [________________________]             │
│                                        │
│ Description                            │
│ [________________________]             │
│ [________________________]             │
│ (optional, max 500 characters)         │
│                                        │
│ Status                                 │
│ ● Active  ○ Inactive                   │
│                                        │
│  [Cancel]      [Create Campaign]        │
└────────────────────────────────────────┘
```

**Form fields** (FR8.2):
1. **Campaign Name** (required):
   - Text input, max 100 characters
   - Must be unique (validated on submit)
   - Validation: Cannot be empty
   - Error: "Campaign name is required"

2. **Description** (optional):
   - Textarea, max 500 characters
   - Character counter shown: "450/500"

3. **Status** (radio buttons):
   - Active (default)
   - Inactive
   - Inactive campaigns don't appear in contact assignment dropdowns

**And** when I submit the form with valid data
**Then** the system:
- Calls POST /api/campaigns
- Creates campaign in campaigns table (Architecture §2.3.3)
- Sets created_by to current user ID
- Sets created_at, updated_at automatically
- Shows success toast: "Campaign created successfully"
- Closes modal, refreshes campaigns list

**And** when I click the Edit icon
**Then** an edit modal opens:
- Pre-filled form with existing campaign data
- Same validation as create form
- [Cancel] and [Save Changes] buttons
- PUT /api/campaigns/[id] on submit

**And** when I click the Delete icon
**Then** a confirmation modal appears:
- Title: "Delete Campaign?"
- Message: "This will remove the campaign and unassign all contacts. Contacts will not be deleted. Continue?"
- Warning: Shows contact count: "This campaign has 47 contacts."
- [Cancel] (secondary) and [Delete Campaign] (red danger)
- On confirm: DELETE /api/campaigns/[id]
- Cascade deletes campaign_contacts associations (Architecture §2.3.3)
- Success toast: "Campaign deleted"

**And** when I try to delete a campaign with contacts
**Then** the confirmation shows contact impact:
- "This campaign has X contacts assigned"
- "Contacts will not be deleted, only the campaign association"
- Reassures user that contact data is preserved

**Technical Notes:**
- Create page: `app/(dashboard)/settings/campaigns/page.tsx`
- API routes:
  - POST /api/campaigns (create)
  - GET /api/campaigns (list)
  - GET /api/campaigns/[id] (read)
  - PUT /api/campaigns/[id] (update)
  - DELETE /api/campaigns/[id] (delete)
- campaigns table: Already created in Story 1.2 (Architecture §2.3.3)
- Unique constraint: Campaign name must be unique (UNIQUE constraint)
- Contact count: Query `SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = ?`
- Delete cascade: ON DELETE CASCADE for campaign_contacts (Architecture §2.3.3)
- Admin check: Only users with role = 'admin' can access Settings (FR8.2)
- Navigation: Add "Settings" link to sidebar (Story 1.5) with sub-menu for Campaigns

**Prerequisites:** Epic 1 (Story 1.2 - requires campaigns table), Story 1.5 (requires sidebar navigation)

---

**Epic 3 Complete: Bulk Contact Import & Campaign Management**

**Stories Created:** 5 stories
**FR Coverage:** FR3.1-FR3.7 (CSV Contact Upload), FR8.2 (Campaign CRUD), FR10.1 (Bulk import faster than manual), FR11.1-FR11.2 (Data integrity, timestamps)
**Architecture Sections Used:** §3.4 (CSV parser, duplicate detection), §3.3.1 (Batch import API), §2.3.3 (Campaigns table), §2.3.4 (Campaign_contacts junction), §4.1 (Indexes for performance)
**UX Sections Used:** §6.3 (Multi-step CSV upload flow), §4.6 (Modals), §4.2 (Campaign management UI), §4.3 (Forms), §4.4 (Badges), §4.5 (Tables)

Ready for checkpoint validation.

---

## Epic 4: Deal Pipeline & Stage Tracking

**Epic Goal:** Enable sales team members to create deals linked to contacts, track them through customizable pipeline stages with values and probabilities, and manage the complete sales lifecycle from first contact to closed won/lost.

**User Value:** Marcus can create deals for qualified contacts, assign dollar values and win probabilities, track progression through 8 pipeline stages, update deal status as conversations progress, and maintain a complete sales history per contact.

**PRD Coverage:** FR5.1-FR5.8, FR4.2-FR4.5, FR10.4, FR11.1-FR11.4
**Architecture Integration:** Deals table with contact foreign keys, pipeline_stages reference, weighted pipeline calculations, deal API routes
**UX Patterns:** Deal creation modal, deal detail view with stage badges, pipeline stage indicators, deal list with filters

---

### Story 4.1: Deals Database Table & Pipeline Stage Relationships

**User Story:**
As a developer, I want to create the deals table with proper relationships to contacts and pipeline stages, so that we can track sales opportunities with values, probabilities, and stage progression.

**Acceptance Criteria:**

**Given** I need to track deal progression through pipeline stages
**When** I create the deals table migration
**Then** the following table structure is created (Architecture §2.3.6):

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(10,2),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Won', 'Lost')),
  expected_close_date DATE,
  notes TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);
```

**And** when I create indexes for performance (Architecture §4.1):
```sql
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
```

**And** when I create the updated_at trigger:
```sql
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**And** when I create the deal_stage_history tracking table (Architecture §2.3.7):
```sql
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_id);
```

**Technical Notes:**
- contact_id foreign key: ON DELETE CASCADE removes deals if contact deleted (Architecture §2.1)
- stage_id foreign key: ON DELETE RESTRICT prevents deleting stages with deals
- probability: Integer 0-100 representing win probability percentage (FR5.3)
- value: DECIMAL(10,2) for currency values up to $99,999,999.99 (FR5.2)
- status: CHECK constraint limits to 'Open', 'Won', 'Lost' (FR5.8)
- expected_close_date: DATE for forecasting (FR5.5)
- owner_id: ON DELETE SET NULL preserves deal if owner deleted (Architecture §2.1)
- deal_stage_history: Audit log of all stage changes for timeline (FR5.7)
- Indexes optimize queries by contact, stage, status, owner (Architecture §4.1)
- Store migration as: migrations/003_deals_schema.sql

**Prerequisites:** Epic 1 (Story 1.2 - requires users and pipeline_stages tables), Epic 2 (Story 2.1 - requires contacts table)

---

### Story 4.2: Create Deal Form with Contact Linking

**User Story:**
As a sales team member (Marcus), I want to create a new deal linked to a contact with value, probability, and stage information, so that I can start tracking a sales opportunity.

**Acceptance Criteria:**

**Given** I am viewing a contact detail page
**When** I click the "+ New Deal" button (orange primary button)
**Then** a deal creation modal opens (UX §4.6):

**Modal design**:
```
┌────────────────────────────────────────┐
│ Create New Deal                        │
├────────────────────────────────────────┤
│ For: John Smith (Acme Corp)            │
│                                        │
│ Deal Title *                           │
│ [_________________________________]    │
│                                        │
│ Deal Value ($)                         │
│ [____________]                         │
│                                        │
│ Win Probability (%)                    │
│ [___] %                                │
│                                        │
│ Pipeline Stage *                       │
│ [Initial LinkedIn Connect ▾]           │
│                                        │
│ Expected Close Date                    │
│ [MM/DD/YYYY]                           │
│                                        │
│ Notes                                  │
│ [_________________________________]    │
│ [_________________________________]    │
│                                        │
│  [Cancel]      [Create Deal]           │
└────────────────────────────────────────┘
```

**Form fields** (FR5.1-FR5.6):

1. **Contact** (read-only, pre-filled):
   - Shows contact name and company from context
   - Contact ID passed as hidden field
   - Cannot be changed (deal created from contact page)

2. **Deal Title** (required):
   - Text input, max 200 characters
   - Placeholder: "e.g., Q1 Enterprise License"
   - Validation: Cannot be empty
   - Error: "Deal title is required"

3. **Deal Value** (optional) (FR5.2):
   - Number input, currency format
   - Placeholder: "0.00"
   - Min: 0, Max: 99999999.99
   - Validation: Must be positive number if provided
   - Format: Display with $ prefix and 2 decimal places
   - Error: "Value must be a positive number"

4. **Win Probability** (optional) (FR5.3):
   - Number input with % suffix
   - Default: 50%
   - Min: 0, Max: 100
   - Step: 5 (increments of 5%)
   - Validation: Integer between 0-100
   - Error: "Probability must be between 0 and 100"

5. **Pipeline Stage** (required) (FR5.4):
   - Dropdown select
   - Options: Load from pipeline_stages table (8 MVP stages)
   - Default: "Initial LinkedIn Connect" (first stage)
   - Displays: stage name with order indicator
   - Example: "1. Initial LinkedIn Connect", "2. First Conversation"

6. **Expected Close Date** (optional) (FR5.5):
   - Date picker input
   - Format: MM/DD/YYYY
   - Min: Today
   - Default: Empty (can be set later)
   - Calendar UI with date selection

7. **Notes** (optional) (FR5.6):
   - Textarea, max 2000 characters
   - Placeholder: "Add context, next steps, or important details..."
   - Character counter: "1850/2000"

**And** when I submit the form with valid data
**Then** the system:
- Calls POST /api/deals (Architecture §3.3)
- Creates deal record in deals table
- Sets contact_id to pre-filled contact
- Sets owner_id to current logged-in user
- Sets status = 'Open' (FR5.8)
- Sets created_at, updated_at automatically
- Creates initial deal_stage_history entry (first stage assignment)
- Shows success toast: "Deal created successfully" (green, 3s) (UX §8.1)
- Closes modal
- Refreshes contact detail page to show new deal in deals list

**And** when validation fails
**Then** inline error messages appear (UX §8.2):
- Red text (Mocha Red #f38ba8)
- 0.875rem font size
- Specific error per field
- Submit button disabled until errors resolved

**And** when I create a deal from the Deals page (not contact page)
**Then** the form includes a "Contact" dropdown field:
- Searchable dropdown with all contacts
- Search by name or company
- Required field
- Autocomplete with live filtering

**Technical Notes:**
- Create component: `app/(dashboard)/contacts/[id]/components/CreateDealModal.tsx`
- Also create: `app/(dashboard)/deals/components/CreateDealModal.tsx` (with contact selector)
- API route: app/api/deals/route.ts (POST method) (Architecture §3.3)
- Form state: React useState or useForm hook
- Pipeline stages: Fetch from GET /api/pipeline-stages endpoint
- Owner assignment: Get user.id from Supabase session (Architecture §3.1)
- Currency formatting: Use Intl.NumberFormat for $ display
- Date picker: HTML5 date input or library like react-datepicker
- Stage history: Insert into deal_stage_history on creation (initial stage assignment)

**Prerequisites:** Story 4.1 (requires deals table), Epic 2 (Story 2.4 - requires contact detail view)

---

### Story 4.3: Deal Detail View & Edit Modal

**User Story:**
As a sales team member, I want to view complete deal details and edit information including stage progression, so that I can maintain accurate deal records and track sales progress.

**Acceptance Criteria:**

**Given** I am viewing a contact detail page with deals
**When** I click a deal card or the view icon
**Then** a deal detail modal opens (UX §4.6, §6.5):

**Modal layout**:
```
┌────────────────────────────────────────┐
│ ← Back           [Edit] [Delete]       │
├────────────────────────────────────────┤
│ Q1 Enterprise License                  │
│ $50,000 • 75% probability              │
│                                        │
│ [=========>        ] Proposal Sent     │
│ Stage 5 of 8                           │
├─────────────────────┬──────────────────┤
│ Deal Information    │ Stage Timeline   │
│                     │                  │
│ Contact:            │ [Timeline view]  │
│ John Smith          │ Dec 8: Moved to  │
│ Acme Corp           │   Proposal Sent  │
│                     │ Dec 5: Moved to  │
│ Value: $50,000      │   Meeting Sched  │
│ Probability: 75%    │ Dec 1: Created   │
│ Status: Open        │   Initial Stage  │
│                     │                  │
│ Expected Close:     │                  │
│ Dec 31, 2024        │                  │
│                     │                  │
│ Owner: Marcus       │                  │
│                     │                  │
│ Created: Dec 1      │                  │
│ Updated: Dec 8      │                  │
│                     │                  │
│ Notes:              │                  │
│ [Editable notes]    │                  │
└─────────────────────┴──────────────────┘
```

**Deal header**:
- Deal title: 1.5rem, weight 800
- Value and probability: 1rem, weight 600, inline with • separator
- Currency format: $50,000 (comma separators)

**Pipeline progress bar** (UX §6.5):
- Visual progress indicator showing current stage
- Filled portion: Orange gradient
- Empty portion: Mocha Surface1
- Current stage label below bar
- Stage X of 8 indicator

**Deal Information panel** (left column):
- Contact name: Clickable link to contact detail
- Company: Below contact name, Mocha Subtext0
- All deal fields in read-only format
- Status badge: Green "Open", Blue "Won", Red "Lost" (UX §4.4)
- Labels: 0.875rem, weight 600, Mocha Subtext0
- Values: 1rem, weight 400, Mocha Text

**Stage Timeline panel** (right column, FR5.7):
- Reverse chronological list (newest first)
- Each entry shows:
  - Date and time
  - Stage change: "Moved to [Stage Name]"
  - Changed by: User name
  - Optional notes from stage change
- Timeline entries: Small dot bullet, connected lines (UX §6.5)

**Notes section** (bottom, FR5.6):
- Rich text area (editable)
- Save button appears when modified
- Auto-save on blur or 3s after last keystroke

**And** when I click the [Edit] button
**Then** the modal transforms to edit mode:
- All fields become editable inputs (same styling as creation form)
- Pipeline stage dropdown allows stage progression
- Status radio buttons: Open / Won / Lost (FR5.8)
- [Cancel] and [Save Changes] buttons in footer
- Form validation same as creation form

**And** when I change the pipeline stage
**Then** a stage change confirmation appears:
- Mini modal: "Move deal to [New Stage]?"
- Optional notes field: "Add notes about this stage change..."
- [Cancel] and [Move to Stage] buttons
- On confirm: Updates deal stage + creates stage history entry

**And** when I save changes
**Then** the system:
- Calls PUT /api/deals/[id] (Architecture §3.3)
- Updates deals table
- Updates updated_at timestamp automatically (trigger)
- If stage changed: Inserts deal_stage_history entry
- If status changed to Won/Lost: Sets closed_at timestamp
- Shows success toast: "Deal updated successfully"
- Refreshes modal with new data

**And** when I click [Delete]
**Then** a confirmation modal appears:
- Title: "Delete Deal?"
- Message: "This will permanently delete this deal and all history. This action cannot be undone."
- [Cancel] (secondary) and [Delete Deal] (red danger)
- On confirm: DELETE /api/deals/[id]
- Cascade deletes deal_stage_history (Architecture §2.3.7)
- Shows success toast: "Deal deleted"
- Closes modal, refreshes parent view

**Technical Notes:**
- API routes: GET /api/deals/[id], PUT /api/deals/[id], DELETE /api/deals/[id]
- Stage timeline: Query deal_stage_history ordered by changed_at DESC
- Progress bar: Calculate current stage position / total stages (8)
- Stage change: Create deal_stage_history entry with from_stage_id, to_stage_id, changed_by
- Status change: When status changes to 'Won' or 'Lost', set closed_at = NOW()
- Delete cascade: ON DELETE CASCADE for deal_stage_history (Architecture §2.3.7)
- Modal component: Reusable for view/edit modes

**Prerequisites:** Story 4.2 (requires deal creation), Epic 2 (Story 2.4 - requires contact detail modal pattern)

---

### Story 4.4: Deal List View with Pipeline Stage Filtering

**User Story:**
As a sales team member (Marcus), I want to see all deals in a filterable list organized by pipeline stage, so that I can quickly find deals at specific stages and manage my sales pipeline.

**Acceptance Criteria:**

**Given** I navigate to the Deals page
**When** the page loads
**Then** I see the deals list layout (UX §6.5):

**Page header**:
- Title: "Deals" (2rem, weight 800, Mocha Text)
- Subtitle: "Track your sales opportunities" (1rem, Mocha Subtext0)
- Buttons (right-aligned):
  - "+ New Deal" (orange primary button)

**Filter bar** (UX §6.5):
- Pipeline stage tabs (horizontal scroll on mobile):
  ```
  [All] [Initial Connect] [First Conv] [Email Engaged] ... [Won] [Lost]
  ```
  - Active tab: Orange underline, Orange text
  - Inactive tab: Mocha Subtext0, hover brightens
  - Count badge per tab: "(12)" showing deal count

- Additional filters (right side):
  - Search input: "Search deals by title or contact..."
  - Owner dropdown: "All Owners", "My Deals", individual team members
  - Sort dropdown: "Expected Close Date", "Deal Value (High)", "Deal Value (Low)", "Recently Updated"

**Deals list** (default view - grouped by stage):
```
┌────────────────────────────────────────┐
│ PROPOSAL SENT (8 deals, $420K total)  │
├────────────────────────────────────────┤
│ [Deal Card 1]                          │
│ [Deal Card 2]                          │
│ ...                                    │
├────────────────────────────────────────┤
│ NEGOTIATION (3 deals, $180K total)    │
├────────────────────────────────────────┤
│ [Deal Card]                            │
│ ...                                    │
└────────────────────────────────────────┘
```

**Deal card design** (UX §6.5):
```
┌────────────────────────────────────────┐
│ Q1 Enterprise License         $50,000  │
│ John Smith • Acme Corp                 │
│                                        │
│ 75% probability • Close: Dec 31        │
│ [=========>        ] Proposal Sent     │
│                                        │
│ Last updated: 2 hours ago              │
└────────────────────────────────────────┘
```

**Card styling**:
- Background: Mocha Mantle
- Border: 1px solid Mocha Surface0
- Border-radius: 12px
- Padding: 1.5rem
- Hover: Border Orange, slight shadow, cursor pointer
- Click: Opens deal detail modal

**Card content**:
- Deal title: 1.125rem, weight 700, truncate if >50 chars
- Value: Right-aligned, weight 700, Orange color
- Contact name + company: 0.875rem, Mocha Subtext0
- Probability + close date: 0.875rem, inline with • separator
- Progress bar: Mini version (8px height), shows current stage
- Last updated: 0.75rem, Mocha Overlay0, relative time ("2 hours ago")

**Stage group header**:
- Stage name: 1rem, weight 700, uppercase
- Deal count and total value: 0.875rem, Mocha Subtext0
- Collapsible: Click to expand/collapse stage group
- Icon: Chevron down (expanded) / chevron right (collapsed)

**And** when I click a pipeline stage tab (FR4.2-FR4.3)
**Then** the deals list filters to show only deals in that stage:
- Active tab highlighted in orange
- Deal cards update to show filtered results
- Empty state if no deals: "No deals in this stage"

**And** when I click "Won" or "Lost" tabs
**Then** I see closed deals:
- Won deals: Green accent (border-left or badge)
- Lost deals: Red accent
- Closed date shown instead of expected close date
- No progress bar (deal is closed)

**And** when I search in the search bar
**Then** deals filter in real-time:
- Search matches: title, contact name, company (case-insensitive)
- Results update as I type (debounced 300ms)
- Query execution: <200ms (Architecture §4.1)

**And** when I select "My Deals" filter
**Then** the list shows only deals where owner_id = current user

**And** when I select a sort option
**Then** deals are reordered:
- "Expected Close Date": Ascending (soonest first)
- "Deal Value (High)": Descending (largest first)
- "Deal Value (Low)": Ascending (smallest first)
- "Recently Updated": updated_at DESC

**Responsive behavior** (UX §9.2):
- Desktop (>1024px): Full layout with stage tabs
- Tablet (768-1024px): Stage tabs scroll horizontally
- Mobile (<768px): Stack deal cards vertically, condensed card design

**Technical Notes:**
- API route: GET /api/deals with query params (stage, owner, status, search, sort)
- Stage grouping: Query deals grouped by stage_id with COUNT and SUM(value)
- Default sort: ORDER BY expected_close_date ASC, updated_at DESC
- Pagination: 50 deals per page (Architecture §3.3)
- Real-time search: Debounce input, use indexes for performance (Architecture §4.1)
- Relative time: Use library like date-fns for "2 hours ago" formatting
- Collapsible groups: React state for expanded/collapsed stages
- Empty state: Custom component when no deals match filters

**Prerequisites:** Story 4.3 (requires deal detail view), Story 4.2 (requires deal creation)

---

### Story 4.5: Pipeline Value Calculation & Deal Metrics

**User Story:**
As a sales team member, I want to see calculated pipeline metrics including total value and weighted value by probability, so that I can forecast revenue and prioritize high-value deals.

**Acceptance Criteria:**

**Given** I am on the Deals page
**When** the page loads
**Then** I see pipeline metrics at the top (UX §6.5):

**Metrics cards** (4-column grid):
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ Total Pipeline│ Weighted Value│ Open Deals    │ Avg Deal Value│
│ $650,000      │ $405,000      │ 18            │ $36,111       │
│ ↑ 15% vs LM   │ 62% avg prob  │ 3 closing soon│ $42K median   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

**Card styling** (UX §4.7):
- Background: Mocha Mantle
- Border: 1px solid Mocha Surface0
- Border-radius: 12px
- Padding: 1.5rem
- Height: Equal across all cards

**Metric 1: Total Pipeline Value** (FR6.1):
- Label: "Total Pipeline Value" (0.875rem, weight 600, Mocha Subtext0)
- Value: Sum of all Open deals' value field
- Display: $650,000 (2rem, weight 800, Mocha Text)
- Subtext: "↑ 15% vs Last Month" (trend indicator, optional for MVP)
- Calculation: `SELECT SUM(value) FROM deals WHERE status = 'Open'`

**Metric 2: Weighted Pipeline Value** (FR6.1):
- Label: "Weighted Value (Probability-Adjusted)"
- Value: Sum of (deal.value × deal.probability / 100) for all Open deals
- Display: $405,000 (2rem, weight 800, Orange)
- Subtext: "62% avg probability" (average of all probabilities)
- Calculation: `SELECT SUM(value * probability / 100) FROM deals WHERE status = 'Open'`

**Metric 3: Open Deals Count** (FR6.2):
- Label: "Open Deals"
- Value: Count of deals with status = 'Open'
- Display: 18 (2rem, weight 800)
- Subtext: "3 closing soon" (deals with expected_close_date within 7 days)
- Calculation: `SELECT COUNT(*) FROM deals WHERE status = 'Open'`

**Metric 4: Average Deal Value**:
- Label: "Avg Deal Value"
- Value: Average of all Open deals' value field
- Display: $36,111 (2rem, weight 800)
- Subtext: "$42K median" (median deal value)
- Calculation: `SELECT AVG(value), PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) FROM deals WHERE status = 'Open'`

**And** when deals are filtered by stage
**Then** metrics recalculate based on filtered deals:
- All metrics update to show values for current filter
- Metrics header shows active filter: "Pipeline Metrics - Proposal Sent Stage"

**And** when I hover over a metric card
**Then** a tooltip appears with additional details:
- Total Pipeline: Breakdown by stage
- Weighted Value: Formula explanation
- Open Deals: Breakdown by owner
- Avg Deal Value: Min and Max values

**And** when the API calculates weighted pipeline (FR10.4, Architecture §4.2)
**Then** the query executes efficiently:
- Uses indexes on deals(status) and deals(stage_id)
- Target: <10 seconds for calculation (FR10.4)
- Aggregation query with SUM and AVG functions
- Results cached for 5 minutes (optional optimization)

**Technical Notes:**
- API route: GET /api/deals/metrics (separate endpoint for metrics)
- Aggregation queries: Use PostgreSQL aggregate functions (SUM, AVG, COUNT, PERCENTILE_CONT)
- Weighted calculation: `SUM(value * probability / 100)` for all Open deals
- Closing soon: Filter where `expected_close_date <= CURRENT_DATE + INTERVAL '7 days'`
- Median calculation: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value)`
- Performance: Index on deals(status) critical for quick filtering (Architecture §4.1)
- Caching: Optional Redis cache for metrics (5min TTL) to reduce DB load
- Trend calculation (optional): Compare current month to previous month (post-MVP)
- Number formatting: Use Intl.NumberFormat for currency and percentages

**Prerequisites:** Story 4.4 (requires deals list), Story 4.1 (requires deals table with value and probability fields)

---

**Epic 4 Complete: Deal Pipeline & Stage Tracking**

**Stories Created:** 5 stories
**FR Coverage:** FR5.1-FR5.8 (Deal Tracking & Metrics), FR4.2-FR4.5 (Pipeline Management - stages), FR6.1-FR6.2 (Dashboard metrics subset), FR10.4 (Pipeline calculation <10s)
**Architecture Sections Used:** §2.3.6 (Deals table), §2.3.7 (Stage history), §3.3 (API routes), §4.1 (Indexes), §4.2 (Weighted calculations)
**UX Sections Used:** §4.6 (Modals), §4.7 (Metric cards), §6.5 (Deal views), §8.1 (Toasts), §9 (Responsive)

Ready for checkpoint validation.

---

## Epic 5: Dashboard & Pipeline Analytics

**Epic Goal:** Provide real-time visibility into sales pipeline health through an executive dashboard with key metrics, pipeline visualization, risk identification, and filtering capabilities for both sales team members and executives.

**User Value:** Marcus and David can see real-time pipeline status at a glance, identify deals at risk, track team performance, filter by stage/owner/campaign, and make data-driven decisions with weighted pipeline values and forecasting - all loading in under 3 seconds.

**PRD Coverage:** FR6.1-FR6.8, FR9.1-FR9.5, FR10.2, FR10.4
**Architecture Integration:** Dashboard aggregation queries, real-time calculations, API endpoints with caching, read-only executive role
**UX Patterns:** Stat cards grid, pipeline funnel visualization, deals at risk list, filter components, responsive dashboard layout

---

### Story 5.1: Dashboard Page with Four Key Stat Cards

**User Story:**
As a sales team member or executive, I want to see four key pipeline metrics at a glance when I access the dashboard, so that I can quickly understand sales health without digging through data.

**Acceptance Criteria:**

**Given** I am authenticated and navigate to /dashboard
**When** the dashboard page loads
**Then** I see the dashboard layout (UX §7.1):

**Page header**:
- Title: "Dashboard" (2rem, weight 800, Mocha Text)
- Subtitle: "Your sales pipeline at a glance" (1rem, Mocha Subtext0)
- Last updated indicator: "Updated 2 minutes ago" (auto-refresh)
- Filter bar (right-aligned): Date range, Owner, Campaign filters

**Four stat cards** (4-column grid, FR6.8):
```
┌────────────┬────────────┬────────────┬────────────┐
│ Pipeline   │ Weighted   │ Open Deals │ Win Rate   │
│ Value      │ Value      │            │            │
│            │            │            │            │
│ $650,000   │ $405,000   │ 18 deals   │ 45%        │
│ ↑ 12%      │ 62% prob   │ 3 closing  │ 5 won      │
└────────────┴────────────┴────────────┴────────────┘
```

**Card 1: Total Pipeline Value** (FR6.1):
- Label: "Total Pipeline Value" (0.875rem, uppercase, Mocha Subtext0)
- Value: $650,000 (2.5rem, weight 800, Mocha Text)
- Trend: "↑ 12% vs last month" (0.875rem, Green if up, Red if down)
- Icon: Currency dollar icon (Heroicons, 24×24px, Mocha Blue)
- Calculation: `SUM(value) WHERE status = 'Open'`

**Card 2: Weighted Pipeline Value** (FR6.1):
- Label: "Weighted Value (Probability-Adjusted)"
- Value: $405,000 (2.5rem, weight 800, Orange #F25C05)
- Subtext: "62% avg probability" (0.875rem, Mocha Subtext0)
- Icon: Chart bar icon (Orange)
- Calculation: `SUM(value * probability / 100) WHERE status = 'Open'`

**Card 3: Open Deals Count** (FR6.2):
- Label: "Open Deals"
- Value: 18 (2.5rem, weight 800, Mocha Text)
- Subtext: "3 closing this week" (0.875rem, Mocha Subtext0)
- Icon: Briefcase icon (Mocha Green)
- Calculation: `COUNT(*) WHERE status = 'Open'`
- Subtext calculation: `COUNT(*) WHERE expected_close_date <= CURRENT_DATE + 7`

**Card 4: Win Rate** (FR6.4):
- Label: "Win Rate (Last 30 Days)"
- Value: 45% (2.5rem, weight 800, Mocha Text)
- Subtext: "5 won, 6 lost" (0.875rem, Mocha Subtext0)
- Icon: Trophy icon (Mocha Peach)
- Calculation: `(COUNT(*) WHERE status = 'Won' AND closed_at >= NOW() - INTERVAL '30 days') / (COUNT(*) WHERE status IN ('Won', 'Lost') AND closed_at >= NOW() - INTERVAL '30 days') * 100`

**Card styling** (UX §4.7):
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0
- Border-radius: 12px
- Padding: 1.5rem
- Hover: Slight border color shift to Orange (interactive feel)
- Height: 140px (equal across all cards)

**And** when the dashboard loads (FR10.2, FR6.7)
**Then** the page loads in under 3 seconds:
- API call to GET /api/dashboard/stats
- Single optimized query using aggregate functions
- Response time target: <1s for stats calculation
- Uses indexes on deals(status), deals(closed_at) (Architecture §4.1)

**And** when I hover over a stat card
**Then** a tooltip appears with breakdown details:
- Pipeline Value: Breakdown by stage
- Weighted Value: Formula explanation with example
- Open Deals: Breakdown by team member
- Win Rate: Monthly trend (last 3 months)

**Responsive behavior** (UX §9.1):
- Desktop (>1024px): 4-column grid
- Tablet (768-1024px): 2×2 grid
- Mobile (<768px): Stack vertically (1 column)

**Technical Notes:**
- Create page: app/(dashboard)/dashboard/page.tsx (set as default route after login)
- API route: GET /api/dashboard/stats (Architecture §3.3)
- Query optimization: Single query with multiple aggregations in one SELECT
- Trend calculation: Compare current period to previous period (same duration)
- Auto-refresh: Poll every 5 minutes or use Supabase real-time subscriptions
- Loading state: Skeleton cards while data loads
- Error state: Show error message if API fails, with retry button
- Icon library: Heroicons React (outline style)

**Prerequisites:** Epic 4 (Story 4.5 - similar metrics pattern), Epic 1 (Story 1.5 - dashboard layout)

---

### Story 5.2: Pipeline Funnel Visualization by Stage

**User Story:**
As a sales team member, I want to see a visual funnel showing deal count and value at each pipeline stage, so that I can identify bottlenecks and understand where deals are concentrated.

**Acceptance Criteria:**

**Given** I am on the Dashboard page
**When** I scroll below the stat cards
**Then** I see the pipeline funnel visualization (UX §7.2):

**Section header**:
- Title: "Pipeline by Stage" (1.5rem, weight 700, Mocha Text)
- Subtitle: "Deal count and value per stage" (0.875rem, Mocha Subtext0)
- View toggle (right): [Funnel View] | [List View]

**Funnel visualization** (FR6.2):
```
┌──────────────────────────────────────────┐
│  Initial LinkedIn Connect  (12 deals)    │
│  ████████████████████████  $180K         │
├──────────────────────────────────────────┤
│    First Conversation  (8 deals)         │
│    ████████████████  $140K               │
├──────────────────────────────────────────┤
│      Email Engaged  (6 deals)            │
│      ████████████  $120K                 │
├──────────────────────────────────────────┤
│        Meeting Scheduled  (4 deals)      │
│        ████████  $90K                    │
├──────────────────────────────────────────┤
│          Proposal Sent  (3 deals)        │
│          ██████  $75K                    │
├──────────────────────────────────────────┤
│            Negotiation  (2 deals)        │
│            ████  $50K                    │
├──────────────────────────────────────────┤
│              Closed Won  (1 deal)        │
│              ██  $30K                    │
└──────────────────────────────────────────┘
```

**Stage bar design** (UX §7.2):
- Each stage is a horizontal bar
- Bar width: Proportional to total value in that stage (widest = 100%)
- Bar indentation: Increases per stage (funnel narrowing effect)
- Bar color: Orange gradient (lighter at top, darker at bottom)
- Bar height: 48px
- Stage label: Left-aligned, weight 600, Mocha Text
- Deal count: In parentheses after stage name
- Value: Right-aligned, weight 700, Mocha Text

**Bar segments** (hover interaction):
- Each bar is clickable
- Hover: Darken bar, show cursor pointer, slight shadow
- Click: Navigate to Deals page filtered by that stage
- Tooltip on hover: "12 deals • $180,000 total • 28% of pipeline"

**Conversion rates** (between stages):
- Small text between bars: "67% → First Conversation" (drop-off rate)
- Green if >50%, Yellow if 30-50%, Red if <30%
- Formula: (deals in next stage / deals in current stage) × 100

**Empty state**:
- If a stage has 0 deals: Show stage bar at minimum width (gray)
- Text: "0 deals" in Mocha Overlay0
- Still clickable (navigates to empty filtered view)

**And** when I click "List View" toggle
**Then** the visualization changes to a table:
```
┌─────────────────────┬──────────┬─────────┬────────────┐
│ Stage               │ Deals    │ Value   │ Conversion │
├─────────────────────┼──────────┼─────────┼────────────┤
│ Initial Connect     │ 12       │ $180K   │ 67% →      │
│ First Conversation  │ 8        │ $140K   │ 75% →      │
│ Email Engaged       │ 6        │ $120K   │ 67% →      │
│ ...                 │ ...      │ ...     │ ...        │
└─────────────────────┴──────────┴─────────┴────────────┘
```

**And** when filters are applied (owner, campaign, date range)
**Then** the funnel updates to show filtered data:
- Funnel bars recalculate based on filtered deals
- Section header shows active filters: "Pipeline by Stage - Marcus Only"

**Technical Notes:**
- API route: GET /api/dashboard/pipeline-funnel with filter params
- Query: Group by stage_id with COUNT and SUM(value)
- Join: pipeline_stages for stage names and order_num
- Order: By pipeline_stages.order_num ASC
- Conversion calculation: For each stage, divide next stage count by current count
- Bar width: Calculate as (stage_value / max_stage_value) × 100%
- Funnel component: Custom React component or library like Recharts
- Click handler: Navigate to /deals?stage={stage_id}

**Prerequisites:** Epic 4 (Story 4.4 - deals list with stage filtering), Epic 1 (Story 1.2 - pipeline_stages table)

---

### Story 5.3: Deals at Risk Identification & List

**User Story:**
As a sales team member, I want to see a list of deals that are stalling or at risk, so that I can proactively follow up and prevent deals from going cold.

**Acceptance Criteria:**

**Given** I am on the Dashboard page
**When** I scroll to the "Deals at Risk" section
**Then** I see the at-risk deals list (UX §7.3, FR6.3):

**Section header**:
- Title: "Deals at Risk" (1.5rem, weight 700, Mocha Red #f38ba8)
- Warning icon: Exclamation triangle (20×20px, Red)
- Count badge: "(4 deals)" in red badge
- "View All" link (right-aligned, navigates to filtered deals page)

**At-risk criteria** (configurable, MVP defaults):
1. **Stalled deals**: No activity or stage change in 14+ days
2. **Overdue close**: Expected close date passed but deal still Open
3. **Low probability**: Probability <30% and in pipeline >30 days
4. **No follow-up**: Deal created >7 days ago with no notes or activities

**Deals at risk list**:
```
┌──────────────────────────────────────────┐
│ ⚠️ Q1 Enterprise License       $50,000   │
│    John Smith • Acme Corp                │
│    Reason: No updates in 18 days         │
│    Last activity: Nov 20 by Marcus       │
│    [Follow Up] [View Deal]               │
├──────────────────────────────────────────┤
│ ⚠️ Partner Integration         $25,000   │
│    Jane Doe • TechCo                     │
│    Reason: Close date passed (Nov 30)    │
│    Expected close: 8 days overdue        │
│    [Follow Up] [View Deal]               │
├──────────────────────────────────────────┤
│ ... (show up to 5 deals, then "View All")│
└──────────────────────────────────────────┘
```

**Deal card design** (UX §7.3):
- Background: rgba(243, 139, 168, 0.1) (Mocha Red tint)
- Border-left: 3px solid Mocha Red
- Border-radius: 8px
- Padding: 1rem
- Warning icon: ⚠️ emoji or Heroicons exclamation triangle

**Card content**:
- Deal title + value (first line, bold)
- Contact name + company (second line, smaller)
- Risk reason: "Reason: [specific issue]" (bold, Red text)
- Last activity: "Last activity: [date] by [user]" (Mocha Subtext0)
- Action buttons: [Follow Up] (primary), [View Deal] (secondary)

**And** when I click [Follow Up]
**Then** a quick action modal opens:
- Pre-filled activity log form
- Activity type: "Follow-up Call" or "Follow-up Email" selected
- Deal pre-selected
- Contact pre-selected
- Notes field focused for quick entry
- [Cancel] [Log Activity] buttons

**And** when I click [View Deal]
**Then** the deal detail modal opens (Story 4.3 pattern)

**And** when I click "View All"
**Then** navigate to /deals?filter=at-risk showing all at-risk deals

**And** when there are no at-risk deals
**Then** show success state:
- Green checkmark icon ✓
- Message: "Great work! No deals at risk."
- Subtext: "All deals have recent activity and are on track."

**Technical Notes:**
- API route: GET /api/dashboard/deals-at-risk
- Query logic: Filter deals using OR conditions for all 4 risk criteria
- Stalled check: `updated_at < NOW() - INTERVAL '14 days'`
- Overdue check: `expected_close_date < CURRENT_DATE AND status = 'Open'`
- Low probability check: `probability < 30 AND created_at < NOW() - INTERVAL '30 days'`
- No follow-up: Check if deal has activities (Epic 6 dependency - optional for MVP)
- Limit: Show 5 deals on dashboard, link to full list
- Sort: By risk severity (overdue first, then stalled, then low prob)

**Prerequisites:** Epic 4 (Story 4.3 - deal detail view), Epic 1 (Story 1.2 - deals table with dates)

---

### Story 5.4: Dashboard Filters (Date Range, Owner, Campaign)

**User Story:**
As a sales team member or executive, I want to filter the dashboard by date range, owner, and campaign, so that I can analyze specific segments of the pipeline.

**Acceptance Criteria:**

**Given** I am on the Dashboard page
**When** I look at the filter bar below the page header
**Then** I see three filter controls (UX §7.4, FR6.6):

**Filter bar layout**:
```
┌──────────────────────────────────────────┐
│ Dashboard     Updated 2 min ago          │
│ Your sales pipeline at a glance          │
│                                          │
│ [📅 Date Range ▾] [👤 Owner ▾] [🏷️ Campaign ▾] │
└──────────────────────────────────────────┘
```

**Filter 1: Date Range** (FR6.6):
- Dropdown button with calendar icon
- Options:
  - "All Time" (default)
  - "This Month"
  - "Last Month"
  - "This Quarter"
  - "Last Quarter"
  - "Custom Range" (opens date picker modal)
- Selected filter shown in button: "📅 This Month"
- Applies to: Deal created_at date

**Filter 2: Owner** (FR6.6):
- Dropdown with user icon
- Options:
  - "All Owners" (default)
  - "My Deals" (current user)
  - Separator line
  - List of all team members (from users table)
- Shows avatar + name for each team member
- Selected filter shown in button: "👤 Marcus"
- Applies to: Deal owner_id

**Filter 3: Campaign** (FR6.6):
- Dropdown with tag icon
- Options:
  - "All Campaigns" (default)
  - List of all active campaigns
- Shows campaign name with contact count
- Multi-select: Can select multiple campaigns
- Selected shown in button: "🏷️ Q4 SaaS (+2 more)"
- Applies to: Deals linked to contacts in selected campaigns (via campaign_contacts)

**Filter styling** (UX §4.3):
- Button background: Mocha Surface0
- Border: 1px solid Mocha Surface1
- Border-radius: 8px
- Padding: 0.5rem 1rem
- Height: 40px
- Hover: Border color Orange, background Surface1
- Active (dropdown open): Border Orange, box-shadow

**Dropdown menu**:
- Max-height: 300px, scrollable
- Background: Mocha Mantle
- Border: 1px solid Mocha Surface0
- Border-radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.3)
- Item hover: Background Mocha Surface0

**And** when I select a filter option
**Then** the dashboard updates:
- All sections recalculate: Stat cards, funnel, at-risk deals
- URL updates with query params: ?dateRange=thisMonth&owner=123&campaign=456
- Loading spinner on affected sections (skeleton state)
- Filter button shows active selection (Orange border, filled background)

**And** when multiple filters are active
**Then** an "Active Filters" indicator appears:
- Badge: "3 filters active" with count
- Clear all button: "Clear All ✕"
- Each active filter shown as pill: "[This Month ✕] [Marcus ✕] [Q4 SaaS ✕]"
- Click ✕ to remove individual filter

**And** when I click "Clear All"
**Then** all filters reset to defaults:
- Date Range: "All Time"
- Owner: "All Owners"
- Campaign: "All Campaigns"
- Dashboard refreshes with all data

**And** when filters are applied, URL params are set
**Then** I can share the filtered dashboard URL:
- URL: `/dashboard?dateRange=thisMonth&owner=abc123&campaigns=def456,ghi789`
- When another user visits this URL, same filters apply
- Bookmarkable filtered views

**Responsive behavior** (UX §9.1):
- Desktop: All 3 filters inline
- Tablet: Stack in 2 rows
- Mobile: Collapsible "Filters" button opens modal with all 3 filters

**Technical Notes:**
- Filter state: React useState or URL search params (use next/navigation useSearchParams)
- API calls: Pass filter params to all dashboard endpoints
- Query filtering:
  - Date: `WHERE created_at >= start_date AND created_at <= end_date`
  - Owner: `WHERE owner_id = selected_user_id`
  - Campaign: `JOIN contacts c, campaign_contacts cc WHERE cc.campaign_id IN (selected_campaigns)`
- URL sync: Update URL params when filters change, read on mount
- Debounce: Debounce filter changes by 300ms to avoid excessive API calls
- Campaign multi-select: Use checkbox list in dropdown
- Clear all: Reset filter state and remove URL params

**Prerequisites:** Epic 4 (Story 4.4 - similar filter pattern), Story 5.1-5.3 (dashboard sections to filter)

---

### Story 5.5: Executive Read-Only Dashboard View

**User Story:**
As an executive (David), I want a read-only dashboard view with the same real-time pipeline visibility as the sales team, so that I can monitor sales health without accidentally modifying data.

**Acceptance Criteria:**

**Given** I am logged in as a user with role = 'executive' (FR9.1)
**When** I access the dashboard
**Then** I see the same dashboard layout as sales team members:
- Four stat cards (Story 5.1)
- Pipeline funnel visualization (Story 5.2)
- Deals at risk list (Story 5.3)
- Filter controls (Story 5.4)

**And** my view has read-only restrictions (FR9.2, FR9.4):
- No "+ New Deal" buttons visible
- No "+ New Contact" buttons visible
- Deal cards not clickable (no modal opens)
- Contact names not clickable (no navigation)
- "View Deal" buttons show "View Details" and open read-only modal

**Read-only deal modal**:
- Same layout as Story 4.3 detail view
- No [Edit] or [Delete] buttons
- All fields display-only (no inputs)
- Stage timeline visible (FR9.4)
- Notes field read-only (no editing)
- Close button only (X or "Close")

**And** when I try to access restricted pages
**Then** I see appropriate redirects:
- /contacts → Redirect to /dashboard with message
- /deals → Allow access (read-only list view)
- /settings → Redirect to /dashboard with message
- Message: "This page is only available to sales team members. View your dashboard for pipeline insights."

**And** when I apply filters (FR9.3)
**Then** all filter options work normally:
- Date range filtering
- Owner filtering (see all team members' deals)
- Campaign filtering (see all campaign data)
- Filters persist in URL (bookmarkable)

**And** I see additional executive-focused metrics:
- Win rate trends (last 3 months)
- Revenue forecast based on weighted pipeline
- Team performance breakdown (deals by owner)
- Risk visibility clearly highlighted (FR9.4)

**Executive insights panel** (optional, below main dashboard):
```
┌──────────────────────────────────────────┐
│ Executive Insights                       │
├──────────────────────────────────────────┤
│ Team Performance:                        │
│ • Marcus: 8 deals, $320K (49% weighted)  │
│ • Sarah: 6 deals, $180K (38% weighted)   │
│ • Todd: 4 deals, $150K (25% weighted)    │
│                                          │
│ Forecast (Next 30 Days):                 │
│ • Expected closes: 7 deals               │
│ • Weighted value: $210K                  │
│ • Win probability avg: 65%               │
└──────────────────────────────────────────┘
```

**Technical Notes:**
- Role check: Middleware checks user.role in session (Architecture §3.1)
- Executive role: Add 'executive' to users.role enum (Story 1.2 update)
- Read-only enforcement: Server-side on all mutation endpoints (POST, PUT, DELETE)
- UI hiding: Conditional rendering based on user.role !== 'executive'
- Same API endpoints: No separate executive APIs needed
- Deal modal: Create read-only variant or add `readOnly` prop to existing modal
- Redirect logic: In middleware or page-level checks
- Team performance: Query deals grouped by owner_id with aggregations

**Prerequisites:** Epic 1 (Story 1.3 - role-based auth), Stories 5.1-5.4 (all dashboard sections), Epic 4 (Story 4.3 - deal modal)

---

**Epic 5 Complete: Dashboard & Pipeline Analytics**

**Stories Created:** 5 stories
**FR Coverage:** FR6.1-FR6.8 (Dashboard), FR9.1-FR9.5 (Executive Dashboard), FR10.2 (Dashboard load <3s), FR10.4 (Pipeline calc <10s)
**Architecture Sections Used:** §3.1 (Role-based auth), §3.3 (API routes), §4.1 (Query optimization), §4.2 (Aggregations)
**UX Sections Used:** §4.7 (Stat cards), §7.1-7.4 (Dashboard layouts), §8.1 (Loading states), §9.1 (Responsive)

Ready for checkpoint validation.

---

## Epic 6: Activity Tracking & Email Integration

**Epic Goal:** Enable sales team members to log all relationship interactions (emails, calls, meetings, LinkedIn messages, WhatsApp) with contacts and deals, view complete activity timelines, and integrate with Outlook email client for seamless communication tracking.

**User Value:** Marcus can log every touchpoint with contacts and deals, view complete interaction history at a glance, click-to-email from contact pages with Outlook integration, and maintain a comprehensive record of all relationship-building activities for follow-up and context.

**PRD Coverage:** FR7.1-FR7.4, FR4.5, FR4.6, FR11.2
**Architecture Integration:** Activities table with contact/deal references, activity types enum, timeline queries, mailto: links for Outlook
**UX Patterns:** Activity log modal, timeline component, activity cards, email integration buttons

---

### Story 6.1: Activities Database Table & Activity Types

**User Story:**
As a developer, I want to create the activities table with support for multiple activity types and references to both contacts and deals, so that we can track all relationship interactions comprehensively.

**Acceptance Criteria:**

**Given** I need to track various types of activities linked to contacts and deals
**When** I create the activities table migration
**Then** the following table structure is created (Architecture §2.3.8):

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'LinkedIn Message', 'WhatsApp', 'Note')),
  subject TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**And** when I create indexes for performance (Architecture §4.1):
```sql
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_logged_by ON activities(logged_by);
CREATE INDEX idx_activities_type ON activities(activity_type);
```

**And** when I create the updated_at trigger:
```sql
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Activity type definitions** (FR7.1-FR7.4):
1. **Email**: Email sent or received via Outlook
2. **Call**: Phone call made or received
3. **Meeting**: In-person or virtual meeting
4. **LinkedIn Message**: Message sent via LinkedIn
5. **WhatsApp**: Message sent via WhatsApp
6. **Note**: General note or conversation summary

**And** when activities are queried for timeline (FR4.5)
**Then** they are ordered by activity_date DESC (most recent first):
- Index on activity_date supports fast sorting
- Query: `SELECT * FROM activities WHERE contact_id = ? ORDER BY activity_date DESC`

**Technical Notes:**
- contact_id and deal_id: At least one must be set (application logic, not DB constraint)
- activity_type: CHECK constraint enforces valid types
- activity_date: Can be backdated for logging past activities
- logged_by: ON DELETE SET NULL preserves activity if user deleted (Architecture §2.1)
- subject: Short description (e.g., "Follow-up call", "Proposal sent")
- description: Full notes about the activity
- Indexes optimize queries by contact, deal, date, user, type (Architecture §4.1)
- Store migration as: migrations/004_activities_schema.sql

**Prerequisites:** Epic 1 (Story 1.2 - requires users table), Epic 2 (Story 2.1 - requires contacts table), Epic 4 (Story 4.1 - requires deals table)

---

### Story 6.2: Log Activity Modal with Activity Type Selection

**User Story:**
As a sales team member (Marcus), I want to quickly log any type of activity (email, call, meeting, etc.) related to a contact or deal, so that I can maintain a complete record of all interactions.

**Acceptance Criteria:**

**Given** I am viewing a contact detail page or deal detail page
**When** I click the "Log Activity" button (secondary button)
**Then** an activity log modal opens (UX §4.6, §8.3):

**Modal design**:
```
┌────────────────────────────────────────┐
│ Log Activity                           │
├────────────────────────────────────────┤
│ For: John Smith (Acme Corp)            │
│                                        │
│ Activity Type *                        │
│ [📧 Email ▾]                           │
│                                        │
│ Subject *                              │
│ [_________________________________]    │
│                                        │
│ Date & Time *                          │
│ [12/09/2024] [02:30 PM]                │
│                                        │
│ Notes                                  │
│ [_________________________________]    │
│ [_________________________________]    │
│ [_________________________________]    │
│                                        │
│  [Cancel]      [Log Activity]          │
└────────────────────────────────────────┘
```

**Form fields**:

1. **Context** (read-only, pre-filled):
   - Shows contact name (and deal title if from deal page)
   - Contact ID and/or Deal ID passed as hidden fields
   - Cannot be changed

2. **Activity Type** (required) (FR7.4):
   - Dropdown select with icons
   - Options:
     - 📧 Email
     - 📞 Call
     - 🤝 Meeting
     - 💼 LinkedIn Message
     - 💬 WhatsApp
     - 📝 Note
   - Default: "Email" (most common)
   - Each option shows icon + label

3. **Subject** (required):
   - Text input, max 200 characters
   - Placeholder varies by activity type:
     - Email: "e.g., Sent proposal follow-up"
     - Call: "e.g., Discovery call"
     - Meeting: "e.g., Product demo at their office"
     - Note: "e.g., Conversation summary"
   - Validation: Cannot be empty
   - Error: "Subject is required"

4. **Date & Time** (required):
   - Date picker + time picker
   - Default: Current date and time
   - Can backdate for logging past activities
   - Format: MM/DD/YYYY HH:MM AM/PM
   - Min: None (can log historical activities)
   - Max: Current date/time (cannot future-date)

5. **Notes** (optional):
   - Textarea, max 5000 characters
   - Placeholder: "Add details about this activity..."
   - Character counter: "4850/5000"
   - Rich text formatting (bold, italic, lists) - optional for MVP

**And** when I submit the form with valid data
**Then** the system:
- Calls POST /api/activities (Architecture §3.3)
- Creates activity record in activities table
- Sets contact_id and/or deal_id from context
- Sets logged_by to current logged-in user
- Sets created_at, updated_at automatically
- Shows success toast: "Activity logged successfully" (green, 3s) (UX §8.1)
- Closes modal
- Refreshes parent page to show new activity in timeline

**And** when validation fails
**Then** inline error messages appear (UX §8.2):
- Red text (Mocha Red #f38ba8)
- 0.875rem font size
- Specific error per field
- Submit button disabled until errors resolved

**Quick log shortcuts**:
- Keyboard shortcut: "L" to open log activity modal (global)
- Recent activity types: Show 3 most recent types at top of dropdown
- Auto-fill subject: If activity type matches recent activity, suggest similar subject

**Technical Notes:**
- Create component: `app/(dashboard)/components/LogActivityModal.tsx` (reusable)
- API route: app/api/activities/route.ts (POST method) (Architecture §3.3)
- Form state: React useState or useForm hook
- Activity type dropdown: Custom select with icons (Heroicons)
- Date/time picker: HTML5 datetime-local input or library like react-datepicker
- Context detection: Determine if opened from contact page, deal page, or dashboard
- If from contact page: Pre-fill contact_id
- If from deal page: Pre-fill both contact_id and deal_id
- Keyboard shortcut: Use global event listener or keyboard library

**Prerequisites:** Story 6.1 (requires activities table), Epic 2 (Story 2.4 - contact detail view), Epic 4 (Story 4.3 - deal detail view)

---

### Story 6.3: Activity Timeline Component for Contacts & Deals

**User Story:**
As a sales team member, I want to see a complete timeline of all activities for a contact or deal in chronological order, so that I can understand the full relationship history at a glance.

**Acceptance Criteria:**

**Given** I am viewing a contact detail page or deal detail page
**When** I scroll to the "Activity Timeline" section
**Then** I see the activity timeline (UX §8.4, FR4.5):

**Timeline section header**:
- Title: "Activity Timeline" (1.25rem, weight 700, Mocha Text)
- Activity count: "(12 activities)" in Mocha Subtext0
- Filter dropdown (right): "All Activities ▾" with type filters
- [Log Activity] button (right, secondary)

**Timeline visualization** (FR4.5):
```
┌──────────────────────────────────────────┐
│ Activity Timeline (12)  [All ▾] [Log]    │
├──────────────────────────────────────────┤
│ Dec 9, 2024                              │
│ ├─ 📧 Sent proposal follow-up            │
│ │  2:30 PM • by Marcus                   │
│ │  Followed up on the proposal sent...   │
│ │  [View] [Edit]                         │
│ │                                        │
│ Dec 8, 2024                              │
│ ├─ 📞 Discovery call                     │
│ │  10:00 AM • by Marcus                  │
│ │  Discussed requirements and budget...  │
│ │  [View] [Edit]                         │
│ │                                        │
│ Dec 5, 2024                              │
│ ├─ 💼 LinkedIn message                   │
│ │  3:45 PM • by Sarah                    │
│ │  Initial outreach via LinkedIn...      │
│ │  [View] [Edit]                         │
│ │                                        │
│ ├─ 🏷️ Deal created: Q1 Enterprise       │
│ │  3:30 PM • by Marcus                   │
│ │  (System event)                        │
│ └                                        │
└──────────────────────────────────────────┘
```

**Timeline entry design** (UX §8.4):
- Background: Transparent
- Border-left: 2px solid Mocha Surface1 (timeline line)
- Activity dot: 8px circle on timeline line
- Dot color: Varies by activity type (Email=Blue, Call=Green, Meeting=Purple, etc.)
- Padding: 1rem
- Spacing between entries: 0.5rem

**Activity card content**:
- Icon: Activity type icon (20×20px) + type label
- Subject: Bold, 1rem, Mocha Text
- Metadata line: Date/time + "by" + user name (0.875rem, Mocha Subtext0)
- Description: First 100 chars, truncated with "..." if longer
- Actions: [View] (expands full description), [Edit] (opens edit modal)

**Date grouping**:
- Activities grouped by date (e.g., "Dec 9, 2024")
- Date headers: 0.875rem, weight 600, Mocha Overlay1
- Same-day activities listed under one date header

**System events** (mixed with activities):
- Deal created: Shows when deal was created for this contact
- Stage changed: Shows when deal moved to new stage (from Story 4.3 deal_stage_history)
- Contact created: Initial contact entry
- System events styled differently: Gray text, tag icon 🏷️

**And** when I click [View] on an activity
**Then** the activity card expands inline:
- Full description displayed (no truncation)
- [View] button changes to [Collapse]
- All metadata visible (exact timestamp, full user name)

**And** when I click [Edit]
**Then** the log activity modal opens in edit mode:
- All fields pre-filled with activity data
- [Cancel] and [Save Changes] buttons
- PUT /api/activities/[id] on submit

**And** when I use the activity type filter
**Then** the timeline filters to show only selected types:
- Dropdown options: "All Activities", "Emails", "Calls", "Meetings", "LinkedIn", "WhatsApp", "Notes"
- Filtered timeline updates immediately
- Empty state if no activities of selected type: "No [type] activities yet"

**And** when there are no activities
**Then** show empty state:
- Icon: Activity icon (gray)
- Message: "No activities logged yet"
- Subtext: "Log your first activity to start tracking interactions"
- [Log Activity] button (primary, centered)

**Responsive behavior** (UX §9.2):
- Desktop: Full timeline with all details
- Mobile: Condensed view, stack metadata vertically, hide [Edit] by default (swipe to reveal)

**Technical Notes:**
- API route: GET /api/activities with query params (contact_id or deal_id, type filter)
- Query: Filter by contact_id or deal_id, order by activity_date DESC
- Date grouping: Client-side grouping by date (group activities by day)
- System events: Query deal_stage_history + join activities for unified timeline
- Expand/collapse: React state per activity (expanded IDs array)
- Edit modal: Same component as Story 6.2, pass activity ID for pre-fill
- Pagination: Load 20 activities initially, "Load More" button for older activities
- Real-time updates: Optional refresh when new activity logged

**Prerequisites:** Story 6.2 (requires log activity modal), Story 6.1 (requires activities table), Epic 4 (Story 4.3 - deal stage history)

---

### Story 6.4: Outlook Email Integration (Click-to-Email)

**User Story:**
As a sales team member (Marcus), I want to click an email button on a contact page that opens Outlook with the contact's email pre-filled, so that I can quickly send emails without manual copying.

**Acceptance Criteria:**

**Given** I am viewing a contact detail page and the contact has an email address
**When** I see the contact's email field
**Then** I see an email button next to the email address (FR7.1):

**Email button design** (UX §4.8):
- Icon: Envelope icon (Heroicons, 20×20px)
- Label: "Send Email" (or just icon on compact view)
- Style: Secondary button (Mocha Surface0 background, orange on hover)
- Position: Inline with email address
- Tooltip: "Open in Outlook"

**And** when I click the "Send Email" button (FR7.1)
**Then** the system opens my default email client:
- Uses mailto: link with pre-filled data
- Format: `mailto:john.smith@acmecorp.com?subject=&body=`
- Opens: Outlook desktop client (if installed) or Outlook web (if default)
- Email To: Contact's email address
- Subject: Empty (user fills in)
- Body: Empty (user fills in)

**Enhanced mailto: link** (optional enhancements):
- Pre-fill subject with deal title if context exists: `?subject=Re: Q1 Enterprise License`
- Pre-fill body with signature: `?body=Best regards,%0D%0AMarcus`
- CC: User's team email if configured

**And** after sending email via Outlook
**Then** I return to NovaCRM and see a prompt (FR7.2):
- Toast notification: "Did you send an email to John Smith?"
- Actions: [Yes, Log It] [No, Dismiss]
- If [Yes, Log It]: Opens log activity modal pre-filled with:
  - Activity type: Email
  - Subject: Empty (user fills in)
  - Date/time: Current time
  - Notes: Empty (user adds email summary)

**Quick log from email button**:
- Right-click or long-press on "Send Email" button
- Context menu: [Send Email] [Send & Log Activity]
- If "Send & Log Activity": Opens mailto: + log activity modal simultaneously

**Email history display** (FR7.3):
- On contact detail page, show "Email History" section
- Lists all activities with type = 'Email'
- Same timeline format as Story 6.3
- Filter to show only emails

**And** when contact has no email address
**Then** the "Send Email" button is:
- Disabled (grayed out)
- Tooltip: "No email address on file"
- Alternative action: [Add Email] button opens contact edit modal

**Technical Notes:**
- mailto: link: Use standard `window.location.href = 'mailto:...'` or `<a href="mailto:...">`
- URL encoding: Encode subject and body params with encodeURIComponent()
- Outlook detection: Cannot detect if Outlook specifically opened (OS-level default mail client)
- Post-send prompt: Use local storage to track when mailto: link clicked, show prompt on window focus return
- Focus detection: Listen for window focus event, show prompt if focus returns within 2 minutes
- Quick log context menu: Use onContextMenu event or long-press gesture library
- Email history: Query activities WHERE contact_id = ? AND activity_type = 'Email'
- No email fallback: Conditional rendering based on contact.email field

**Prerequisites:** Epic 2 (Story 2.4 - contact detail with email field), Story 6.2 (log activity modal)

---

### Story 6.5: Activity Summary & Recent Activity Dashboard Widget

**User Story:**
As a sales team member, I want to see my recent activity summary on the dashboard, so that I can track my engagement with contacts and deals at a glance.

**Acceptance Criteria:**

**Given** I am on the Dashboard page
**When** I scroll to the "Recent Activity" section
**Then** I see my recent activity summary (UX §7.5, FR6.5):

**Section header**:
- Title: "Recent Activity" (1.5rem, weight 700, Mocha Text)
- Subtitle: "Your last 10 interactions" (0.875rem, Mocha Subtext0)
- Filter: "My Activity ▾" dropdown (All Team / My Activity / By User)
- [View All] link (right-aligned, navigates to /activities page)

**Activity summary widget**:
```
┌──────────────────────────────────────────┐
│ Recent Activity    [My Activity ▾] [All] │
├──────────────────────────────────────────┤
│ Today                                    │
│ ├─ 📧 Sent proposal to John Smith        │
│ │  2:30 PM • Acme Corp                   │
│ │                                        │
│ ├─ 📞 Discovery call with Jane Doe       │
│ │  10:00 AM • TechCo                     │
│ │                                        │
│ Yesterday                                │
│ ├─ 🤝 Product demo at Client Site        │
│ │  3:00 PM • BigCorp                     │
│ │                                        │
│ Dec 7                                    │
│ ├─ 💼 LinkedIn outreach to 5 contacts    │
│ │  4:15 PM • Q4 SaaS Campaign            │
│ └                                        │
│                                          │
│ [View All Activities →]                  │
└──────────────────────────────────────────┘
```

**Activity entry design**:
- Compact card format
- Icon + activity subject on first line
- Time + related entity (contact/deal/company) on second line
- Click: Navigates to related contact or deal page
- Hover: Background lightens (Mocha Surface0)

**Activity stats** (above widget):
```
┌────────────┬────────────┬────────────┐
│ This Week  │ This Month │ Avg/Day    │
│ 23 activities│ 87 activities│ 4.2 activities│
└────────────┴────────────┴────────────┘
```

**Mini stat cards**:
- Three cards showing activity metrics
- This Week: COUNT of activities WHERE activity_date >= start of week
- This Month: COUNT of activities WHERE activity_date >= start of month
- Avg/Day: COUNT / days (last 30 days)

**And** when I filter by "All Team"
**Then** I see all team members' activities:
- Includes logged_by user name in each entry
- Format: "by Marcus • 2:30 PM"
- Sorted by activity_date DESC (most recent first)

**And** when I filter by specific user
**Then** I see only that user's activities:
- Dropdown shows list of all team members
- Filter WHERE logged_by = selected_user_id

**And** when I click [View All Activities]
**Then** navigate to /activities page:
- Full activity list page (similar to Deals page)
- Filters: Activity type, date range, user, contact, deal
- Search: By subject or description
- Export: Download activities as CSV (optional)

**And** when there are no recent activities
**Then** show empty state:
- Icon: Activity icon (gray)
- Message: "No recent activity"
- Subtext: "Log your first activity to start tracking"
- [Log Activity] button

**Technical Notes:**
- API route: GET /api/activities/recent with filter params (user_id, limit=10)
- Query: Order by activity_date DESC, limit 10
- Stats calculation: Aggregate queries for week, month, average
- Date grouping: Group by date (Today, Yesterday, specific dates)
- Click navigation: Determine if activity has contact_id or deal_id, navigate accordingly
- Full activities page: Create app/(dashboard)/activities/page.tsx (optional for MVP)
- Real-time updates: Poll every 60s or use Supabase subscriptions

**Prerequisites:** Story 6.1-6.3 (activities infrastructure), Epic 5 (Story 5.1 - dashboard layout)

---

**Epic 6 Complete: Activity Tracking & Email Integration**

**Stories Created:** 5 stories
**FR Coverage:** FR7.1-FR7.4 (Email Integration - Outlook), FR4.5 (Activity timeline), FR4.6 (Notes), FR6.5 (Team activity), FR11.2 (Timestamps)
**Architecture Sections Used:** §2.3.8 (Activities table), §3.3 (API routes), §4.1 (Indexes), §2.1 (Cascading deletes)
**UX Sections Used:** §4.6 (Modals), §4.8 (Email buttons), §8.3-8.4 (Activity components), §7.5 (Dashboard widget), §9.2 (Responsive)

Ready for checkpoint validation.

---

## FR Coverage Map

This section maps all functional requirements from the PRD to specific stories in the epic breakdown, ensuring 100% coverage of MVP requirements.

### FR1: User Authentication & Access Control
- **FR1.1** - Secure login for 3-5 team members: **Epic 1, Story 1.3**
- **FR1.2** - Individual accounts with email/password: **Epic 1, Story 1.3**
- **FR1.3** - Shared visibility to all data: **Epic 1, Story 1.3** (no RLS in MVP)
- **FR1.4** - Session management and logout: **Epic 1, Story 1.6**
- **FR1.5** - Role-based access (admin vs sales_rep): **Epic 1, Story 1.3** + **Epic 5, Story 5.5**

### FR2: LinkedIn Lead Capture - Manual Entry
- **FR2.1** - Manual lead entry form: **Epic 2, Story 2.2**
- **FR2.2** - Required fields (Name, LinkedIn URL): **Epic 2, Story 2.2**
- **FR2.3** - Optional fields (Email, Company, etc.): **Epic 2, Story 2.2**
- **FR2.4** - Campaign attribution dropdown: **Epic 2, Story 2.2**
- **FR2.5** - Lead source tracking: **Epic 2, Story 2.2**
- **FR2.6** - Automatic timestamps: **Epic 2, Story 2.1**
- **FR2.7** - Lead ownership assignment: **Epic 2, Story 2.2**

### FR3: CSV Contact Upload
- **FR3.1** - CSV upload with drag-and-drop: **Epic 3, Story 3.2**
- **FR3.2** - LinkedIn CSV format parsing: **Epic 3, Story 3.1**
- **FR3.3** - Duplicate detection: **Epic 3, Story 3.3**
- **FR3.4** - Duplicate alert modal: **Epic 3, Story 3.3**
- **FR3.5** - Multi-campaign association: **Epic 3, Story 3.4**
- **FR3.6** - Batch import with transactions: **Epic 3, Story 3.4**
- **FR3.7** - Import summary: **Epic 3, Story 3.2**

### FR4: Pipeline Management
- **FR4.1** - Contact record management: **Epic 2, Story 2.2, 2.4**
- **FR4.2** - Customizable sales stages: **Epic 1, Story 1.2** (8 default stages)
- **FR4.3** - Default 8 stages: **Epic 1, Story 1.2**
- **FR4.4** - Lead assignment and ownership: **Epic 2, Story 2.2**
- **FR4.5** - Activity timeline: **Epic 6, Story 6.3**
- **FR4.6** - Editable notes: **Epic 2, Story 2.4** + **Epic 4, Story 4.2**
- **FR4.7** - Contact search and filtering: **Epic 2, Story 2.3**

### FR5: Deal Tracking & Metrics
- **FR5.1** - Create deals linked to contacts: **Epic 4, Story 4.2**
- **FR5.2** - Deal value estimation: **Epic 4, Story 4.2**
- **FR5.3** - Win probability percentage: **Epic 4, Story 4.2**
- **FR5.4** - Current pipeline stage indicator: **Epic 4, Story 4.2, 4.3**
- **FR5.5** - Expected close date: **Epic 4, Story 4.2**
- **FR5.6** - Deal notes: **Epic 4, Story 4.2, 4.3**
- **FR5.7** - Deal history tracking: **Epic 4, Story 4.3**
- **FR5.8** - Deal status (Open, Won, Lost): **Epic 4, Story 4.1, 4.3**

### FR6: Pipeline Dashboard
- **FR6.1** - Real-time pipeline value: **Epic 5, Story 5.1** + **Epic 4, Story 4.5**
- **FR6.2** - Lead count by stage: **Epic 5, Story 5.2**
- **FR6.3** - Deals at risk identification: **Epic 5, Story 5.3**
- **FR6.4** - Recently closed deals: **Epic 5, Story 5.1**
- **FR6.5** - Team activity summary: **Epic 6, Story 6.5**
- **FR6.6** - Quick filters: **Epic 5, Story 5.4**
- **FR6.7** - Dashboard loads <3s: **Epic 5, Story 5.1**
- **FR6.8** - Four key stat cards: **Epic 5, Story 5.1**

### FR7: Email Integration - Outlook
- **FR7.1** - Click-to-email button: **Epic 6, Story 6.4**
- **FR7.2** - Manual email activity logging: **Epic 6, Story 6.2, 6.4**
- **FR7.3** - Email history timeline: **Epic 6, Story 6.3, 6.4**
- **FR7.4** - "Log Email" UI component: **Epic 6, Story 6.2**

### FR8: Admin Configuration
- **FR8.1** - Sales stage management: **Epic 1, Story 1.2** (MVP: hard-coded)
- **FR8.2** - Campaign CRUD operations: **Epic 3, Story 3.5**
- **FR8.3** - User account management: **Epic 1, Story 1.3** (via Supabase)
- **FR8.4** - Admin dashboard: **Epic 5, Story 5.1** (shared dashboard)
- **FR8.5** - Settings control panel: **Epic 3, Story 3.5**

### FR9: Executive Dashboard
- **FR9.1** - Read-only executive view role: **Epic 5, Story 5.5**
- **FR9.2** - Real-time pipeline visibility: **Epic 5, Story 5.5**
- **FR9.3** - Pipeline breakdown by stage/team/campaign: **Epic 5, Story 5.4, 5.5**
- **FR9.4** - Risk visibility: **Epic 5, Story 5.3, 5.5**
- **FR9.5** - Data transparency: **Epic 5, Story 5.5**

### FR10: Performance Requirements
- **FR10.1** - Lead capture <2 minutes: **Epic 2, Story 2.2**
- **FR10.2** - Dashboard loads <3s: **Epic 5, Story 5.1**
- **FR10.3** - Duplicate prevention instant: **Epic 2, Story 2.5** + **Epic 3, Story 3.3**
- **FR10.4** - Pipeline calculation <10s: **Epic 4, Story 4.5** + **Epic 5, Story 5.1**
- **FR10.5** - All pages <3s Time to Interactive: **Epic 1, Story 1.1** (Next.js 15)

### FR11: Data Management
- **FR11.1** - Zero data loss (durable operations): **All epics** (PostgreSQL transactions)
- **FR11.2** - Automatic timestamps: **Epic 1, Story 1.2** (triggers)
- **FR11.3** - Soft deletes for owners: **Epic 2, Story 2.1** + **Epic 4, Story 4.1** (ON DELETE SET NULL)
- **FR11.4** - Cascade deletes for dependents: **Epic 2, Story 2.1** + **Epic 4, Story 4.1** (ON DELETE CASCADE)

---

## Summary

**Total Epics:** 6
**Total Stories:** 31 implementation-ready stories

### Epic Summary

1. **Epic 1: Foundation & Team Authentication** (6 stories)
   - Next.js 15 + Vercel deployment
   - Supabase database & auth setup
   - Login page & application layout
   - Protected routes & session management

2. **Epic 2: Contact Management & LinkedIn Capture** (5 stories)
   - Contacts database with indexes
   - Manual contact creation form
   - Contacts list with search/filter
   - Contact detail & edit modal
   - Duplicate detection & prevention

3. **Epic 3: Bulk Contact Import & Campaign Management** (5 stories)
   - CSV parser for LinkedIn format
   - Multi-step upload UI flow
   - Duplicate resolution modal
   - Batch import API with transactions
   - Campaign CRUD interface

4. **Epic 4: Deal Pipeline & Stage Tracking** (5 stories)
   - Deals database & stage relationships
   - Create deal form
   - Deal detail & edit modal
   - Deal list with stage filtering
   - Pipeline value calculations

5. **Epic 5: Dashboard & Pipeline Analytics** (5 stories)
   - Dashboard with stat cards
   - Pipeline funnel visualization
   - Deals at risk identification
   - Dashboard filters
   - Executive read-only view

6. **Epic 6: Activity Tracking & Email Integration** (5 stories)
   - Activities database & types
   - Log activity modal
   - Activity timeline component
   - Outlook email integration
   - Recent activity dashboard widget

### Functional Requirements Coverage

**Total FR Categories:** 11
**Total Requirements:** 60
**Coverage:** 100% (all requirements mapped to stories)

### Next Steps

1. Review epics and stories for completeness
2. Prioritize epics for implementation (Epic 1 → Epic 2 is MVP)
3. Use `/bmad:bmm:workflows:create-story` to generate detailed implementation specs for each story
4. Begin implementation with Epic 1, Story 1.1

---

_This epic breakdown is ready for implementation. Each story includes complete acceptance criteria, technical specifications, UX references, and prerequisites for a smooth development workflow._

