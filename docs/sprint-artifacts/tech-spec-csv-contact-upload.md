# Tech-Spec: CSV Contact Upload with Duplicate Detection

**Created:** 2025-12-09
**Status:** Completed - Ready for Testing
**Project:** Nova CRM
**Implemented:** 2025-12-09

---

## Overview

### Problem Statement

INNOVAAS sales team needs to bulk import LinkedIn connections from exported CSV files into Nova CRM. The manual entry process from the MVP (one contact at a time) is inefficient when onboarding dozens or hundreds of LinkedIn connections from Sales Navigator exports.

### Solution

Build a web-based CSV upload interface that:
- Accepts LinkedIn `Connections.csv` files in standard export format
- Parses the CSV with proper handling of blank email fields and special characters
- Detects duplicates by matching First Name + Last Name OR LinkedIn URL
- Alerts users to duplicates with option to overwrite existing records
- Allows multi-campaign association during import
- Validates LinkedIn URLs
- Imports contacts as unassigned (no owner, no deals)

### Scope

**In Scope:**
- CSV file upload UI component
- LinkedIn CSV parsing with edge case handling (blank emails, special chars)
- Duplicate detection against existing contacts database
- Duplicate alert modal with overwrite option
- Campaign multi-select for contact association
- LinkedIn URL validation
- Batch contact creation in Supabase
- Progress indicator during import
- Complete database schema implementation (contacts, campaigns, deals, pipeline_stages, activities, users)
- Next.js project initialization with TypeScript + Supabase

**Out of Scope:**
- CSV template generation/download (future enhancement)
- Automated campaign creation during import (campaigns must exist)
- Deal creation during import (contacts only)
- Email validation (email is optional per LinkedIn export)
- Contact deduplication merging (user manually overwrites)
- Undo/rollback functionality (V2 feature)

---

## Context for Development

### Codebase Patterns

**Project State:** Greenfield - no Next.js application exists yet

**Tech Stack:**
- **Framework:** Next.js 15.x with TypeScript
- **Database:** Supabase (PostgreSQL) - credentials configured in `.env.local`
- **Deployment:** Vercel
- **UI:** TailwindCSS (per product brief tech stack)
- **Styling:** Next.js 15 app router conventions

**CSV Format (LinkedIn Connections.csv):**
```csv
First Name,Last Name,URL,Email Address,Company,Position,Connected On
Bob,Sacheli,https://www.linkedin.com/in/bob-sacheli,,eBusiness Solutions,Principal Consultant,07 Dec 2025
```

**Parsing Challenges:**
1. Email Address is often blank (double commas: `URL,,Company`)
2. Names can contain commas and special characters (e.g., `"Raymond, EHRC"`)
3. First 3 lines are header notes to skip
4. Quoted fields for names with punctuation

### Files to Create

**Next.js Project Initialization:**
```
/package.json                          # Next.js 15, TypeScript, Supabase, Papa Parse
/tsconfig.json                         # TypeScript configuration
/next.config.js                        # Next.js configuration
/tailwind.config.ts                    # TailwindCSS setup
/app/layout.tsx                        # Root layout
/app/page.tsx                          # Home page
```

**Database Schema (Supabase SQL):**
```
/supabase/migrations/001_initial_schema.sql    # All tables
```

**Supabase Client:**
```
/lib/supabase/client.ts                # Browser client
/lib/supabase/server.ts                # Server client
```

**CSV Upload Feature:**
```
/app/contacts/upload/page.tsx          # Upload page UI
/components/CsvUploadForm.tsx          # Upload form component
/components/DuplicateAlertModal.tsx    # Duplicate detection modal
/lib/csv-parser.ts                     # LinkedIn CSV parsing logic
/lib/duplicate-checker.ts              # Duplicate detection logic
/app/api/contacts/import/route.ts      # API endpoint for batch import
```

### Technical Decisions

**1. CSV Parsing Library: Papa Parse**
- **Why:** Industry standard, handles quoted fields, blank columns, edge cases
- **Alternative considered:** Native string.split() - rejected due to complexity

**2. Duplicate Detection Strategy: Client-Side Pre-Check**
- Fetch all existing contacts (first_name, last_name, linkedin_url) on upload
- Check duplicates before showing confirmation modal
- User can choose to overwrite on a per-duplicate basis
- **Why:** Better UX than post-upload failures

**3. Batch Import Approach: Supabase Batch Insert**
- Use Supabase `.insert()` with array of contacts
- Single transaction for all non-duplicate contacts
- **Why:** Faster than individual inserts, atomic operation

**4. Campaign Association: Many-to-Many via Junction Table**
- User selects campaigns from dropdown (multi-select)
- On import, create `campaign_contacts` records for selected campaigns
- **Why:** Supports multiple campaigns per contact as required

**5. Validation: LinkedIn URL Only**
- Regex pattern: `^https://www\.linkedin\.com/in/[a-zA-Z0-9-]+/?$`
- Skip email validation (email is optional per LinkedIn export)
- **Why:** Matches confirmed requirements

---

## Implementation Plan

### Database Schema

#### SQL Migration File: `/supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Team Members)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'sales_rep', -- 'admin', 'sales_rep'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts (LinkedIn Connections)
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

-- Indexes for duplicate detection
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_url);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);

-- Campaigns (Outreach Campaigns)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active', -- 'Active', 'Paused', 'Completed'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign-Contact Association (Many-to-Many)
CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_contact ON campaign_contacts(contact_id);

-- Pipeline Stages (Hard-Coded for MVP)
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  order_num INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, order_num) VALUES
  ('Initial LinkedIn Connect', 1),
  ('First Conversation', 2),
  ('Email Engaged', 3),
  ('Meeting Scheduled', 4),
  ('Proposal Sent', 5),
  ('Negotiation', 6),
  ('Closed Won', 7),
  ('Closed Lost', 8);

-- Deals (Sales Opportunities)
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

CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);

-- Activities (Interaction Tracking)
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

CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Tasks

#### Phase 1: Project Setup
- [ ] **Task 1.1**: Initialize Next.js 15 project with TypeScript
  - Run `npx create-next-app@latest nova-crm --typescript --tailwind --app`
  - Configure TypeScript strict mode
  - Set up TailwindCSS

- [ ] **Task 1.2**: Install dependencies
  ```bash
  npm install @supabase/supabase-js papaparse
  npm install -D @types/papaparse
  ```

- [ ] **Task 1.3**: Configure Supabase clients
  - Create `/lib/supabase/client.ts` (browser client)
  - Create `/lib/supabase/server.ts` (server client)
  - Use environment variables from `.env.local`

- [ ] **Task 1.4**: Run database migration
  - Create `/supabase/migrations/001_initial_schema.sql`
  - Execute SQL via Supabase dashboard or CLI
  - Verify all tables created successfully

#### Phase 2: Core CSV Upload Feature
- [ ] **Task 2.1**: Create CSV parsing utility (`/lib/csv-parser.ts`)
  ```typescript
  export interface LinkedInContact {
    firstName: string;
    lastName: string;
    url: string;
    email?: string;
    company?: string;
    position?: string;
    connectedOn?: string;
  }

  export function parseLinkedInCsv(file: File): Promise<LinkedInContact[]>
  ```
  - Use Papa Parse with `skipEmptyLines: true`
  - Skip first 3 header note lines
  - Handle quoted fields
  - Validate required fields (firstName, lastName, url)
  - Return parsed contact array

- [ ] **Task 2.2**: Create duplicate detection utility (`/lib/duplicate-checker.ts`)
  ```typescript
  export interface DuplicateMatch {
    csvContact: LinkedInContact;
    existingContact: Contact;
    matchType: 'name' | 'url';
  }

  export async function findDuplicates(
    csvContacts: LinkedInContact[],
    existingContacts: Contact[]
  ): Promise<DuplicateMatch[]>
  ```
  - Match by: (firstName + lastName) OR linkedinUrl
  - Return array of duplicate matches

- [ ] **Task 2.3**: Create upload form component (`/components/CsvUploadForm.tsx`)
  - File input with `.csv` validation
  - Campaign multi-select dropdown (fetch from campaigns table)
  - "Upload" button
  - Progress indicator during processing
  - Error display for invalid CSV format

- [ ] **Task 2.4**: Create duplicate alert modal (`/components/DuplicateAlertModal.tsx`)
  - Display list of duplicates found
  - Show existing contact details vs CSV contact details side-by-side
  - Checkbox for each duplicate: "Overwrite this contact"
  - "Proceed with Import" button
  - Handle user selections (skip or overwrite per duplicate)

- [ ] **Task 2.5**: Create upload page (`/app/contacts/upload/page.tsx`)
  - Render CsvUploadForm
  - On file select:
    1. Parse CSV with csv-parser
    2. Fetch all existing contacts (firstName, lastName, linkedinUrl)
    3. Run duplicate detection
    4. If duplicates found → show DuplicateAlertModal
    5. If no duplicates OR user confirms → proceed to import
  - Call import API endpoint
  - Show success/error message

- [ ] **Task 2.6**: Create import API endpoint (`/app/api/contacts/import/route.ts`)
  - Accept POST request with:
    - `contacts`: LinkedInContact[]
    - `campaignIds`: string[]
    - `overwriteIds`: string[] (contact IDs to overwrite)
  - Validate LinkedIn URLs with regex
  - For overwrites: UPDATE existing contacts
  - For new contacts: INSERT batch into contacts table
  - Create campaign_contacts records for selected campaigns
  - Return: `{ imported: number, overwritten: number, errors: string[] }`

#### Phase 3: Testing & Validation
- [ ] **Task 3.1**: Test with sample CSV
  - Use provided `Connections.csv` file
  - Verify parsing handles blank emails correctly
  - Verify special characters in names (commas, quotes)
  - Verify duplicate detection by name and URL

- [ ] **Task 3.2**: Test duplicate overwrite flow
  - Import same CSV twice
  - Verify duplicates detected
  - Test overwrite functionality
  - Verify campaign associations preserved/updated

- [ ] **Task 3.3**: Test LinkedIn URL validation
  - Valid URLs accepted
  - Invalid URLs rejected with clear error message

- [ ] **Task 3.4**: Test multi-campaign association
  - Import contacts with multiple campaigns selected
  - Verify junction table records created correctly
  - Verify contacts appear in all selected campaigns

---

### Acceptance Criteria

**AC 1: CSV Upload Success Path**
- **Given:** User has a valid LinkedIn Connections.csv file
- **When:** User uploads the file and selects campaigns
- **Then:** All contacts are imported successfully with campaign associations

**AC 2: Duplicate Detection**
- **Given:** Database contains existing contacts
- **When:** User uploads CSV with duplicate names or LinkedIn URLs
- **Then:** Modal shows all duplicates with option to overwrite each

**AC 3: LinkedIn URL Validation**
- **Given:** CSV contains invalid LinkedIn URLs
- **When:** User attempts import
- **Then:** System rejects invalid URLs with error message specifying which rows failed

**AC 4: Multi-Campaign Association**
- **Given:** User selects 3 campaigns during upload
- **When:** Import completes successfully
- **Then:** All imported contacts appear in all 3 selected campaigns (verified in database)

**AC 5: Unassigned Contact Import**
- **Given:** User imports contacts via CSV
- **When:** Import completes
- **Then:** All contacts have `owner_id = NULL` (unassigned)

**AC 6: Edge Case Handling**
- **Given:** CSV has blank email fields and quoted names with commas
- **When:** User uploads the file
- **Then:** Parsing succeeds without errors, special characters preserved

---

## Additional Context

### Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/papaparse": "^5.3.14",
    "tailwindcss": "^3.4.0"
  }
}
```

### Testing Strategy

**Manual Testing Focus:**
1. Upload valid CSV → Verify success
2. Upload CSV with duplicates → Verify detection modal
3. Select overwrite for some duplicates → Verify update vs insert
4. Upload CSV with invalid URLs → Verify validation errors
5. Select multiple campaigns → Verify junction table records

**Database Verification Queries:**
```sql
-- Check imported contacts
SELECT * FROM contacts WHERE source = 'CSV Import';

-- Check campaign associations
SELECT c.first_name, c.last_name, ca.name
FROM contacts c
JOIN campaign_contacts cc ON cc.contact_id = c.id
JOIN campaigns ca ON ca.id = cc.campaign_id;

-- Check unassigned contacts
SELECT COUNT(*) FROM contacts WHERE owner_id IS NULL;
```

### Notes

**Future Enhancements (Not in Current Spec):**
- CSV template download for users
- Import history log
- Undo/rollback functionality
- Automated duplicate merging (AI-assisted)
- Background job processing for large files (1000+ contacts)
- Email notifications on import completion

**Known Limitations:**
- Large CSV files (>1000 rows) may have slow client-side processing
- No partial import on failure (all-or-nothing transaction)
- Overwrites replace entire contact record (no field-level merge)

---

**End of Tech Spec**
