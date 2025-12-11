# NovaCRM - Technical Architecture

**Author:** Todd
**Date:** 2025-12-09
**Version:** 1.0
**Status:** Active Development

---

## Executive Summary

NovaCRM is built on a modern, serverless architecture leveraging Next.js 15, Supabase (PostgreSQL), and Vercel for deployment. The architecture prioritizes rapid development, cost efficiency, and scalability while maintaining the flexibility to evolve with INNOVAAS's needs.

**Key Architectural Principles:**
- **Serverless-First:** Minimize infrastructure management overhead
- **PostgreSQL-Powered:** Leverage relational database strengths for CRM data integrity
- **Type-Safe:** Full TypeScript implementation across frontend and backend
- **MCP-Enhanced:** Model Context Protocol integrations for AI-assisted development and operations

---

## MCP (Model Context Protocol) Integrations

NovaCRM leverages MCP servers for AI-assisted development and operations:

### Available MCP Connections

**1. Supabase MCP Server** ✅ Active
- **Purpose:** Direct database operations, schema management, migrations
- **Capabilities:**
  - Execute SQL queries and DDL operations
  - Apply migrations programmatically
  - List tables, schemas, and database objects
  - Retrieve logs for debugging
  - Generate TypeScript types from database schema
  - Security/performance advisory checks
- **Use Cases:**
  - AI-assisted database schema evolution
  - Automated migration generation
  - Real-time database introspection
  - Performance optimization recommendations

**2. Vercel MCP Server** ⚠️ Available (configuration pending)
- **Purpose:** Deployment management, project operations
- **Capabilities:**
  - List and manage Vercel projects
  - Deploy applications
  - View deployment logs and status
  - Manage environment variables
  - Monitor build/deployment health
- **Use Cases:**
  - AI-assisted deployment workflows
  - Automated environment configuration
  - Build troubleshooting and optimization

**Future MCP Integrations (Roadmap):**
- LinkedIn MCP for automated lead enrichment
- ClickUp MCP for sales-to-delivery handoff (V2.0)
- Email MCP for Outlook integration automation (V2.0)

---

## Technology Stack

### Frontend & Backend Framework

**Next.js 15** (React 19 + TypeScript)
- **App Router:** Modern file-based routing with server components
- **Server Components:** Default server-side rendering for performance
- **API Routes:** Backend API endpoints co-located with frontend code
- **Type Safety:** Full TypeScript across client and server

**Key Dependencies:**
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.8.0",
  "papaparse": "^5.4.1",
  "typescript": "^5.3.0"
}
```

### Styling & UI

**TailwindCSS 3.4**
- Utility-first CSS framework
- Custom design system integration
- Catppuccin Mocha + Innovaas Orange color palette (#F25C05)
- Responsive design patterns built-in

**Design System:**
- Primary Color: Innovaas Orange (#F25C05)
- Dark Theme: Catppuccin Mocha palette
- Typography: Plus Jakarta Sans (Google Fonts)
- Logo Assets: SVG (horizontal, stacked, icon variants)

### Database & Backend Services

**Supabase (PostgreSQL 15)**
- **Database:** Managed PostgreSQL with real-time subscriptions
- **Authentication:** Built-in auth with JWT tokens
- **Storage:** File storage for future document uploads
- **Edge Functions:** Serverless functions for complex operations
- **Region:** Asia-Pacific Southeast 1 (Singapore)
- **Connection Pooling:** PgBouncer for scalability

**Connection Details:**
- Supabase URL: `https://uavqmlqkuvjhgnuwcsqx.supabase.co`
- Pooled Connection: Port 6543 (PgBouncer)
- Direct Connection: Port 5432 (for migrations)

---

## Database Architecture

### Schema Design Principles

1. **Normalized Data Model:** Third normal form for data integrity
2. **UUID Primary Keys:** Globally unique identifiers for all entities
3. **Foreign Key Constraints:** Referential integrity enforced at database level
4. **Timestamps:** `created_at` and `updated_at` tracking on all core tables
5. **Soft Deletes:** Owner references use `ON DELETE SET NULL` to preserve data
6. **Indexes:** Strategic indexing for query performance and duplicate detection

### Core Data Model

**Entity Relationship Overview:**
```
users (3-5 team members)
  ↓ owns
contacts (LinkedIn connections)
  ↓ has many
deals (sales opportunities)
  ↓ references
pipeline_stages (8 hard-coded stages)
  ↓ tracks
activities (interactions: email, LinkedIn, WhatsApp, calls, meetings)

contacts ←→ campaigns (many-to-many via campaign_contacts)
```

### Table Specifications

#### 1. users (Team Members)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'sales_rep', -- 'admin', 'sales_rep'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** INNOVAAS sales team members (3-5 people)
**Authentication:** Managed by Supabase Auth (separate auth.users table)
**Roles:** 'admin' (full control), 'sales_rep' (standard user)

#### 2. contacts (LinkedIn Connections)
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
  source TEXT DEFAULT 'Manual Entry', -- 'CSV Import', 'Manual Entry'
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Duplicate Detection Indexes
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
```

**Purpose:** Primary entity representing LinkedIn Sales Navigator connections
**Unique Constraint:** `linkedin_url` prevents duplicate profiles
**Duplicate Strategy:** Check by (name match OR LinkedIn URL match)
**Owner Assignment:** Nullable to support unassigned contacts from CSV imports

#### 3. campaigns (Outreach Campaigns)
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active', -- 'Active', 'Paused', 'Completed'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Track distinct outreach campaigns for lead attribution
**Status Values:** 'Active', 'Paused', 'Completed'
**Campaign Attribution:** Contacts can belong to multiple campaigns

#### 4. campaign_contacts (Many-to-Many Junction)
```sql
CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);
```

**Purpose:** Associate contacts with multiple campaigns
**Constraint:** One contact can be in many campaigns; prevents duplicate associations
**Cascade Delete:** If campaign deleted, associations removed automatically

#### 5. pipeline_stages (Hard-Coded Sales Stages)
```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  order_num INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default MVP Stages
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

**Purpose:** Define sales pipeline progression stages
**MVP Approach:** Hard-coded 8 stages (future: admin-configurable)
**Order:** Determines visual flow in pipeline views

#### 6. deals (Sales Opportunities)
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(12, 2),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  stage_id UUID REFERENCES pipeline_stages(id),
  expected_close_date DATE,
  status TEXT DEFAULT 'Open', -- 'Open', 'Won', 'Lost'
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose:** Sales opportunities linked to contacts
**Value Tracking:** Dollar amount with 2 decimal precision
**Probability:** 0-100% for weighted pipeline calculations
**Status Lifecycle:** Open → Won/Lost (closed_at timestamp set)

#### 7. activities (Interaction Tracking)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'Email', 'LinkedIn Message', 'WhatsApp', 'Phone Call', 'Meeting'
  subject TEXT,
  notes TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Track all interactions with contacts/deals
**Activity Types:** Email, LinkedIn Message, WhatsApp, Phone Call, Meeting
**Dual Reference:** Can link to contact AND/OR deal
**Timeline:** activity_date determines ordering in timeline views

### Database Triggers & Functions

**Auto-Update Timestamp Trigger:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: contacts, campaigns, deals
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Purpose:** Automatically maintain `updated_at` timestamps on record modifications

---

## Authentication & Authorization

### Authentication Strategy

**Supabase Auth (Built-in)**
- **Provider:** Email/Password authentication
- **Token Type:** JWT (JSON Web Tokens)
- **Session Management:** Automatic refresh token rotation
- **Security:** bcrypt password hashing (handled by Supabase)

**Authentication Flow:**
1. User submits email/password via login form
2. Supabase Auth validates credentials
3. JWT access token + refresh token returned
4. Tokens stored in secure httpOnly cookies (SSR mode)
5. Client-side SDK automatically handles token refresh

**Supabase Client Initialization:**
```typescript
// Browser client (app/lib/supabase/client.ts)
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server client (app/lib/supabase/server.ts)
import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get, set, remove } } // Cookie helpers
  )
}
```

### Authorization Model (MVP)

**Role-Based Access Control (RBAC):**
- **admin:** Full system access (user management, campaign configuration, pipeline stages)
- **sales_rep:** Standard CRM operations (create/edit contacts, deals, activities)

**MVP Authorization Rules:**
- All team members can view all contacts and deals (full visibility)
- No record-level permissions in MVP (future: owner-only restrictions)
- Supabase Row Level Security (RLS) **disabled in MVP** (future enhancement)

**Future Authorization (V2.0+):**
- Supabase RLS policies for row-level security
- Executive dashboard role with read-only access
- Owner-based record visibility restrictions

---

## API Architecture

### API Pattern: Next.js Route Handlers

**Location:** `app/api/` directory
**Pattern:** RESTful endpoints using Next.js App Router API routes
**Format:** JSON request/response

**Example API Route Structure:**
```typescript
// app/api/contacts/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()

  // Business logic here

  return NextResponse.json({ success: true, data: result })
}
```

### Implemented API Endpoints

#### POST /api/contacts/import
**Purpose:** Batch import contacts from CSV with duplicate detection
**Request Body:**
```typescript
{
  contacts: Array<{
    first_name: string
    last_name: string
    linkedin_url: string
    email?: string
    company?: string
    position?: string
    connected_on?: string
  }>,
  campaign_ids: string[], // UUIDs of campaigns to associate
  overwrite_ids?: string[] // Contact IDs to overwrite if duplicates
}
```

**Response:**
```typescript
{
  success: boolean
  imported: number
  skipped: number
  duplicates: Array<{
    existing_id: string
    existing_name: string
    new_contact: Contact
  }>
}
```

**Duplicate Detection Logic:**
1. Check if contact exists by: `(first_name + last_name) OR linkedin_url`
2. If match found and NOT in `overwrite_ids`, return as duplicate
3. If match found and IN `overwrite_ids`, update existing record
4. If no match, insert new contact
5. Create campaign associations in `campaign_contacts` table

**Transaction Handling:** All-or-nothing batch insert with Supabase transactions

### Future API Endpoints (Roadmap)

**MVP Phase:**
- `GET /api/contacts` - List contacts with filters, pagination
- `POST /api/contacts` - Create single contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/deals` - List deals with pipeline filtering
- `POST /api/deals` - Create deal
- `PUT /api/deals/:id` - Update deal (stage changes, value updates)
- `GET /api/dashboard` - Aggregated metrics for dashboard
- `POST /api/activities` - Log interaction (email, call, meeting)

**V2.0 (AI Features):**
- `POST /api/sentiment/analyze` - AI sentiment analysis of conversation text
- `POST /api/leads/health-score` - Calculate lead engagement score
- `GET /api/alerts/risk` - Identify at-risk deals

---

## CSV Import Architecture

### Parser Implementation

**Library:** PapaParse 5.4.1
**File:** `lib/csv-parser.ts`

**LinkedIn CSV Format Handling:**
```typescript
interface LinkedInCSVRow {
  'First Name': string
  'Last Name': string
  'Email Address': string  // Often blank
  'Company': string
  'Position': string
  'Connected On': string  // Format: "DD MMM YYYY"
  'URL': string  // LinkedIn profile URL
}
```

**Special Handling:**
- **Blank Emails:** Allowed (many LinkedIn connections have no email)
- **Date Parsing:** Convert "08 Dec 2024" → ISO date
- **LinkedIn URL Validation:** Regex check for valid LinkedIn profile format
- **Special Characters:** UTF-8 support for international names, companies

**Validation Rules:**
1. First Name + Last Name: Required
2. LinkedIn URL: Required, must match pattern `^https://www\.linkedin\.com/in/[a-zA-Z0-9_-]+/?$`
3. Email: Optional, if provided must be valid RFC 5322 format
4. Company/Position: Optional
5. Connected On: Optional, must parse to valid date

### Duplicate Detection Strategy

**File:** `lib/duplicate-checker.ts`

**Detection Algorithm:**
```typescript
// Step 1: Fetch existing contacts
const existing = await supabase
  .from('contacts')
  .select('id, first_name, last_name, linkedin_url')

// Step 2: For each new contact, check:
const isDuplicate = existing.some(contact =>
  (contact.first_name === new.first_name &&
   contact.last_name === new.last_name) ||
  contact.linkedin_url === new.linkedin_url
)
```

**Duplicate Resolution UI:**
- Modal displays all detected duplicates
- Per-contact checkbox: "Overwrite this contact?"
- User selects which duplicates to overwrite vs. skip
- Batch operation processes user selections

**Database Optimization:**
- `idx_contacts_name` index on (first_name, last_name)
- `idx_contacts_linkedin` index on linkedin_url
- Query performance: <100ms for 1000+ contact check

---

## Performance Architecture

### Query Optimization

**Database Indexes (14 total):**
```sql
-- Duplicate detection (critical for CSV import)
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);

-- Foreign key lookups
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);

-- Campaign associations
CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_contact ON campaign_contacts(contact_id);

-- Activity timeline queries
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);
```

**Query Performance Targets:**
- Dashboard aggregation queries: <1 second
- Contact list (100 records): <500ms
- Duplicate detection check: <100ms
- CSV import (500 contacts): <5 seconds

### Caching Strategy (Future)

**V2.0 Enhancements:**
- Next.js Server Component caching for dashboard metrics
- Supabase real-time subscriptions for live pipeline updates
- Redis caching for frequently accessed lead lists (if needed)

### Client-Side Performance

**React 19 + Next.js 15 Optimizations:**
- Server Components by default (minimal JavaScript to client)
- Streaming SSR for progressive page rendering
- Automatic code splitting per route
- Image optimization (next/image) for logo/avatars

**Performance Budgets:**
- First Contentful Paint (FCP): <1.5 seconds
- Time to Interactive (TTI): <3 seconds
- Largest Contentful Paint (LCP): <2.5 seconds

---

## Security Architecture

### Data Protection

**Encryption:**
- **In Transit:** TLS 1.3 for all HTTPS connections (Supabase + Vercel)
- **At Rest:** Supabase PostgreSQL automatic encryption (AES-256)
- **Passwords:** bcrypt hashing via Supabase Auth (cost factor: 10)

**Environment Variables:**
- Stored in `.env.local` (gitignored)
- Supabase keys: Anon key (public), Service Role key (server-only)
- Never expose service role key to client-side code

**Secrets Management:**
```bash
# Public keys (safe for client)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Private keys (server-only)
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_PASSWORD
```

### API Security

**Rate Limiting (Future):**
- Implement Vercel rate limiting middleware
- 100 requests/minute per IP for public endpoints
- 1000 requests/minute for authenticated users

**Input Validation:**
- LinkedIn URL regex validation
- Email RFC 5322 format validation
- SQL injection protection (Supabase parameterized queries)
- XSS protection (React automatic escaping)

**Authentication Token Security:**
- JWT tokens stored in httpOnly cookies (not localStorage)
- Automatic token refresh before expiration
- Logout invalidates refresh token

### OWASP Top 10 Mitigation

1. **Injection:** Supabase parameterized queries prevent SQL injection
2. **Broken Authentication:** Supabase Auth handles session management securely
3. **Sensitive Data Exposure:** Environment variables in .env.local, never committed
4. **XML External Entities:** N/A (no XML processing)
5. **Broken Access Control:** Role-based auth (admin vs sales_rep)
6. **Security Misconfiguration:** Vercel/Supabase production-hardened defaults
7. **XSS:** React/Next.js automatic output escaping
8. **Insecure Deserialization:** JSON parsing with type validation
9. **Using Components with Known Vulnerabilities:** npm audit + Dependabot
10. **Insufficient Logging:** Supabase logs + Vercel deployment logs

---

## Deployment Architecture

### Hosting Platform: Vercel

**Why Vercel:**
- Native Next.js optimization (created by Vercel team)
- Global CDN with edge caching
- Automatic HTTPS and DDoS protection
- Zero-config deployments from Git
- Preview deployments for every PR
- Generous free tier for MVP

**Deployment Flow:**
```
GitHub Push → Vercel Build → Deploy to Edge Network → Live in <2 min
```

**Environments:**
- **Production:** `main` branch → `novacrm.vercel.app` (or custom domain)
- **Preview:** Every PR gets unique preview URL
- **Development:** Local `npm run dev`

### Build Configuration

**next.config.ts:**
```typescript
export default {
  reactStrictMode: true,
  images: {
    domains: ['uavqmlqkuvjhgnuwcsqx.supabase.co'], // Supabase storage
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}
```

**Build Process:**
1. TypeScript compilation with strict mode
2. ESLint checks for code quality
3. Tailwind CSS optimization and purging
4. Next.js production build (optimized bundles)
5. Deploy to Vercel Edge Network

**Environment Variables (Vercel Dashboard):**
- Production: Set all `NEXT_PUBLIC_*` and server-side keys
- Preview: Separate Supabase project for testing (future)

### Infrastructure Costs

**Monthly Cost Estimate (MVP):**
- Vercel: $0 (Hobby tier, <100GB bandwidth)
- Supabase: $0 (Free tier, <500MB database, <2GB bandwidth)
- **Total: $0/month**

**Scaling Costs (If Needed):**
- Vercel Pro: $20/month (1TB bandwidth, advanced analytics)
- Supabase Pro: $25/month (8GB database, 250GB bandwidth, daily backups)
- **Scaling Total: ~$45/month**

---

## Error Handling & Monitoring

### Error Handling Patterns

**API Route Error Handling:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const data = await request.json()

    // Validation
    if (!data.contacts || !Array.isArray(data.contacts)) {
      return NextResponse.json(
        { error: 'Invalid request: contacts array required' },
        { status: 400 }
      )
    }

    // Business logic
    const result = await processImport(data)

    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error.message },
      { status: 500 }
    )
  }
}
```

**Client-Side Error Boundaries:**
- React Error Boundaries for component failures
- Graceful fallback UI for data fetch failures
- User-friendly error messages (no stack traces to users)

### Monitoring & Logging

**Vercel Analytics (Built-in):**
- Request logs for all API routes
- Build/deployment logs
- Performance metrics (Web Vitals)

**Supabase Logs (MCP-accessible):**
- Database query logs
- Authentication events
- API request logs
- Error logs with stack traces

**Future Monitoring (V2.0+):**
- Sentry for error tracking and alerting
- Custom dashboard for business metrics
- Automated alerts for critical errors

---

## Migration Strategy

### Database Migration Pattern

**Tool:** Raw SQL migrations (manual)
**Location:** `novacrm/supabase/migrations/`
**Naming:** `{number}_{description}.sql`

**Migration Execution:**
1. Write migration SQL in `migrations/` directory
2. Test locally against Supabase dev project
3. Manually execute in Supabase SQL Editor (production)
4. OR use MCP Supabase server: `apply_migration(name, query)`

**Migration Example:**
```sql
-- migrations/002_add_contact_tags.sql
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, tag_name)
);

CREATE INDEX idx_contact_tags_contact ON contact_tags(contact_id);
```

**Rollback Strategy:**
- Write down migrations for every up migration
- Store rollback SQL in comments
- Test rollback before production deployment

### Future Migration Tools (V2.0+)

**Consider:**
- Prisma Migrate for automated schema management
- Supabase CLI for version-controlled migrations
- CI/CD pipeline for automatic migration execution

---

## Testing Strategy (Future)

**MVP:** Manual testing + Supabase SQL tests
**V2.0 Testing Architecture:**

**Unit Tests:**
- Jest + React Testing Library
- Test utility functions (CSV parser, duplicate checker)
- Test React components in isolation

**Integration Tests:**
- Test API routes with Supabase test database
- Test authentication flows
- Test CSV import end-to-end

**E2E Tests:**
- Playwright for browser automation
- Critical user journeys (login, add contact, create deal)
- Dashboard metrics accuracy

---

## Design System Integration

### Color Palette

**Primary Brand Color:**
- Innovaas Orange: `#F25C05` (CSS variable: `--innovaas-orange`)
- Orange Soft (accents): `#ff7b3d`

**Catppuccin Mocha Theme:**
- Background (Base): `#1e1e2e`
- Background (Mantle): `#181825`
- Background (Crust): `#11111b`
- Text (Primary): `#cdd6f4` (`--mocha-text`)
- Text (Secondary): `#a6adc8` (`--mocha-subtext0`)
- Mocha Blue (data): `#89b4fa` (`--mocha-blue`)
- Mocha Sapphire (data): `#74c7ec` (`--mocha-sapphire`)

**TailwindCSS Configuration:**
```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'innovaas-orange': '#F25C05',
      'innovaas-orange-soft': '#ff7b3d',
      'mocha-base': '#1e1e2e',
      'mocha-text': '#cdd6f4',
      'mocha-blue': '#89b4fa',
      // ... etc
    }
  }
}
```

### Typography

**Font Family:** Plus Jakarta Sans (Google Fonts)
- **Headers:** 800 weight (Extra Bold)
- **Body:** 400 weight (Regular)
- **Emphasis:** 600 weight (Semi Bold)

**Next.js Font Optimization:**
```typescript
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800']
})
```

### Logo Assets

**Available Formats:**
- `nova-crm-logo.svg` (200×60px) - Horizontal header logo
- `nova-crm-logo-stacked.svg` (140×100px) - Vertical/mobile logo
- `nova-crm-icon.svg` (60×60px) - Favicon/app icon

**Usage Guidelines:**
- Use on dark backgrounds (optimized for Catppuccin Mocha)
- Maintain 20px minimum clear space
- Never rotate, skew, or change colors
- SVG preferred for all use cases (infinite scaling)

**Favicon Implementation:**
```html
<link rel="icon" href="/nova-crm-icon.svg" type="image/svg+xml">
```

---

## Future Architecture Enhancements

### V2.0: AI Integration

**AI Sentiment Analysis:**
- OpenAI GPT-4 API for conversation sentiment analysis
- Batch processing for cost efficiency
- Store sentiment scores in new `sentiment_analysis` table
- Real-time alerts for declining engagement

**Lead Health Scoring:**
- ML model (Python FastAPI microservice)
- Inputs: Engagement frequency, sentiment trends, deal age
- Output: 0-100 health score
- Hosted on Vercel serverless functions or Railway

### V3.0: Advanced Integrations

**ClickUp API Integration:**
- Webhook: Deal marked "Closed Won" → Create ClickUp task
- Bidirectional sync: ClickUp project updates → Nova activities
- OAuth 2.0 authentication for ClickUp

**LinkedIn Scraping (Ethical):**
- LinkedIn official APIs (requires LinkedIn partnership)
- OR screenshot upload + OCR for message extraction
- Store enriched lead data (company size, industry, recent posts)

**Email Integration (Outlook):**
- Microsoft Graph API for email read/send
- OAuth 2.0 authentication for Outlook
- Auto-log sent emails to activities table
- Parse email threads for sentiment analysis

### V4.0: Enterprise Features

**Multi-Workspace:**
- Support multiple INNOVAAS teams or clients
- Workspace-level data isolation
- Billing per workspace

**Advanced Reporting:**
- Custom report builder (no-code)
- Revenue forecasting models
- Conversion funnel analytics
- Campaign ROI tracking

**Mobile App:**
- React Native or Flutter
- Offline mode with sync
- Push notifications for deal updates

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 15 over Separate Frontend/Backend

**Decision:** Use Next.js 15 with App Router for full-stack application
**Rationale:**
- Reduced complexity (one codebase vs. two)
- Automatic API route bundling with frontend
- Type-safe data flow (TypeScript across stack)
- Superior SEO and performance (SSR + SSG)
- Faster development velocity for small team

**Trade-offs:**
- Less flexibility for future mobile app (no dedicated REST API)
- Vercel vendor lock-in for optimal performance
- **Mitigation:** Can extract API routes to standalone Express app if needed

### ADR-002: Supabase over Self-Hosted PostgreSQL

**Decision:** Use Supabase managed PostgreSQL
**Rationale:**
- Zero DevOps overhead (no server management)
- Built-in authentication system (saves weeks of dev time)
- Real-time subscriptions out-of-box
- Generous free tier for MVP
- Easy scaling path (Pro plan)

**Trade-offs:**
- Vendor lock-in (harder to migrate than raw PostgreSQL)
- Less control over database configuration
- **Mitigation:** PostgreSQL-compatible, can export and self-host if needed

### ADR-003: Manual CSV Import over Automated LinkedIn Scraping

**Decision:** MVP uses manual CSV upload from LinkedIn Sales Navigator exports
**Rationale:**
- LinkedIn API requires partnership approval (months of lead time)
- Web scraping violates LinkedIn TOS (legal risk)
- CSV export is native LinkedIn feature (sustainable)
- Faster to market (no API approval process)

**Trade-offs:**
- Manual process for users (less automated)
- No real-time lead updates
- **Future:** Explore LinkedIn official APIs when available

### ADR-004: No Row-Level Security (RLS) in MVP

**Decision:** Disable Supabase RLS for MVP, all users see all data
**Rationale:**
- INNOVAAS team requirement: Full visibility across all leads (no data hiding)
- RLS adds complexity to queries and development
- 3-5 user team doesn't need granular permissions yet

**Trade-offs:**
- Less secure if unauthorized user gains access
- Harder to add privacy later
- **Mitigation:** Plan RLS implementation for V2.0 when team scales

### ADR-005: Hard-Coded Pipeline Stages in MVP

**Decision:** Use fixed 8 pipeline stages, no admin configuration in MVP
**Rationale:**
- INNOVAAS uses stable, well-defined sales process
- Configurable stages add UI/backend complexity
- Faster to ship without admin panel
- Can iterate based on actual usage patterns

**Trade-offs:**
- Less flexible for changing sales process
- No customization per campaign
- **Future:** Admin panel for stage management in V2.0

---

## Appendix: Technical Specifications

### Browser Support

**Supported Browsers:**
- Chrome 100+ (primary target)
- Firefox 100+
- Safari 15+
- Edge 100+

**Mobile Browsers:**
- Safari iOS 15+
- Chrome Android 100+

**Not Supported:**
- Internet Explorer (deprecated)
- Chrome <90

### Server Requirements

**Development:**
- Node.js 20+ LTS
- npm 10+
- 2GB RAM minimum
- 1GB free disk space

**Production (Vercel):**
- Serverless functions (no server management)
- Automatic scaling
- 50MB max function bundle size

### Network Requirements

**API Latency Targets:**
- Supabase queries: <200ms (Singapore region)
- Vercel Edge response: <50ms (global CDN)
- Full page load: <3 seconds

**Bandwidth Estimates:**
- Dashboard page: ~500KB initial load
- Subsequent navigations: ~100KB (prefetching)
- CSV upload (500 contacts): ~50KB upload, ~2KB response

---

**Document Version:** 1.0
**Last Updated:** 2025-12-09
**Next Review:** After MVP launch
**Maintained By:** Todd (INNOVAAS Engineering)
