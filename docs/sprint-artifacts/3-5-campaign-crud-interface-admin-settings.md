# Story 3.5: Campaign CRUD Interface (Admin Settings)

Status: ready-for-dev

## Story

As an admin user (Sarah),
I want to create, edit, and manage campaigns in a centralized settings area,
so that sales team members can assign contacts to organized campaigns.

## Acceptance Criteria

**AC1: Campaign Settings Page Creation**
**Given** I am an admin user [Source: Epics Epic 3 Story 3.5, FR8.2]
**When** I navigate to Settings → Campaigns
**Then** I see the campaign management page at `/settings/campaigns`:
- Page title: "Settings > Campaigns"
- Subtitle: "Manage campaigns for organizing leads"
- "+ New Campaign" button (orange, primary styling, top-right)
- Campaigns table displaying all campaigns

**AC2: Campaigns Table Display**
**Given** I am viewing the campaigns page [Source: Epics Epic 3 Story 3.5, UX§4.5]
**When** the page loads
**Then** a table displays with columns:
- **Campaign Name** (text, left-aligned)
- **Description** (text, truncated to 100 chars with "..." if longer)
- **Status** (badge component - Green "Active" or Gray "Inactive", UX§4.4)
- **Contact Count** (number, queried from campaign_contacts junction table)
- **Actions** (Edit icon, Delete icon - 20×20px Heroicons)
**And** campaigns are sorted by created_at DESC (most recent first)
**And** table styling matches existing tables from Story 2.3

**AC3: New Campaign Modal**
**Given** I am on the campaigns page [Source: Epics Epic 3 Story 3.5, UX§4.6]
**When** I click "+ New Campaign" button
**Then** a modal opens with title "Create New Campaign" containing:
- **Campaign Name** field (required, text input, max 100 chars)
  - Validation: Cannot be empty
  - Error message: "Campaign name is required"
  - Must be unique (validated on submit)
- **Description** field (optional, textarea, max 500 chars)
  - Character counter: "X/500" displayed below textarea
- **Status** radio buttons (default: Active)
  - Options: ● Active  ○ Inactive
  - Note: Inactive campaigns don't appear in contact assignment dropdowns
- **[Cancel]** button (left, secondary style)
- **[Create Campaign]** button (right, orange primary style)

**AC4: Campaign Creation Processing**
**Given** I have filled the create campaign form with valid data [Source: Epics Epic 3 Story 3.5, FR8.2]
**When** I submit the form
**Then** the system:
- Calls POST /api/campaigns with request body: { name, description, status }
- Creates campaign in campaigns table (Architecture §2.3.3)
- Sets created_by to current authenticated user ID
- Sets created_at and updated_at automatically
- Shows success toast: "Campaign created successfully" (green)
- Closes the modal
- Refreshes the campaigns list to show new campaign

**AC5: Campaign Name Uniqueness Validation**
**Given** I am creating a campaign [Source: Epics Epic 3 Story 3.5]
**When** I submit a campaign name that already exists
**Then** the system:
- Returns 400 error from API: "Campaign name already exists"
- Displays error message below Campaign Name field
- Keeps modal open for user to correct
- Does NOT create duplicate campaign

**AC6: Edit Campaign Modal**
**Given** I am viewing the campaigns table [Source: Epics Epic 3 Story 3.5]
**When** I click the Edit icon (✏️) for a campaign
**Then** a modal opens with title "Edit Campaign" containing:
- Same form fields as create modal
- Form pre-filled with existing campaign data
- Same validation rules as create
- **[Cancel]** button (left, secondary style)
- **[Save Changes]** button (right, orange primary style)
**And** when I submit valid changes
**Then** the system:
- Calls PUT /api/campaigns/[id]
- Updates the campaign record
- Shows success toast: "Campaign updated successfully"
- Closes modal and refreshes list

**AC7: Delete Campaign Confirmation**
**Given** I am viewing the campaigns table [Source: Epics Epic 3 Story 3.5]
**When** I click the Delete icon (🗑️) for a campaign
**Then** a confirmation modal appears with:
- Title: "Delete Campaign?"
- Message: "This will remove the campaign and unassign all contacts. Contacts will not be deleted. Continue?"
- Contact count warning: "This campaign has X contacts assigned" (if > 0)
- Reassurance: "Contacts will not be deleted, only the campaign association"
- **[Cancel]** button (left, secondary style)
- **[Delete Campaign]** button (right, red danger style)

**AC8: Campaign Deletion Processing**
**Given** I have confirmed campaign deletion [Source: Epics Epic 3 Story 3.5, Architecture §2.3.3]
**When** the delete request processes
**Then** the system:
- Calls DELETE /api/campaigns/[id]
- Deletes campaign record from campaigns table
- Cascade deletes all campaign_contacts associations (ON DELETE CASCADE)
- Shows success toast: "Campaign deleted" (green)
- Closes confirmation modal
- Refreshes campaigns list

**AC9: Contact Count Query**
**Given** the campaigns table is displaying [Source: Epics Epic 3 Story 3.5]
**When** fetching campaign data
**Then** for each campaign, the system:
- Queries: `SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = ?`
- Displays count in Contact Count column
- Uses count in delete confirmation warning

**AC10: Admin-Only Access**
**Given** I am a non-admin user [Source: Epics Epic 3 Story 3.5, FR8.2]
**When** I attempt to access /settings/campaigns
**Then** the system:
- Checks user role via Supabase auth
- Redirects to dashboard if role !== 'admin'
- Shows toast: "Admin access required"
**And** Settings menu item only visible to admin users

## Tasks / Subtasks

- [ ] 1. Create campaigns settings page file (AC1)
  - [ ] 1.1 Create file: `app/(dashboard)/settings/campaigns/page.tsx`
  - [ ] 1.2 Add page title and subtitle
  - [ ] 1.3 Add "+ New Campaign" button with modal trigger
  - [ ] 1.4 Implement admin role check (redirect if not admin)

- [ ] 2. Create campaigns table component (AC2, AC9)
  - [ ] 2.1 Create table with columns: Name, Description, Status, Contact Count, Actions
  - [ ] 2.2 Fetch campaigns from GET /api/campaigns
  - [ ] 2.3 For each campaign, fetch contact count from campaign_contacts
  - [ ] 2.4 Implement Status badge component (green Active, gray Inactive)
  - [ ] 2.5 Add Edit and Delete icon buttons (Heroicons)
  - [ ] 2.6 Sort campaigns by created_at DESC
  - [ ] 2.7 Truncate description to 100 chars with "..."

- [ ] 3. Create "New Campaign" modal (AC3, AC4, AC5)
  - [ ] 3.1 Create modal component with "Create New Campaign" title
  - [ ] 3.2 Add Campaign Name input field with max 100 chars
  - [ ] 3.3 Add required validation for Campaign Name
  - [ ] 3.4 Add Description textarea with max 500 chars and character counter
  - [ ] 3.5 Add Status radio buttons (Active/Inactive, default Active)
  - [ ] 3.6 Add Cancel and Create Campaign buttons
  - [ ] 3.7 Implement form submit: POST /api/campaigns
  - [ ] 3.8 Handle unique name validation error (400 response)
  - [ ] 3.9 Show success toast on creation
  - [ ] 3.10 Close modal and refresh list on success

- [ ] 4. Create "Edit Campaign" modal (AC6)
  - [ ] 4.1 Reuse/extend create modal component for edit mode
  - [ ] 4.2 Pre-fill form with existing campaign data
  - [ ] 4.3 Change title to "Edit Campaign"
  - [ ] 4.4 Change button to "Save Changes"
  - [ ] 4.5 Implement form submit: PUT /api/campaigns/[id]
  - [ ] 4.6 Show success toast on update
  - [ ] 4.7 Close modal and refresh list on success

- [ ] 5. Create delete confirmation modal (AC7, AC8)
  - [ ] 5.1 Create confirmation modal component
  - [ ] 5.2 Display campaign name and contact count
  - [ ] 5.3 Show warning message about contact associations
  - [ ] 5.4 Add Cancel and Delete Campaign buttons (Delete in red)
  - [ ] 5.5 Implement DELETE /api/campaigns/[id] on confirm
  - [ ] 5.6 Show success toast on deletion
  - [ ] 5.7 Close modal and refresh list on success

- [ ] 6. Create/update campaigns API routes (AC4, AC6, AC8)
  - [ ] 6.1 Create GET /api/campaigns route (list all campaigns)
  - [ ] 6.2 Create POST /api/campaigns route (create campaign)
  - [ ] 6.3 Implement unique name validation in POST
  - [ ] 6.4 Create GET /api/campaigns/[id] route (read single campaign)
  - [ ] 6.5 Create PUT /api/campaigns/[id] route (update campaign)
  - [ ] 6.6 Create DELETE /api/campaigns/[id] route (delete with cascade)
  - [ ] 6.7 Add created_by, created_at, updated_at handling
  - [ ] 6.8 Add proper error handling and status codes

- [ ] 7. Update Settings navigation (AC10)
  - [ ] 7.1 Add "Settings" link to sidebar navigation (from Story 1.5)
  - [ ] 7.2 Add "Campaigns" sub-menu item under Settings
  - [ ] 7.3 Show Settings menu only to admin users
  - [ ] 7.4 Implement role-based navigation visibility

- [ ] 8. Write unit tests for components
  - [ ] 8.1 Test campaigns table renders correctly
  - [ ] 8.2 Test create modal form validation
  - [ ] 8.3 Test edit modal pre-filling
  - [ ] 8.4 Test delete confirmation modal
  - [ ] 8.5 Test admin role check and redirect

- [ ] 9. Write API route tests
  - [ ] 9.1 Test GET /api/campaigns returns all campaigns
  - [ ] 9.2 Test POST /api/campaigns creates campaign
  - [ ] 9.3 Test POST validates unique campaign name
  - [ ] 9.4 Test PUT /api/campaigns/[id] updates campaign
  - [ ] 9.5 Test DELETE /api/campaigns/[id] deletes with cascade
  - [ ] 9.6 Test contact count query accuracy

- [ ] 10. Integration testing and verification
  - [ ] 10.1 Verify campaigns page loads for admin users
  - [ ] 10.2 Verify non-admin users redirected
  - [ ] 10.3 Create, edit, and delete campaigns end-to-end
  - [ ] 10.4 Verify contact count displays correctly
  - [ ] 10.5 Verify cascade delete removes campaign_contacts
  - [ ] 10.6 Verify inactive campaigns don't appear in contact assignment

## Dev Notes

### Architecture Compliance

**Page Structure** [Source: Architecture, Story 1.4]
- Location: `app/(dashboard)/settings/campaigns/page.tsx`
- Uses (dashboard) layout group for authenticated pages
- Follows Next.js 15 App Router conventions
- Server component by default, use 'use client' for modals

**API Routes** [Source: Architecture §API Patterns, Previous Stories]
- RESTful resource: `/api/campaigns`
- Supported methods: GET, POST, GET [id], PUT [id], DELETE [id]
- Use createClient from '@/app/lib/supabase/server'
- Return NextResponse with proper status codes
- Handle authentication and authorization

**Database Access** [Source: Architecture §2.3.3]
- campaigns table structure (already created in Story 1.2):
  - id (uuid, primary key)
  - name (text, NOT NULL, UNIQUE)
  - description (text)
  - status (text, 'Active' or 'Inactive')
  - created_by (uuid, references users)
  - created_at (timestamp)
  - updated_at (timestamp)
- campaign_contacts junction table for contact associations
- ON DELETE CASCADE removes associations when campaign deleted

**Styling Patterns** [Source: UX Design, Story 2.3]
- Use Mocha color scheme (Catppuccin Mocha palette)
- Table styling matches contacts list table
- Modal styling matches existing modals (800px width for data-heavy, 600px for forms)
- Button styles: Orange primary (#F25C05), secondary (gray border)
- Badge styles: Green for Active, Gray for Inactive

### Technical Implementation Notes

**Contact Count Calculation**
- Option 1: Aggregate query with JOIN in main campaigns query
  ```sql
  SELECT c.*, COUNT(cc.contact_id) as contact_count
  FROM campaigns c
  LEFT JOIN campaign_contacts cc ON c.id = cc.campaign_id
  GROUP BY c.id
  ```
- Option 2: Separate query per campaign (simpler for MVP)
  ```sql
  SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = ?
  ```
- Use Option 1 for better performance

**Unique Name Validation**
- Database enforces UNIQUE constraint on campaigns.name
- Catch Supabase error code '23505' (unique violation)
- Return user-friendly error: "Campaign name already exists"

**Status Handling**
- Active campaigns appear in multi-select dropdowns (Stories 2.2, 3.2)
- Inactive campaigns hidden from assignment dropdowns
- Filter query: `WHERE status = 'Active'` for dropdown population

**Admin Role Check**
- Use Supabase auth to get current user
- Query users table for role field
- Redirect to /dashboard if role !== 'admin'
- Use middleware or page-level check

### Previous Story Learnings

**From Story 1.2 (Database Setup):**
- campaigns table already created in initial schema
- UNIQUE constraint on campaign name enforced at database level
- created_by, created_at, updated_at columns exist

**From Story 2.2 (Manual Contact Creation):**
- Campaign multi-select dropdown pattern established
- Only Active campaigns shown in assignment dropdowns
- UI expects GET /api/campaigns?status=Active

**From Story 3.2 (CSV Upload):**
- Campaign assignment UI pattern established
- User selects campaigns before import
- campaign_ids array passed to bulk import API

**From Story 2.3 (Contacts List):**
- Table styling and layout patterns
- Search, filter, and pagination patterns
- Action icons (Edit, Delete) in Actions column

### Testing Standards

**Component Testing:**
- Test role-based access control
- Test modal open/close behavior
- Test form validation (required fields, max lengths)
- Test success/error toast display

**API Testing:**
- Test CRUD operations for all endpoints
- Test unique name constraint violation
- Test CASCADE delete behavior
- Test authorization checks

**Integration Testing:**
- Test complete create/edit/delete flows
- Test contact count accuracy
- Test inactive campaign filtering

### File Structure

```
app/
  (dashboard)/
    settings/
      campaigns/
        page.tsx              # NEW: Campaign management page
        components/
          CampaignModal.tsx   # NEW: Create/Edit modal
          DeleteModal.tsx     # NEW: Delete confirmation
          CampaignsTable.tsx  # NEW: Campaigns table component
  api/
    campaigns/
      route.ts                # NEW: GET (list), POST (create)
      [id]/
        route.ts              # NEW: GET, PUT, DELETE
```

### Project Structure Notes

**Settings Navigation Extension:**
- Extend sidebar from Story 1.5 to include Settings menu
- Settings menu item with dropdown for sub-pages:
  - Campaigns (this story)
  - Users (Story 1.7)
  - Future: Email templates, Pipeline stages, etc.
- Use role-based visibility for Settings menu

**Component Reusability:**
- Modal component can be shared for Create/Edit modes
- Table component follows established patterns
- Badge component reusable for other status displays

### References

- [Source: docs/epics.md Epic 3 Story 3.5] - Story requirements and acceptance criteria
- [Source: docs/epics.md Epic 3 Overview] - Business context and user value
- [Source: docs/architecture.md §2.3.3] - Campaigns table schema
- [Source: docs/architecture.md §2.3.4] - Campaign_contacts junction table
- [Source: docs/architecture.md §API Patterns] - API route conventions
- [Source: docs/UX.md §4.2] - Campaign management UI design
- [Source: docs/UX.md §4.3] - Form field specifications
- [Source: docs/UX.md §4.4] - Badge components
- [Source: docs/UX.md §4.5] - Table components
- [Source: docs/UX.md §4.6] - Modal specifications
- [Source: docs/PRD.md FR8.2] - Campaign CRUD requirements
- [Source: docs/sprint-artifacts/1-2-supabase-database-setup-core-tables.md] - Initial campaigns table
- [Source: docs/sprint-artifacts/2-2-manual-contact-creation-form-campaign-assignment.md] - Campaign dropdown
- [Source: docs/sprint-artifacts/2-3-contacts-list-page-search-filtering.md] - Table patterns

## Dev Agent Record

### Context Reference

<!-- Enhanced context from create-story workflow -->
Epic 3 Story 5 of 5 - Campaign CRUD Interface completes Epic 3 by providing admin tools to manage the campaigns that organize imported contacts.

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be added during implementation_

### Completion Notes

_To be added during implementation_

### File List

_To be added during implementation_

### Change Log

- 2025-12-11: Story created with comprehensive context from epics, architecture, UX design, and previous stories across Epics 1-3
