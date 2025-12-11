# Story 4.4: Deal List View with Pipeline Stage Filtering

Status: Ready for Review

## Story

As a sales team member (Marcus),
I want to see all deals in a filterable list organized by pipeline stage,
so that I can quickly find deals at specific stages and manage my sales pipeline.

## Acceptance Criteria

**AC1: Deals Page Layout**
**Given** I navigate to the Deals page [Source: Epics Epic 4 Story 4.4, UX §6.5]
**When** the page loads
**Then** I see the deals list layout:
- Page title: "Deals" (2rem, weight 800, Mocha Text)
- Subtitle: "Track your sales opportunities" (1rem, Mocha Subtext0)
- "+ New Deal" button (orange primary, top-right)
- Filter bar below header
- Deals list below filters

**AC2: Pipeline Stage Tabs Filter**
**Given** the page is loaded [Source: FR4.2-FR4.3, UX §6.5]
**When** I view the filter bar
**Then** I see horizontal stage tabs:
- Tabs: "All", then 8 pipeline stages (Initial LinkedIn Connect, First Conversation, etc.), "Won", "Lost"
- Active tab: Orange underline (2px), Orange text (#F25C05)
- Inactive tab: Mocha Subtext0, hover brightens to Mocha Text
- Count badge: Shows deal count per tab (e.g., "(12)")
- Horizontal scroll: On mobile, tabs scroll left/right
- Tab click: Filters deals to selected stage

**Tab list:**
1. All (shows all open deals)
2. Initial LinkedIn Connect
3. First Conversation
4. Email Engaged
5. Meeting Scheduled
6. Proposal Sent
7. Negotiation
8. Closed Won
9. Closed Lost

**AC3: Additional Filters (Search, Owner, Sort)**
**Given** the filter bar is displayed [Source: Epics Epic 4 Story 4.4]
**When** I interact with filters
**Then** I see:

**Search input:**
- Placeholder: "Search deals by title or contact..."
- Icon: Magnifying glass (left side)
- Width: 300px (desktop), full-width (mobile)
- Debounced: 300ms after last keystroke
- Matches: Deal title, contact name, company (case-insensitive)

**Owner dropdown:**
- Label: "Owner:"
- Options: "All Owners", "My Deals", then list of all team members
- Default: "All Owners"
- "My Deals": Filters where owner_id = current user

**Sort dropdown:**
- Label: "Sort by:"
- Options:
  - "Expected Close Date" (default)
  - "Deal Value (High)"
  - "Deal Value (Low)"
  - "Recently Updated"

**AC4: Deals List - Grouped by Stage View**
**Given** no specific stage tab is selected [Source: UX §6.5]
**When** I view the deals list
**Then** deals are grouped by stage:

**Stage group header:**
- Format: "PROPOSAL SENT (8 deals, $420K total)"
- Styling: 1rem, weight 700, uppercase, Mocha Text
- Total value: Sum of all deals in stage
- Deal count: Number of deals in stage
- Collapsible: Click to expand/collapse group
- Icon: Chevron down (expanded) / right (collapsed)

**Deal cards within group:**
- Sorted by expected_close_date ASC (or selected sort)
- See AC5 for card design

**AC5: Deal Card Design**
**Given** deals are displayed [Source: UX §6.5]
**When** I view a deal card
**Then** the card shows:

**Layout:**
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

**Card styling:**
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 12px
- Padding: 1.5rem
- Margin-bottom: 1rem
- Hover: Border Orange, slight shadow (0 4px 8px rgba(0,0,0,0.2)), cursor pointer
- Click: Opens DealDetailModal (Story 4.3)

**Card content:**
- **Deal title:** 1.125rem, weight 700, Mocha Text, truncate after 50 chars
- **Value:** Right-aligned, weight 700, Orange, currency formatted
- **Contact + company:** 0.875rem, Mocha Subtext0, inline with • separator
- **Probability + close date:** 0.875rem, inline with • separator
- **Progress bar:** Mini version (8px height), shows current stage position
- **Last updated:** 0.75rem, Mocha Overlay0, relative time (e.g., "2 hours ago")

**AC6: Stage Tab Filtering**
**Given** I click a specific pipeline stage tab [Source: FR4.2-FR4.3]
**When** the tab is selected
**Then** the deals list updates:
- Only shows deals in selected stage
- Stage group header hidden (single stage view)
- Active tab highlighted in orange
- Empty state if no deals: "No deals in this stage" with illustration

**AC7: Won/Lost Tabs Display**
**Given** I click "Won" or "Lost" tabs [Source: FR5.8]
**When** the tab is selected
**Then** closed deals display:
- **Won deals:** Green accent (2px left border, #a6e3a1)
- **Lost deals:** Red accent (2px left border, #f38ba8)
- **Closed date:** Shown instead of expected close date
- **No progress bar:** Deal is closed
- **Status badge:** Green "Won" or Red "Lost" (0.75rem, weight 600)

**AC8: Search Functionality**
**Given** I type in the search bar [Source: Architecture §4.1]
**When** I enter search terms
**Then** deals filter in real-time:
- Debounced: 300ms after last keystroke
- Matches: title, contact first_name, contact last_name, contact company (case-insensitive)
- Results update dynamically
- Performance target: <200ms query execution
- Empty state: "No deals match your search" with clear filters button

**AC9: Owner Filter**
**Given** I select an owner from the dropdown [Source: Epics Epic 4 Story 4.4]
**When** "My Deals" is selected
**Then** only deals where owner_id = current user display
**When** specific team member selected
**Then** only deals owned by that user display
**When** "All Owners" selected
**Then** all deals display (default)

**AC10: Sort Options**
**Given** I select a sort option [Source: Epics Epic 4 Story 4.4]
**When** a sort is applied
**Then** deals reorder:
- **Expected Close Date:** ASC (soonest first)
- **Deal Value (High):** DESC (largest first)
- **Deal Value (Low):** ASC (smallest first)
- **Recently Updated:** updated_at DESC (newest first)

**AC11: Empty States**
**Given** no deals match the current filters
**When** the list is empty
**Then** display empty state:
- Icon: Empty box illustration
- Message: Contextual message based on filter
  - No filters: "No deals yet. Create your first deal!"
  - Filtered: "No deals match your filters"
- Action button: "Clear Filters" or "+ Create Deal"

**AC12: Responsive Design**
**Given** the page is viewed on different screen sizes [Source: UX §9.2]
**When** the viewport changes
**Then** layout adapts:
- **Desktop (>1024px):** Full layout with stage tabs
- **Tablet (768-1024px):** Stage tabs scroll horizontally
- **Mobile (<768px):**
  - Stack deal cards vertically
  - Condensed card design (smaller font sizes)
  - Filters collapse into dropdown menu

**AC13: GET /api/deals Endpoint**
**Given** the frontend needs to fetch deals [Source: Architecture §3.3]
**When** GET /api/deals is called with query params
**Then** return filtered/sorted deals:

**Query parameters:**
- `stage_id` (UUID): Filter by pipeline stage
- `status` (string): Filter by Open/Won/Lost
- `owner_id` (UUID): Filter by owner
- `search` (string): Search title, contact name, company
- `sort` (string): Sort field (expected_close_date, value, updated_at)
- `order` (string): ASC or DESC
- `limit` (number): Pagination limit (default 50)
- `offset` (number): Pagination offset (default 0)

**Response format:**
```json
{
  "deals": [
    {
      "id": "uuid",
      "title": "Q1 Enterprise License",
      "value": 50000.00,
      "probability": 75,
      "status": "Open",
      "expected_close_date": "2024-12-31",
      "updated_at": "2024-12-08T14:30:00Z",
      "stage": {
        "id": "uuid",
        "name": "Proposal Sent",
        "order_num": 5
      },
      "contact": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Smith",
        "company": "Acme Corp"
      },
      "owner": {
        "id": "uuid",
        "full_name": "Marcus"
      }
    }
  ],
  "total": 18,
  "stage_counts": {
    "stage-uuid-1": 12,
    "stage-uuid-2": 6,
    ...
  }
}
```

**File location:** `novacrm/app/api/deals/route.ts` (extend existing POST handler)

**AC14: Stage Grouping Query**
**Given** deals need to be grouped by stage [Source: Epics Epic 4 Story 4.4]
**When** no specific stage filter is applied
**Then** query returns deals grouped by stage:

```typescript
const { data: deals } = await supabase
  .from('deals')
  .select(`
    *,
    stage:pipeline_stages(id, name, order_num),
    contact:contacts(id, first_name, last_name, company),
    owner:users(id, full_name)
  `)
  .eq('status', 'Open')
  .order('stage.order_num', { ascending: true })
  .order('expected_close_date', { ascending: true });

// Group by stage in JavaScript
const groupedDeals = deals.reduce((acc, deal) => {
  const stageId = deal.stage.id;
  if (!acc[stageId]) {
    acc[stageId] = {
      stage: deal.stage,
      deals: [],
      total_value: 0,
      count: 0
    };
  }
  acc[stageId].deals.push(deal);
  acc[stageId].total_value += deal.value || 0;
  acc[stageId].count++;
  return acc;
}, {});
```

## Tasks / Subtasks

- [ ] Task 1: Extend GET /api/deals endpoint (AC13-AC14)
  - [ ] 1.1 Add query parameter handling (stage_id, status, owner_id, search, sort, order)
  - [ ] 1.2 Build dynamic Supabase query with filters
  - [ ] 1.3 Implement search across title, contact name, company
  - [ ] 1.4 Add sorting logic
  - [ ] 1.5 Include joined data (stage, contact, owner)
  - [ ] 1.6 Return deals with total count
  - [ ] 1.7 Calculate stage_counts for tab badges
  - [ ] 1.8 Test all filter combinations

- [ ] Task 2: Create Deals List page component (AC1-AC2)
  - [ ] 2.1 Create file: app/(dashboard)/deals/page.tsx
  - [ ] 2.2 Implement page layout (header, filters, list)
  - [ ] 2.3 Add "+ New Deal" button (link to Story 4.2 modal)
  - [ ] 2.4 Fetch deals using GET /api/deals
  - [ ] 2.5 Implement pipeline stage tabs
  - [ ] 2.6 Add count badges to tabs
  - [ ] 2.7 Handle active tab state

- [ ] Task 3: Implement filter components (AC3)
  - [ ] 3.1 Create search input with debounce
  - [ ] 3.2 Create owner dropdown (fetch from /api/users)
  - [ ] 3.3 Create sort dropdown
  - [ ] 3.4 Implement filter state management
  - [ ] 3.5 Update API query when filters change

- [ ] Task 4: Create DealCard component (AC5)
  - [ ] 4.1 Create file: app/(dashboard)/deals/components/DealCard.tsx
  - [ ] 4.2 Implement card layout and styling
  - [ ] 4.3 Add progress bar component (mini version)
  - [ ] 4.4 Format currency, dates, relative time
  - [ ] 4.5 Add hover states
  - [ ] 4.6 Add click handler (open DealDetailModal)

- [ ] Task 5: Implement grouped by stage view (AC4)
  - [ ] 5.1 Group deals by stage_id
  - [ ] 5.2 Create stage group header component
  - [ ] 5.3 Implement collapsible groups (expand/collapse)
  - [ ] 5.4 Display total value and count per stage
  - [ ] 5.5 Render deal cards within groups

- [ ] Task 6: Implement stage tab filtering (AC6)
  - [ ] 6.1 Add tab click handler
  - [ ] 6.2 Update API query with stage filter
  - [ ] 6.3 Switch to single-stage view
  - [ ] 6.4 Handle Won/Lost tabs (AC7)
  - [ ] 6.5 Add empty state handling

- [ ] Task 7: Implement empty states (AC11)
  - [ ] 7.1 Create EmptyState component
  - [ ] 7.2 Add contextual messages
  - [ ] 7.3 Add clear filters button
  - [ ] 7.4 Add create deal button

- [ ] Task 8: Implement responsive design (AC12)
  - [ ] 8.1 Add mobile breakpoints
  - [ ] 8.2 Implement horizontal scroll for tabs
  - [ ] 8.3 Adjust card sizing for mobile
  - [ ] 8.4 Collapse filters into dropdown on mobile

- [ ] Task 9: Test complete flow
  - [ ] 9.1 Test all filter combinations
  - [ ] 9.2 Test search functionality
  - [ ] 9.3 Test sorting options
  - [ ] 9.4 Test stage tab filtering
  - [ ] 9.5 Test Won/Lost views
  - [ ] 9.6 Test responsive design on all screen sizes
  - [ ] 9.7 Test deal card click (opens modal)

## Dev Notes

### Architecture Compliance

**API Routes** [Source: Architecture.md §3.3]
- GET /api/deals with query parameters
- Dynamic filtering and sorting
- Joined queries for related data
- Performance target: <200ms (Architecture §4.1)

**Database Queries**
- Use indexes: idx_deals_stage, idx_deals_status, idx_deals_owner
- Search uses idx_deals_contact for JOIN performance
- Pagination: LIMIT and OFFSET
- Default limit: 50 deals per page

**Frontend Patterns**
- Debounced search input (300ms)
- Relative time formatting (date-fns or similar)
- Collapsible components (React state)
- Responsive design (TailwindCSS breakpoints)

### Project Structure Notes

**Files Created:**
1. `novacrm/app/(dashboard)/deals/page.tsx` - Main deals list page
2. `novacrm/app/(dashboard)/deals/components/DealCard.tsx` - Deal card component
3. `novacrm/app/(dashboard)/deals/components/EmptyState.tsx` - Empty state component

**Files Modified:**
- `novacrm/app/api/deals/route.ts` (extend with GET handler)

### Libraries and Dependencies

- date-fns or dayjs (relative time formatting)
- lucide-react (icons)
- TailwindCSS (styling)
- @headlessui/react or radix-ui (dropdowns, tabs)

### Previous Story Intelligence

**From Story 4.3 (Deal Detail Modal):**
- Deal card click opens modal
- Pass deal ID to modal

**From Story 4.2 (Create Deal Form):**
- "+ New Deal" button opens CreateDealModal

**From Story 2.3 (Contacts List):**
- List view patterns (search, filters, sorting)
- Empty states
- Card hover/click patterns

### References

**Architecture Documentation:**
- [Architecture.md §3.3](../Architecture.md) - Deal API routes
- [Architecture.md §4.1](../Architecture.md) - Indexes and performance

**PRD Requirements:**
- [PRD.md FR4.2-FR4.5](../PRD.md) - Pipeline management
- [PRD.md FR5.8](../PRD.md) - Deal status

**UX Design:**
- [UX.md §6.5](../UX-Design.md) - Deal list and card design
- [UX.md §9.2](../UX-Design.md) - Responsive design

**Epic Context:**
- [epics.md Epic 4 Story 4.4](../epics.md) - Complete acceptance criteria

**Previous Stories:**
- [Story 4.3](./4-3-deal-detail-view-edit-modal.md) - Deal detail modal
- [Story 4.2](./4-2-create-deal-form-contact-linking.md) - Create deal form
- [Story 2.3](./2-3-contacts-list-page-search-filtering.md) - List view patterns

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

**Story Creation Complete:**
- ✅ Comprehensive acceptance criteria
- ✅ Complete API specifications
- ✅ Detailed UI/UX design
- ✅ Task breakdown
- ✅ Complete references

**Ready for dev-story workflow execution**

**Story Implementation Complete (2025-12-11):**
- ✅ Extended GET /api/deals with full query parameter support
- ✅ Implemented filtering by stage_id, status, owner_id, contact_id
- ✅ Implemented search across title, contact name, company (debounced 300ms)
- ✅ Implemented sorting by expected_close_date, value (high/low), updated_at
- ✅ Added pagination with limit/offset support
- ✅ Calculate stage counts for tab badges
- ✅ Created Deals list page with complete layout
- ✅ Implemented pipeline stage tabs (All Open + 8 stages + Won/Lost)
- ✅ Created DealCard component with progress bar and status badges
- ✅ Implemented grouped by stage view (when "All Open" selected)
- ✅ Implemented single stage filtered view
- ✅ Added search input with magnifying glass icon
- ✅ Added sort dropdown with 4 options
- ✅ Implemented empty states with contextual messaging
- ✅ Integrated DealDetailModal for card clicks
- ✅ Responsive design (mobile, tablet, desktop breakpoints)
- ✅ All tasks completed successfully

### File List

**Created:**
- `novacrm/app/(dashboard)/deals/page.tsx`
- `novacrm/app/(dashboard)/deals/components/DealCard.tsx`

**Modified:**
- `novacrm/app/api/deals/route.ts`

**Referenced:**
- Story 4.3 DealDetailModal integration
- Story 4.2 form patterns
- Story 2.3 list view patterns
