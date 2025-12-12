# Story 5.2: Company List Page & CRUD Operations

Status: ready-for-dev

## Story

As a sales team member,
I want to view and manage companies in a dedicated page with full CRUD capabilities,
so that I can maintain accurate company information and track relationships with multiple contacts per company.

## Acceptance Criteria

**AC1: Companies Page Navigation**
**Given** I am authenticated and viewing the application
**When** I click "Companies" in the sidebar navigation [Source: Epics Epic 5 Story 5.2]
**Then** I navigate to `/companies` route
**And** the Companies page loads with the complete company management interface

**AC2: Page Layout and Header**
**Given** I am on the Companies page [Source: Epics Epic 5 Story 5.2, UX§6.2 pattern from Contacts]
**When** the page loads
**Then** I see the page header:
- Title: "Companies" (2rem, weight 800, Mocha Text #cdd6f4)
- Subtitle: "Manage company information and relationships" (1rem, Mocha Subtext0 #a6adc8)
- Buttons (right-aligned):
  - "+ New Company" (orange primary button #F25C05)
  - Style per UX§4.1 specifications

**AC3: Filter Bar Components**
**Given** the page has loaded [Source: Epics Epic 5 Story 5.2, UX§6.2 from Story 2.3]
**When** I view the filter bar
**Then** I see:
- **Search input** (flex: 1):
  - Placeholder: "Search companies by name or industry..."
  - Magnifying glass icon (left side, 20×20px Heroicons)
  - Real-time search on keystroke (debounced 300ms)
  - Orange focus state (#F25C05)
  - Background: Mocha Surface0 (#313244)
  - Border-radius: 10px

- **Industry Filter dropdown**:
  - Label: "Industry ▾"
  - Options: "All Industries", then alphabetical list of unique industries
  - Background: Mocha Surface0
  - Hover: Mocha Surface1

- **Size Filter dropdown**:
  - Label: "Size ▾"
  - Options: "All Sizes", "Startup", "SMB", "Enterprise"
  - Filters by company.size column

- **Sort dropdown**:
  - Label: "Sort ▾"
  - Options: "Name A-Z", "Name Z-A", "Most Contacts", "Highest Deal Value"

**AC4: Companies Table Design**
**Given** the page has loaded [Source: Epics Epic 5 Story 5.2, UX§4.5]
**When** I view the companies table
**Then** I see:
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 12px
- Padding: 1.5rem

**Table columns:**
| Company | Industry | Size | Contacts | Deal Value | Actions |
|---------|----------|------|----------|------------|---------|
| [Avatar] Acme Corp | Technology | Enterprise | 5 | $125,000 | [👁️] [✏️] [🗑️] |

**AC5: Table Styling Specifications**
**Given** the table is displayed [Source: UX§4.5 from Story 2.3]
**Then** the styling follows:
- **Header row**: border-bottom 1px solid Surface0
- **Header cells**: 0.75rem uppercase, weight 600, Mocha Overlay1 (#7f849c), letter-spacing 0.05em
- **Body cells**: padding 1rem 0.5rem, border-bottom 1px solid Surface0
- **Hover row**: background rgba(242,92,5,0.03), 0.15s transition
- **Last row**: no border-bottom

**AC6: Company Cell with Avatar**
**Given** a company row is displayed [Source: UX§4.5]
**When** I view the Company column
**Then** I see:
- **Company avatar**: 32×32px, border-radius 6px, first 2 letters of name
- **Company name**: Font-weight 700, clickable
- **Name styling**: Mocha Text color, hover orange (#F25C05)
- **Click behavior**: Opens company detail modal (like Story 2.4 contact detail)
- **Avatar colors**: Rotate through Mocha accent colors (Blue, Sapphire, Teal, Lavender)

**AC7: Contacts Count Cell**
**Given** a company row is displayed [Source: Epics Epic 5 Story 5.2]
**When** I view the Contacts column
**Then** I see:
- **Display format**: Number of contacts (e.g., "5 contacts", "1 contact", "0 contacts")
- **Font**: Mocha Text, regular weight
- **Clickable**: Links to filtered contacts page showing only this company's contacts
- **Hover**: Orange underline

**AC8: Deal Value Cell**
**Given** a company row is displayed [Source: Epics Epic 5 Story 5.2]
**When** I view the Deal Value column
**Then** I see:
- **Format**: Currency format (e.g., "$125,000.00")
- **Font**: JetBrains Mono (monospace), weight 700
- **Color**: Mocha Text
- **Calculation**: Sum of all deals.value WHERE deals.contact_id IN (SELECT id FROM contacts WHERE company_id = this_company.id)
- **Empty state**: "$0.00" if no deals

**AC9: Actions Column**
**Given** a company row is displayed [Source: Epics Epic 5 Story 5.2]
**When** I view the Actions column
**Then** I see three icon buttons:
- **View icon** (eye, Heroicons): Opens company detail modal
- **Edit icon** (pencil, Heroicons): Opens edit company modal
- **Delete icon** (trash, Heroicons): Opens delete confirmation modal
- **Icon styling**: 20×20px, Mocha Subtext0, hover orange (#F25C05), transition 0.2s

**AC10: Real-Time Search Functionality**
**Given** I type in the search bar [Source: Epics Epic 5 Story 5.2, Architecture§4.1 performance]
**When** I search for companies
**Then** the system:
- Searches: company.name, company.industry (case-insensitive using ILIKE)
- **Debounce**: 300ms delay before API call
- **Performance**: Query execution time <200ms using idx_companies_name index
- **Results update**: As I type (after debounce)
- **Empty state**: Shows "No companies found" if no matches

**AC11: Industry Filter Functionality**
**Given** I select an industry from the dropdown [Source: Epics Epic 5 Story 5.2]
**When** the filter is applied
**Then** the list shows:
- Only companies WHERE industry = selected_industry (exact match)
- "All Industries" shows all companies
- Industry list populated from: `SELECT DISTINCT industry FROM companies WHERE industry IS NOT NULL ORDER BY industry`

**AC12: Size Filter Functionality**
**Given** I select a size from the dropdown [Source: Epics Epic 5 Story 5.2]
**When** the filter is applied
**Then** the list shows:
- Only companies WHERE size = selected_size
- Options: "All Sizes", "Startup", "SMB", "Enterprise" (from companies table CHECK constraint)

**AC13: Sort Functionality**
**Given** I select a sort option [Source: Epics Epic 5 Story 5.2]
**When** the sort is applied
**Then** companies are ordered by:
- "Name A-Z": company.name ASC
- "Name Z-A": company.name DESC
- "Most Contacts": COUNT(contacts) DESC (via subquery)
- "Highest Deal Value": SUM(deals.value) DESC (via subquery)

**AC14: Create Company Modal - Form Fields**
**Given** I click "+ New Company" button [Source: Epics Epic 5 Story 5.2, UX§4.6 modal pattern]
**When** the modal opens
**Then** I see the form with fields:

1. **Company Name** (text input, REQUIRED)
   - Label: "Company Name *"
   - Max length: 200 characters
   - Validation: Cannot be empty, must be unique (case-insensitive)
   - Error: "Company name is required" or "A company with this name already exists"
   - Character counter: "X/200"

2. **Industry** (text input, optional)
   - Label: "Industry"
   - Max length: 100 characters
   - Placeholder: "e.g., Technology, Healthcare, Finance"
   - Character counter: "X/100"

3. **Size** (dropdown, optional)
   - Label: "Company Size"
   - Options: "—" (empty), "Startup", "SMB", "Enterprise"
   - Default: Empty

4. **Website** (text input, optional)
   - Label: "Website"
   - Placeholder: "https://example.com"
   - Validation: Valid URL format if provided (regex: `^https?://`)
   - Error: "Please enter a valid URL starting with http:// or https://"

5. **Notes** (textarea, optional)
   - Label: "Notes"
   - Rows: 4
   - Max length: 2000 characters
   - Placeholder: "Additional information about the company..."
   - Character counter: "X/2000"

**Modal styling** per UX§4.6:
- Max-width: 600px
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0
- Border-radius: 16px
- Animation: slideUp 0.3s ease

**AC15: Create Company - Form Submission**
**Given** I fill the form with valid data [Source: Epics Epic 5 Story 5.2, Architecture§3.3]
**When** I click "Create Company" button
**Then** the system:
1. Validates all fields client-side
2. Calls POST /api/companies with:
   ```json
   {
     "name": "Acme Corp",
     "industry": "Technology",
     "size": "Enterprise",
     "website": "https://acme.com",
     "notes": "Leading software provider"
   }
   ```
3. Server inserts into companies table (Story 5.1)
4. Server handles UNIQUE constraint on name (case-insensitive check using LOWER())
5. Returns 201 Created with company object
6. Client shows success toast: "Company created successfully" (green, 3s)
7. Client closes modal
8. Client refreshes companies list to show new company

**AC16: Edit Company Modal**
**Given** I click the edit icon (✏️) on a company row [Source: Epics Epic 5 Story 5.2]
**When** the edit modal opens
**Then** I see:
- Same form fields as create modal (AC14)
- All fields pre-populated with current company data
- Modal title: "Edit Company"
- Submit button: "Update Company"
- Validation same as create (including unique name check, excluding self)
- API call: PUT /api/companies/[id]
- Success toast: "Company updated successfully"

**AC17: Delete Company Confirmation**
**Given** I click the delete icon (🗑️) on a company row [Source: Epics Epic 5 Story 5.2]
**When** the delete confirmation modal opens
**Then** I see:
- Modal title: "Delete Company?"
- Warning message: "Are you sure you want to delete [Company Name]?"
- **Impact warning**: "This will unlink X contacts from this company (contacts will not be deleted)"
- Two buttons:
  - "Cancel" (secondary button, gray)
  - "Delete Company" (danger button, red background Mocha Red #f38ba8)
- Modal styling: Standard modal with red accent border-left (4px solid)

**AC18: Delete Company - Execution**
**Given** I confirm deletion [Source: Epics Epic 5 Story 5.2]
**When** I click "Delete Company"
**Then** the system:
1. Calls DELETE /api/companies/[id]
2. Server checks if company has contacts (count contacts WHERE company_id = this_id)
3. Server sets contacts.company_id = NULL for all linked contacts (per Story 5.1 ON DELETE SET NULL)
4. Server deletes company record
5. Returns 200 OK
6. Client shows success toast: "[Company Name] deleted successfully" (green, 3s)
7. Client closes modal
8. Client refreshes companies list (company removed from view)

**AC19: Company Detail Modal (View)**
**Given** I click a company name or the view icon (👁️) [Source: Epics Epic 5 Story 5.2]
**When** the detail modal opens
**Then** I see:
- Modal title: Company name
- **Company Information section**:
  - Industry: [value or "—"]
  - Size: [value or "—"]
  - Website: [clickable link or "—"]
  - Notes: [value or "—"]
- **Contacts section**:
  - Title: "Contacts (X)" where X = count
  - List of contacts with this company (mini table or card list)
  - Each contact shows: Avatar, Name, Position, Email
  - Click contact → opens contact detail modal
  - "+ Add Contact" button → opens contact form with company pre-selected
- **Deals section**:
  - Title: "Deals (X)" where X = count
  - Total deal value displayed prominently
  - List of deals from contacts at this company
  - Each deal shows: Title, Contact, Stage, Value, Probability
- **Actions**:
  - "Edit Company" button (secondary)
  - "Delete Company" button (danger)
  - Close X button

**AC20: Responsive Behavior**
**Given** the page is viewed on different screen sizes [Source: UX§9.2]
**When** the viewport changes
**Then** the layout adapts:
- **Desktop (>1024px)**: Full table with all columns
- **Tablet (768-1024px)**: Hide "Size" column
- **Mobile (<768px)**: Transform to card view:
  - Each company = card (Mocha Mantle background)
  - Company avatar + name at top
  - Industry, contacts count, deal value below
  - Actions in card footer

**AC21: Initial Data Load**
**Given** I navigate to the Companies page [Source: Epics Epic 5 Story 5.2]
**When** the page loads
**Then** the system:
- Calls GET /api/companies
- Displays first 50 companies (pagination, default sort: Name A-Z)
- Shows loading spinner while fetching
- Shows empty state if no companies exist:
  - Icon: Building icon (Heroicons)
  - Message: "No companies yet"
  - Submessage: "Create your first company to get started"
  - "+ New Company" button (centered)
- Shows error message if API fails

**AC22: GET /api/companies Endpoint**
**Given** the frontend needs company data [Source: Epics Epic 5 Story 5.2, Architecture§3.3]
**When** GET /api/companies is called
**Then** the endpoint:

**Query Parameters:**
- `search`: string (optional) - Search term for name/industry
- `industry`: string (optional) - Filter by exact industry
- `size`: string (optional) - Filter by size (Startup|SMB|Enterprise)
- `sort`: "name-asc" | "name-desc" | "contacts" | "value" (default: name-asc)
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response (200 OK):**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "industry": "Technology",
      "size": "Enterprise",
      "website": "https://acme.com",
      "notes": "Leading provider",
      "created_at": "2025-12-09T...",
      "updated_at": "2025-12-09T...",
      "contacts_count": 5,
      "total_deal_value": 125000.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 9
  }
}
```

**Implementation notes:**
- Join subquery to count contacts: `(SELECT COUNT(*) FROM contacts WHERE company_id = companies.id)`
- Join subquery to sum deal values: Complex join through contacts → deals
- Use idx_companies_name for search performance
- Apply ILIKE for case-insensitive search on name and industry

**AC23: POST /api/companies Endpoint**
**Given** the frontend submits create form [Source: Epics Epic 5 Story 5.2]
**When** POST /api/companies is called
**Then** the endpoint:

**Request Body:**
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "size": "Enterprise",
  "website": "https://acme.com",
  "notes": "Leading provider"
}
```

**Validation:**
- name: Required, 1-200 chars, unique (case-insensitive using LOWER())
- industry: Optional, max 100 chars
- size: Optional, must be NULL or one of: "Startup", "SMB", "Enterprise"
- website: Optional, valid URL format
- notes: Optional, max 2000 chars

**Response (201 Created):**
```json
{
  "success": true,
  "company": { /* full company object */ }
}
```

**Response (409 Conflict - duplicate name):**
```json
{
  "error": "A company with this name already exists"
}
```

**AC24: PUT /api/companies/[id] Endpoint**
**Given** the frontend submits edit form [Source: Epics Epic 5 Story 5.2]
**When** PUT /api/companies/[id] is called
**Then** the endpoint:
- Validates same as POST
- Checks unique name constraint (excluding current company ID)
- Updates company record with new data
- Returns 200 OK with updated company object
- Returns 404 if company not found
- Returns 409 if name conflicts with another company

**AC25: DELETE /api/companies/[id] Endpoint**
**Given** the frontend confirms deletion [Source: Epics Epic 5 Story 5.2]
**When** DELETE /api/companies/[id] is called
**Then** the endpoint:
- Finds company by ID
- Returns 404 if not found
- Deletes company (contacts.company_id automatically set to NULL by FK constraint)
- Returns 200 OK with success message
- Returns 500 if deletion fails

## Tasks / Subtasks

- [ ] 1. Create Companies page route (AC: 1, 2, 21)
  - [ ] 1.1 Create file: app/(dashboard)/companies/page.tsx
  - [ ] 1.2 Mark as 'use client' for interactivity
  - [ ] 1.3 Add page header with title and subtitle per UX§6.2
  - [ ] 1.4 Add "+ New Company" button (opens modal)
  - [ ] 1.5 Set up React useState for companies data, loading, error, modal states
  - [ ] 1.6 Implement useEffect to fetch companies on page load
  - [ ] 1.7 Add empty state component (no companies)
  - [ ] 1.8 Add loading state (spinner)
  - [ ] 1.9 Add error state (error message with retry)

- [ ] 2. Create GET /api/companies endpoint (AC: 22)
  - [ ] 2.1 Create file: app/api/companies/route.ts (GET method)
  - [ ] 2.2 Get authenticated user from Supabase session
  - [ ] 2.3 Parse query parameters: search, industry, size, sort, page, limit
  - [ ] 2.4 Build Supabase query with filters
  - [ ] 2.5 Implement search logic (ILIKE on name, industry)
  - [ ] 2.6 Implement industry filter (exact match)
  - [ ] 2.7 Implement size filter (exact match)
  - [ ] 2.8 Implement sort logic (name, contacts count, deal value)
  - [ ] 2.9 Add subquery to count contacts per company
  - [ ] 2.10 Add complex join to sum deal values (contacts → deals → sum)
  - [ ] 2.11 Add pagination (50 per page default)
  - [ ] 2.12 Return JSON with companies array and pagination metadata

- [ ] 3. Create FilterBar component (AC: 3)
  - [ ] 3.1 Create file: app/(dashboard)/companies/components/FilterBar.tsx
  - [ ] 3.2 Mark as 'use client' for interactivity
  - [ ] 3.3 Create search input with magnifying glass icon (Heroicons)
  - [ ] 3.4 Style search input per UX§6.2
  - [ ] 3.5 Implement debounced search (300ms) using useCallback and setTimeout
  - [ ] 3.6 Create Industry filter dropdown
  - [ ] 3.7 Fetch distinct industries from companies table
  - [ ] 3.8 Create Size filter dropdown with static options
  - [ ] 3.9 Create Sort dropdown with 4 options
  - [ ] 3.10 Emit onChange events to parent component

- [ ] 4. Create CompaniesTable component (AC: 4, 5, 6, 7, 8, 9)
  - [ ] 4.1 Create file: app/(dashboard)/companies/components/CompaniesTable.tsx
  - [ ] 4.2 Mark as 'use client' for hover states and actions
  - [ ] 4.3 Create table container with Mocha Mantle background
  - [ ] 4.4 Create table header row with 6 columns
  - [ ] 4.5 Style header cells per UX§4.5 (uppercase, weight 600)
  - [ ] 4.6 Map companies data to table rows
  - [ ] 4.7 Implement row hover state (rgba(242,92,5,0.03) background)
  - [ ] 4.8 Create CompanyAvatar component (reuse ContactAvatar pattern)
  - [ ] 4.9 Format Contacts count cell (e.g., "5 contacts")
  - [ ] 4.10 Format Deal Value cell with currency (JetBrains Mono)
  - [ ] 4.11 Add action icons (view, edit, delete) with hover states

- [ ] 5. Create CreateCompanyModal component (AC: 14, 15)
  - [ ] 5.1 Create file: app/(dashboard)/companies/components/CreateCompanyModal.tsx
  - [ ] 5.2 Mark as 'use client' for form interactivity
  - [ ] 5.3 Implement modal shell (backdrop, container, close button)
  - [ ] 5.4 Add modal title: "Create New Company"
  - [ ] 5.5 Implement Company Name field with required validation
  - [ ] 5.6 Implement Industry field (optional text input)
  - [ ] 5.7 Implement Size dropdown (optional)
  - [ ] 5.8 Implement Website field with URL validation
  - [ ] 5.9 Implement Notes textarea with character counter
  - [ ] 5.10 Add form state management (useState)
  - [ ] 5.11 Implement client-side validation
  - [ ] 5.12 Implement form submission handler
  - [ ] 5.13 Add loading states (button spinner)
  - [ ] 5.14 Add inline error message display

- [ ] 6. Create POST /api/companies endpoint (AC: 23)
  - [ ] 6.1 Add POST method to app/api/companies/route.ts
  - [ ] 6.2 Get authenticated user from Supabase session
  - [ ] 6.3 Parse and validate request body
  - [ ] 6.4 Check for duplicate name using LOWER() comparison
  - [ ] 6.5 Insert company into companies table
  - [ ] 6.6 Handle unique constraint violation (name)
  - [ ] 6.7 Handle CHECK constraint violation (size)
  - [ ] 6.8 Return 201 Created with company object
  - [ ] 6.9 Return 409 Conflict if duplicate name
  - [ ] 6.10 Add error handling (400, 500)

- [ ] 7. Create EditCompanyModal component (AC: 16)
  - [ ] 7.1 Create file: app/(dashboard)/companies/components/EditCompanyModal.tsx
  - [ ] 7.2 OR: Reuse CreateCompanyModal with edit mode prop
  - [ ] 7.3 Pre-populate form fields with current company data
  - [ ] 7.4 Change modal title to "Edit Company"
  - [ ] 7.5 Change submit button to "Update Company"
  - [ ] 7.6 Call PUT /api/companies/[id] on submit
  - [ ] 7.7 Show success toast on update
  - [ ] 7.8 Refresh companies list after update

- [ ] 8. Create PUT /api/companies/[id] endpoint (AC: 24)
  - [ ] 8.1 Create file: app/api/companies/[id]/route.ts (PUT method)
  - [ ] 8.2 Get authenticated user from Supabase session
  - [ ] 8.3 Extract company ID from URL params
  - [ ] 8.4 Validate request body same as POST
  - [ ] 8.5 Check duplicate name (excluding current company)
  - [ ] 8.6 Update company record in database
  - [ ] 8.7 Return 200 OK with updated company
  - [ ] 8.8 Return 404 if company not found
  - [ ] 8.9 Return 409 if name conflicts

- [ ] 9. Create DeleteConfirmationModal component (AC: 17, 18)
  - [ ] 9.1 Create file: app/(dashboard)/companies/components/DeleteConfirmationModal.tsx
  - [ ] 9.2 OR: Create generic DeleteConfirmationModal in shared components
  - [ ] 9.3 Display company name in warning message
  - [ ] 9.4 Fetch contacts count for impact warning
  - [ ] 9.5 Add red accent border (4px solid Mocha Red)
  - [ ] 9.6 Add "Cancel" button (secondary)
  - [ ] 9.7 Add "Delete Company" button (danger red)
  - [ ] 9.8 Call DELETE /api/companies/[id] on confirm
  - [ ] 9.9 Show success toast after deletion
  - [ ] 9.10 Refresh companies list after deletion

- [ ] 10. Create DELETE /api/companies/[id] endpoint (AC: 25)
  - [ ] 10.1 Add DELETE method to app/api/companies/[id]/route.ts
  - [ ] 10.2 Get authenticated user from Supabase session
  - [ ] 10.3 Extract company ID from URL params
  - [ ] 10.4 Find company by ID (verify exists)
  - [ ] 10.5 Delete company (FK constraint handles contact unlinking)
  - [ ] 10.6 Return 200 OK with success message
  - [ ] 10.7 Return 404 if company not found
  - [ ] 10.8 Add error handling (500)

- [ ] 11. Create CompanyDetailModal component (AC: 19)
  - [ ] 11.1 Create file: app/(dashboard)/companies/components/CompanyDetailModal.tsx
  - [ ] 11.2 Fetch full company data with contacts and deals
  - [ ] 11.3 Display company information section
  - [ ] 11.4 Display contacts list (mini table with link to full contact)
  - [ ] 11.5 Display deals list with total value
  - [ ] 11.6 Add "Edit Company" button (opens edit modal)
  - [ ] 11.7 Add "Delete Company" button (opens delete confirmation)
  - [ ] 11.8 Add "+ Add Contact" button (opens contact form with company pre-selected)
  - [ ] 11.9 Style modal per UX§4.6

- [ ] 12. Create GET /api/companies/[id] endpoint (for detail modal)
  - [ ] 12.1 Add GET method to app/api/companies/[id]/route.ts
  - [ ] 12.2 Get authenticated user from Supabase session
  - [ ] 12.3 Extract company ID from URL params
  - [ ] 12.4 Fetch company by ID
  - [ ] 12.5 Join contacts for this company
  - [ ] 12.6 Join deals through contacts
  - [ ] 12.7 Calculate total deal value
  - [ ] 12.8 Return 200 OK with full company object
  - [ ] 12.9 Return 404 if company not found

- [ ] 13. Implement responsive card view (AC: 20)
  - [ ] 13.1 Create file: app/(dashboard)/companies/components/CompanyCard.tsx
  - [ ] 13.2 Use CSS media queries to switch table/card at 768px breakpoint
  - [ ] 13.3 Style cards with Mocha Mantle background
  - [ ] 13.4 Layout: Avatar + name at top, industry/size/contacts/value below
  - [ ] 13.5 Actions in card footer
  - [ ] 13.6 Test responsive behavior on mobile devices

- [ ] 14. Add Companies to sidebar navigation (AC: 1)
  - [ ] 14.1 Open app/(dashboard)/components/Sidebar.tsx or navigation config
  - [ ] 14.2 Add "Companies" nav item below "Contacts"
  - [ ] 14.3 Icon: Building icon from Heroicons
  - [ ] 14.4 Link to /companies route
  - [ ] 14.5 Active state styling (orange gradient) when on /companies

- [ ] 15. Implement success/error toast notifications (AC: 15, 16, 18)
  - [ ] 15.1 Verify ToastContext exists (from Story 2.2)
  - [ ] 15.2 Use toast for create success: "Company created successfully"
  - [ ] 15.3 Use toast for update success: "Company updated successfully"
  - [ ] 15.4 Use toast for delete success: "[Company Name] deleted successfully"
  - [ ] 15.5 Use toast for errors with specific messages
  - [ ] 15.6 Style toasts with Catppuccin Mocha colors (green/red)

- [ ] 16. Test all functionality (AC: ALL)
  - [ ] 16.1 Test page loads with 9 existing companies (from Story 5.1)
  - [ ] 16.2 Test search: type "Fusion" → verify Fusion Cyber appears
  - [ ] 16.3 Test industry filter: select "Technology" → verify filtering
  - [ ] 16.4 Test size filter: select "SMB" → verify filtering
  - [ ] 16.5 Test sort: "Name A-Z" → alphabetical order
  - [ ] 16.6 Test sort: "Most Contacts" → companies with most contacts first
  - [ ] 16.7 Test create company modal with valid data
  - [ ] 16.8 Test create with duplicate name → verify 409 error
  - [ ] 16.9 Test edit company → verify update
  - [ ] 16.10 Test delete company → verify deletion and contact unlinking
  - [ ] 16.11 Test company detail modal → verify contacts/deals display
  - [ ] 16.12 Test responsive: resize to mobile → verify card view
  - [ ] 16.13 Verify all action icons have hover states
  - [ ] 16.14 Verify contacts count is accurate
  - [ ] 16.15 Verify deal value calculation is correct

- [ ] 17. Finalize and commit (AC: ALL)
  - [ ] 17.1 Verify all 9 existing companies are visible
  - [ ] 17.2 Test on deployed Vercel instance
  - [ ] 17.3 Verify search performance <200ms
  - [ ] 17.4 Verify page load time <2 seconds
  - [ ] 17.5 Commit changes with descriptive message
  - [ ] 17.6 Update story status to review

## Dev Notes

### Architecture Requirements

**API Endpoints** [Source: Epics Epic 5 Story 5.2, Architecture§3.3]
- **GET /api/companies** - List companies with filters, sorting, pagination
- **POST /api/companies** - Create new company
- **GET /api/companies/[id]** - Get single company with contacts and deals
- **PUT /api/companies/[id]** - Update company
- **DELETE /api/companies/[id]** - Delete company

**Database Schema** [Source: Story 5.1 migration]
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('Startup', 'SMB', 'Enterprise', NULL)),
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
```

**Foreign Key Relationship** [Source: Story 5.1]
```sql
ALTER TABLE contacts ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX idx_contacts_company ON contacts(company_id);
```

**Query Patterns:**

**1. List companies with counts:**
```sql
SELECT
  companies.*,
  COUNT(DISTINCT contacts.id) as contacts_count,
  COALESCE(SUM(deals.value * deals.probability / 100), 0) as total_deal_value
FROM companies
LEFT JOIN contacts ON contacts.company_id = companies.id
LEFT JOIN deals ON deals.contact_id = contacts.id
WHERE companies.name ILIKE '%search%' OR companies.industry ILIKE '%search%'
GROUP BY companies.id
ORDER BY companies.name ASC
LIMIT 50 OFFSET 0;
```

**2. Check duplicate name (case-insensitive):**
```sql
SELECT id FROM companies WHERE LOWER(name) = LOWER('Acme Corp');
```

**3. Get company with full details:**
```sql
-- Company + contacts
SELECT
  companies.*,
  json_agg(contacts.*) as contacts
FROM companies
LEFT JOIN contacts ON contacts.company_id = companies.id
WHERE companies.id = $1
GROUP BY companies.id;

-- Then fetch deals for those contacts separately
```

### Previous Story Patterns

**From Story 2.3 (Contacts List Page):**
- Page structure: Header → Filter Bar → Table → Pagination
- FilterBar component with search, filter dropdowns, sort dropdown
- Table component with hover states and action icons
- GET /api/contacts endpoint pattern with query params
- Debounced search (300ms)
- Responsive card view for mobile
- ContactAvatar component (reusable for CompanyAvatar)

**From Story 2.2 (Create Contact Form):**
- Modal component structure (backdrop, container, header, body, footer)
- Form validation with inline errors
- Required vs optional fields
- Character counters for text fields
- Success toast after creation
- POST /api/contacts endpoint pattern
- Unique constraint handling (409 Conflict)

**From Story 4.2 (Create Deal Form):**
- Edit modal pattern (reuse create form with pre-population)
- PUT /api/resource/[id] endpoint
- Delete confirmation modal
- DELETE /api/resource/[id] endpoint
- Currency formatting for deal value
- Dropdown with API-fetched options

**From Story 5.1 (Companies Database):**
- companies table schema created
- Indexes for performance
- Foreign key to contacts with ON DELETE SET NULL
- Auto-update trigger for updated_at timestamp
- 9 companies already migrated from contacts data

### Component Architecture

**File Structure:**
```
app/(dashboard)/companies/
├── page.tsx                          # Main companies page
└── components/
    ├── FilterBar.tsx                 # Search and filters
    ├── CompaniesTable.tsx            # Desktop table view
    ├── CompanyCard.tsx               # Mobile card view
    ├── CompanyAvatar.tsx             # Company initials avatar
    ├── CreateCompanyModal.tsx        # Create company form
    ├── EditCompanyModal.tsx          # Edit company form (or reuse Create with mode)
    ├── DeleteConfirmationModal.tsx   # Delete confirmation
    └── CompanyDetailModal.tsx        # View company details

app/api/companies/
├── route.ts                          # GET, POST /api/companies
└── [id]/
    └── route.ts                      # GET, PUT, DELETE /api/companies/[id]
```

**Reusable Components:**
- Toast notifications (from Story 2.2 ToastContext)
- LoadingSpinner (existing)
- EmptyState (existing or create generic)
- Modal backdrop and container (shared pattern)

### UX Design Specifications

**Page Layout** [Source: UX§6.2]
```css
.companies-page {
  padding: 2rem;
  background: var(--mocha-base); /* #1e1e2e */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem; /* 32px */
  font-weight: 800;
  color: var(--mocha-text); /* #cdd6f4 */
}

.page-subtitle {
  font-size: 1rem;
  color: var(--mocha-subtext0); /* #a6adc8 */
  margin-top: 0.5rem;
}
```

**Company Avatar** [Source: UX§4.5]
```css
.company-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  background: var(--mocha-blue); /* Rotate colors */
  color: var(--mocha-base); /* Dark text */
}
```

**Deal Value Cell** [Source: UX§4.5, Story 4.2 currency formatting]
```typescript
const formatCurrency = (value: number | null) => {
  if (value === null || value === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
```

**Action Icons** [Source: UX§4.5]
```css
.action-icon {
  width: 20px;
  height: 20px;
  color: var(--mocha-subtext0); /* #a6adc8 */
  cursor: pointer;
  transition: color 0.2s ease;
}

.action-icon:hover {
  color: var(--innovaas-orange); /* #F25C05 */
}
```

**Delete Button (Danger)** [Source: UX§4.1]
```css
.button-danger {
  background: var(--mocha-red); /* #f38ba8 */
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-danger:hover {
  background: #e56c89; /* Slightly darker red */
  transform: translateY(-2px);
}
```

### Form Validation Rules

**Company Name:**
- Required: Cannot be empty
- Max length: 200 characters
- Unique: Case-insensitive check using LOWER(name)
- Client error: "Company name is required"
- Server error (409): "A company with this name already exists"

**Industry:**
- Optional
- Max length: 100 characters
- No special validation

**Size:**
- Optional
- Must be NULL or one of: "Startup", "SMB", "Enterprise"
- Enforced by CHECK constraint in database

**Website:**
- Optional
- Valid URL format if provided: Must start with http:// or https://
- Regex: `/^https?:\/\/.+/`
- Client error: "Please enter a valid URL starting with http:// or https://"

**Notes:**
- Optional
- Max length: 2000 characters
- Character counter displayed

### Testing Checklist

**Critical Success Tests:**
- [ ] Page loads and displays 9 existing companies from Story 5.1 migration
- [ ] Company names: Blahnik Consulting, Fusion Cyber, Greenwood Consulting, etc.
- [ ] Search "Fusion" returns Fusion Cyber
- [ ] Search "Consulting" returns multiple companies
- [ ] Industry filter works (if industries populated)
- [ ] Size filter works (Startup, SMB, Enterprise)
- [ ] Sort "Name A-Z" alphabetical order
- [ ] Sort "Most Contacts" orders by contact count
- [ ] Create company with valid data succeeds
- [ ] Create with duplicate name shows error
- [ ] Edit company updates successfully
- [ ] Delete company removes from list and unlinks contacts
- [ ] Company detail modal shows contacts and deals
- [ ] Responsive: Table on desktop, cards on mobile
- [ ] All action icons have hover states

**Performance Tests:**
- [ ] Initial page load <2s
- [ ] Search results return <200ms
- [ ] No visible lag when typing in search
- [ ] Table renders smoothly with all companies

**Edge Cases:**
- [ ] Empty search returns all companies
- [ ] Search with no matches shows empty state
- [ ] Table handles long company names gracefully
- [ ] Companies with 0 contacts show "0 contacts"
- [ ] Companies with no deals show "$0.00"
- [ ] Delete company with contacts unlinks contacts (contacts.company_id = NULL)

**Data Integrity:**
- [ ] Verify companies table has 9 records after Story 5.1
- [ ] Verify contacts.company_id populated from migration
- [ ] Verify contacts count matches actual linked contacts
- [ ] Verify deal value calculation includes all deals from company's contacts

### Migration Verification

**Existing Companies (from Story 5.1):**
1. Blahnik Consulting Services, LLC
2. Fusion Cyber
3. Greenwood Consulting
4. Inflection Point Solutions
5. IPE.SERVICES
6. Neural Dawn Consulting
7. OmniCo Consulting
8. Our Union Street
9. SamNova, Inc.

**Expected State After Story 5.1:**
- companies table exists with 9 companies
- contacts table has company_id column (nullable UUID)
- Foreign key constraint: contacts.company_id → companies.id ON DELETE SET NULL
- Indexes: idx_companies_name, idx_contacts_company
- Auto-update trigger: update_companies_updated_at

**Story 5.2 Builds On:**
- UI to view and manage these 9 companies
- Full CRUD operations (create, read, update, delete)
- Search and filter capabilities
- Contact and deal aggregations

### Performance Optimization

**Database Indexes** [Source: Story 5.1, Architecture§4.1]
```sql
-- Already created in Story 5.1:
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_contacts_company ON contacts(company_id);

-- Will use these for performance:
-- Search: idx_companies_name for ILIKE queries on name
-- Joins: idx_contacts_company for contacts WHERE company_id = X
```

**Query Performance Targets:** [Source: Architecture§4.1]
- Company list query (with counts): <500ms
- Search query: <200ms
- Single company detail: <300ms
- Create/update/delete: <100ms

**Optimization Strategies:**
- Use subqueries for counts instead of multiple queries
- Apply LIMIT/OFFSET for pagination
- Cache distinct industries in component state (don't refetch)
- Debounce search to reduce API calls

### API Route Implementation Examples

**GET /api/companies (List):**
```typescript
// app/api/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query params
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const industry = searchParams.get('industry');
  const size = searchParams.get('size');
  const sort = searchParams.get('sort') || 'name-asc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Build query with counts (complex - need proper Supabase query or raw SQL)
  let query = supabase
    .from('companies')
    .select(`
      *,
      contacts:contacts(count)
    `, { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`);
  }
  if (industry) {
    query = query.eq('industry', industry);
  }
  if (size) {
    query = query.eq('size', size);
  }

  // Apply sort
  if (sort === 'name-asc') {
    query = query.order('name', { ascending: true });
  } else if (sort === 'name-desc') {
    query = query.order('name', { ascending: false });
  }
  // Note: Sorting by contacts count or deal value requires custom query

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: companies, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Add deal value calculation (complex join)
  // For now, return companies with contacts count
  return NextResponse.json({
    companies: companies.map(c => ({
      ...c,
      contacts_count: c.contacts?.[0]?.count || 0,
      total_deal_value: 0 // Placeholder
    })),
    pagination: {
      page,
      limit,
      total: count || 0
    }
  });
}
```

**POST /api/companies (Create):**
```typescript
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, industry, size, website, notes } = body;

  // Validation
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ error: 'Company name must be 200 characters or less' }, { status: 400 });
  }
  if (size && !['Startup', 'SMB', 'Enterprise'].includes(size)) {
    return NextResponse.json({ error: 'Invalid company size' }, { status: 400 });
  }

  // Check duplicate (case-insensitive)
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .ilike('name', name)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'A company with this name already exists' }, { status: 409 });
  }

  // Insert
  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: name.trim(),
      industry: industry?.trim() || null,
      size: size || null,
      website: website?.trim() || null,
      notes: notes?.trim() || null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, company }, { status: 201 });
}
```

**DELETE /api/companies/[id]:**
```typescript
// app/api/companies/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companyId = params.id;

  // Delete (FK constraint handles contact unlinking automatically)
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Company deleted successfully' });
}
```

### Deal Value Calculation

**Complex Join for Deal Values:**
```sql
-- Get company with total deal value
SELECT
  companies.*,
  COALESCE(SUM(deals.value * deals.probability / 100), 0) as total_deal_value
FROM companies
LEFT JOIN contacts ON contacts.company_id = companies.id
LEFT JOIN deals ON deals.contact_id = contacts.id
WHERE companies.id = $1
GROUP BY companies.id;
```

**Note:** This is a complex query that may require raw SQL via Supabase `.rpc()` or manual query construction. For MVP, consider:
1. Fetching companies first
2. For each company, fetch contacts count and deal value in separate queries
3. Or use Supabase Edge Function for complex aggregation
4. Or create a PostgreSQL VIEW for companies with aggregates

### References

**Source Documentation:**
- [Epics.md Epic 5 Story 5.2](../epics.md) - Complete story requirements
- [Architecture.md §3.3](../Architecture.md) - API route patterns
- [Architecture.md §4.1](../Architecture.md) - Performance targets and indexes
- [UX-Design.md §4.1](../UX-Design.md) - Button styling
- [UX-Design.md §4.5](../UX-Design.md) - Table styling
- [UX-Design.md §4.6](../UX-Design.md) - Modal design
- [UX-Design.md §6.2](../UX-Design.md) - List page layout
- [UX-Design.md §9.2](../UX-Design.md) - Responsive behavior

**Previous Stories:**
- [Story 5.1](./5-1-companies-database-table-data-migration.md) - Companies table creation and migration
- [Story 2.3](./2-3-contacts-list-page-search-filtering.md) - List page pattern
- [Story 2.2](./2-2-manual-contact-creation-form-campaign-assignment.md) - Create modal pattern
- [Story 4.2](./4-2-create-deal-form-contact-linking.md) - Edit/delete modal patterns
- [Story 3.2](./3-2-csv-upload-page-multistep-flow.md) - Modal component patterns

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)
- Epic 5 Story 5.2 complete context analyzed from epics.md
- Architecture documentation reviewed: API patterns, database schema, performance targets
- UX Design specifications reviewed: Table, modal, button, responsive patterns
- Previous similar stories analyzed: Story 2.3 (Contacts List), Story 2.2 (Contact Form), Story 4.2 (Deal CRUD)
- Story 5.1 companies migration context incorporated (9 existing companies)
- Git commit history analyzed for established patterns
- Comprehensive developer guide created with all specifications

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story creation phase

### Completion Notes List

**Story Creation Complete:**
- ✅ 25 comprehensive acceptance criteria from epics file
- ✅ Complete API endpoint specifications (GET/POST/PUT/DELETE)
- ✅ Detailed filter bar with search, industry filter, size filter, sort
- ✅ Companies table with 6 columns and action icons
- ✅ Create/Edit/Delete modal specifications
- ✅ Company detail modal with contacts and deals
- ✅ Responsive card view for mobile
- ✅ Form validation rules for all fields
- ✅ Database query patterns for complex joins (contacts count, deal value sum)
- ✅ Success/error flow handling with toasts
- ✅ 17 task groups with 100+ subtasks
- ✅ Architecture compliance notes
- ✅ Previous story patterns incorporated (Story 2.3, 2.2, 4.2)
- ✅ Performance optimization strategies
- ✅ Currency formatting utilities
- ✅ Testing checklist with 9 existing companies
- ✅ Complete reference documentation

**Ready for Implementation:**
- Story marked as `ready-for-dev`
- All implementation details provided
- Exact file paths and component structure specified
- API endpoint request/response examples provided
- Database query patterns documented
- Reuse patterns from existing stories identified
- 9 existing companies from Story 5.1 ready to display

### File List

**Files to Create:**
- `app/(dashboard)/companies/page.tsx` - Main companies list page
- `app/(dashboard)/companies/components/FilterBar.tsx` - Search and filter controls
- `app/(dashboard)/companies/components/CompaniesTable.tsx` - Desktop table view
- `app/(dashboard)/companies/components/CompanyCard.tsx` - Mobile card view
- `app/(dashboard)/companies/components/CompanyAvatar.tsx` - Reusable avatar component
- `app/(dashboard)/companies/components/CreateCompanyModal.tsx` - Create company form
- `app/(dashboard)/companies/components/EditCompanyModal.tsx` - Edit company form (or reuse Create)
- `app/(dashboard)/companies/components/DeleteConfirmationModal.tsx` - Delete confirmation
- `app/(dashboard)/companies/components/CompanyDetailModal.tsx` - View company details
- `app/api/companies/route.ts` - GET/POST /api/companies
- `app/api/companies/[id]/route.ts` - GET/PUT/DELETE /api/companies/[id]

**Files to Update:**
- Sidebar navigation component - Add "Companies" nav item
- ToastContext (verify exists and reuse from Story 2.2)

**Files to Verify:**
- `lib/supabase/client.ts` - Supabase browser client (exists from Story 1.2)
- `lib/supabase/server.ts` - Supabase server client (exists from Story 1.2)
- `app/(dashboard)/components/Toast.tsx` - Toast component (from Story 2.2)
- Companies database table and indexes (created in Story 5.1)
