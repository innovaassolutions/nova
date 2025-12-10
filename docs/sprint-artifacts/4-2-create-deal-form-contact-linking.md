# Story 4.2: Create Deal Form with Contact Linking

Status: Ready for Review

## Story

As a sales team member (Marcus),
I want to create a new deal linked to a contact with value, probability, and stage information,
so that I can start tracking a sales opportunity.

## Acceptance Criteria

**AC1: Deal Creation Button on Contact Detail Page**
**Given** I am viewing a contact detail page [Source: Epics Epic 4 Story 4.2]
**When** I see the page layout
**Then** a "+ New Deal" button is displayed:
- Location: Page header, right side (consistent with "+ New Contact" button placement from Story 2.2)
- Style: Orange primary button (#F25C05)
- Text: "+ New Deal"
- Icon: Plus icon from lucide-react
- Hover state: Darken to #D94F04

**AC2: Deal Creation Modal Opens**
**Given** I click the "+ New Deal" button [Source: Epics Epic 4 Story 4.2, UX §4.6]
**When** the button is clicked
**Then** a modal opens with:
- Width: 600px (standard form modal)
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 16px
- Backdrop: Semi-transparent overlay (rgba(0,0,0,0.7))
- Title: "Create New Deal"
- Close X button in top-right corner

**Modal behavior:**
- Centered on screen
- Closes on backdrop click (with confirmation if form dirty)
- Closes on ESC key (with confirmation if form dirty)
- Prevents body scroll when open

**AC3: Deal Form Fields - Contact Context (Read-Only)**
**Given** the modal opened from a contact detail page [Source: Epics Epic 4 Story 4.2]
**When** the form loads
**Then** the contact field displays:
- Label: "For:" (above contact info)
- Format: "[Contact Name] ([Company])"
- Example: "John Smith (Acme Corp)"
- Style: Read-only, gray text, 1rem font size
- Hidden field: contact_id stored for API submission
- Note: Contact cannot be changed when creating from contact page

**AC4: Deal Form Fields - Deal Title (Required)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.1]
**When** I interact with the Deal Title field
**Then** the field specifications are:
- Label: "Deal Title *" (asterisk for required)
- Input type: text
- Max length: 200 characters
- Placeholder: "e.g., Q1 Enterprise License"
- Validation: Cannot be empty
- Error message: "Deal title is required"
- Error display: Red text (Mocha Red #f38ba8), 0.875rem, below field
- Character counter: "X/200" (gray, 0.75rem, bottom-right)

**AC5: Deal Form Fields - Deal Value (Optional)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.2]
**When** I interact with the Deal Value field
**Then** the field specifications are:
- Label: "Deal Value ($)"
- Input type: number with currency formatting
- Prefix: $ symbol (displayed in input)
- Placeholder: "0.00"
- Min: 0
- Max: 99999999.99
- Step: 0.01
- Format: Display with 2 decimal places (e.g., $50,000.00)
- Validation: Must be positive number if provided
- Error message: "Value must be a positive number"
- Optional: Can be left empty

**Currency formatting:**
- Use Intl.NumberFormat for display: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Store as number in database (not string)

**AC6: Deal Form Fields - Win Probability (Optional)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.3]
**When** I interact with the Win Probability field
**Then** the field specifications are:
- Label: "Win Probability (%)"
- Input type: number with % suffix
- Default value: 50 (pre-filled)
- Min: 0
- Max: 100
- Step: 5 (increments of 5% for easier selection)
- Display: Integer value with "%" symbol
- Validation: Must be integer between 0-100
- Error message: "Probability must be between 0 and 100"
- Optional: Can be changed from default

**UI enhancement:**
- Consider range slider (0-100) with number input for dual control
- Display color coding: <30% (red), 30-70% (yellow), >70% (green)

**AC7: Deal Form Fields - Pipeline Stage (Required)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.4]
**When** I interact with the Pipeline Stage field
**Then** the field specifications are:
- Label: "Pipeline Stage *" (required)
- Input type: Dropdown select
- Options: Fetched from GET /api/pipeline-stages
- Default: First stage by order_num ("Initial LinkedIn Connect")
- Display format: "[order_num]. [stage_name]"
- Example options:
  - "1. Initial LinkedIn Connect"
  - "2. First Conversation"
  - "3. Email Engaged"
  - (... 8 total stages)
- Validation: Must select a stage
- Error message: "Please select a pipeline stage"

**API integration:**
- Fetch stages on modal open
- Cache stages in component state (don't refetch on every open)
- Handle loading state: Show spinner while fetching
- Handle error state: Display "Unable to load pipeline stages" with retry button

**AC8: Deal Form Fields - Expected Close Date (Optional)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.5]
**When** I interact with the Expected Close Date field
**Then** the field specifications are:
- Label: "Expected Close Date"
- Input type: Date picker (HTML5 date input or react-datepicker)
- Format: MM/DD/YYYY
- Min date: Today (cannot select past dates)
- Default: Empty (user must explicitly set)
- Validation: Must be today or future date if provided
- Error message: "Close date cannot be in the past"
- Optional: Can be left empty

**Date picker behavior:**
- Calendar popup for easy date selection
- Today button for quick selection
- Clear button to remove date

**AC9: Deal Form Fields - Notes (Optional)**
**Given** the form is displayed [Source: Epics Epic 4 Story 4.2, FR5.6]
**When** I interact with the Notes field
**Then** the field specifications are:
- Label: "Notes"
- Input type: Textarea
- Rows: 4 (initial height)
- Max length: 2000 characters
- Placeholder: "Add context, next steps, or important details..."
- Character counter: "X/2000" (bottom-right, 0.75rem, gray)
- Validation: No validation (optional field)
- Auto-resize: Expand height as user types (max 8 rows)

**AC10: Form Submission - Create Deal**
**Given** I have filled required fields (title, stage) [Source: Epics Epic 4 Story 4.2, Architecture §3.3]
**When** I click the "Create Deal" button
**Then** the system performs:
1. Client-side validation of all fields
2. If validation fails: Display inline error messages (AC11)
3. If validation succeeds:
   - Disable submit button
   - Show loading spinner on button
   - Call POST /api/deals with payload:
     ```json
     {
       "contact_id": "<uuid>",
       "title": "Deal title text",
       "value": 50000.00,
       "probability": 75,
       "stage_id": "<stage_uuid>",
       "expected_close_date": "2024-12-31",
       "notes": "Optional notes text"
     }
     ```
4. Backend processes request (AC12)
5. On success: AC13 success flow
6. On error: AC14 error handling

**AC11: Form Validation - Inline Errors**
**Given** form validation fails [Source: Epics Epic 4 Story 4.2, UX §8.2]
**When** I attempt to submit with invalid data
**Then** error messages display:
- Position: Below each invalid field
- Style: Red text (Mocha Red #f38ba8), 0.875rem font size
- Icon: X icon from lucide-react (red)
- Specific error per field (see AC4-AC9 for messages)
- Submit button remains enabled (allow retry)
- Form does not submit until all errors resolved

**Field-specific validation:**
- Deal Title: Required, 1-200 characters
- Deal Value: Optional, must be positive number ≤99999999.99
- Win Probability: Optional, must be integer 0-100
- Pipeline Stage: Required, must be valid stage_id
- Expected Close Date: Optional, must be today or future
- Notes: Optional, max 2000 characters

**AC12: Backend API - Create Deal Endpoint**
**Given** frontend calls POST /api/deals [Source: Epics Epic 4 Story 4.2, Architecture §3.3]
**When** the API receives the request
**Then** the backend performs:

1. **Authentication check:**
   - Verify Supabase session exists
   - Extract user.id from session
   - Return 401 Unauthorized if not authenticated

2. **Request validation:**
   - Validate required fields: contact_id, title, stage_id
   - Validate data types and constraints
   - Return 400 Bad Request with error details if invalid

3. **Database operations:**
   ```typescript
   // Insert deal
   const { data: deal, error } = await supabase
     .from('deals')
     .insert({
       contact_id: body.contact_id,
       title: body.title,
       value: body.value || null,
       probability: body.probability || null,
       stage_id: body.stage_id,
       expected_close_date: body.expected_close_date || null,
       notes: body.notes || null,
       owner_id: user.id, // Current user
       status: 'Open' // Default status
     })
     .select()
     .single();
   ```

4. **Create initial stage history entry:**
   ```typescript
   await supabase
     .from('deal_stage_history')
     .insert({
       deal_id: deal.id,
       from_stage_id: null, // First stage
       to_stage_id: body.stage_id,
       changed_by: user.id,
       notes: 'Deal created'
     });
   ```

5. **Response:**
   - Success: Return 201 Created with deal object
   - Error: Return 500 Internal Server Error with message

**File location:** `novacrm/app/api/deals/route.ts`

**AC13: Success Flow - Deal Created**
**Given** POST /api/deals returns success [Source: Epics Epic 4 Story 4.2, UX §8.1]
**When** the deal is created
**Then** the system:
1. Closes the modal
2. Displays success toast notification:
   - Message: "Deal created successfully"
   - Style: Green background (Mocha Green #a6e3a1)
   - Duration: 3 seconds
   - Position: Top-right corner
   - Icon: Checkmark icon
3. Refreshes contact detail page to display new deal
4. New deal appears in contact's deals list (if deals list component exists)
5. Clears form state (prepare for next use)

**AC14: Error Handling - API Failure**
**Given** POST /api/deals returns error [Source: UX §8.2]
**When** the API call fails
**Then** the system:
1. Keeps modal open
2. Displays error toast notification:
   - Message: API error message or "Failed to create deal. Please try again."
   - Style: Red background (Mocha Red #f38ba8)
   - Duration: 5 seconds
   - Position: Top-right corner
   - Icon: X icon
3. Re-enables submit button
4. Preserves form data (don't clear fields)
5. Allows user to retry submission

**Error scenarios:**
- Network failure: "Network error. Please check your connection."
- 401 Unauthorized: "Session expired. Please log in again."
- 400 Bad Request: Display specific validation error from API
- 500 Server Error: "An unexpected error occurred. Please try again."

**AC15: Deal Creation from Deals Page (Alternative Flow)**
**Given** I click "+ New Deal" from the Deals page (not contact page) [Source: Epics Epic 4 Story 4.2]
**When** the modal opens
**Then** the form includes a Contact dropdown field:
- Label: "Contact *" (required)
- Input type: Searchable dropdown (combobox)
- Options: All contacts from GET /api/contacts
- Search: Filter by first_name, last_name, or company
- Display format: "[First Name] [Last Name] ([Company])"
- Autocomplete: Live filtering as user types
- Required: Must select a contact
- Error: "Please select a contact"

**Implementation notes:**
- Use separate component: `app/(dashboard)/deals/components/CreateDealModal.tsx`
- Contact selector uses same pattern as Campaign multi-select (Story 2.2)
- All other fields identical to contact page version
- Consider component composition: Shared form with conditional contact field

**AC16: Pipeline Stages API Endpoint**
**Given** frontend needs pipeline stages [Source: Epics Epic 4 Story 4.2]
**When** GET /api/pipeline-stages is called
**Then** return all stages:

```typescript
// GET /api/pipeline-stages
export async function GET(request: Request) {
  const supabase = createClient();

  const { data: stages, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('is_active', true)
    .order('order_num', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stages }, { status: 200 });
}
```

**File location:** `novacrm/app/api/pipeline-stages/route.ts`

**Response format:**
```json
{
  "stages": [
    {
      "id": "uuid",
      "name": "Initial LinkedIn Connect",
      "order_num": 1,
      "is_active": true,
      "created_at": "2024-12-09T..."
    },
    ...
  ]
}
```

## Tasks / Subtasks

- [x] Task 1: Create Pipeline Stages API endpoint (AC16)
  - [x] 1.1 Create file: app/api/pipeline-stages/route.ts
  - [x] 1.2 Implement GET handler with Supabase query
  - [x] 1.3 Filter by is_active = true
  - [x] 1.4 Order by order_num ascending
  - [x] 1.5 Add error handling
  - [x] 1.6 Test endpoint manually (curl or Postman)

- [x] Task 2: Create Deals API endpoint (AC12)
  - [x] 2.1 Create file: app/api/deals/route.ts
  - [x] 2.2 Implement POST handler with authentication check
  - [x] 2.3 Validate request body (required fields, types)
  - [x] 2.4 Insert deal into deals table
  - [x] 2.5 Set owner_id from current user session
  - [x] 2.6 Create initial deal_stage_history entry
  - [x] 2.7 Return created deal with 201 status
  - [x] 2.8 Add comprehensive error handling
  - [x] 2.9 Test endpoint manually

- [x] Task 3: Create CreateDealModal component (Contact page version) (AC2-AC10)
  - [x] 3.1 Create file: app/(dashboard)/contacts/components/CreateDealModal.tsx
  - [x] 3.2 Implement modal shell (backdrop, container, close button)
  - [x] 3.3 Add contact context display (read-only, from props)
  - [x] 3.4 Implement Deal Title field with validation
  - [x] 3.5 Implement Deal Value field with currency formatting
  - [x] 3.6 Implement Win Probability field with range/number input
  - [x] 3.7 Implement Pipeline Stage dropdown with API fetch
  - [x] 3.8 Implement Expected Close Date picker
  - [x] 3.9 Implement Notes textarea with character counter
  - [x] 3.10 Add form state management (useState or useForm)
  - [x] 3.11 Implement client-side validation
  - [x] 3.12 Implement form submission handler
  - [x] 3.13 Add loading states (button spinner, disabled fields)
  - [x] 3.14 Add inline error message display

- [x] Task 4: Integrate CreateDealModal with Contact Detail page (AC1)
  - [x] 4.1 Find contact detail page component
  - [x] 4.2 Add "+ New Deal" button to page header
  - [x] 4.3 Import CreateDealModal component
  - [x] 4.4 Add modal open/close state
  - [x] 4.5 Pass contact_id prop to modal
  - [x] 4.6 Handle modal close and refresh contact page

- [x] Task 5: Implement success/error notifications (AC13-AC14)
  - [x] 5.1 Install/use toast library (react-hot-toast or sonner)
  - [x] 5.2 Create toast success handler
  - [x] 5.3 Create toast error handler
  - [x] 5.4 Style toasts with Catppuccin Mocha colors
  - [x] 5.5 Test success and error flows

- [ ] Task 6: Create CreateDealModal for Deals page (optional, AC15)
  - [ ] 6.1 Create file: app/(dashboard)/deals/components/CreateDealModal.tsx
  - [ ] 6.2 Add Contact searchable dropdown field
  - [ ] 6.3 Fetch contacts from GET /api/contacts
  - [ ] 6.4 Implement contact search/filter logic
  - [ ] 6.5 Reuse form fields from contact page version
  - [ ] 6.6 Test modal from Deals page context

- [ ] Task 7: Test complete flow (AC1-AC14)
  - [ ] 7.1 Test modal open/close
  - [ ] 7.2 Test all field validations
  - [ ] 7.3 Test successful deal creation
  - [ ] 7.4 Verify deal appears in database
  - [ ] 7.5 Verify deal_stage_history entry created
  - [ ] 7.6 Test error scenarios (network, validation, server)
  - [ ] 7.7 Test toast notifications
  - [ ] 7.8 Test form reset after success

## Dev Notes

### Architecture Compliance

**API Routes** [Source: Architecture.md §3.3]
- POST /api/deals - Create new deal
- GET /api/pipeline-stages - Fetch pipeline stages
- Follow Next.js 15 App Router API route patterns
- Use Supabase SSR client for server-side operations
- Return proper HTTP status codes (200, 201, 400, 401, 500)
- Include error messages in response body

**Authentication** [Source: Architecture.md §3.1]
- Use createClient() from @/lib/supabase/server
- Extract user from session: `const { data: { user } } = await supabase.auth.getUser()`
- Set owner_id to current user.id automatically
- Return 401 if session invalid or missing

**Database Operations** [Source: Architecture.md §2.3.6, §2.3.7]
- Insert into deals table with proper foreign keys
- Create deal_stage_history entry on deal creation (initial stage assignment)
- Use .select().single() to return created deal
- Handle foreign key constraint errors gracefully

**Frontend Patterns** [Source: Story 2.2, Story 3.2]
- Modal component with backdrop and close handlers
- Form validation with inline error messages
- Loading states during API calls
- Toast notifications for feedback
- Consistent button styling (orange primary, gray secondary)

### Project Structure Notes

**File Structure:**
```
novacrm/
├── app/
│   ├── api/
│   │   ├── deals/
│   │   │   └── route.ts                    # POST /api/deals (NEW)
│   │   └── pipeline-stages/
│   │       └── route.ts                    # GET /api/pipeline-stages (NEW)
│   └── (dashboard)/
│       ├── contacts/
│       │   └── [id]/
│       │       └── components/
│       │           └── CreateDealModal.tsx # Modal for contact page (NEW)
│       └── deals/
│           └── components/
│               └── CreateDealModal.tsx     # Modal for deals page (NEW, optional)
```

**Component Architecture:**
- CreateDealModal: Client component ("use client")
- Use React hooks: useState for form state, useEffect for data fetching
- Consider extracting shared form logic to custom hook (useDealForm)
- Modal backdrop prevents body scroll (body overflow:hidden when open)

**Styling:**
- TailwindCSS utility classes
- Catppuccin Mocha color palette
- Consistent with existing forms (Story 2.2, Story 3.2)
- Responsive design (works on mobile, though primary use is desktop)

### Testing Standards Summary

**Manual Testing Checklist:**
1. **Modal behavior:**
   - Opens on button click
   - Closes on X button, ESC key, backdrop click
   - Prevents body scroll when open
   - Form dirty warning on close

2. **Form validation:**
   - Required fields: title, stage
   - Optional fields: value, probability, close date, notes
   - Field-specific validation (see AC4-AC9)
   - Inline error messages display correctly

3. **API integration:**
   - Pipeline stages load correctly
   - Deal creation succeeds with valid data
   - Error handling for failed API calls
   - Loading states display appropriately

4. **Data verification:**
   - Deal inserted into deals table with correct data
   - deal_stage_history entry created
   - owner_id set to current user
   - status defaults to 'Open'

5. **User experience:**
   - Success toast appears after creation
   - Modal closes automatically on success
   - Form resets after successful creation
   - Error toast appears on failure

**Test Data:**
- Use existing contact from Story 2.2/2.3
- Test with all field combinations (required only, all filled, etc.)
- Test validation errors for each field
- Test with existing pipeline stages from Story 1.2

**No automated tests required** (per project pattern - manual testing sufficient for MVP)

### Previous Story Intelligence

**Learnings from Story 3.2 (CSV Upload Modal):**
- Modal component structure: backdrop, container, header, body, footer
- Multi-step flow patterns (not needed for this story, but reference for modal structure)
- Loading states during async operations
- Toast notifications for success/error feedback
- Form validation with inline errors

**Learnings from Story 2.2 (Create Contact Form):**
- Form field patterns: text, textarea, dropdown, multi-select
- Campaign dropdown with API fetch (similar pattern for pipeline stages)
- Required field validation
- Character counters for text fields
- Success toast and page refresh after creation

**Learnings from Story 4.1 (Deals Table):**
- deals table structure and foreign keys
- deal_stage_history table for audit trail
- Pipeline stages seeded in database (8 stages)
- RLS policies for authenticated users
- owner_id automatically set from session

### Git Intelligence Summary

**Recent Commits Relevant to This Story:**
- `7cc2752` - Story 3.5: Campaign CRUD Interface (Admin Settings)
- `e0dee85` - Story 3.2: CSV Upload Page - Multistep Flow (modal patterns)
- `39e5812` - Story 2.2: Manual Contact Creation Form (form patterns)

**Code Patterns Established:**
- API routes in `app/api/[resource]/route.ts`
- Modal components in `app/(dashboard)/[page]/components/[Modal].tsx`
- Supabase client: createClient() from @/lib/supabase/server
- Toast notifications: Likely using react-hot-toast or sonner
- Form validation: Client-side with inline error display

**Libraries and Dependencies:**
- @supabase/supabase-js, @supabase/ssr (database)
- react-hot-toast or sonner (toasts)
- lucide-react (icons)
- TailwindCSS (styling)
- Consider: react-datepicker or HTML5 date input (date picker)
- Consider: @headlessui/react or radix-ui (combobox for contact search in AC15)

### File Structure Requirements

**Files Created:**
1. `novacrm/app/api/deals/route.ts` - Deals API endpoint (POST)
2. `novacrm/app/api/pipeline-stages/route.ts` - Pipeline stages API endpoint (GET)
3. `novacrm/app/(dashboard)/contacts/[id]/components/CreateDealModal.tsx` - Deal creation modal (contact page)
4. `novacrm/app/(dashboard)/deals/components/CreateDealModal.tsx` - Deal creation modal (deals page, optional)

**Files Modified:**
- Contact detail page component (add "+ New Deal" button and modal integration)
- Possibly: Deals list page component (add "+ New Deal" button for AC15)

**Files Referenced:**
- `novacrm/supabase/migrations/*_deals_schema.sql` (from Story 4.1)
- `lib/types/database.types.ts` (TypeScript types for deals)
- Existing modal components (Story 2.2, Story 3.2) for pattern reference
- `lib/supabase/server.ts` or `client.ts` (Supabase client utilities)

### Currency and Number Formatting

**Currency Display:**
```typescript
// Format currency for display
const formatCurrency = (value: number | null) => {
  if (value === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Parse currency input to number
const parseCurrency = (input: string): number | null => {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};
```

**Probability Display:**
```typescript
// Probability as integer with % symbol
const formatProbability = (value: number | null) => {
  if (value === null) return '';
  return `${Math.round(value)}%`;
};
```

### References

**Architecture Documentation:**
- [Architecture.md §3.3](../Architecture.md) - Deals API routes
- [Architecture.md §3.1](../Architecture.md) - Authentication and session management
- [Architecture.md §2.3.6](../Architecture.md) - Deals table schema
- [Architecture.md §2.3.7](../Architecture.md) - Deal stage history table

**PRD Requirements:**
- [PRD.md FR5.1](../PRD.md) - Deal creation
- [PRD.md FR5.2](../PRD.md) - Deal value tracking
- [PRD.md FR5.3](../PRD.md) - Win probability
- [PRD.md FR5.4](../PRD.md) - Pipeline stage assignment
- [PRD.md FR5.5](../PRD.md) - Expected close date
- [PRD.md FR5.6](../PRD.md) - Deal notes
- [PRD.md FR5.7](../PRD.md) - Stage change history
- [PRD.md FR5.8](../PRD.md) - Deal status

**UX Design:**
- [UX.md §4.6](../UX-Design.md) - Modal design patterns
- [UX.md §8.1](../UX-Design.md) - Success toast notifications
- [UX.md §8.2](../UX-Design.md) - Error message display

**Epic Context:**
- [epics.md Epic 4 Story 4.2](../epics.md) - Complete acceptance criteria
- [epics.md Epic 4](../epics.md) - Epic goal and user value

**Previous Stories:**
- [Story 4.1](./4-1-deals-database-table-pipeline-stage-relationships.md) - Deals database schema
- [Story 2.2](./2-2-manual-contact-creation-form-campaign-assignment.md) - Contact creation form patterns
- [Story 3.2](./3-2-csv-upload-page-multistep-flow.md) - Modal component patterns

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)
- Epic 4 Story 4.2 complete context analyzed
- Architecture documentation for deals API, authentication, database thoroughly reviewed
- Previous form and modal stories (2.2, 3.2) patterns incorporated
- Git commit history analyzed for established patterns
- Comprehensive developer guide created with all specifications

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story creation phase

### Completion Notes List

**Story Creation Complete:**
- ✅ Comprehensive acceptance criteria from epics file
- ✅ Complete API endpoint specifications (POST /api/deals, GET /api/pipeline-stages)
- ✅ Detailed form field specifications with validation
- ✅ Modal design and behavior documentation
- ✅ Success/error flow handling
- ✅ Task breakdown with clear subtasks
- ✅ Architecture compliance notes
- ✅ Previous story learnings incorporated
- ✅ Currency and number formatting utilities
- ✅ Complete reference documentation

**Story Implementation Complete (2025-12-10):**
- ✅ Created GET /api/pipeline-stages endpoint
- ✅ Created POST /api/deals endpoint with full validation
- ✅ Implemented authentication check and user session extraction
- ✅ Created deal_stage_history entry on deal creation
- ✅ Built CreateDealModal component with all form fields
- ✅ Implemented form validation (title, value, probability, stage, date, notes)
- ✅ Added currency formatting for deal value field
- ✅ Added range slider + number input for win probability
- ✅ Integrated pipeline stages API with loading states
- ✅ Added "+ New Deal" button to ContactDetailModal header
- ✅ Implemented modal open/close with dirty form warning
- ✅ Success and error toast notifications using existing ToastContext
- ✅ Form reset after successful deal creation
- ✅ Refresh contact data after deal created
- ✅ All required fields validated, optional fields handled correctly
- ✅ Error handling for network, validation, and server errors

### File List

**Created:**
- `novacrm/app/api/deals/route.ts`
- `novacrm/app/api/pipeline-stages/route.ts`
- `novacrm/app/(dashboard)/contacts/components/CreateDealModal.tsx`

**Modified:**
- `novacrm/app/(dashboard)/contacts/components/ContactDetailModal.tsx`

**Referenced:**
- Story 2.2, Story 3.2 modal/form patterns
- Story 4.1 deals schema and database tables
- Existing Supabase client utilities
- Existing ToastContext for notifications
