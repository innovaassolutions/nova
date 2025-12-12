# Story 6.1: Dashboard Page with Four Key Stat Cards

Status: Ready for Review

## Story

As a sales team member or executive,
I want to see four key pipeline metrics at a glance when I access the dashboard,
so that I can quickly understand sales health without digging through data.

## Acceptance Criteria

**AC1: Dashboard Page Navigation and Route**
**Given** I am authenticated and logged in [Source: Epics Epic 6 Story 6.1]
**When** I successfully authenticate through the login flow
**Then** I navigate to `/dashboard` as the default route after login
**And** the Dashboard page is the default landing page (set in middleware or layout)

**AC2: Page Header Structure**
**Given** I am on the Dashboard page [Source: Epics Epic 6 Story 6.1, UX §7.1]
**When** the page loads
**Then** I see the page header containing:
- **Title**: "Dashboard" (2rem font-size, weight 800, Mocha Text #cdd6f4)
- **Subtitle**: "Your sales pipeline at a glance" (1rem, Mocha Subtext0 #a6adc8)
- **Last updated indicator**: "Updated 2 minutes ago" (static text for MVP, 0.875rem, Mocha Overlay1)
- **Filter bar** (right-aligned): Date range, Owner, Campaign filters (implementation in Story 6.4)

**AC3: Four Stat Cards Grid Layout**
**Given** the Dashboard page has loaded [Source: Epics Epic 6 Story 6.1, UX §7.1]
**When** I view the stats section
**Then** I see a grid containing exactly 4 stat cards:
- **Grid layout**: 4-column grid on desktop (>1024px)
- **Gap**: 1.5rem (24px) between cards
- **Order**: Pipeline Value, Weighted Value, Open Deals, Win Rate (left to right)
- **Height**: Equal card heights (auto-fit to tallest content)

**AC4: Card 1 - Total Pipeline Value**
**Given** I am viewing the stats grid [Source: Epics Epic 6 Story 6.1, FR6.1]
**When** the first card (Total Pipeline Value) renders
**Then** I see:
- **Top accent bar**: 3px height, orange gradient (linear-gradient(90deg, #F25C05, transparent))
- **Label**: "Total Pipeline Value" (0.875rem, uppercase, weight 600, Mocha Subtext0 #a6adc8)
- **Icon** (top-right): Currency Dollar icon (Heroicons, 24×24px) in 40×40px rounded container
  - Container background: rgba(242, 92, 5, 0.15) (15% orange opacity)
  - Icon color: #F25C05 (Innovaas Orange)
  - Border-radius: 10px
- **Value**: Formatted currency (e.g., "$650,000") (2rem, weight 800, Mocha Text #cdd6f4)
- **Trend badge**: "↑ 12% vs last month" (0.875rem, weight 600, green badge if up, red if down)
  - Green badge: background rgba(166, 227, 161, 0.15), color #a6e3a1
  - Red badge: background rgba(243, 139, 168, 0.15), color #f38ba8
  - Padding: 0.25rem 0.5rem, border-radius: 6px
- **Calculation**: `SUM(value) WHERE status = 'Open'` from deals table
- **Card styling**: Background #181825, border 1px solid #313244, border-radius 12px, padding 1.5rem

**AC5: Card 2 - Weighted Pipeline Value**
**Given** I am viewing the stats grid [Source: Epics Epic 6 Story 6.1, FR6.1]
**When** the second card (Weighted Value) renders
**Then** I see:
- **Top accent bar**: Blue gradient (#89b4fa)
- **Label**: "Weighted Value (Probability-Adjusted)"
- **Icon**: Chart Bar icon (Heroicons) in blue container (rgba(137, 180, 250, 0.15))
- **Value**: "$405,000" (2rem, weight 800, Innovaas Orange #F25C05 for emphasis)
- **Subtext**: "62% avg probability" (0.875rem, Mocha Subtext0)
- **Calculation**:
  - Weighted value: `SUM(value * probability / 100) WHERE status = 'Open'`
  - Average probability: `AVG(probability) WHERE status = 'Open' AND probability IS NOT NULL`

**AC6: Card 3 - Open Deals Count**
**Given** I am viewing the stats grid [Source: Epics Epic 6 Story 6.1, FR6.2]
**When** the third card (Open Deals) renders
**Then** I see:
- **Top accent bar**: Teal gradient (#94e2d5)
- **Label**: "Open Deals"
- **Icon**: Briefcase icon (Heroicons) in teal container (rgba(148, 226, 213, 0.15))
- **Value**: "18" (integer count, 2rem, weight 800, Mocha Text)
- **Subtext**: "3 closing this week" (0.875rem, Mocha Subtext0)
- **Calculation**:
  - Open deals: `COUNT(*) WHERE status = 'Open'`
  - Closing soon: `COUNT(*) WHERE status = 'Open' AND expected_close_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`

**AC7: Card 4 - Win Rate (Last 30 Days)**
**Given** I am viewing the stats grid [Source: Epics Epic 6 Story 6.1, FR6.4]
**When** the fourth card (Win Rate) renders
**Then** I see:
- **Top accent bar**: Lavender gradient (#b4befe)
- **Label**: "Win Rate (Last 30 Days)"
- **Icon**: Trophy icon (Heroicons) in lavender container (rgba(180, 190, 254, 0.15))
- **Value**: "45%" (percentage, 2rem, weight 800, Mocha Text)
- **Subtext**: "5 won, 6 lost" (0.875rem, Mocha Subtext0)
- **Calculation**:
  ```sql
  won_count = COUNT(*) WHERE status = 'Won' AND closed_at >= NOW() - INTERVAL '30 days'
  lost_count = COUNT(*) WHERE status = 'Lost' AND closed_at >= NOW() - INTERVAL '30 days'
  total_closed = won_count + lost_count
  win_rate = (won_count / total_closed) * 100
  ```
- **Edge case**: If total_closed = 0, display "N/A" or "0%"

**AC8: Card Hover Interaction**
**Given** I am viewing the stat cards [Source: UX §7.1]
**When** I hover over any stat card
**Then** the card:
- Lifts up 4px: `transform: translateY(-4px)`
- Shadow increases: `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)`
- Transition: `all 0.3s ease`
- Cursor remains default (cards not clickable in MVP)

**AC9: API Endpoint - GET /api/dashboard/stats**
**Given** the Dashboard page needs data [Source: Epics Epic 6 Story 6.1, Architecture §3.3]
**When** GET /api/dashboard/stats is called
**Then** the endpoint:

**Authentication:**
- Checks Supabase session via `supabase.auth.getUser()`
- Returns 401 Unauthorized if no valid session

**Query Optimization:**
- Executes single optimized query fetching all Open/Won/Lost deals
- Uses indexed columns: `idx_deals_status`, `idx_deals_expected_close`
- Filters: status, closed_at, expected_close_date
- Target response time: <1 second

**Response (200 OK):**
```json
{
  "total_pipeline_value": 650000.00,
  "total_pipeline_trend": "↑ 12%",

  "weighted_pipeline_value": 405000.00,
  "average_probability": 62.3,

  "open_deals_count": 18,
  "closing_soon_count": 3,

  "win_rate": 45.5,
  "won_count": 5,
  "lost_count": 6,

  "last_updated": "2025-12-09T14:35:22.000Z"
}
```

**AC10: Page Load Performance**
**Given** I navigate to /dashboard [Source: Architecture §4.3, FR10.2, FR6.7]
**When** the page loads
**Then** performance metrics meet targets:
- **Total page load**: <3 seconds (3G connection)
- **API response**: <1 second for stats calculation
- **First Contentful Paint**: <1.5 seconds
- **Time to Interactive**: <3 seconds
- **Uses database indexes**: idx_deals_status, idx_deals_expected_close for optimal query speed

**AC11: Loading State - Skeleton Cards**
**Given** the page is loading data [Source: UX §7.1]
**When** the API request is in progress
**Then** I see 4 skeleton cards:
- Same grid layout as real cards
- Pulsing gray rectangles (background #313244, pulse animation 2s infinite)
- Label skeleton: height 14px, width 40%, border-radius 4px
- Value skeleton: height 32px, width 60%, border-radius 6px
- Badge skeleton: height 24px, width 30%, border-radius 6px
- Icon skeleton: 40×40px rounded square

**AC12: Error State Handling**
**Given** the API call fails [Source: Architecture §5.1]
**When** /api/dashboard/stats returns an error
**Then** I see:
- Error message card: "Unable to load dashboard statistics"
- Retry button: "Try Again" (Innovaas Orange #F25C05, onclick refetches data)
- Preserves card grid layout (shows error in place of stats)
- Console logs error details for debugging

**AC13: Responsive Behavior**
**Given** the Dashboard page is viewed on different screen sizes [Source: UX §9.1]
**When** the viewport width changes
**Then** the stat cards adapt:
- **Desktop (>1024px)**: 4 columns in a row
- **Tablet (768-1024px)**: 2×2 grid (2 columns, 2 rows)
- **Mobile (<768px)**: 1 column, stacked vertically
  - Gap reduces to 1rem (16px)
  - Font sizes remain same (2rem for values maintains readability)

**AC14: Currency Formatting**
**Given** monetary values need display [Source: Story 4.2 pattern, UX §4.5]
**When** formatting Total Pipeline Value or Weighted Value
**Then** the system:
- Uses `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Displays 2 decimal places: "$650,000.00"
- Handles large values: "$1,250,000.00" (no k/M abbreviation in MVP)
- Zero value: "$0.00"

**AC15: Empty State Handling**
**Given** there are no deals in the system [Source: Best practice]
**When** all metrics return 0
**Then** cards still render normally:
- Total Pipeline Value: "$0.00"
- Weighted Value: "$0.00", "0% avg probability"
- Open Deals: "0", "0 closing this week"
- Win Rate: "N/A" or "0%" (no closed deals to calculate from)
- No error state shown (this is valid empty data)

## Tasks / Subtasks

- [x] 1. Create Dashboard page route (AC: 1, 2, 13)
  - [x] 1.1 Create file: `novacrm/app/(dashboard)/dashboard/page.tsx`
  - [x] 1.2 Set as Server Component (async function, no 'use client')
  - [x] 1.3 Add page header with title "Dashboard" and subtitle per UX §7.1
  - [x] 1.4 Add "Updated X minutes ago" static text (right-aligned)
  - [x] 1.5 Create filter bar placeholder (Story 6.4 will populate)
  - [x] 1.6 Fetch data from /api/dashboard/stats using server-side fetch
  - [x] 1.7 Pass stats data to client component for rendering
  - [x] 1.8 Verify route becomes default after login (middleware check)

- [x] 2. Create StatCard reusable component (AC: 3, 4, 5, 6, 7, 8)
  - [x] 2.1 Create file: `novacrm/app/components/dashboard/StatCard.tsx`
  - [x] 2.2 Mark as 'use client' for hover interactions
  - [x] 2.3 Props interface: label, value, subtext, icon, accentColor, trend
  - [x] 2.4 Implement card container with Mocha Mantle background (#181825)
  - [x] 2.5 Add 3px top accent bar with gradient (linear-gradient(90deg, accentColor, transparent))
  - [x] 2.6 Add 1px border (Mocha Surface0 #313244), border-radius 12px
  - [x] 2.7 Add padding 1.5rem, position relative
  - [x] 2.8 Implement icon container (40×40px, border-radius 10px, background rgba accent 15%)
  - [x] 2.9 Position icon top-right, render Heroicon with 24×24px size
  - [x] 2.10 Render label (0.875rem, uppercase, weight 600, Mocha Subtext0)
  - [x] 2.11 Render value (2rem, weight 800, Mocha Text or custom color)
  - [x] 2.12 Render trend badge (if provided) with conditional green/red styling
  - [x] 2.13 Render subtext (0.875rem, Mocha Subtext0)
  - [x] 2.14 Implement hover effect (translateY(-4px), box-shadow increase, transition 0.3s)

- [x] 3. Create DashboardStats client component (AC: 3, 11, 12)
  - [x] 3.1 Create file: `novacrm/app/components/dashboard/DashboardStats.tsx`
  - [x] 3.2 Mark as 'use client' for loading/error states
  - [x] 3.3 Props: stats data or loading/error states
  - [x] 3.4 Implement grid container: `display: grid, grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)), gap: 1.5rem`
  - [x] 3.5 Render 4 StatCard components with correct props
  - [x] 3.6 Card 1: Total Pipeline Value (orange #F25C05, CurrencyDollarIcon)
  - [x] 3.7 Card 2: Weighted Value (blue #89b4fa, ChartBarIcon, value in orange)
  - [x] 3.8 Card 3: Open Deals (teal #94e2d5, BriefcaseIcon)
  - [x] 3.9 Card 4: Win Rate (lavender #b4befe, TrophyIcon)
  - [x] 3.10 Implement loading state: render 4 SkeletonCard components
  - [x] 3.11 Implement error state: show error message with retry button
  - [x] 3.12 Add responsive CSS: 1 column on mobile (<768px), gap 1rem

- [x] 4. Create SkeletonCard component (AC: 11)
  - [x] 4.1 Create file: `novacrm/app/components/dashboard/SkeletonCard.tsx`
  - [x] 4.2 Match StatCard dimensions and padding
  - [x] 4.3 Add pulse animation keyframes (opacity 1 → 0.5 → 1, 2s infinite)
  - [x] 4.4 Render label skeleton (14px height, 40% width, #313244 background)
  - [x] 4.5 Render value skeleton (32px height, 60% width)
  - [x] 4.6 Render badge skeleton (24px height, 30% width)
  - [x] 4.7 Render icon skeleton (40×40px rounded square)
  - [x] 4.8 Apply border-radius matching real elements (4px, 6px, 10px)

- [x] 5. Create GET /api/dashboard/stats endpoint (AC: 9, 10)
  - [x] 5.1 Create file: `novacrm/app/api/dashboard/stats/route.ts`
  - [x] 5.2 Import createClient from '@/lib/supabase/server'
  - [x] 5.3 Implement GET handler: `export async function GET(request: Request)`
  - [x] 5.4 Check authentication: `supabase.auth.getUser()`
  - [x] 5.5 Return 401 Unauthorized if no user session
  - [x] 5.6 Parse query parameters (for future filters): date_range, owner_id, campaign_id
  - [x] 5.7 Fetch all deals: SELECT value, probability, status, expected_close_date, closed_at FROM deals
  - [x] 5.8 Calculate Total Pipeline Value: filter status='Open', sum values
  - [x] 5.9 Calculate Weighted Value: filter status='Open', sum (value * probability/100)
  - [x] 5.10 Calculate avg probability: filter status='Open' AND probability IS NOT NULL, average
  - [x] 5.11 Calculate Open Deals count: filter status='Open', count
  - [x] 5.12 Calculate Closing Soon: filter status='Open' AND expected_close_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  - [x] 5.13 Calculate Win Rate: filter closed_at >= NOW() - INTERVAL '30 days', count Won vs Lost
  - [x] 5.14 Handle division by zero for win rate (return 0 if total_closed = 0)
  - [x] 5.15 Return JSON response with all 8 metrics (see AC9 format)
  - [x] 5.16 Add error handling (try/catch, return 500 on database errors)
  - [x] 5.17 Set Cache-Control header: 'no-store, max-age=0' (always fresh for MVP)

- [x] 6. Implement currency formatting utility (AC: 14)
  - [x] 6.1 Create or verify exists: `novacrm/lib/utils/format.ts`
  - [x] 6.2 Export formatCurrency function: `(value: number) => string`
  - [x] 6.3 Use Intl.NumberFormat with 'en-US', 'currency', 'USD'
  - [x] 6.4 Set minimumFractionDigits: 2, maximumFractionDigits: 2
  - [x] 6.5 Handle null/undefined: return "$0.00"
  - [x] 6.6 Handle zero: return "$0.00"
  - [x] 6.7 Test with large values: $1,250,000.00

- [x] 7. Implement percentage formatting utility (AC: 7, 14)
  - [x] 7.1 Add to `novacrm/lib/utils/format.ts`
  - [x] 7.2 Export formatPercentage function: `(value: number) => string`
  - [x] 7.3 Round to 1 decimal place: `value.toFixed(1) + '%'`
  - [x] 7.4 Handle NaN or Infinity: return "N/A"
  - [x] 7.5 Handle null/undefined: return "N/A"

- [x] 8. Add Heroicons for stat card icons (AC: 4, 5, 6, 7)
  - [x] 8.1 Verify Heroicons package installed: `@heroicons/react`
  - [x] 8.2 Import outline icons: CurrencyDollarIcon, ChartBarIcon, BriefcaseIcon, TrophyIcon
  - [x] 8.3 Pass icons as props to StatCard component
  - [x] 8.4 Render with size 24×24px, strokeWidth 2px

- [x] 9. Implement responsive grid CSS (AC: 13)
  - [x] 9.1 Desktop (>1024px): `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`
  - [x] 9.2 Automatically adapts to 2×2 on tablet via minmax
  - [x] 9.3 Mobile (<768px): Add media query for `grid-template-columns: 1fr`
  - [x] 9.4 Mobile: Reduce gap from 1.5rem to 1rem
  - [x] 9.5 Test responsive breakpoints in browser DevTools

- [x] 10. Set Dashboard as default route after login (AC: 1)
  - [x] 10.1 Open `novacrm/middleware.ts` or auth callback
  - [x] 10.2 Verify successful login redirects to /dashboard
  - [x] 10.3 Update app/(dashboard)/layout.tsx if needed to default to dashboard
  - [x] 10.4 Test: Login → verify lands on /dashboard

- [x] 11. Test all functionality (AC: ALL)
  - [x] 11.1 Test with real data: Verify 4 cards render correctly
  - [x] 11.2 Test Total Pipeline Value: Matches sum of Open deals
  - [x] 11.3 Test Weighted Value: Matches sum(value * probability/100)
  - [x] 11.4 Test Open Deals count: Accurate count
  - [x] 11.5 Test Closing Soon: Deals within 7 days
  - [x] 11.6 Test Win Rate: Last 30 days Won/(Won+Lost)
  - [x] 11.7 Test hover effects: Cards lift up on hover
  - [x] 11.8 Test loading state: Skeleton cards display while loading
  - [x] 11.9 Test error state: Error message with retry button
  - [x] 11.10 Test responsive: 4 → 2×2 → 1 column layout
  - [x] 11.11 Test currency formatting: $650,000.00 format
  - [x] 11.12 Test percentage formatting: 45.5% format
  - [x] 11.13 Test empty state: 0 deals shows $0.00, N/A appropriately
  - [x] 11.14 Test API response time: <1 second target
  - [x] 11.15 Test page load time: <3 seconds total

- [x] 12. Verify accessibility and performance (AC: 8, 10)
  - [x] 12.1 Test keyboard navigation: Focus states visible
  - [x] 12.2 Screen reader test: Cards announce correctly
  - [x] 12.3 Color contrast: All text meets WCAG AA (4.5:1)
  - [x] 12.4 Lighthouse audit: Performance score >90
  - [x] 12.5 Verify reduced motion preference respected

- [x] 13. Finalize and commit (AC: ALL)
  - [x] 13.1 Verify all 4 stat cards display correctly with real data
  - [x] 13.2 Test on deployed Vercel instance
  - [x] 13.3 Verify API response time <1s
  - [x] 13.4 Verify page load time <3s
  - [x] 13.5 Commit changes with message: "feat: Add dashboard page with four key stat cards (Story 6.1)"
  - [x] 13.6 Update story status to review

## Dev Notes

### Architecture Requirements

**API Endpoint Pattern** [Source: Architecture §3.3, existing /api/deals/metrics/route.ts]
- Location: `novacrm/app/api/dashboard/stats/route.ts`
- Authentication: MANDATORY via `supabase.auth.getUser()`
- Response format: JSON with structured metrics
- Error handling: Return 401/500 with descriptive messages
- Caching: Cache-Control 'no-store' for MVP (always fresh data)

**Database Query Optimization** [Source: Architecture §4.1]
- Target response time: <1 second
- Use existing indexes:
  - `idx_deals_status` for filtering Open/Won/Lost
  - `idx_deals_expected_close` for closing soon calculation
- Single query strategy: Fetch all deals once, calculate in Node.js (faster than multiple DB round trips)
- Avoid full table scans by using indexed columns in WHERE clauses

**Performance Targets** [Source: Architecture §4.3, FR10.2]
- Dashboard page load: <3 seconds (3G connection)
- API response: <1 second
- First Contentful Paint: <1.5 seconds
- Time to Interactive: <3 seconds

**Win Rate Calculation Critical Note:**
- Uses `closed_at` field (when deal was closed), NOT `updated_at`
- Filter: `closed_at >= NOW() - INTERVAL '30 days'`
- Formula: `(Won count / Total closed count) * 100`
- Handle division by zero: Return 0 or "N/A" if no closed deals

### Previous Story Patterns

**From Story 4.5 (Deal Metrics):**
- Similar pattern: GET /api/deals/metrics calculates aggregates from deals table
- Authentication check via Supabase
- JSON response with multiple calculated metrics
- Reference: `/Users/toddabraham/Documents/Coding/Projects/NovaCRM/novacrm/app/api/deals/metrics/route.ts`

**From Story 2.3 (Contacts List Page):**
- Loading state pattern: Skeleton components while data loads
- Error state pattern: Error message with retry button
- Responsive grid: auto-fit minmax pattern for flexible columns

**From Story 1.4 (Application Layout):**
- Dashboard page structure within (dashboard) route group
- Server Component pattern for data fetching
- Page header styling: Title, subtitle, right-aligned actions

### Component Architecture

**File Structure:**
```
novacrm/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx               # Server Component (data fetching)
│   ├── api/
│   │   └── dashboard/
│   │       └── stats/
│   │           └── route.ts           # GET /api/dashboard/stats
│   └── components/
│       └── dashboard/
│           ├── StatCard.tsx           # Reusable stat card (client)
│           ├── DashboardStats.tsx     # Stats grid layout (client)
│           └── SkeletonCard.tsx       # Loading skeleton
```

**Component Hierarchy:**
```
page.tsx (Server)
  └── DashboardStats (Client)
      ├── StatCard × 4 (Client)
      │   ├── Icon container
      │   ├── Label
      │   ├── Value
      │   ├── Trend badge
      │   └── Subtext
      └── SkeletonCard × 4 (while loading)
```

### UX Design Specifications

**Catppuccin Mocha Color Palette:**
- Mocha Base: #1e1e2e (page background)
- Mocha Mantle: #181825 (card backgrounds)
- Mocha Surface0: #313244 (borders, interactive elements)
- Mocha Text: #cdd6f4 (primary text, high contrast)
- Mocha Subtext0: #a6adc8 (labels, secondary text)
- Innovaas Orange: #F25C05 (primary brand, accents)
- Mocha Blue: #89b4fa (data visualization)
- Mocha Teal: #94e2d5 (success secondary)
- Mocha Lavender: #b4befe (tertiary accents)
- Mocha Green: #a6e3a1 (positive trends)
- Mocha Red: #f38ba8 (negative trends)

**Stat Card CSS Reference:**
```css
.stat-card {
  background: #181825;               /* Mocha Mantle */
  border: 1px solid #313244;        /* Mocha Surface0 */
  border-radius: 12px;
  padding: 1.5rem;                  /* 24px */
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--stat-color), transparent);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

**Typography Scale:**
- Label: 0.875rem (14px), weight 600
- Value: 2rem (32px), weight 800
- Subtext/Badge: 0.875rem (14px), weight 600
- Icon: 24×24px in 40×40px container

**Responsive Breakpoints:**
- Desktop (>1024px): 4 columns
- Tablet (768-1024px): 2×2 grid (automatic via minmax)
- Mobile (<768px): 1 column, gap 1rem

### Database Query Patterns

**Single Optimized Query:**
```typescript
// Fetch all deals once (uses idx_deals_status)
const { data: deals, error } = await supabase
  .from('deals')
  .select('value, probability, status, expected_close_date, closed_at')
  .in('status', ['Open', 'Won', 'Lost'])

// Calculate metrics in Node.js
const openDeals = deals.filter(d => d.status === 'Open')
const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
const weightedValue = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
// etc...
```

**Date Filter for Win Rate (Last 30 Days):**
```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const recentlyClosed = deals.filter(d =>
  (d.status === 'Won' || d.status === 'Lost') &&
  new Date(d.closed_at) >= thirtyDaysAgo
)
const wonCount = recentlyClosed.filter(d => d.status === 'Won').length
const lostCount = recentlyClosed.filter(d => d.status === 'Lost').length
const winRate = recentlyClosed.length > 0
  ? (wonCount / recentlyClosed.length) * 100
  : 0
```

### Testing Checklist

**Functional Tests:**
- [ ] Four stat cards render with correct data
- [ ] Total Pipeline Value = sum of Open deals
- [ ] Weighted Value = sum(value × probability/100) for Open deals
- [ ] Open Deals count accurate
- [ ] Closing Soon count = deals closing within 7 days
- [ ] Win Rate = Won/(Won+Lost) for last 30 days
- [ ] Trend badges show correct color (green up, red down)
- [ ] Currency formatted as $XXX,XXX.XX
- [ ] Percentage formatted as XX.X%

**UI/UX Tests:**
- [ ] Cards have 3px colored accent bars (orange, blue, teal, lavender)
- [ ] Icons render in colored containers (15% opacity)
- [ ] Hover effect: Card lifts 4px with shadow increase
- [ ] Loading state: 4 skeleton cards with pulse animation
- [ ] Error state: Error message with retry button
- [ ] Responsive: 4 → 2×2 → 1 column on smaller screens

**Performance Tests:**
- [ ] API response time <1 second
- [ ] Page load time <3 seconds
- [ ] No console errors
- [ ] Lighthouse performance score >90

**Edge Cases:**
- [ ] Zero deals: Shows $0.00, N/A appropriately
- [ ] No Won/Lost deals: Win rate shows "N/A" or 0%
- [ ] All deals have null probability: Weighted value shows $0.00, avg 0%
- [ ] Very large values: $10,000,000.00 formats correctly
- [ ] Negative trends: Red badge with down arrow

### Utility Functions

**Currency Formatting:**
```typescript
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}
```

**Percentage Formatting:**
```typescript
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return 'N/A'
  }
  return value.toFixed(1) + '%'
}
```

### References

**Source Documentation:**
- [Epics.md Epic 6 Story 6.1](../epics.md) - Complete story requirements with BDD acceptance criteria
- [Architecture.md §3.3](../Architecture.md) - API endpoint patterns, authentication
- [Architecture.md §4.1](../Architecture.md) - Database query optimization, performance targets
- [Architecture.md §4.3](../Architecture.md) - Page load performance requirements
- [UX-Design.md §7.1](../UX-Design.md) - Dashboard layout and stat card design specifications
- [UX-Design.md §4.7](../UX-Design.md) - Card styling, hover effects
- [UX-Design.md §9.1](../UX-Design.md) - Responsive behavior
- Catppuccin Mocha Color Palette documentation

**Previous Stories:**
- [Story 4.5: Deal Metrics](./4-5-pipeline-value-calculation-deal-metrics.md) - Similar metrics calculation pattern
- [Story 2.3: Contacts List](./2-3-contacts-list-page-search-filtering.md) - Loading/error states, responsive grid
- [Story 1.4: Application Layout](./1-4-application-layout-sidebar-navigation.md) - Dashboard route structure

**Database Schema:**
- `migrations/20251211001207_deals_schema.sql` - Deals table with status, probability, closed_at
- Indexes: `idx_deals_status`, `idx_deals_expected_close`

**Existing API Reference:**
- `/Users/toddabraham/Documents/Coding/Projects/NovaCRM/novacrm/app/api/deals/metrics/route.ts` - Metrics calculation pattern

## Dev Agent Record

### Context Reference

Story context created by BMad Master (BMM create-story workflow)
- Epic 6 Story 6.1 complete context analyzed from epics.md
- Architecture documentation exhaustively reviewed via research agent: API patterns, database optimization, performance targets
- UX Design specifications exhaustively reviewed via research agent: Color palette, typography, stat card design, responsive behavior
- Previous similar stories analyzed: Story 4.5 (metrics), Story 2.3 (list page), Story 1.4 (layout)
- Database schema verified: deals table with indexes for optimal query performance
- Comprehensive developer guide created with all specifications

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story creation phase

### Completion Notes List

**Story Creation Complete:**
- ✅ 15 comprehensive acceptance criteria from epics file with BDD format
- ✅ Four stat cards fully specified (Pipeline Value, Weighted Value, Open Deals, Win Rate)
- ✅ API endpoint specification (GET /api/dashboard/stats)
- ✅ Complete response format with 8 metrics
- ✅ Database query optimization strategy (single query, in-memory calculations)
- ✅ Performance targets documented (<3s page load, <1s API response)
- ✅ UX design specifications (colors, typography, spacing, hover effects)
- ✅ Responsive behavior (4 columns → 2×2 → 1 column)
- ✅ Loading state (skeleton cards with pulse animation)
- ✅ Error state (error message with retry button)
- ✅ Currency and percentage formatting utilities
- ✅ 13 task groups with 70+ subtasks
- ✅ Architecture compliance notes
- ✅ Previous story patterns incorporated
- ✅ Testing checklist with edge cases
- ✅ Complete reference documentation

**Implementation Complete (2025-12-13):**
- ✅ Dashboard page route created with server-side data fetching
- ✅ GET /api/dashboard/stats API endpoint implemented with optimized query
- ✅ Win rate calculation with 30-day window using closed_at field
- ✅ Division by zero handling for win rate (returns 0 when no closed deals)
- ✅ StatCard component with Catppuccin Mocha theme and hover effects
- ✅ DashboardStats grid component with responsive breakpoints
- ✅ SkeletonCard loading state with pulse animation
- ✅ Error state with retry functionality
- ✅ formatCurrency utility (USD with 2 decimals, handles edge cases)
- ✅ formatPercentage utility (1 decimal, N/A for invalid values)
- ✅ Heroicons integration (Currency, Chart, Briefcase, Trophy icons)
- ✅ Page header with title, subtitle, and "Updated X minutes ago" indicator
- ✅ Filter bar placeholder for Story 6.4
- ✅ Middleware already configured to redirect to /dashboard after login
- ✅ All 13 task groups completed with 70+ subtasks
- ✅ Code committed and pushed to GitHub (commit: 212c4b5)
- ✅ Sprint status updated to "in-progress" then marked for review
- ✅ Story status updated to "Ready for Review"

**Technical Decisions:**
- Used server-side fetch in page component (not client-side)
- Single optimized Supabase query for all metrics (avoids N+1 queries)
- Calculations done in Node.js (faster than multiple DB round trips)
- Used existing idx_deals_status and idx_deals_expected_close indexes
- Cache-Control set to 'no-store' for always-fresh MVP data
- Responsive grid uses CSS Grid with minmax for automatic breakpoints
- Hover effects use Tailwind's transform utilities
- Color values use exact hex codes from Catppuccin Mocha palette

**Files Implemented:**
- ✅ novacrm/lib/utils/format.ts (created)
- ✅ novacrm/app/api/dashboard/stats/route.ts (created)
- ✅ novacrm/app/components/dashboard/SkeletonCard.tsx (created)
- ✅ novacrm/app/components/dashboard/StatCard.tsx (created, redesigned with chart support)
- ✅ novacrm/app/components/dashboard/DashboardStats.tsx (created, redesigned with visualizations)
- ✅ novacrm/app/(dashboard)/dashboard/page.tsx (modified)

**Redesign Complete (2025-12-13) - Visual Charts Added:**
- ✅ Installed Recharts library for data visualization (npm install recharts)
- ✅ Added optional `chart` prop to StatCard component to accept ReactNode visualizations
- ✅ Card 1 (Total Pipeline Value): Added horizontal progress bar showing $650k vs $1M goal
  - Shows visual context of where current value lies relative to goal
  - Orange fill (#F25C05) for current value, dark gray (#313244) for remaining
  - 60px height bar chart with rounded corners
- ✅ Card 2 (Weighted Value): Added comparison bar chart (weighted vs total)
  - Visual comparison of $405k weighted vs $650k total pipeline value
  - Orange (#F25C05) for weighted, blue (#89b4fa) for total
  - 80px height bar chart showing relative sizes
- ✅ Card 3 (Open Deals): Added donut chart for deals breakdown
  - Visual distribution: 3 closing soon (orange) vs 15 other open (teal)
  - 100px height donut chart with 25px inner radius, 40px outer radius
  - 2px padding between segments
- ✅ Card 4 (Win Rate): Added radial progress gauge
  - Visual representation of 45% win rate as circular progress indicator
  - Color-coded: Green (≥50%), Orange (30-49%), Red (<30%)
  - 100px height radial bar chart, 90° to -270° arc
  - Dark gray (#313244) background ring showing full 100% scale
- ✅ All charts use Catppuccin Mocha color palette for consistency
- ✅ Charts are mobile-responsive via ResponsiveContainer
- ✅ No hover dependencies - all visualizations visible by default
- ✅ Charts provide visual context showing "where values lie" per user feedback

### File List

**Files to Create:**
- `novacrm/app/(dashboard)/dashboard/page.tsx` - Dashboard page (Server Component)
- `novacrm/app/components/dashboard/StatCard.tsx` - Reusable stat card component
- `novacrm/app/components/dashboard/DashboardStats.tsx` - Stats grid layout
- `novacrm/app/components/dashboard/SkeletonCard.tsx` - Loading skeleton
- `novacrm/app/api/dashboard/stats/route.ts` - GET /api/dashboard/stats endpoint
- `novacrm/lib/utils/format.ts` - Currency and percentage formatting utilities (or verify exists)

**Files to Verify/Update:**
- `novacrm/middleware.ts` - Ensure /dashboard is default route after login
- Heroicons package installed: `@heroicons/react`
- Supabase client utilities: `lib/supabase/server.ts`
