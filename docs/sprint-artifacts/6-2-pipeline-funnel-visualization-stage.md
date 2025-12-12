# Story 6.2: Pipeline Funnel Visualization by Stage

Status: ready-for-dev

## Story

As a sales team member,
I want to see a visual funnel showing deal count and value at each pipeline stage,
so that I can identify bottlenecks and understand where deals are concentrated.

## Acceptance Criteria

**AC1: Section Placement and Header**
**Given** I am on the Dashboard page [Source: Epics Epic 6 Story 6.2]
**When** I scroll below the four stat cards (Story 6.1)
**Then** I see the "Pipeline by Stage" section with:
- **Title**: "Pipeline by Stage" (1.5rem, weight 700, Mocha Text #cdd6f4)
- **Subtitle**: "Deal count and value per stage" (0.875rem, Mocha Subtext0 #a6adc8)
- **View toggle** (right-aligned): Two buttons [Funnel View] | [List View]
  - Active state: Orange background #F25C05
  - Inactive state: Mocha Surface0 background
- Section margin-top: 2rem (32px spacing from stat cards)

**AC2: Funnel Visualization - Horizontal Bars**
**Given** "Funnel View" is selected (default) [Source: Epics Epic 6 Story 6.2, UX §7.2, FR6.2]
**When** the funnel renders
**Then** I see horizontal bars for each pipeline stage:
- **Stages displayed**: All pipeline stages from pipeline_stages table, ordered by order_num ASC
- **Bar layout**: Stacked vertically, one per stage
- **Bar indentation**: Increases with each stage (creates funnel narrowing visual effect)
  - Stage 1: padding-left 0
  - Stage 2: padding-left 1rem
  - Stage 3: padding-left 2rem (etc.)
- **Bar height**: 48px each
- **Gap between bars**: 0.5rem (8px)

**AC3: Stage Bar Design and Styling**
**Given** a pipeline stage bar is rendered [Source: Epics Epic 6 Story 6.2, UX §7.2]
**When** I view the bar
**Then** I see:
- **Bar width**: Proportional to total value in that stage (widest stage = 100% of container)
- **Bar color**: Orange gradient `linear-gradient(135deg, #ff7b3d, #F25C05)`
  - Lighter orange at top (#ff7b3d), darker at bottom (#F25C05)
- **Bar background**: Mocha Surface0 (#313244) for empty portion
- **Border-radius**: 8px
- **Padding**: 0.75rem horizontal
- **Stage label** (left-aligned): Stage name, weight 600, Mocha Text
- **Deal count**: "(12 deals)" in parentheses after stage name, Mocha Subtext0
- **Value** (right-aligned): "$180,000" formatted currency, weight 700, Mocha Text

**AC4: Bar Hover Interaction**
**Given** I hover over a pipeline stage bar [Source: Epics Epic 6 Story 6.2]
**When** my mouse enters the bar
**Then** the bar:
- Darkens: Apply `filter: brightness(0.85)`
- Cursor changes to pointer
- Shows subtle shadow: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)`
- Tooltip appears with details: "12 deals • $180,000 total • 28% of pipeline"
  - Tooltip background: Mocha Mantle (#181825)
  - Tooltip border: 1px solid Mocha Surface0
  - Tooltip padding: 0.5rem 0.75rem
  - Tooltip font-size: 0.875rem

**AC5: Bar Click Navigation**
**Given** I click on a pipeline stage bar [Source: Epics Epic 6 Story 6.2]
**When** the bar is clicked
**Then** the system:
- Navigates to `/deals?stage={stage_id}` (filtered deals page)
- Deals page loads showing only deals in that specific stage
- User can return to dashboard via back button or sidebar navigation

**AC6: Conversion Rates Between Stages**
**Given** the funnel is displaying multiple stages [Source: Epics Epic 6 Story 6.2]
**When** I view the space between stage bars
**Then** I see conversion rate indicators:
- **Position**: Small text between bars
- **Format**: "67% →" (percentage with right arrow)
- **Calculation**: `(deals in next stage / deals in current stage) × 100`
- **Color coding**:
  - Green (#a6e3a1) if >50%
  - Yellow (#f9e2af) if 30-50%
  - Red (#f38ba8) if <30%
- **Font-size**: 0.75rem (12px)
- **Alignment**: Right-aligned, positioned at stage bar trailing edge

**AC7: Empty Stage Handling**
**Given** a pipeline stage has zero deals [Source: Epics Epic 6 Story 6.2]
**When** that stage renders in the funnel
**Then** I see:
- Bar still displayed at minimum width (40px)
- Bar background: Mocha Overlay0 (#6c7086) - gray tint
- Text: "0 deals" in Mocha Overlay0
- Value: "$0" (or hidden)
- Bar still clickable (navigates to empty filtered view)
- Conversion rate to next stage shows "—" or "N/A"

**AC8: List View Toggle**
**Given** I click the "List View" toggle button [Source: Epics Epic 6 Story 6.2]
**When** the view switches
**Then** the visualization changes to a table format:

**Table columns:**
| Stage | Deals | Value | Conversion |
|-------|-------|-------|------------|
| Initial LinkedIn Connect | 12 | $180,000 | 67% → |
| First Conversation | 8 | $140,000 | 75% → |
| Email Engaged | 6 | $120,000 | 67% → |

**Table styling:**
- Header row: border-bottom 1px solid Mocha Surface0, uppercase labels
- Body rows: hover background rgba(242, 92, 5, 0.03)
- Value column: Right-aligned, JetBrains Mono font
- Conversion column: Color-coded same as funnel view

**AC9: Filter Integration (Future Story 6.4)**
**Given** filters are applied on the dashboard (date range, owner, campaign) [Source: Epics Epic 6 Story 6.2]
**When** the pipeline funnel renders
**Then** it reflects filtered data:
- Funnel bars recalculate based on filtered deals
- Section header shows active filters: "Pipeline by Stage - Marcus Only"
- API call includes filter parameters
**Note:** Filter UI implemented in Story 6.4; this story prepares API to accept filter params

**AC10: API Endpoint - GET /api/dashboard/pipeline-funnel**
**Given** the funnel component needs data [Source: Epics Epic 6 Story 6.2, Architecture §3.3]
**When** GET /api/dashboard/pipeline-funnel is called
**Then** the endpoint:

**Authentication:**
- Checks Supabase session via `supabase.auth.getUser()`
- Returns 401 Unauthorized if no valid session

**Query Parameters (optional, for Story 6.4 integration):**
- `owner_id`: UUID - Filter deals by owner
- `campaign_id`: UUID - Filter deals by campaign
- `date_range`: string - Filter by date range ("this_month", "last_month", etc.)

**Database Query:**
```sql
SELECT
  ps.id as stage_id,
  ps.stage_name,
  ps.order_num,
  COUNT(d.id) as deal_count,
  COALESCE(SUM(d.value), 0) as total_value
FROM pipeline_stages ps
LEFT JOIN deals d ON d.stage_id = ps.id AND d.status = 'Open'
GROUP BY ps.id, ps.stage_name, ps.order_num
ORDER BY ps.order_num ASC
```

**Response (200 OK):**
```json
{
  "stages": [
    {
      "stage_id": "uuid1",
      "stage_name": "Initial LinkedIn Connect",
      "order_num": 1,
      "deal_count": 12,
      "total_value": 180000.00,
      "conversion_rate": 66.7
    },
    {
      "stage_id": "uuid2",
      "stage_name": "First Conversation",
      "order_num": 2,
      "deal_count": 8,
      "total_value": 140000.00,
      "conversion_rate": 75.0
    }
  ],
  "max_value": 180000.00
}
```

**Conversion Rate Calculation:**
- For each stage: `(next_stage.deal_count / current_stage.deal_count) × 100`
- Last stage: null or omitted (no next stage to convert to)

**AC11: Performance Requirements**
**Given** the funnel is loading [Source: Architecture §4.3, FR6.7]
**When** the API call executes
**Then** performance targets are met:
- API response time: <500ms
- Query uses indexed columns: `idx_deals_stage`, `idx_pipeline_stages_order`
- Page rendering with funnel: <3 seconds total (including Story 6.1 stats)

**AC12: Loading State**
**Given** the funnel data is loading [Source: Best practice]
**When** the API request is in progress
**Then** I see:
- Skeleton bars (7 gray pulsing rectangles matching funnel layout)
- Same dimensions as real bars (48px height each)
- Pulse animation: 2s infinite

**AC13: Error State**
**Given** the API call fails [Source: Architecture §5.1]
**When** /api/dashboard/pipeline-funnel returns an error
**Then** I see:
- Error message: "Unable to load pipeline visualization"
- Retry button: "Try Again" (onclick refetches)
- Error container matches funnel section styling

**AC14: Responsive Behavior**
**Given** the funnel is viewed on different screen sizes [Source: UX §9.1]
**When** the viewport width changes
**Then** the funnel adapts:
- **Desktop (>1024px)**: Full funnel width, all labels visible
- **Tablet (768-1024px)**: Funnel width adjusts, labels may truncate with ellipsis
- **Mobile (<768px)**: Funnel remains horizontal but compressed, consider switching to List View by default

**AC15: Empty Pipeline Handling**
**Given** there are no deals in any stage [Source: Best practice]
**When** the funnel renders with all zero values
**Then** I see:
- All stages displayed at minimum width (gray)
- Message: "No active deals in pipeline"
- Funnel structure preserved (helps user understand stages exist)

## Tasks / Subtasks

- [ ] 1. Create PipelineFunnel component (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] 1.1 Create file: `novacrm/app/components/dashboard/PipelineFunnel.tsx`
  - [ ] 1.2 Mark as 'use client' for interactivity
  - [ ] 1.3 Props interface: stages data, onStageClick, loading, error
  - [ ] 1.4 Add section header: title, subtitle, view toggle buttons
  - [ ] 1.5 Implement view toggle state (funnel vs list)
  - [ ] 1.6 Render funnel bars container (vertical stack)
  - [ ] 1.7 Map stages data to FunnelBar components
  - [ ] 1.8 Calculate bar widths based on max value
  - [ ] 1.9 Apply indentation for funnel effect (padding-left increases)
  - [ ] 1.10 Implement conversion rate calculations
  - [ ] 1.11 Render conversion rate indicators between bars
  - [ ] 1.12 Color-code conversion rates (green/yellow/red)
  - [ ] 1.13 Handle empty stages (gray bars, 0 deals)

- [ ] 2. Create FunnelBar sub-component (AC: 3, 4, 5)
  - [ ] 2.1 Create file: `novacrm/app/components/dashboard/FunnelBar.tsx`
  - [ ] 2.2 Props: stage_name, deal_count, total_value, width_percentage, indentation, onClick
  - [ ] 2.3 Implement bar container (48px height, border-radius 8px)
  - [ ] 2.4 Apply orange gradient background: `linear-gradient(135deg, #ff7b3d, #F25C05)`
  - [ ] 2.5 Set width based on width_percentage prop
  - [ ] 2.6 Apply left padding for indentation
  - [ ] 2.7 Render stage label (left-aligned, weight 600)
  - [ ] 2.8 Render deal count in parentheses
  - [ ] 2.9 Render value (right-aligned, weight 700, formatted currency)
  - [ ] 2.10 Implement hover effect (darken, shadow, cursor pointer)
  - [ ] 2.11 Add onClick handler (navigate to deals filtered by stage)
  - [ ] 2.12 Implement tooltip on hover with details

- [ ] 3. Create FunnelListView component (AC: 8)
  - [ ] 3.1 Create file: `novacrm/app/components/dashboard/FunnelListView.tsx`
  - [ ] 3.2 Props: stages data
  - [ ] 3.3 Render table with 4 columns: Stage, Deals, Value, Conversion
  - [ ] 3.4 Style header row (border-bottom, uppercase)
  - [ ] 3.5 Map stages to table rows
  - [ ] 3.6 Format values with currency formatter
  - [ ] 3.7 Color-code conversion rates
  - [ ] 3.8 Add hover effect on rows
  - [ ] 3.9 Make rows clickable (navigate to deals filtered by stage)

- [ ] 4. Create GET /api/dashboard/pipeline-funnel endpoint (AC: 10, 11)
  - [ ] 4.1 Create file: `novacrm/app/api/dashboard/pipeline-funnel/route.ts`
  - [ ] 4.2 Import createClient from '@/lib/supabase/server'
  - [ ] 4.3 Implement GET handler: `export async function GET(request: Request)`
  - [ ] 4.4 Check authentication: `supabase.auth.getUser()`
  - [ ] 4.5 Return 401 if no user session
  - [ ] 4.6 Parse query parameters: owner_id, campaign_id, date_range (optional for Story 6.4)
  - [ ] 4.7 Query pipeline_stages table ordered by order_num
  - [ ] 4.8 For each stage, count deals and sum values WHERE status='Open'
  - [ ] 4.9 Apply filters if provided (owner_id, campaign_id, date_range)
  - [ ] 4.10 Calculate conversion rates between consecutive stages
  - [ ] 4.11 Find max_value across all stages (for bar width calculation)
  - [ ] 4.12 Return JSON with stages array and max_value
  - [ ] 4.13 Add error handling (try/catch, return 500)
  - [ ] 4.14 Optimize query performance (use indexed columns)

- [ ] 5. Implement conversion rate logic (AC: 6)
  - [ ] 5.1 Add conversion rate calculation to API endpoint
  - [ ] 5.2 For each stage: divide next stage count by current count
  - [ ] 5.3 Multiply by 100 for percentage
  - [ ] 5.4 Handle division by zero (return null or 0)
  - [ ] 5.5 Last stage has no conversion (null)
  - [ ] 5.6 Return conversion_rate in each stage object

- [ ] 6. Implement bar width calculation (AC: 3)
  - [ ] 6.1 Find max total_value across all stages
  - [ ] 6.2 For each bar: calculate width_percentage = (stage_value / max_value) × 100
  - [ ] 6.3 Set minimum width for empty stages (40px or 10%)
  - [ ] 6.4 Apply width as inline style or CSS variable

- [ ] 7. Implement stage click navigation (AC: 5)
  - [ ] 7.1 Add onClick handler to FunnelBar component
  - [ ] 7.2 Use Next.js router: `useRouter` from 'next/navigation'
  - [ ] 7.3 Navigate to: `/deals?stage=${stage_id}`
  - [ ] 7.4 Ensure Deals page supports stage filter query param (verify from Story 4.4)

- [ ] 8. Add funnel to Dashboard page (AC: 1)
  - [ ] 8.1 Open `novacrm/app/(dashboard)/dashboard/page.tsx`
  - [ ] 8.2 Add fetch call to /api/dashboard/pipeline-funnel
  - [ ] 8.3 Pass funnel data to PipelineFunnel component
  - [ ] 8.4 Place below DashboardStats component (Story 6.1)
  - [ ] 8.5 Add 2rem margin-top for spacing

- [ ] 9. Implement loading state (AC: 12)
  - [ ] 9.1 Create SkeletonFunnel component
  - [ ] 9.2 Render 7 gray bars (48px height each)
  - [ ] 9.3 Add pulse animation
  - [ ] 9.4 Display while API data loading

- [ ] 10. Implement error state (AC: 13)
  - [ ] 10.1 Add error handling in PipelineFunnel component
  - [ ] 10.2 Display error message: "Unable to load pipeline visualization"
  - [ ] 10.3 Add "Try Again" button
  - [ ] 10.4 Retry button triggers API refetch

- [ ] 11. Implement responsive behavior (AC: 14)
  - [ ] 11.1 Test funnel on desktop (full width)
  - [ ] 11.2 Test on tablet (compressed but readable)
  - [ ] 11.3 Test on mobile (<768px)
  - [ ] 11.4 Consider auto-switching to List View on mobile
  - [ ] 11.5 Add media queries for label truncation

- [ ] 12. Test all functionality (AC: ALL)
  - [ ] 12.1 Verify funnel renders with real pipeline stages
  - [ ] 12.2 Verify bar widths proportional to values
  - [ ] 12.3 Verify indentation creates funnel visual effect
  - [ ] 12.4 Test hover: bars darken, tooltip appears
  - [ ] 12.5 Test click: navigates to filtered deals page
  - [ ] 12.6 Verify conversion rates calculate correctly
  - [ ] 12.7 Verify color coding (green >50%, yellow 30-50%, red <30%)
  - [ ] 12.8 Test empty stages: gray bars, 0 deals
  - [ ] 12.9 Test view toggle: Funnel ↔ List View
  - [ ] 12.10 Test responsive: Desktop → Tablet → Mobile
  - [ ] 12.11 Test loading state: skeleton bars display
  - [ ] 12.12 Test error state: error message + retry
  - [ ] 12.13 Verify API response time <500ms
  - [ ] 12.14 Verify no console errors

- [ ] 13. Finalize and commit (AC: ALL)
  - [ ] 13.1 Verify funnel displays correctly with pipeline stages
  - [ ] 13.2 Test on deployed Vercel instance
  - [ ] 13.3 Verify performance targets met
  - [ ] 13.4 Commit changes: "feat: Add pipeline funnel visualization to dashboard (Story 6.2)"
  - [ ] 13.5 Update story status to review

## Dev Notes

### Architecture Requirements

**API Endpoint** [Source: Architecture §3.3]
- Location: `novacrm/app/api/dashboard/pipeline-funnel/route.ts`
- Authentication: MANDATORY via `supabase.auth.getUser()`
- Query optimization: Use indexes on deals(stage_id), pipeline_stages(order_num)
- Target response time: <500ms

**Database Query Pattern:**
```typescript
// Fetch pipeline stages with deal counts
const { data: stages } = await supabase
  .from('pipeline_stages')
  .select(`
    id,
    stage_name,
    order_num
  `)
  .order('order_num', { ascending: true })

// For each stage, count deals and sum values
// Join deals WHERE status = 'Open' and stage_id = stage.id
// Use existing indexes for performance
```

**Performance Targets** [Source: Architecture §4.3]
- API response: <500ms
- Combined dashboard load (stats + funnel): <3 seconds
- Query uses indexed columns: idx_deals_stage

### Previous Story Patterns

**From Story 4.4 (Deals List with Stage Filtering):**
- Deals page supports `/deals?stage={stage_id}` query parameter
- Filters deals by stage when parameter present
- Navigation pattern established for drill-down

**From Story 6.1 (Dashboard Stats):**
- Loading state pattern: Skeleton components
- Error state pattern: Error message + retry button
- Server Component data fetching in dashboard/page.tsx
- Client components for interactive visualizations

### Component Architecture

**File Structure:**
```
novacrm/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx              # Updated: Add funnel fetch + render
│   ├── api/
│   │   └── dashboard/
│   │       └── pipeline-funnel/
│   │           └── route.ts          # GET /api/dashboard/pipeline-funnel
│   └── components/
│       └── dashboard/
│           ├── PipelineFunnel.tsx    # Main funnel container + toggle
│           ├── FunnelBar.tsx         # Individual stage bar
│           ├── FunnelListView.tsx    # Table view alternative
│           └── SkeletonFunnel.tsx    # Loading state
```

### UX Design Specifications

**Funnel Bar Gradient:**
```css
background: linear-gradient(135deg, #ff7b3d, #F25C05);
```

**Bar Dimensions:**
- Height: 48px
- Border-radius: 8px
- Padding: 0.75rem horizontal
- Gap: 0.5rem (8px between bars)

**Indentation Pattern (Funnel Effect):**
```css
.funnel-bar-1 { padding-left: 0; }
.funnel-bar-2 { padding-left: 1rem; }
.funnel-bar-3 { padding-left: 2rem; }
.funnel-bar-4 { padding-left: 3rem; }
/* etc. */
```

**Conversion Rate Color Coding:**
- Green (#a6e3a1): >50%
- Yellow (#f9e2af): 30-50%
- Red (#f38ba8): <30%

**Tooltip Styling:**
```css
background: #181825;        /* Mocha Mantle */
border: 1px solid #313244; /* Mocha Surface0 */
padding: 0.5rem 0.75rem;
font-size: 0.875rem;
border-radius: 6px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

### Testing Checklist

**Visual Tests:**
- [ ] Funnel bars display in correct order (by order_num)
- [ ] Bar widths proportional to values
- [ ] Indentation creates visual funnel narrowing effect
- [ ] Orange gradient visible on bars
- [ ] Conversion rates display between bars with correct colors
- [ ] Empty stages show gray bars at minimum width
- [ ] List View toggle works correctly
- [ ] Responsive behavior on all screen sizes

**Interaction Tests:**
- [ ] Hover darkens bars and shows tooltip
- [ ] Click navigates to /deals?stage={id}
- [ ] View toggle switches between Funnel and List
- [ ] Retry button refetches on error

**Data Tests:**
- [ ] API returns all pipeline stages
- [ ] Deal counts accurate per stage
- [ ] Values sum correctly per stage
- [ ] Conversion rates calculate correctly
- [ ] Max value identified for width scaling

**Performance Tests:**
- [ ] API response <500ms
- [ ] No layout shift on load
- [ ] Smooth hover transitions

### References

**Source Documentation:**
- [Epics.md Epic 6 Story 6.2](../epics.md) - Complete funnel visualization requirements
- [Architecture.md §3.3](../Architecture.md) - API endpoint patterns
- [Architecture.md §4.3](../Architecture.md) - Performance targets
- [UX-Design.md §7.2](../UX-Design.md) - Funnel design specifications
- [FR6.2](../PRD.md) - Pipeline visualization functional requirements

**Previous Stories:**
- [Story 6.1](./6-1-dashboard-page-four-key-stat-cards.md) - Dashboard foundation
- [Story 4.4](./4-4-deal-list-view-pipeline-stage-filtering.md) - Stage filtering
- [Story 1.2](./1-2-supabase-database-setup-core-tables.md) - pipeline_stages table

**Database Schema:**
- `pipeline_stages` table: id, stage_name, order_num, probability_weight
- `deals` table: id, stage_id, value, status
- Index: `idx_deals_stage` on deals(stage_id)

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)
- Epic 6 Story 6.2 requirements analyzed from epics.md
- Architecture and UX specifications incorporated
- Previous dashboard pattern from Story 6.1 referenced
- Stage filtering pattern from Story 4.4 verified

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

**Story Creation Complete:**
- ✅ 15 comprehensive acceptance criteria
- ✅ Pipeline funnel visualization with horizontal bars
- ✅ Funnel narrowing effect via indentation
- ✅ Conversion rates between stages with color coding
- ✅ View toggle: Funnel ↔ List View
- ✅ Clickable bars navigate to filtered deals
- ✅ API endpoint specification
- ✅ Performance targets documented
- ✅ Loading and error states
- ✅ Responsive behavior
- ✅ 13 task groups with 70+ subtasks
- ✅ Complete design specifications
- ✅ Testing checklist

**Ready for Implementation:**
- Story marked as `ready-for-dev`
- Visual graph component addresses user request for "more than just numbers"
- Integration with dashboard from Story 6.1
- Drill-down to deals page established

### File List

**Files to Create:**
- `novacrm/app/components/dashboard/PipelineFunnel.tsx` - Main funnel container
- `novacrm/app/components/dashboard/FunnelBar.tsx` - Individual stage bar
- `novacrm/app/components/dashboard/FunnelListView.tsx` - Table view
- `novacrm/app/components/dashboard/SkeletonFunnel.tsx` - Loading state
- `novacrm/app/api/dashboard/pipeline-funnel/route.ts` - API endpoint

**Files to Update:**
- `novacrm/app/(dashboard)/dashboard/page.tsx` - Add funnel below stats
