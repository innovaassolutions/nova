# Story 2.3: Contacts List View with Search & Filter

Status: drafted

## Story

As a sales team member (Marcus),
I want to see all contacts in a searchable, filterable table,
so that I can quickly find specific contacts and prevent duplicate outreach.

## Acceptance Criteria

**AC1: Page Layout and Header**
**Given** I am on the Contacts page
**When** the page loads
**Then** I see the page header [Source: UX§6.2, Epics Epic 2 Story 2.3]:
- Title: "Contacts" (2rem, weight 800, Mocha Text #cdd6f4)
- Subtitle: "Manage your LinkedIn connections and leads" (1rem, Mocha Subtext0 #a6adc8)
- Buttons (right-aligned):
  - "+ New Contact" (orange primary button from Story 2.2)
  - "Upload CSV" (secondary button - disabled for now, Epic 3)

**AC2: Filter Bar Components**
**And** I see the filter bar with [Source: UX§6.2]:
- **Search input** (flex: 1, max-width none):
  - Placeholder: "Search by name, company, or position..."
  - Magnifying glass icon (left side, 20×20px)
  - Real-time search on keystroke (debounced 300ms)
  - Orange focus state (#F25C05)

- **Filter dropdown**:
  - Label: "Filter ▾"
  - Options: "All Contacts", "My Contacts", "Unassigned", by Campaign

- **Sort dropdown**:
  - Label: "Sort ▾"
  - Options: "Recently Added", "Name A-Z", "Name Z-A", "Company A-Z"

**AC3: Contacts Table Design**
**And** I see the contacts table [Source: UX§4.5]:
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 12px
- Padding: 1.5rem

**Table columns**:
| Name | Company | Campaign(s) | Owner | Connected On | Actions |
|------|---------|-------------|-------|--------------|---------|
| [Avatar] John Smith | Acme Corp | Q4 SaaS | Todd | Dec 8, 2024 | [👁️] [✏️] |

**AC4: Table Styling Specifications**
**Then** the table has the following styling [Source: UX§4.5]:
- **Header row**: border-bottom 1px solid Surface0
- **Header cells**: 0.75rem uppercase, weight 600, Mocha Overlay1 (#7f849c), letter-spacing 0.05em
- **Body cells**: padding 1rem 0.5rem, border-bottom 1px solid Surface0
- **Hover row**: background rgba(242,92,5,0.03), 0.15s transition

**AC5: Name Cell Specifications**
**And** the Name cell displays [Source: UX§4.5]:
- **Company avatar**: 32×32px, border-radius 6px, initials, colored background
- **Name**: Font-weight 700, clickable (opens detail modal in Story 2.4)
- **Clickable link**: Mocha Text color, hover orange (#F25C05)

**AC6: Campaign Badges**
**And** the Campaign(s) cell displays [Source: UX§4.4]:
- Multiple campaign badges if assigned to multiple campaigns
- Each badge: 6px border-radius, 0.75rem font-size, colored background
- Badge colors: Rotate through Mocha accent colors (Blue, Sapphire, Teal, Lavender)

**AC7: Actions Column**
**And** the Actions column has [Source: Epics Epic 2 Story 2.3]:
- **View icon** (eye): Opens contact detail modal (Story 2.4)
- **Edit icon** (pencil): Opens edit form (Story 2.4)
- Both icons: 20×20px, Heroicons outline, hover: orange color (#F25C05)

**AC8: Real-Time Search Functionality**
**When** I type in the search bar [Source: Epics Epic 2 Story 2.3, FR4.7, FR10.3]
**Then** the contacts list filters in real-time:
- Search matches: first_name, last_name, company, position (case-insensitive)
- Results update as I type (debounced 300ms to avoid excessive API calls)
- Query execution time: <200ms [Source: Architecture§4.1]
- Uses idx_contacts_name index for performance

**AC9: Filter Dropdown Functionality**
**When** I select a filter option
**Then** the list updates to show [Source: Epics Epic 2 Story 2.3]:
- "All Contacts": All contacts in database
- "My Contacts": owner_id = current user
- "Unassigned": owner_id IS NULL
- By Campaign: Joins campaign_contacts to filter by campaign_id

**AC10: Sort Dropdown Functionality**
**When** I select a sort option
**Then** contacts are ordered by [Source: Epics Epic 2 Story 2.3]:
- "Recently Added": created_at DESC (default)
- "Name A-Z": last_name ASC, first_name ASC
- "Name Z-A": last_name DESC, first_name DESC
- "Company A-Z": company ASC NULLS LAST

**AC11: Responsive Behavior**
**When** the page is viewed on different screen sizes [Source: UX§9.2]
**Then** the layout adapts:
- **Desktop (>1024px)**: Full table with all columns
- **Tablet (768-1024px)**: Hide "Connected On" column
- **Mobile (<768px)**: Transform to card view:
  - Each contact = card (Mocha Mantle background)
  - Avatar + name at top
  - Company, campaign below
  - Actions in card footer

**AC12: Initial Data Load**
**When** the page first loads
**Then** [Source: Epics Epic 2 Story 2.3]:
- Fetch contacts from GET /api/contacts
- Display first 50 contacts (pagination)
- Show loading state while fetching
- Show empty state if no contacts exist
- Show error message if API call fails

## Tasks / Subtasks

- [ ] 1. Update Contacts page from placeholder to functional list (AC: 1, 12)
  - [ ] 1.1 Open app/(dashboard)/contacts/page.tsx (currently placeholder from Story 1.4)
  - [ ] 1.2 Replace placeholder content with functional page layout
  - [ ] 1.3 Add page header with title and subtitle per UX§6.2
  - [ ] 1.4 Add "+ New Contact" button that opens modal from Story 2.2
  - [ ] 1.5 Add "Upload CSV" button (disabled, placeholder for Epic 3)
  - [ ] 1.6 Set up React useState for contacts data, loading, error states
  - [ ] 1.7 Implement useEffect to fetch contacts on page load

- [ ] 2. Create GET /api/contacts API route (AC: 8, 9, 10, 12)
  - [ ] 2.1 Create file: app/api/contacts/route.ts (GET method)
  - [ ] 2.2 Get authenticated user from Supabase session
  - [ ] 2.3 Parse query parameters: search, filter, sort, page, limit
  - [ ] 2.4 Build Supabase query with filters
  - [ ] 2.5 Implement search logic (ILIKE on first_name, last_name, company, position)
  - [ ] 2.6 Implement filter logic (All/My/Unassigned/Campaign)
  - [ ] 2.7 Implement sort logic (Recently Added/Name/Company)
  - [ ] 2.8 Add pagination (50 per page default)
  - [ ] 2.9 Join campaign_contacts to get campaign data
  - [ ] 2.10 Return JSON with contacts array and pagination metadata

- [ ] 3. Create FilterBar component (AC: 2)
  - [ ] 3.1 Create file: app/(dashboard)/contacts/components/FilterBar.tsx
  - [ ] 3.2 Mark as 'use client' for interactivity
  - [ ] 3.3 Create search input with magnifying glass icon (Heroicons)
  - [ ] 3.4 Style search input per UX§6.2 specifications
  - [ ] 3.5 Implement debounced search (300ms) using useCallback and setTimeout
  - [ ] 3.6 Create Filter dropdown with options
  - [ ] 3.7 Create Sort dropdown with options
  - [ ] 3.8 Emit onChange events to parent component

- [ ] 4. Create ContactsTable component (AC: 3, 4, 5, 6, 7)
  - [ ] 4.1 Create file: app/(dashboard)/contacts/components/ContactsTable.tsx
  - [ ] 4.2 Mark as 'use client' for hover states and actions
  - [ ] 4.3 Create table container with Mocha Mantle background and styling
  - [ ] 4.4 Create table header row with 6 columns per UX§4.5
  - [ ] 4.5 Style header cells (uppercase, weight 600, letter-spacing)
  - [ ] 4.6 Map contacts data to table rows
  - [ ] 4.7 Implement row hover state (rgba(242,92,5,0.03) background)

- [ ] 5. Create ContactAvatar component (AC: 5)
  - [ ] 5.1 Create file: app/(dashboard)/components/ContactAvatar.tsx (reusable)
  - [ ] 5.2 Generate initials from first_name + last_name
  - [ ] 5.3 Assign colored background (rotate through Mocha accent colors)
  - [ ] 5.4 Style as 32×32px circle with border-radius 6px
  - [ ] 5.5 Center initials with appropriate font size and weight

- [ ] 6. Create CampaignBadges component (AC: 6)
  - [ ] 6.1 Create file: app/(dashboard)/contacts/components/CampaignBadges.tsx
  - [ ] 6.2 Accept campaigns array prop
  - [ ] 6.3 Map campaigns to badge elements
  - [ ] 6.4 Style badges per UX§4.4 (6px border-radius, colored backgrounds)
  - [ ] 6.5 Rotate badge colors through Mocha accents

- [ ] 7. Implement action icons (AC: 7)
  - [ ] 7.1 Import EyeIcon and PencilIcon from Heroicons
  - [ ] 7.2 Create IconButton component for consistent styling
  - [ ] 7.3 Style icons: 20×20px, hover orange (#F25C05), transition 0.2s
  - [ ] 7.4 Add onClick handlers (placeholder for Story 2.4)
  - [ ] 7.5 Add accessibility: aria-labels and keyboard navigation

- [ ] 8. Implement responsive card view (AC: 11)
  - [ ] 8.1 Create ContactCard component for mobile view
  - [ ] 8.2 Use CSS media queries to switch table/card at 768px breakpoint
  - [ ] 8.3 Style cards with Mocha Mantle background, padding, border-radius
  - [ ] 8.4 Layout: Avatar + name at top, company/campaign below, actions in footer
  - [ ] 8.5 Test responsive behavior on mobile devices

- [ ] 9. Implement empty and loading states (AC: 12)
  - [ ] 9.1 Create LoadingSpinner component (orange spinner)
  - [ ] 9.2 Create EmptyState component with friendly message
  - [ ] 9.3 Show loading spinner while fetching contacts
  - [ ] 9.4 Show empty state if contacts array is empty
  - [ ] 9.5 Show error message if API call fails

- [ ] 10. Test all functionality (AC: ALL)
  - [ ] 10.1 Test page loads with existing 10 contacts displayed
  - [ ] 10.2 Test search: type "Bob" and verify 2 Bob contacts appear
  - [ ] 10.3 Test search: type "eBusiness" and verify Bob Sacheli appears
  - [ ] 10.4 Test filter: "All Contacts" shows all 10
  - [ ] 10.5 Test filter: "Unassigned" shows all 10 (owner_id is NULL)
  - [ ] 10.6 Test sort: "Name A-Z" sorts by last name alphabetically
  - [ ] 10.7 Test responsive: resize to mobile and verify card view
  - [ ] 10.8 Test action icons display and hover states
  - [ ] 10.9 Verify campaign badges display correctly (if campaigns assigned)
  - [ ] 10.10 Verify avatars show correct initials with colored backgrounds

- [ ] 11. Finalize and commit (AC: ALL)
  - [ ] 11.1 Verify all 10 existing contacts are visible
  - [ ] 11.2 Test on deployed Vercel instance
  - [ ] 11.3 Verify search performance <200ms
  - [ ] 11.4 Commit changes with descriptive message
  - [ ] 11.5 Update story status to review

## Dev Notes

### 🎯 CRITICAL: This Story Solves the User's Problem!

**The User's Issue:** "Customer accounts not showing up in the system even though they're in the database."

**Solution:** This story creates the contacts list page that will display the **10 existing contacts** currently in the database:
1. Bob Sacheli (eBusiness Solutions)
2. Jason Greenwood (Greenwood Consulting)
3. Bob Keiller (Our Union Street)
4. Donald Bauer (Fusion Cyber)
5. John M. Cachat (IPE.SERVICES)
6. ...and 5 more

**Current State:** The /contacts page is a placeholder showing "Coming soon" text (from Story 1.4).
**After This Story:** The page will fetch and display all contacts in a searchable, filterable table.

### Previous Story Patterns

**Component Architecture (from Stories 1.4, 1.5, 2.2):**
- Use 'use client' for interactive components
- Place reusable components in `app/(dashboard)/components/`
- Place page-specific components in `app/(dashboard)/[page]/components/`
- Import Heroicons from '@heroicons/react/24/outline'
- Use exact Catppuccin Mocha colors from UX specifications

**API Route Pattern (from Architecture, Story 2.2):** [Source: Architecture.md§3.3]
```typescript
// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Build query
  let query = supabase
    .from('contacts')
    .select(`
      *,
      campaigns:campaign_contacts(
        campaign:campaigns(id, name, status)
      )
    `);

  // Apply search filter
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,position.ilike.%${search}%`);
  }

  // Apply filter
  if (filter === 'my') {
    query = query.eq('owner_id', user.id);
  } else if (filter === 'unassigned') {
    query = query.is('owner_id', null);
  }

  // Apply sort
  if (sort === 'name-asc') {
    query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true });
  } else if (sort === 'name-desc') {
    query = query.order('last_name', { ascending: false }).order('first_name', { ascending: false });
  } else if (sort === 'company') {
    query = query.order('company', { ascending: true, nullsFirst: false });
  } else {
    query = query.order('created_at', { ascending: false }); // Default: recent
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: contacts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    contacts,
    pagination: {
      page,
      limit,
      total: contacts.length, // In production, do a separate count query
    }
  });
}
```

### Architecture Requirements

**Contacts API Endpoint** [Source: Architecture.md§3.3]
- **Endpoint:** GET /api/contacts
- **Authentication:** Required (Supabase session)
- **Query Parameters:**
  - `search`: string (optional) - Search term for name/company/position
  - `filter`: "all" | "my" | "unassigned" | "campaign-{id}" (optional)
  - `sort`: "recent" | "name-asc" | "name-desc" | "company" (optional)
  - `page`: number (default: 1)
  - `limit`: number (default: 50)

**Response:**
```typescript
{
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    linkedin_url: string;
    email: string | null;
    company: string | null;
    position: string | null;
    connected_on: string | null;
    source: string;
    owner_id: string | null;
    created_at: string;
    updated_at: string;
    campaigns: Array<{
      campaign: {
        id: string;
        name: string;
        status: string;
      }
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
}
```

### Search Query Optimization

**Database Indexes** [Source: Architecture.md§4.1]
The following indexes already exist from Story 1.2:
- `idx_contacts_name` on (first_name, last_name) - Used for name searches
- `idx_contacts_linkedin` on linkedin_url - Used for duplicate detection
- `idx_contacts_owner` on owner_id - Used for "My Contacts" filter

**Search Performance Target:** <200ms [Source: Architecture.md§4.1]

**Supabase Query Pattern:**
```typescript
// Use .or() for multiple column search with ILIKE (case-insensitive)
query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,position.ilike.%${search}%`)
```

### UX Design Specifications

**Page Layout** [Source: UX-Design.md§6.2]
```css
.contacts-page {
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
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--mocha-subtext0); /* #a6adc8 */
  margin-top: 0.5rem;
}
```

**Filter Bar Styling** [Source: UX-Design.md§6.2]
```css
.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: none;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--mocha-overlay1); /* #7f849c */
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem; /* Extra left padding for icon */
  background: var(--mocha-surface0); /* #313244 */
  border: 1px solid var(--mocha-surface1); /* #45475a */
  border-radius: 10px;
  color: var(--mocha-text); /* #cdd6f4 */
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--innovaas-orange); /* #F25C05 */
  box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1);
}

.filter-dropdown,
.sort-dropdown {
  padding: 0.75rem 1rem;
  background: var(--mocha-surface0);
  border: 1px solid var(--mocha-surface1);
  border-radius: 10px;
  color: var(--mocha-text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-dropdown:hover,
.sort-dropdown:hover {
  background: var(--mocha-surface1);
}
```

**Table Styling** [Source: UX-Design.md§4.5]
```css
.contacts-table-container {
  background: var(--mocha-mantle); /* #181825 */
  border: 1px solid var(--mocha-surface0); /* #313244 */
  border-radius: 12px;
  padding: 1.5rem;
  overflow-x: auto;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
}

.contacts-table thead tr {
  border-bottom: 1px solid var(--mocha-surface0);
}

.contacts-table th {
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mocha-overlay1); /* #7f849c */
}

.contacts-table tbody tr {
  border-bottom: 1px solid var(--mocha-surface0);
  transition: background 0.15s ease;
}

.contacts-table tbody tr:hover {
  background: rgba(242, 92, 5, 0.03); /* Very subtle orange */
}

.contacts-table tbody tr:last-child {
  border-bottom: none;
}

.contacts-table td {
  padding: 1rem 0.5rem;
  font-size: 0.95rem;
  color: var(--mocha-text);
}
```

**Name Cell with Avatar** [Source: UX-Design.md§4.5]
```css
.name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--mocha-base); /* Dark text */
}

.contact-name {
  font-weight: 700;
  color: var(--mocha-text);
  cursor: pointer;
  transition: color 0.2s ease;
}

.contact-name:hover {
  color: var(--innovaas-orange); /* #F25C05 */
}
```

**Campaign Badges** [Source: UX-Design.md§4.4]
```css
.campaign-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.campaign-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: var(--mocha-base); /* Dark text on colored background */
}

/* Rotate through Mocha accent colors */
.campaign-badge-blue { background: var(--mocha-blue); } /* #89b4fa */
.campaign-badge-sapphire { background: var(--mocha-sapphire); } /* #74c7ec */
.campaign-badge-teal { background: var(--mocha-teal); } /* #94e2d5 */
.campaign-badge-lavender { background: var(--mocha-lavender); } /* #b4befe */
```

**Action Icons** [Source: UX-Design.md§4.5]
```css
.action-icons {
  display: flex;
  gap: 0.5rem;
}

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

**Responsive Card View** [Source: UX-Design.md§9.2]
```css
@media (max-width: 768px) {
  .contacts-table-container {
    padding: 0;
    background: transparent;
    border: none;
  }

  .contacts-table {
    display: none; /* Hide table on mobile */
  }

  .contact-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contact-card {
    background: var(--mocha-mantle);
    border: 1px solid var(--mocha-surface0);
    border-radius: 12px;
    padding: 1rem;
  }

  .contact-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .contact-card-body {
    font-size: 0.875rem;
    color: var(--mocha-subtext0);
  }

  .contact-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--mocha-surface0);
  }
}
```

### Debounce Implementation

**Search Debounce Pattern:**
```typescript
import { useState, useCallback, useEffect } from 'react';

export default function FilterBar({ onSearchChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by name, company, or position..."
    />
  );
}
```

### Testing Checklist

**Critical Success Tests:**
- [ ] Page loads and displays all 10 existing contacts
- [ ] Search "Bob" returns Bob Sacheli and Bob Keiller
- [ ] Search "eBusiness" returns Bob Sacheli (company match)
- [ ] Search "Fusion" returns Donald Bauer (company match)
- [ ] Filter "All Contacts" shows all 10
- [ ] Filter "Unassigned" shows all 10 (owner_id is NULL for all)
- [ ] Sort "Name A-Z" sorts by last name (Bauer, Cachat, Greenwood, Keiller, Sacheli...)
- [ ] Action icons display and have hover states
- [ ] Responsive: Table on desktop, cards on mobile

**Performance Tests:**
- [ ] Initial page load <1s
- [ ] Search results return <200ms
- [ ] No visible lag when typing in search

**Edge Cases:**
- [ ] Empty search returns all contacts
- [ ] Search with no matches shows empty state
- [ ] Table handles long company names gracefully
- [ ] Campaign badges wrap correctly if multiple campaigns

### File List

**Files to Create:**
- `app/(dashboard)/contacts/components/FilterBar.tsx` - Search and filter controls
- `app/(dashboard)/contacts/components/ContactsTable.tsx` - Desktop table view
- `app/(dashboard)/contacts/components/ContactCard.tsx` - Mobile card view
- `app/(dashboard)/contacts/components/CampaignBadges.tsx` - Campaign badge display
- `app/(dashboard)/components/ContactAvatar.tsx` - Reusable avatar component
- `app/api/contacts/route.ts` - GET endpoint (also used by Story 2.2 POST)

**Files to Update:**
- `app/(dashboard)/contacts/page.tsx` - Replace placeholder with functional list page

**Files to Verify:**
- `app/lib/supabase/client.ts` - Supabase browser client (exists from Story 1.2)
- `app/lib/supabase/server.ts` - Supabase server client (exists from Story 1.2)

### References

- [Source: docs/epics.md Epic 2 Story 2.3] - Complete story requirements
- [Source: docs/UX-Design.md§4.4] - Campaign badge styling
- [Source: docs/UX-Design.md§4.5] - Table styling specifications
- [Source: docs/UX-Design.md§6.2] - Contacts list page layout
- [Source: docs/UX-Design.md§9.2] - Responsive behavior specifications
- [Source: docs/Architecture.md§2.3.2] - Contacts table schema
- [Source: docs/Architecture.md§2.3.4] - Campaign_contacts junction for filtering
- [Source: docs/Architecture.md§3.3] - API route patterns
- [Source: docs/Architecture.md§4.1] - Performance targets and indexes
- [Source: docs/sprint-artifacts/1-4-application-layout-sidebar-navigation.md] - Placeholder contacts page

### Implementation Notes

**Estimated Completion Time:** 3-4 hours
- 45 min: Update contacts page and create layout
- 45 min: FilterBar component with debounced search
- 60 min: ContactsTable component with all styling
- 30 min: GET /api/contacts with search/filter/sort
- 45 min: Responsive card view for mobile
- 30 min: Testing all scenarios with existing 10 contacts

**Critical Success Factors:**
1. All 10 existing contacts must be visible on page load
2. Search must work in real-time with <200ms response
3. Filter "Unassigned" must show all contacts (owner_id is NULL)
4. Table must match exact Catppuccin Mocha styling
5. Responsive card view must work on mobile devices

**Common Pitfalls to Avoid:**
- Forgetting to join campaign_contacts for campaign data
- Not handling NULL values (owner_id, email, company, position)
- Search not being case-insensitive (use ILIKE, not LIKE)
- Not debouncing search input (will cause excessive API calls)
- Not testing with actual 10 contacts in database

### Prerequisites

- Epic 2 Story 2.1 complete (contacts table exists) ✓ READY-FOR-DEV
- Epic 2 Story 2.2 complete (modal for adding contacts) ✓ READY-FOR-DEV
- Existing 10 contacts in database ✓ CONFIRMED

## Change Log

- 2025-12-09 (Initial Draft): Story created by BMad Master Ultimate Context Engine. This is the CRITICAL story that solves the user's problem - displaying the 10 existing contacts currently in the database. Comprehensive analysis of Epic 2 Story 2.3 requirements, UX Design table and responsive specifications (§4.4, §4.5, §6.2, §9.2), Architecture API patterns and performance targets (§3.3, §4.1), and database query optimization with existing indexes. All search, filter, and sort functionality detailed with exact implementation patterns. Responsive card view for mobile specified. Status: drafted → ready-for-dev.
