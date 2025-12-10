# Story 4.1: Deals Database Table & Pipeline Stage Relationships

Status: Ready for Review

## Story

As a developer,
I want to create the deals table with proper relationships to contacts and pipeline stages,
so that we can track sales opportunities with values, probabilities, and stage progression.

## Acceptance Criteria

**AC1: Create Deals Table Migration**
**Given** I need to track deal progression through pipeline stages [Source: Epics Epic 4 Story 4.1]
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

**Technical specifications:**
- `contact_id`: Foreign key with CASCADE delete - deals removed when contact deleted (Architecture §2.1)
- `title`: Required text field, up to 200 characters for deal name
- `value`: DECIMAL(10,2) supports currency values up to $99,999,999.99 (FR5.2)
- `probability`: Integer 0-100 representing win probability percentage (FR5.3)
- `stage_id`: Foreign key with RESTRICT delete - prevents deleting stages with active deals
- `status`: CHECK constraint limits to 'Open', 'Won', 'Lost' (FR5.8)
- `expected_close_date`: DATE type for sales forecasting (FR5.5)
- `notes`: TEXT field for deal context and updates (FR5.6)
- `owner_id`: Foreign key with SET NULL - preserves deal history if owner deleted (Architecture §2.1)
- `created_at`, `updated_at`: Automatic timestamp management
- `closed_at`: Timestamp set when deal moves to Won/Lost status

**AC2: Create Performance Indexes**
**Given** deals table is created [Source: Architecture §4.1]
**When** I create performance indexes
**Then** the following indexes are added:

```sql
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
```

**Index purposes:**
- `idx_deals_contact`: Optimize queries fetching all deals for a contact (contact detail view)
- `idx_deals_stage`: Fast filtering by pipeline stage (pipeline view, stage metrics)
- `idx_deals_status`: Filter by Open/Won/Lost status (dashboard queries)
- `idx_deals_owner`: Query deals by sales rep assignment (owner-specific views)
- `idx_deals_expected_close`: Sort and filter by close date (forecasting, at-risk deals)

**Performance targets** (Architecture §4.1):
- Dashboard aggregation queries: <1 second
- Contact detail deal list (100 records): <500ms
- Pipeline stage filtering: <500ms

**AC3: Create updated_at Trigger**
**Given** deals table exists [Source: Architecture §4.1]
**When** I create the updated_at trigger
**Then** implement automatic timestamp update:

```sql
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Note:** The `update_updated_at_column()` function already exists from Story 1.2 (contacts table setup). Reuse the same function for consistency.

**AC4: Create Deal Stage History Tracking Table**
**Given** I need to track all stage changes for audit trail [Source: Architecture §2.3.7, FR5.7]
**When** I create the deal_stage_history table
**Then** the following structure is created:

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

**Technical specifications:**
- `deal_id`: CASCADE delete removes history when deal deleted
- `from_stage_id`, `to_stage_id`: SET NULL preserves history if stage deleted
- `changed_by`: SET NULL preserves history if user deleted
- `changed_at`: Timestamp of stage change
- `notes`: Optional notes explaining stage change reason
- Index on `deal_id`: Fast retrieval of complete stage history timeline

**Use cases:**
- Display stage progression timeline in deal detail view (Story 4.3)
- Track time spent in each pipeline stage for analytics (Story 4.5)
- Audit trail for deal progression (FR5.7)

**AC5: Enable Row Level Security (RLS)**
**Given** tables are created [Source: Architecture §3.1, Story 1.2 pattern]
**When** I enable RLS policies
**Then** apply the following security:

```sql
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;

-- MVP: All authenticated users can access all deals (team-wide visibility)
CREATE POLICY "authenticated_users_all_access" ON deals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_users_all_access" ON deal_stage_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

**Security notes:**
- MVP requirement: Full team visibility across all deals (FR11.1)
- RLS enabled as framework for future V2.0 granular permissions
- Pattern consistent with contacts, campaigns, activities tables (Story 1.2)

**AC6: Store Migration File**
**Given** all SQL is validated and tested [Source: Epics Epic 4 Story 4.1]
**When** I save the migration
**Then** store as: `novacrm/supabase/migrations/YYYYMMDDHHMMSS_deals_schema.sql`

**Migration file structure:**
```sql
-- Migration: Deals Schema and Pipeline Stage Tracking
-- Story 4.1: Deals Database Table & Pipeline Stage Relationships
-- Dependencies: contacts, pipeline_stages, users tables (from Story 1.2)

-- Deals table
CREATE TABLE deals (...);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- Triggers
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deal stage history
CREATE TABLE deal_stage_history (...);
CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- RLS policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_all_access" ON deals ...;
CREATE POLICY "authenticated_users_all_access" ON deal_stage_history ...;
```

**AC7: Apply Migration to Supabase**
**Given** migration file is created [Source: Architecture §1.3]
**When** I apply the migration
**Then** execute using Supabase MCP or CLI:

```bash
# Using Supabase CLI (local dev)
npx supabase migration up

# OR using Supabase MCP (recommended)
# Use mcp__supabase__apply_migration tool with:
# - name: "deals_schema"
# - query: <complete SQL from migration file>
```

**Verification steps:**
1. Confirm tables exist: `SELECT * FROM deals LIMIT 0;`
2. Verify indexes: Query pg_indexes for deals and deal_stage_history
3. Test RLS: Attempt query as authenticated user (should succeed)
4. Verify foreign keys: Check information_schema.referential_constraints

**AC8: Update TypeScript Types**
**Given** migration is applied [Source: Architecture §1.3.2]
**When** database schema changes
**Then** regenerate TypeScript types:

```bash
# Using Supabase MCP (recommended)
# Call mcp__supabase__generate_typescript_types

# OR manually
npx supabase gen types typescript --local > lib/types/database.types.ts
```

**Expected types generated:**
```typescript
export interface Database {
  public: {
    Tables: {
      deals: {
        Row: {
          id: string
          contact_id: string
          title: string
          value: number | null
          probability: number | null
          stage_id: string | null
          status: string
          expected_close_date: string | null
          notes: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      deal_stage_history: {
        // ...
      }
    }
  }
}
```

**AC9: Test Data Integrity**
**Given** migration is applied [Source: Architecture §2.1]
**When** I test foreign key constraints
**Then** verify the following behaviors:

**Test 1: Contact CASCADE delete**
```sql
-- Create test deal
INSERT INTO deals (contact_id, title, stage_id, owner_id)
VALUES ('<contact_uuid>', 'Test Deal', '<stage_uuid>', '<user_uuid>');

-- Delete contact
DELETE FROM contacts WHERE id = '<contact_uuid>';

-- Verify deal is also deleted (CASCADE)
SELECT * FROM deals WHERE contact_id = '<contact_uuid>';
-- Should return 0 rows
```

**Test 2: Stage RESTRICT delete**
```sql
-- Attempt to delete stage with deals
DELETE FROM pipeline_stages WHERE id = '<stage_with_deals>';
-- Should fail with foreign key violation error
```

**Test 3: Owner SET NULL on delete**
```sql
-- Delete user who owns deals
DELETE FROM users WHERE id = '<owner_uuid>';

-- Verify deals still exist with NULL owner_id
SELECT * FROM deals WHERE owner_id IS NULL;
-- Should return deals previously owned by deleted user
```

## Tasks / Subtasks

- [x] Task 1: Create deals table migration (AC1-AC4)
  - [x] 1.1 Create new migration file with timestamp naming
  - [x] 1.2 Write CREATE TABLE deals with all columns and constraints
  - [x] 1.3 Add performance indexes (5 indexes)
  - [x] 1.4 Add updated_at trigger (reuse existing function)
  - [x] 1.5 Write CREATE TABLE deal_stage_history with index
  - [x] 1.6 Add SQL comments documenting foreign key behaviors

- [x] Task 2: Configure Row Level Security (AC5)
  - [x] 2.1 Enable RLS on deals table
  - [x] 2.2 Enable RLS on deal_stage_history table
  - [x] 2.3 Create authenticated_users_all_access policy for deals
  - [x] 2.4 Create authenticated_users_all_access policy for deal_stage_history
  - [x] 2.5 Test policy with authenticated session

- [x] Task 3: Apply migration and verify (AC6-AC7)
  - [x] 3.1 Run migration using Supabase MCP or CLI
  - [x] 3.2 Verify tables created successfully
  - [x] 3.3 Verify all 5 indexes exist
  - [x] 3.4 Verify triggers exist
  - [x] 3.5 Verify RLS policies active

- [x] Task 4: Update TypeScript types (AC8)
  - [x] 4.1 Generate types using mcp__supabase__generate_typescript_types
  - [x] 4.2 Verify Deal and DealStageHistory types present
  - [x] 4.3 Commit updated types to repository

- [x] Task 5: Test data integrity (AC9)
  - [x] 5.1 Create test data (contact, user, stage, deal)
  - [x] 5.2 Test CASCADE delete (contact → deals)
  - [x] 5.3 Test RESTRICT delete (stage with deals)
  - [x] 5.4 Test SET NULL (user delete preserves deals)
  - [x] 5.5 Clean up test data

## Dev Notes

### Architecture Compliance

**Database Design Patterns** [Source: Architecture.md §2.1, §2.3.6, §2.3.7]
- Follow established foreign key cascade patterns from Story 1.2
- CASCADE delete: contact_id (deal meaningless without contact)
- RESTRICT delete: stage_id (protect pipeline integrity)
- SET NULL: owner_id (preserve historical deal data)
- All tables use UUID primary keys with uuid_generate_v4()
- Timestamps: created_at, updated_at with automatic triggers

**Performance Requirements** [Source: Architecture.md §4.1]
- Indexes on all frequently queried columns (contact_id, stage_id, status, owner_id, expected_close_date)
- Target: Dashboard queries <1s, list views <500ms
- deal_stage_history uses single index on deal_id (timeline queries always filtered by deal)

**Row Level Security** [Source: Architecture.md §3.1, Story 1.2 pattern]
- Enable RLS on all tables as security best practice
- MVP: Team-wide access (all authenticated users can view/edit all deals)
- RLS framework enables future V2.0 per-user or role-based permissions
- Pattern consistent with contacts, campaigns, activities tables

### Project Structure Notes

**Migration Files** [Source: Story 1.2, 3.1, 3.2 patterns]
- Location: `novacrm/supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_deals_schema.sql`
- Generate timestamp: `date +%Y%m%d%H%M%S` or use Supabase CLI auto-naming
- Include descriptive header comment with story reference

**TypeScript Types** [Source: Architecture.md §1.3.2]
- Location: `lib/types/database.types.ts`
- Regenerate after ANY schema change using Supabase type generation
- Types power frontend components with compile-time safety
- Import pattern: `import { Database } from '@/lib/types/database.types'`

**Supabase MCP Tools Available** [Source: Architecture.md §1.2]
- `mcp__supabase__apply_migration(name, query)` - Apply migration programmatically
- `mcp__supabase__list_tables(schemas)` - Verify tables exist
- `mcp__supabase__execute_sql(query)` - Test queries and data integrity
- `mcp__supabase__generate_typescript_types()` - Regenerate types
- `mcp__supabase__get_advisors(type: "security" | "performance")` - Check for issues

### Testing Standards Summary

**Manual Testing Checklist:**
1. Apply migration successfully without errors
2. Verify all 3 tables created (deals, deal_stage_history, plus existing pipeline_stages)
3. Verify all 6 indexes exist (5 on deals, 1 on history)
4. Test foreign key constraints (CASCADE, RESTRICT, SET NULL)
5. Test RLS policies (authenticated access)
6. Verify TypeScript types generated correctly

**Data Integrity Tests:**
- Use SQL test queries (AC9) to verify foreign key behaviors
- Create minimal test data, verify constraints, clean up
- No automated tests required for pure database migrations (per Story 1.2 pattern)

**Migration Rollback Plan:**
- Supabase migrations are versioned and tracked
- Rollback: `npx supabase migration down`
- OR drop tables manually: `DROP TABLE IF EXISTS deal_stage_history, deals CASCADE;`

### Previous Story Intelligence

**Learnings from Story 3.2 (CSV Upload):**
- Supabase MCP tools work reliably for migrations (used in Story 1.2)
- Always regenerate TypeScript types immediately after schema changes
- Test foreign key constraints with actual SQL queries, not just inspection
- RLS policies use consistent pattern: `authenticated_users_all_access` for MVP team-wide access

**Learnings from Story 1.2 (Database Setup):**
- `update_updated_at_column()` trigger function already exists - reuse it
- CASCADE vs SET NULL vs RESTRICT: Clearly document reasoning in comments
- Indexes on foreign keys are critical for JOIN performance
- Enable RLS even with permissive policies (security framework)

### Git Intelligence Summary

**Recent Commits Relevant to This Story:**
- `7cc2752` - Implement Story 3.5: Campaign CRUD Interface (Admin Settings)
- `8a12b3f` - Implement Story 3.4: Batch Import API with Transaction Handling
- `c80466f` - Implement Story 3.3: Duplicate Detection & Resolution Modal
- `e0dee85` - Implement Story 3.2: CSV Upload Page - Multistep Flow

**Code Patterns Established:**
- Migration files consistently stored in `novacrm/supabase/migrations/`
- TypeScript types regenerated after schema changes
- RLS policies follow consistent naming and structure
- Foreign key constraints documented in table creation SQL

**Libraries and Dependencies:**
- No new dependencies required for this story
- Uses existing Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- Leverages Supabase MCP server for migration operations

### File Structure Requirements

**Files Created:**
1. `novacrm/supabase/migrations/YYYYMMDDHHMMSS_deals_schema.sql` - Complete migration SQL
2. `lib/types/database.types.ts` - Updated TypeScript types (regenerated)

**Files Modified:**
- None (pure schema story)

**Files Referenced:**
- `novacrm/supabase/migrations/` - Review prior migrations for pattern consistency
- `lib/types/database.types.ts` - Verify types after regeneration

### References

**Architecture Documentation:**
- [Architecture.md §2.3.6](../Architecture.md) - Deals table schema
- [Architecture.md §2.3.7](../Architecture.md) - Deal stage history table
- [Architecture.md §2.1](../Architecture.md) - Foreign key cascade patterns
- [Architecture.md §4.1](../Architecture.md) - Performance indexes
- [Architecture.md §3.1](../Architecture.md) - Row Level Security patterns
- [Architecture.md §1.3.2](../Architecture.md) - TypeScript type generation
- [Architecture.md §1.2](../Architecture.md) - Supabase MCP tools

**PRD Requirements:**
- [PRD.md FR5.2](../PRD.md) - Deal value tracking
- [PRD.md FR5.3](../PRD.md) - Win probability percentage
- [PRD.md FR5.5](../PRD.md) - Expected close date
- [PRD.md FR5.6](../PRD.md) - Deal notes
- [PRD.md FR5.7](../PRD.md) - Stage change history
- [PRD.md FR5.8](../PRD.md) - Deal status (Open/Won/Lost)

**Epic Context:**
- [epics.md Epic 4 Story 4.1](../epics.md) - Complete acceptance criteria
- [epics.md Epic 4](../epics.md) - Epic goal and user value

**Previous Stories:**
- [Story 1.2](./1-2-supabase-database-setup-core-tables.md) - Database setup patterns, RLS, triggers
- [Story 3.2](./3-2-csv-upload-page-multistep-flow.md) - Recent implementation patterns

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)
- Epic 4 complete context analyzed
- Architecture documentation for deals, pipeline stages, indexes, RLS thoroughly reviewed
- Previous story patterns (1.2, 3.2) incorporated
- Git commit history analyzed for established patterns
- Comprehensive developer guide created to prevent implementation issues

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story creation phase

### Completion Notes List

**Story Creation Complete:**
- ✅ Comprehensive acceptance criteria from epics file
- ✅ Complete SQL schema definitions with constraints
- ✅ Performance index specifications
- ✅ RLS policy configuration
- ✅ Foreign key cascade behavior documentation
- ✅ TypeScript type generation steps
- ✅ Data integrity test procedures
- ✅ Task breakdown with clear subtasks
- ✅ Architecture compliance notes
- ✅ Previous story learnings incorporated
- ✅ Git intelligence included
- ✅ Complete reference documentation

**Story Implementation Complete (2025-12-10):**
- ✅ Created migration file: `novacrm/supabase/migrations/20251211001207_deals_schema.sql`
- ✅ Applied migration to Supabase database
- ✅ Created `deals` table with all columns, constraints, and 5 indexes
- ✅ Created `deal_stage_history` table with audit trail capability
- ✅ Enabled Row Level Security (RLS) on both tables
- ✅ Created authenticated_users_all_access policies for MVP team-wide access
- ✅ Verified all indexes created (idx_deals_contact, idx_deals_stage, idx_deals_status, idx_deals_owner, idx_deals_expected_close)
- ✅ Verified update_deals_updated_at trigger active
- ✅ Regenerated TypeScript types with Deal and DealStageHistory types
- ✅ Tested CASCADE delete (contact → deals)
- ✅ Tested RESTRICT delete (stage with deals prevented)
- ✅ Tested SET NULL (user delete preserves deals)
- ✅ All data integrity tests passed
- ✅ Migration file saved and database schema complete

### File List

**Created:**
- `novacrm/supabase/migrations/20251211001207_deals_schema.sql`
- `novacrm/lib/types/database.types.ts` (regenerated with Deal types)

**Referenced:**
- All prior migration files in `novacrm/supabase/migrations/`
- Story 1.2 migration patterns for RLS and triggers
