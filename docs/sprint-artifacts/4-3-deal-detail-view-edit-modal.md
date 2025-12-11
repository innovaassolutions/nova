# Story 4.3: Deal Detail View & Edit Modal

Status: Ready for Review

## Story

As a sales team member,
I want to view complete deal details and edit information including stage progression,
so that I can maintain accurate deal records and track sales progress.

## Acceptance Criteria

**AC1: Deal Detail Modal Opens**
**Given** I am viewing a contact detail page with deals [Source: Epics Epic 4 Story 4.3]
**When** I click a deal card or view icon
**Then** a deal detail modal opens with:
- Width: 800px (wider for two-column layout)
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 16px
- Backdrop: Semi-transparent overlay
- Top bar: Back button (←), [Edit] button, [Delete] button

**AC2: Deal Header Display**
**Given** the modal is open [Source: Epics Epic 4 Story 4.3, UX §6.5]
**When** I view the header section
**Then** I see:
- Deal title: 1.5rem, weight 800, Mocha Text
- Value and probability: 1rem, weight 600, inline format "$50,000 • 75% probability"
- Currency format: Comma separators (e.g., $50,000)

**AC3: Pipeline Progress Bar**
**Given** the modal displays deal info [Source: UX §6.5]
**When** I view the progress section
**Then** I see:
- Visual progress bar indicating current stage position
- Filled portion: Orange gradient (#F25C05)
- Empty portion: Mocha Surface1 (#45475a)
- Current stage label below bar (e.g., "Proposal Sent")
- Stage position: "Stage 5 of 8"
- Progress calculation: (current stage order_num - 1) / (total stages - 1) * 100

**AC4: Deal Information Panel (Left Column)**
**Given** the modal displays two-column layout [Source: Epics Epic 4 Story 4.3]
**When** I view the left panel
**Then** I see read-only fields:
- **Contact:** Name (clickable link to contact detail) + Company (below, Mocha Subtext0)
- **Value:** Currency formatted (e.g., "$50,000.00")
- **Probability:** Percentage (e.g., "75%")
- **Status:** Badge component - Green "Open", Blue "Won", Red "Lost" (UX §4.4)
- **Expected Close:** Date formatted (e.g., "Dec 31, 2024")
- **Owner:** User name (e.g., "Marcus")
- **Created:** Relative date (e.g., "Dec 1, 2024")
- **Updated:** Relative date (e.g., "Dec 8, 2024")
- **Notes:** Display notes text (editable)

**Label styling:**
- Font size: 0.875rem
- Weight: 600
- Color: Mocha Subtext0

**Value styling:**
- Font size: 1rem
- Weight: 400
- Color: Mocha Text

**AC5: Stage Timeline Panel (Right Column)**
**Given** the modal displays two-column layout [Source: FR5.7, UX §6.5]
**When** I view the right panel
**Then** I see stage change timeline:
- Title: "Stage Timeline"
- Entries: Reverse chronological (newest first)
- Each entry displays:
  - Date and time (e.g., "Dec 8, 2024 2:30 PM")
  - Action: "Moved to [Stage Name]"
  - User: "by [User Name]"
  - Notes: Optional notes from stage change
- Visual: Vertical timeline with dots and connecting lines
- Entries loaded from deal_stage_history table

**Timeline entry styling:**
- Dot: 8px circle, Orange fill
- Connecting line: 2px solid, Mocha Surface1
- Text: 0.875rem, Mocha Text
- Date: 0.75rem, Mocha Subtext0

**AC6: Notes Section (Editable)**
**Given** the modal displays notes [Source: FR5.6]
**When** I interact with the notes field
**Then** the notes behavior:
- Display: Editable textarea
- Save button: Appears when notes modified
- Auto-save: On blur or 3s after last keystroke
- Character counter: "X/2000"
- Success feedback: "Notes saved" toast (green, 2s)

**AC7: Edit Mode Activation**
**Given** I am viewing deal details [Source: Epics Epic 4 Story 4.3]
**When** I click the [Edit] button
**Then** the modal transforms to edit mode:
- All fields become editable inputs
- Field styling: Same as creation form (Story 4.2)
- Pipeline stage: Dropdown select
- Status: Radio buttons (Open / Won / Lost)
- Footer buttons: [Cancel] (gray) and [Save Changes] (orange)
- Form validation: Same as Story 4.2

**Fields editable:**
- Title (text input, required, max 200 chars)
- Value (currency input, optional)
- Probability (number input 0-100, optional)
- Pipeline Stage (dropdown, required)
- Expected Close Date (date picker, optional)
- Notes (textarea, optional, max 2000 chars)
- Status (radio buttons, required)

**Fields NOT editable:**
- Contact (fixed to original contact)
- Owner (fixed to original owner - future V2.0 may allow reassignment)
- Created date (immutable)

**AC8: Stage Change Confirmation**
**Given** I change the pipeline stage in edit mode [Source: Epics Epic 4 Story 4.3]
**When** the stage dropdown value changes
**Then** a stage change confirmation modal appears:
- Title: "Move deal to [New Stage]?"
- Message: "This will update the deal stage and record the change in history."
- Notes field: "Add notes about this stage change..." (optional, textarea)
- Buttons: [Cancel] (secondary) and [Move to Stage] (orange primary)

**On confirmation:**
- Update deal stage_id
- Create deal_stage_history entry:
  - deal_id: Current deal
  - from_stage_id: Previous stage
  - to_stage_id: New stage
  - changed_by: Current user
  - changed_at: NOW()
  - notes: User-provided notes

**AC9: Save Changes - Update Deal**
**Given** I made edits and click [Save Changes] [Source: Epics Epic 4 Story 4.3, Architecture §3.3]
**When** the form submits
**Then** the system:
1. Validates all fields (client-side)
2. Calls PUT /api/deals/[id] with payload:
   ```json
   {
     "title": "Updated deal title",
     "value": 60000.00,
     "probability": 80,
     "stage_id": "<new_stage_uuid>",
     "expected_close_date": "2024-12-31",
     "notes": "Updated notes",
     "status": "Open"
   }
   ```
3. Backend updates deals table (AC10)
4. If stage changed: Creates stage history entry
5. If status changed to Won/Lost: Sets closed_at = NOW()
6. Shows success toast: "Deal updated successfully" (green, 3s)
7. Refreshes modal with updated data
8. Returns to view mode

**AC10: Backend API - Update Deal Endpoint**
**Given** frontend calls PUT /api/deals/[id] [Source: Architecture §3.3]
**When** the API receives the request
**Then** the backend performs:

1. **Authentication check:**
   - Verify Supabase session
   - Extract user.id
   - Return 401 if not authenticated

2. **Authorization check (MVP):**
   - All authenticated users can edit all deals (FR11.1)
   - Future V2.0: Check if user is owner or admin

3. **Request validation:**
   - Validate required fields: title, stage_id, status
   - Validate data types and constraints
   - Return 400 if invalid

4. **Database operations:**
   ```typescript
   const { data: updatedDeal, error } = await supabase
     .from('deals')
     .update({
       title: body.title,
       value: body.value || null,
       probability: body.probability || null,
       stage_id: body.stage_id,
       expected_close_date: body.expected_close_date || null,
       notes: body.notes || null,
       status: body.status,
       closed_at: body.status !== 'Open' ? new Date().toISOString() : null
     })
     .eq('id', dealId)
     .select()
     .single();
   ```

5. **Stage history (if stage changed):**
   ```typescript
   if (body.stage_id !== originalStageId) {
     await supabase
       .from('deal_stage_history')
       .insert({
         deal_id: dealId,
         from_stage_id: originalStageId,
         to_stage_id: body.stage_id,
         changed_by: user.id,
         notes: body.stage_change_notes || null
       });
   }
   ```

6. **Response:**
   - Success: Return 200 OK with updated deal
   - Error: Return 500 with message

**File location:** `novacrm/app/api/deals/[id]/route.ts`

**AC11: Delete Deal Confirmation**
**Given** I click the [Delete] button [Source: Epics Epic 4 Story 4.3]
**When** the button is clicked
**Then** a confirmation modal appears:
- Title: "Delete Deal?"
- Message: "This will permanently delete this deal and all history. This action cannot be undone."
- Icon: Red warning triangle
- Buttons: [Cancel] (secondary, gray) and [Delete Deal] (danger, red background)

**On confirmation:**
- Call DELETE /api/deals/[id]
- Backend deletes deal (CASCADE deletes deal_stage_history automatically)
- Show success toast: "Deal deleted" (green, 3s)
- Close modal
- Refresh parent view (contact page or deals list)

**AC12: Backend API - Delete Deal Endpoint**
**Given** frontend calls DELETE /api/deals/[id] [Source: Architecture §2.3.7]
**When** the API receives the request
**Then** the backend performs:

1. **Authentication check:** Verify session
2. **Authorization check (MVP):** All authenticated users can delete (FR11.1)
3. **Database operation:**
   ```typescript
   const { error } = await supabase
     .from('deals')
     .delete()
     .eq('id', dealId);
   ```
4. **Automatic cascade:** deal_stage_history entries deleted via ON DELETE CASCADE
5. **Response:** Return 200 OK on success, 500 on error

**AC13: GET Deal by ID Endpoint**
**Given** the modal needs to load deal details [Source: Epics Epic 4 Story 4.3]
**When** GET /api/deals/[id] is called
**Then** return complete deal with related data:

```typescript
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const dealId = params.id;

  // Fetch deal with joined data
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, company),
      stage:pipeline_stages(id, name, order_num),
      owner:users(id, email, full_name)
    `)
    .eq('id', dealId)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  // Fetch stage history
  const { data: history } = await supabase
    .from('deal_stage_history')
    .select(`
      *,
      from_stage:pipeline_stages!from_stage_id(name),
      to_stage:pipeline_stages!to_stage_id(name),
      changed_by_user:users(full_name)
    `)
    .eq('deal_id', dealId)
    .order('changed_at', { ascending: false });

  return NextResponse.json({ deal, history }, { status: 200 });
}
```

**File location:** `novacrm/app/api/deals/[id]/route.ts`

## Tasks / Subtasks

- [ ] Task 1: Create GET /api/deals/[id] endpoint (AC13)
  - [ ] 1.1 Create file: app/api/deals/[id]/route.ts
  - [ ] 1.2 Implement GET handler with deal query
  - [ ] 1.3 Join contact, stage, owner tables
  - [ ] 1.4 Fetch stage history with joins
  - [ ] 1.5 Return combined response
  - [ ] 1.6 Add error handling (404 if not found)
  - [ ] 1.7 Test endpoint manually

- [ ] Task 2: Create PUT /api/deals/[id] endpoint (AC10)
  - [ ] 2.1 Implement PUT handler in same file
  - [ ] 2.2 Add authentication and validation
  - [ ] 2.3 Update deal in database
  - [ ] 2.4 Handle stage change (create history entry)
  - [ ] 2.5 Handle status change (set closed_at)
  - [ ] 2.6 Return updated deal
  - [ ] 2.7 Test endpoint

- [ ] Task 3: Create DELETE /api/deals/[id] endpoint (AC12)
  - [ ] 3.1 Implement DELETE handler in same file
  - [ ] 3.2 Add authentication check
  - [ ] 3.3 Delete deal (CASCADE handles history)
  - [ ] 3.4 Return success response
  - [ ] 3.5 Test endpoint

- [ ] Task 4: Create DealDetailModal component - View mode (AC1-AC6)
  - [ ] 4.1 Create file: app/(dashboard)/components/DealDetailModal.tsx
  - [ ] 4.2 Implement modal shell (800px width, two-column layout)
  - [ ] 4.3 Add header with back button, [Edit], [Delete] buttons
  - [ ] 4.4 Fetch deal data using GET /api/deals/[id]
  - [ ] 4.5 Implement deal header (title, value, probability)
  - [ ] 4.6 Implement pipeline progress bar with calculation
  - [ ] 4.7 Implement left panel (Deal Information)
  - [ ] 4.8 Implement right panel (Stage Timeline)
  - [ ] 4.9 Implement editable notes section with auto-save
  - [ ] 4.10 Add loading states
  - [ ] 4.11 Style all components with Catppuccin Mocha

- [ ] Task 5: Add Edit mode functionality (AC7-AC9)
  - [ ] 5.1 Add edit mode state toggle
  - [ ] 5.2 Transform fields to editable inputs
  - [ ] 5.3 Implement form validation
  - [ ] 5.4 Add stage change confirmation modal
  - [ ] 5.5 Implement PUT /api/deals/[id] submission
  - [ ] 5.6 Handle success/error responses
  - [ ] 5.7 Refresh modal data after save
  - [ ] 5.8 Return to view mode after save

- [ ] Task 6: Add Delete functionality (AC11-AC12)
  - [ ] 6.1 Implement delete confirmation modal
  - [ ] 6.2 Add DELETE /api/deals/[id] call
  - [ ] 6.3 Handle success (close modal, refresh parent)
  - [ ] 6.4 Handle error (show toast)

- [ ] Task 7: Integrate modal with parent pages
  - [ ] 7.1 Add modal to contact detail page (open on deal click)
  - [ ] 7.2 Pass deal ID prop
  - [ ] 7.3 Handle modal close and refresh
  - [ ] 7.4 Test from contact detail page

- [ ] Task 8: Test complete flow
  - [ ] 8.1 Test view mode display (all fields, timeline, progress bar)
  - [ ] 8.2 Test edit mode (all field updates)
  - [ ] 8.3 Test stage change with history creation
  - [ ] 8.4 Test status change to Won/Lost (closed_at set)
  - [ ] 8.5 Test delete with confirmation
  - [ ] 8.6 Test notes auto-save
  - [ ] 8.7 Verify database updates correctly

## Dev Notes

### Architecture Compliance

**API Routes** [Source: Architecture.md §3.3]
- GET /api/deals/[id] - Fetch deal with relations
- PUT /api/deals/[id] - Update deal
- DELETE /api/deals/[id] - Delete deal (CASCADE to history)
- Join related tables: contacts, pipeline_stages, users
- Use Supabase .select() with foreign key syntax

**Database Patterns** [Source: Architecture.md §2.3.6, §2.3.7]
- deal_stage_history: Record all stage changes
- ON DELETE CASCADE: History deleted with deal
- closed_at: Set when status changes to Won/Lost
- updated_at: Automatic via trigger

**Frontend Patterns**
- Two-column modal layout (800px width)
- View/Edit mode toggle
- Progress bar calculation: (current_order - 1) / (total - 1) * 100
- Timeline component with vertical dot/line design
- Confirmation modals for destructive actions

### Project Structure Notes

**Files Created:**
1. `novacrm/app/api/deals/[id]/route.ts` - GET, PUT, DELETE handlers
2. `novacrm/app/(dashboard)/components/DealDetailModal.tsx` - Modal component

**Files Modified:**
- Contact detail page (integrate modal)
- Possibly: Deals list page (integrate modal)

### Previous Story Intelligence

**From Story 4.2 (Create Deal Form):**
- Form field patterns and validation
- Toast notifications
- Modal structure
- Currency formatting utilities

**From Story 4.1 (Deals Schema):**
- deal_stage_history table structure
- Foreign key CASCADE/RESTRICT/SET NULL behaviors
- Trigger for updated_at

### References

**Architecture Documentation:**
- [Architecture.md §3.3](../Architecture.md) - Deal API routes
- [Architecture.md §2.3.6](../Architecture.md) - Deals table
- [Architecture.md §2.3.7](../Architecture.md) - Deal stage history

**PRD Requirements:**
- [PRD.md FR5.7](../PRD.md) - Stage change history
- [PRD.md FR5.8](../PRD.md) - Deal status (Open/Won/Lost)

**UX Design:**
- [UX.md §6.5](../UX-Design.md) - Pipeline progress bar, timeline
- [UX.md §4.6](../UX-Design.md) - Modal patterns

**Epic Context:**
- [epics.md Epic 4 Story 4.3](../epics.md) - Complete acceptance criteria

**Previous Stories:**
- [Story 4.1](./4-1-deals-database-table-pipeline-stage-relationships.md) - Database schema
- [Story 4.2](./4-2-create-deal-form-contact-linking.md) - Form patterns

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

**Story Creation Complete:**
- ✅ Comprehensive acceptance criteria
- ✅ Complete API specifications (GET, PUT, DELETE)
- ✅ Detailed modal design (view/edit modes)
- ✅ Stage timeline and progress bar specs
- ✅ Task breakdown
- ✅ Complete references

**Ready for dev-story workflow execution**

**Story Implementation Complete (2025-12-11):**
- ✅ Created GET /api/deals/[id] endpoint with full data joins
- ✅ Created PUT /api/deals/[id] endpoint with validation and stage tracking
- ✅ Created DELETE /api/deals/[id] endpoint with CASCADE behavior
- ✅ Built DealDetailModal component with view/edit modes
- ✅ Implemented pipeline progress bar with calculation
- ✅ Implemented stage timeline with deal_stage_history display
- ✅ Added stage change confirmation modal with notes
- ✅ Added delete confirmation modal
- ✅ Integrated modal into ContactDetailModal with deals section
- ✅ Form validation matching Story 4.2 patterns
- ✅ Success/error toast notifications
- ✅ Auto-save notes functionality
- ✅ Status change handling (Open/Won/Lost with closed_at)
- ✅ All tasks completed successfully

### File List

**Created:**
- `novacrm/app/api/deals/[id]/route.ts`
- `novacrm/app/(dashboard)/components/DealDetailModal.tsx`

**Modified:**
- `novacrm/app/(dashboard)/contacts/components/ContactDetailModal.tsx`
