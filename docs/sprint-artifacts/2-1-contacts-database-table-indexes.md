# Story 2.1: Contacts Database Table & Indexes

Status: duplicate

## Story

As a developer,
I want to create the contacts table with proper constraints and indexes,
so that we can store LinkedIn connection data efficiently with duplicate detection.

## Acceptance Criteria

**AC1: Contacts Table Creation**
**Given** I need to store contact information from LinkedIn
**When** I create the contacts table migration
**Then** the following table structure is created [Source: Architecture.md§2.3.2, Epics.md Epic 2 Story 2.1]:

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

**AC2: Duplicate Detection Indexes**
**And** when I create the duplicate detection indexes [Source: Architecture.md§2.3.2, §4.1]:
```sql
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
```

**AC3: Updated_at Trigger**
**And** when I create the updated_at trigger:
```sql
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**AC4: Campaign_Contacts Junction Table**
**And** when I create the campaign_contacts junction table [Source: Architecture.md§2.3.4]:
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

**AC5: Verification**
**And** when I verify the database schema
**Then**:
- linkedin_url UNIQUE constraint prevents duplicate LinkedIn profiles [Source: Architecture.md§2.3.2]
- email is optional (many LinkedIn connections have no email) [Source: Architecture.md§3.4.1]
- owner_id ON DELETE SET NULL preserves contact if owner deleted [Source: Architecture.md§2.1]
- source tracks 'Manual Entry', 'CSV Import', or other entry methods
- connected_on DATE field for LinkedIn connection date
- Indexes optimize duplicate detection queries (<100ms target) [Source: Architecture.md§4.1]
- campaign_contacts allows many-to-many relationship [Source: Architecture.md§2.3.4]

## Tasks / Subtasks

- [x] 1. ⚠️ **CRITICAL: Verify if contacts table already exists** (AC: ALL)
  - [x] 1.1 Use Supabase MCP list_tables to check current database schema
  - [x] 1.2 Verify if contacts table exists from Story 1.2 initial schema
  - [x] 1.3 Verify if campaign_contacts table exists from Story 1.2
  - [x] 1.4 If tables exist, verify schema matches requirements exactly
  - [x] 1.5 If tables exist with correct schema, mark story as duplicate and skip remaining tasks

- [x] 2. Create migration SQL (if needed) (AC: 1, 2, 3, 4)
  - [x] 2.1 N/A - Tables already exist from Story 1.2
  - [x] 2.2 N/A - Tables already exist from Story 1.2
  - [x] 2.3 N/A - Tables already exist from Story 1.2
  - [x] 2.4 N/A - Tables already exist from Story 1.2
  - [x] 2.5 N/A - Tables already exist from Story 1.2

- [x] 3. Apply migration to Supabase database (AC: ALL)
  - [x] 3.1 N/A - Already completed in Story 1.2
  - [x] 3.2 N/A - Already completed in Story 1.2
  - [x] 3.3 ✅ Verified: contacts table exists with 10 rows
  - [x] 3.4 ✅ Verified: All indexes exist (idx_contacts_name, idx_contacts_linkedin, idx_contacts_owner)
  - [x] 3.5 ✅ Verified: campaign_contacts table exists with indexes
  - [x] 3.6 ✅ Verified: updated_at trigger active (update_contacts_updated_at)

- [x] 4. Verify database implementation (AC: 5)
  - [x] 4.1 ✅ Verified: linkedin_url has UNIQUE constraint
  - [x] 4.2 ✅ Verified: owner_id foreign key constraint exists (contacts_owner_id_fkey)
  - [x] 4.3 ✅ Verified: source field defaults to 'Manual Entry'
  - [x] 4.4 ✅ Verified: updated_at trigger active
  - [x] 4.5 ✅ Verified: campaign_contacts has composite unique constraint
  - [x] 4.6 ✅ Verified: Indexes in place for performance optimization

- [x] 5. Document schema and finalize (AC: ALL)
  - [x] 5.1 N/A - TypeScript types already generated in Story 1.2
  - [x] 5.2 ✅ Documented: Story is duplicate of Story 1.2
  - [x] 5.3 ✅ Verified: All acceptance criteria satisfied by Story 1.2
  - [x] 5.4 ✅ Story marked as duplicate

## Dev Notes

### ⚠️ CRITICAL DISCOVERY: Contacts Table Already Exists

**DATABASE VERIFICATION SHOWS:**
- The contacts table **ALREADY EXISTS** in the database (created in Story 1.2)
- The contacts table currently has **10 rows** of customer data
- The campaign_contacts table **ALREADY EXISTS** (created in Story 1.2)
- All indexes **ALREADY CREATED** in Story 1.2 initial schema

**STORY STATUS:**
This story is **LIKELY A DUPLICATE** of work completed in Story 1.2: Supabase Database Setup & Core Tables.

**RECOMMENDED ACTION:**
1. **FIRST STEP:** Run Supabase MCP list_tables and execute_sql to verify exact schema
2. **IF SCHEMA MATCHES:** Mark this story as duplicate/skip and proceed to Story 2.2
3. **IF SCHEMA DIFFERS:** Apply only the missing elements

### Previous Story Intelligence (Story 1.2)

**Pattern Established in Story 1.2:** [Source: 1-2-supabase-database-setup-core-tables.md]
- **Migration Approach:** Used Supabase MCP apply_migration tool (NOT local migration files)
- **Verification:** Used list_tables and execute_sql to verify schema
- **RLS Configuration:** Enabled RLS with permissive policies for authenticated users
- **TypeScript Types:** Generated via Supabase MCP generate_typescript_types tool
- **File Location:** Supabase client utilities in app/lib/supabase/client.ts and server.ts

**Database Connection Pattern:**
```typescript
// Browser client: app/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Architecture Requirements

**Database Platform** [Source: Architecture.md§1.3]
- **Provider:** Supabase (Managed PostgreSQL 15)
- **Region:** Asia-Pacific Southeast 1 (Singapore)
- **Connection Pooling:** PgBouncer (port 6543) for application queries
- **Direct Connection:** Port 5432 for migrations and schema changes
- **URL:** https://uavqmlqkuvjhgnuwcsqx.supabase.co

**Contacts Table Requirements** [Source: Architecture.md§2.3.2]
- **Primary Key:** UUID with uuid_generate_v4() default
- **Required Fields:** first_name, last_name, linkedin_url (UNIQUE)
- **Optional Fields:** email, company, position, connected_on
- **Foreign Keys:** owner_id REFERENCES users(id) ON DELETE SET NULL
- **Timestamps:** created_at (default NOW()), updated_at (with trigger)
- **Source Tracking:** source field defaults to 'Manual Entry'

**Duplicate Detection Strategy** [Source: Architecture.md§2.3.2]
- **Primary:** linkedin_url UNIQUE constraint (prevents exact URL duplicates)
- **Secondary:** idx_contacts_name index on (first_name, last_name) for fuzzy matching
- **Performance Target:** <100ms for duplicate detection queries [Source: Architecture.md§4.1]

**Campaign_Contacts Junction Table** [Source: Architecture.md§2.3.4]
- **Purpose:** Many-to-many relationship between contacts and campaigns
- **Composite Unique:** UNIQUE(campaign_id, contact_id) prevents duplicate associations
- **Cascade Delete:** ON DELETE CASCADE for both foreign keys
- **Indexes:** Both campaign_id and contact_id for query optimization

### Testing Requirements

**Database Constraint Tests:**
1. **UNIQUE Constraint Test:**
   ```sql
   -- Test linkedin_url UNIQUE constraint
   -- Attempting to insert duplicate LinkedIn URL should fail
   ```

2. **Foreign Key Test:**
   ```sql
   -- Test owner_id foreign key with ON DELETE SET NULL
   -- Deleting a user should set contact.owner_id to NULL
   ```

3. **Trigger Test:**
   ```sql
   -- Test updated_at trigger
   -- Updating any contact field should auto-update updated_at timestamp
   ```

4. **Junction Table Test:**
   ```sql
   -- Test campaign_contacts UNIQUE(campaign_id, contact_id)
   -- Attempting duplicate association should fail
   ```

**Performance Tests:**
1. **Duplicate Detection Query (<100ms):**
   ```sql
   SELECT * FROM contacts
   WHERE first_name = 'John' AND last_name = 'Doe';
   -- Should use idx_contacts_name index

   SELECT * FROM contacts
   WHERE linkedin_url = 'https://www.linkedin.com/in/johndoe';
   -- Should use idx_contacts_linkedin index
   ```

2. **Campaign Association Query:**
   ```sql
   SELECT c.* FROM contacts c
   JOIN campaign_contacts cc ON c.id = cc.contact_id
   WHERE cc.campaign_id = 'some-uuid';
   -- Should use idx_campaign_contacts_campaign index
   ```

### MCP Integration Pattern

**Use Supabase MCP Server for all database operations:**

```typescript
// Example: Apply migration via MCP
mcp__supabase__apply_migration({
  name: "002_contacts_schema",
  query: `
    CREATE TABLE contacts (...);
    CREATE INDEX idx_contacts_name ON contacts(...);
    -- etc.
  `
})

// Verify tables
mcp__supabase__list_tables({
  schemas: ["public"]
})

// Execute verification queries
mcp__supabase__execute_sql({
  query: "SELECT COUNT(*) FROM contacts;"
})

// Generate TypeScript types
mcp__supabase__generate_typescript_types()
```

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes
- ✅ Verified database schema via Supabase MCP list_tables
- ✅ Confirmed contacts table exists with 10 rows of customer data
- ✅ Confirmed campaign_contacts junction table exists
- ✅ All columns match Story 2.1 requirements exactly:
  - linkedin_url UNIQUE constraint ✓
  - owner_id foreign key to users(id) ✓
  - source defaults to 'Manual Entry' ✓
  - created_at and updated_at timestamps ✓
  - RLS enabled ✓
- ✅ All indexes present (idx_contacts_name, idx_contacts_linkedin, idx_contacts_owner)
- ✅ Story is 100% duplicate of work completed in Story 1.2
- ✅ No migration needed - all requirements already satisfied

### File List

**No files created or modified** - All work was completed in Story 1.2

### References

- [Source: docs/epics.md Epic 2 Story 2.1] - Story requirements and acceptance criteria
- [Source: docs/Architecture.md§2.3.2] - Contacts table specification
- [Source: docs/Architecture.md§2.3.4] - Campaign_contacts junction table
- [Source: docs/Architecture.md§4.1] - Index requirements and performance targets
- [Source: docs/Architecture.md§3.4.1] - LinkedIn URL validation requirements
- [Source: docs/sprint-artifacts/1-2-supabase-database-setup-core-tables.md] - Previous database setup patterns

### Implementation Notes

**⚠️ BEFORE STARTING DEVELOPMENT:**
1. Run `mcp__supabase__list_tables()` to check current database state
2. Run `mcp__supabase__execute_sql({ query: "SELECT * FROM contacts LIMIT 1;" })` to verify contacts table
3. If tables exist with correct schema, **SKIP THIS STORY** and mark as duplicate

**Estimated Completion Time:**
- If duplicate: 5 minutes (verification only)
- If new migration needed: 30-45 minutes (migration + testing)

### Prerequisites

- Epic 1 Story 1.2 complete (requires users and campaigns tables) ✓ DONE
- Supabase MCP Server configured and active ✓ CONFIRMED

## Change Log

- 2025-12-09 (Initial Draft): Story created by BMad Master Ultimate Context Engine. Comprehensive analysis identified that contacts table and campaign_contacts junction table were already created in Story 1.2 with 10 existing customer records. This story is likely a duplicate. Dev agent must verify database state before proceeding with any migrations. Status: drafted → ready-for-dev (with critical duplicate warning).
- 2025-12-09 (Verification Complete): Dev agent verified via Supabase MCP that contacts table (10 rows) and campaign_contacts table exist with exact schema matching Story 2.1 requirements. All acceptance criteria satisfied by Story 1.2. Status: ready-for-dev → duplicate. Story marked complete with no changes needed.
