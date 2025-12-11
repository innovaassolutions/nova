# NovaCRM - UX Design Specification

**Author:** Todd
**Date:** 2025-12-09
**Version:** 1.0
**Status:** Active Development

---

## Executive Summary

NovaCRM's user experience is designed around **LinkedIn-first sales workflows** with a **dark, modern aesthetic** that reduces eye strain during extended work sessions. The design leverages the Catppuccin Mocha color palette combined with Innovaas Orange (#F25C05) to create a professional, high-contrast interface optimized for data visibility and rapid task completion.

**Core UX Principles:**
- **Speed Over Beauty:** Every interaction optimized for <2 second completion
- **Data First:** Information density balanced with readability
- **No Surprises:** Consistent patterns, predictable interactions
- **Dark by Default:** Reduce eye strain for all-day CRM usage
- **Mobile-Aware:** Responsive layouts that adapt gracefully

---

## Design System Foundation

### Color Palette

**Catppuccin Mocha Theme (Base Colors):**
```css
--mocha-base: #1e1e2e         /* Primary background */
--mocha-mantle: #181825       /* Elevated surfaces (cards, sidebar) */
--mocha-crust: #11111b        /* Deepest background (rarely used) */
--mocha-surface0: #313244     /* Interactive elements (buttons, inputs) */
--mocha-surface1: #45475a     /* Hover states */
--mocha-surface2: #585b70     /* Borders, dividers */
```

**Text Colors:**
```css
--mocha-text: #cdd6f4         /* Primary text (high contrast) */
--mocha-subtext0: #a6adc8     /* Secondary text, labels */
--mocha-subtext1: #bac2de     /* Tertiary text */
--mocha-overlay0: #6c7086     /* Disabled text, placeholders */
--mocha-overlay1: #7f849c     /* Subtle UI elements */
--mocha-overlay2: #9399b2     /* Very subtle elements */
```

**Innovaas Brand (Primary Actions):**
```css
--innovaas-orange: #F25C05      /* Primary brand color, CTAs */
--innovaas-orange-hover: #D94C04 /* Hover state (darker) */
--innovaas-orange-soft: #ff7b3d  /* Accents, gradients */
```

**Catppuccin Mocha Accents (Data Visualization):**
```css
--mocha-blue: #89b4fa        /* Info, data points */
--mocha-sapphire: #74c7ec    /* Secondary data */
--mocha-teal: #94e2d5        /* Success secondary */
--mocha-green: #a6e3a1       /* Success, positive metrics */
--mocha-yellow: #f9e2af      /* Warning, pending states */
--mocha-peach: #fab387       /* Alerts, attention */
--mocha-red: #f38ba8         /* Error, negative metrics */
--mocha-lavender: #b4befe    /* Tertiary data */
--mocha-mauve: #cba6f7       /* Quaternary data */
```

**Color Usage Guidelines:**
- **Orange (#F25C05):** Primary CTAs, active navigation, brand elements
- **Green (#a6e3a1):** Positive trends, success states, "Closed Won"
- **Red (#f38ba8):** Negative trends, errors, "Closed Lost"
- **Blue (#89b4fa):** Information, neutral states, data visualization
- **Yellow (#f9e2af):** Warnings, pending actions, "At Risk" indicators
- **Surface colors:** Layer depth (base → mantle → surface0)

### Typography

**Font Stack:**
```css
Primary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif
Monospace (numbers/data): 'JetBrains Mono', monospace
```

**Font Weights:**
- **800 (Extra Bold):** Page titles, logo "Nova", stat values
- **700 (Bold):** Card titles, table data values, company names
- **600 (Semi Bold):** Nav labels, stat labels, buttons, table headers
- **500 (Medium):** Nav items, regular emphasis
- **400 (Regular):** Body text, descriptions, table cells

**Type Scale:**
```css
Page Title: 2rem (32px), weight 800, -0.02em letter-spacing
Card Title: 1.25rem (20px), weight 700, -0.01em letter-spacing
Body: 1rem (16px), weight 400
Small: 0.875rem (14px), weight 400
Tiny: 0.75rem (12px), weight 600 (uppercase labels)
```

**Line Height:**
- Body text: 1.6 (26px at 16px font size)
- Headings: 1.2
- Tight (stats, data): 1

### Logo Usage

**Available Formats:**
- **Horizontal Logo** (`nova-crm-logo.svg`): 200×60px - Use in header, navigation
- **Stacked Logo** (`nova-crm-logo-stacked.svg`): 140×100px - Use in mobile, sidebar collapse
- **Icon Only** (`nova-crm-icon.svg`): 60×60px - Use for favicon, app icon

**Logo Specifications (Sidebar):**
```html
<div class="logo-icon">
  <!-- 40×40px square, orange gradient background -->
  <!-- Border-radius: 10px -->
  <!-- Box-shadow: 0 4px 12px rgba(242, 92, 5, 0.3) -->
  N
</div>
<div class="logo-text">
  <span class="nova">Nova</span>  <!-- Orange #F25C05 -->
  <span class="crm">CRM</span>    <!-- Mocha Text #cdd6f4 -->
</div>
```

**Logo Implementation Notes:**
- Always use dark background (Mocha Base or Mantle)
- Maintain 20px minimum clear space around logo
- Never change colors or rotate
- Use SVG for infinite scaling

---

## Layout Architecture

### Application Grid Structure

**Desktop Layout (>1024px):**
```
┌─────────────┬──────────────────────────────┐
│             │ Header (Sticky)              │
│  Sidebar    ├──────────────────────────────┤
│  280px      │                              │
│  Fixed      │  Main Content                │
│             │  (Scrollable)                │
│             │                              │
└─────────────┴──────────────────────────────┘
```

**Tablet Layout (768px - 1024px):**
```
┌────┬──────────────────────────────────┐
│ S  │ Header (Sticky)                  │
│ i  ├──────────────────────────────────┤
│ d  │                                  │
│ e  │  Main Content                    │
│    │  (Full Width)                    │
│ 60 │                                  │
└────┴──────────────────────────────────┘
Sidebar collapses to icon-only (60px width)
```

**Mobile Layout (<768px):**
```
┌──────────────────────────────────────┐
│ Header (with hamburger menu)        │
├──────────────────────────────────────┤
│                                      │
│  Main Content                        │
│  (Full Width)                        │
│                                      │
└──────────────────────────────────────┘
Sidebar becomes slide-out drawer overlay
```

### Sidebar Navigation

**Dimensions & Behavior:**
- Width: 280px (desktop), 60px (tablet icons only), 0px (mobile hidden)
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244) on right edge
- Padding: 2rem vertical, 0 horizontal
- Scrollable if content overflows

**Navigation Sections:**
```
┌─────────────────────────────┐
│ Logo + Brand                │ Border-bottom separator
├─────────────────────────────┤
│ NAV SECTION: MAIN           │ Label (12px uppercase)
│   ☐ Dashboard (active)      │ Orange gradient background
│   ☐ Contacts                │ Hover: Surface0 background
│   ☐ Companies               │
│   ☐ Deals                   │
├─────────────────────────────┤
│ NAV SECTION: MANAGEMENT     │
│   ☐ Tasks                   │
│   ☐ Analytics               │
│   ☐ Settings                │
└─────────────────────────────┘
```

**Nav Item States:**
```css
/* Default */
background: transparent
color: var(--mocha-subtext0)
padding: 0.75rem 1rem
border-radius: 8px

/* Hover */
background: var(--mocha-surface0)
color: var(--mocha-text)
transition: all 0.2s ease

/* Active */
background: linear-gradient(135deg, rgba(242, 92, 5, 0.15), rgba(242, 92, 5, 0.05))
color: var(--innovaas-orange)
border-left: 3px solid var(--innovaas-orange)
padding-left: calc(1rem - 3px)  /* Compensate for border */
```

**Nav Icon Specifications:**
- Size: 20×20px
- Stroke width: 2px
- Heroicons outline style
- Color: Inherits from nav item

### Header (Top Bar)

**Dimensions & Behavior:**
- Height: Auto (based on content, ~80px typical)
- Background: Mocha Mantle (#181825)
- Border-bottom: 1px solid Mocha Surface0
- Padding: 1.5rem 2rem
- Sticky: Position sticky, top: 0, z-index: 100

**Header Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [Search Bar (flex: 1, max 500px)]  [🔔] [User Avatar]   │
└──────────────────────────────────────────────────────────┘
```

**Search Bar Component:**
```css
Width: 100% (max-width: 500px)
Height: 48px
Background: var(--mocha-surface0)
Border: 1px solid var(--mocha-surface1)
Border-radius: 10px
Padding-left: 3rem (for search icon)
Font-size: 0.95rem

/* Focus State */
border-color: var(--innovaas-orange)
box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1)
```

**Icon Button (Notifications):**
```css
Width: 40px
Height: 40px
Background: var(--mocha-surface0)
Border-radius: 10px
Hover: background: var(--mocha-surface1), transform: translateY(-2px)
```

**User Avatar:**
```css
Width: 40px
Height: 40px
Border-radius: 10px
Background: linear-gradient(135deg, var(--mocha-lavender), var(--mocha-blue))
Font-weight: 700
Color: var(--mocha-base) (dark text on light gradient)
Display: Flex, center aligned
Content: User initials (e.g., "TS" for Todd)
```

### Main Content Area

**Content Container:**
```css
Padding: 2rem
Background: var(--mocha-base)
Overflow-y: auto
Height: calc(100vh - header-height)
```

**Page Header Pattern:**
```html
<div class="page-header">
  <h1 class="page-title">Welcome back, Todd</h1>
  <p class="page-subtitle">Here's what's happening with your sales pipeline today</p>
</div>

Margin-bottom: 2rem
Title: 2rem, weight 800
Subtitle: 1rem, color: var(--mocha-subtext0)
```

---

## Component Library

### Buttons

**Primary Button (CTA):**
```css
background: var(--innovaas-orange)
color: white
padding: 0.5rem 1rem
border-radius: 8px
font-weight: 600
font-size: 0.875rem
box-shadow: 0 2px 8px rgba(242, 92, 5, 0.3)

/* Hover State */
background: var(--innovaas-orange-hover)
transform: translateY(-2px)
box-shadow: 0 4px 12px rgba(242, 92, 5, 0.4)
transition: all 0.2s ease
```

**Secondary Button:**
```css
background: var(--mocha-surface0)
color: var(--mocha-text)
border: 1px solid var(--mocha-surface1)
padding: 0.5rem 1rem
border-radius: 8px
font-weight: 600
font-size: 0.875rem

/* Hover State */
background: var(--mocha-surface1)
```

**Icon Button (40×40px):**
```css
width: 40px
height: 40px
border-radius: 10px
background: var(--mocha-surface0)
color: var(--mocha-text)
display: flex, center aligned

/* Hover */
background: var(--mocha-surface1)
transform: translateY(-2px)
```

**Button Usage:**
- Primary (Orange): Main actions ("+ New Deal", "Upload CSV", "Save Changes")
- Secondary: Auxiliary actions ("View All", "Cancel", "Filter")
- Icon: Single-action buttons (notifications, settings, close modals)

### Cards

**Standard Card:**
```css
background: var(--mocha-mantle)
border: 1px solid var(--mocha-surface0)
border-radius: 12px
padding: 1.5rem

/* Card Header (if title + action needed) */
display: flex
justify-content: space-between
align-items: center
margin-bottom: 1.5rem

/* Card Title */
font-size: 1.25rem
font-weight: 700
letter-spacing: -0.01em
```

**Stat Card (Dashboard Metrics):**
```css
background: var(--mocha-mantle)
border: 1px solid var(--mocha-surface0)
border-radius: 12px
padding: 1.5rem
position: relative
overflow: hidden

/* Top Accent Bar */
::before {
  content: ''
  position: absolute
  top: 0, left: 0, right: 0
  height: 3px
  background: linear-gradient(90deg, var(--stat-color), transparent)
}

/* Color Variants */
.orange::before { --stat-color: var(--innovaas-orange) }
.blue::before { --stat-color: var(--mocha-blue) }
.teal::before { --stat-color: var(--mocha-teal) }
.lavender::before { --stat-color: var(--mocha-lavender) }

/* Hover Effect */
:hover {
  transform: translateY(-4px)
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
  transition: all 0.3s ease
}
```

**Stat Card Layout:**
```
┌─────────────────────────────────┐ ← 3px colored accent bar
│ Total Revenue           💰      │ ← Label + Icon (40×40px rounded)
│                                 │
│ $847,290                        │ ← Value (2rem, weight 800)
│ ↑ 12.5% [green badge]           │ ← Change indicator
└─────────────────────────────────┘
```

### Badges & Status Indicators

**Status Badge (Deals, Activities):**
```css
display: inline-flex
align-items: center
padding: 0.375rem 0.75rem
border-radius: 6px
font-size: 0.75rem
font-weight: 600

/* Variants */
.active {
  background: rgba(166, 227, 161, 0.15)
  color: var(--mocha-green)
}

.pending {
  background: rgba(249, 226, 175, 0.15)
  color: var(--mocha-yellow)
}

.negotiation {
  background: rgba(137, 180, 250, 0.15)
  color: var(--mocha-blue)
}

.closed-won {
  background: rgba(166, 227, 161, 0.15)
  color: var(--mocha-green)
}

.closed-lost {
  background: rgba(243, 139, 168, 0.15)
  color: var(--mocha-red)
}
```

**Change Indicator (Stats):**
```css
display: inline-flex
align-items: center
gap: 0.25rem
font-size: 0.875rem
font-weight: 600
padding: 0.25rem 0.5rem
border-radius: 6px

.positive {
  background: rgba(166, 227, 161, 0.15)
  color: var(--mocha-green)
  content: "↑ "
}

.negative {
  background: rgba(243, 139, 168, 0.15)
  color: var(--mocha-red)
  content: "↓ "
}
```

### Forms & Inputs

**Text Input Field:**
```css
width: 100%
padding: 0.75rem 1rem
background: var(--mocha-surface0)
border: 1px solid var(--mocha-surface1)
border-radius: 10px
color: var(--mocha-text)
font-family: 'Plus Jakarta Sans'
font-size: 0.95rem
transition: all 0.2s ease

/* Focus State */
outline: none
border-color: var(--innovaas-orange)
box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1)

/* Disabled State */
background: var(--mocha-surface0)
color: var(--mocha-overlay0)
cursor: not-allowed
opacity: 0.6
```

**Label:**
```css
font-size: 0.875rem
font-weight: 600
color: var(--mocha-subtext0)
margin-bottom: 0.5rem
display: block
```

**Checkbox:**
```css
width: 20px
height: 20px
border: 2px solid var(--mocha-surface1)
border-radius: 4px
background: var(--mocha-surface0)

/* Checked State */
background: var(--innovaas-orange)
border-color: var(--innovaas-orange)
/* Show checkmark icon */
```

**Select Dropdown:**
```css
/* Same as text input */
appearance: none (custom arrow)
background-image: url('data:image/svg+xml...') /* Custom caret */
background-position: right 1rem center
background-repeat: no-repeat
padding-right: 3rem
```

**File Upload Zone (CSV Import):**
```css
border: 2px dashed var(--mocha-surface1)
border-radius: 12px
padding: 2rem
text-align: center
background: var(--mocha-mantle)
cursor: pointer
transition: all 0.2s ease

/* Hover State */
border-color: var(--innovaas-orange)
background: rgba(242, 92, 5, 0.05)

/* Active (dragging file) */
border-color: var(--mocha-green)
background: rgba(166, 227, 161, 0.1)
border-style: solid

/* Error State */
border-color: var(--mocha-red)
background: rgba(243, 139, 168, 0.1)
```

### Tables

**Data Table Structure:**
```css
width: 100%
border-collapse: separate
border-spacing: 0

/* Table Header */
thead {
  border-bottom: 1px solid var(--mocha-surface0)
}

th {
  text-align: left
  padding: 0.75rem 0.5rem
  font-size: 0.75rem
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.05em
  color: var(--mocha-overlay1)
}

/* Table Body */
td {
  padding: 1rem 0.5rem
  border-bottom: 1px solid var(--mocha-surface0)
}

tr:last-child td {
  border-bottom: none
}

/* Hover State */
tbody tr:hover {
  background: rgba(242, 92, 5, 0.03)
}
```

**Company Cell (with Avatar):**
```html
<div class="company-cell">
  <div class="company-avatar">AL</div>
  <span class="company-name">Alimex Manufacturing</span>
</div>

.company-avatar {
  width: 32px
  height: 32px
  border-radius: 6px
  display: flex, center aligned
  font-weight: 700
  font-size: 0.875rem
  background: rgba(color, 0.2)
  color: var(--accent-color)
}
```

**Deal Value Cell:**
```css
.deal-value {
  font-weight: 700
  font-family: 'JetBrains Mono', monospace
  color: var(--mocha-text)
}
```

### Modals & Overlays

**Modal Overlay:**
```css
position: fixed
top: 0, left: 0, right: 0, bottom: 0
background: rgba(0, 0, 0, 0.7)
backdrop-filter: blur(4px)
z-index: 1000
display: flex
align-items: center
justify-content: center
padding: 2rem
```

**Modal Container:**
```css
background: var(--mocha-mantle)
border: 1px solid var(--mocha-surface0)
border-radius: 16px
max-width: 600px
width: 100%
max-height: 90vh
overflow-y: auto
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)
animation: slideUp 0.3s ease

/* Modal Header */
padding: 2rem 2rem 1rem
border-bottom: 1px solid var(--mocha-surface0)

/* Modal Body */
padding: 1.5rem 2rem

/* Modal Footer */
padding: 1rem 2rem 2rem
display: flex
justify-content: flex-end
gap: 1rem
border-top: 1px solid var(--mocha-surface0)
```

**Duplicate Alert Modal (CSV Upload):**
```
┌────────────────────────────────────────┐
│ ⚠️ Duplicate Contacts Found            │ ← Orange warning border
├────────────────────────────────────────┤
│ We found 12 contacts that already      │
│ exist in your database.                │
│                                        │
│ ☐ John Smith (linkedin.com/in/j...)   │ ← Checkboxes for selection
│ ☐ Sarah Chen (linkedin.com/in/s...)   │
│ ☐ ...                                  │
│                                        │
│ Select contacts to overwrite, or       │
│ leave unchecked to skip.               │
├────────────────────────────────────────┤
│               [Cancel] [Proceed]       │ ← Secondary + Primary
└────────────────────────────────────────┘

Modal has orange border-left: 4px solid var(--innovaas-orange)
```

---

## Dashboard Screens

### Dashboard (Home)

**Layout Grid:**
```
┌─────────────────────────────────────────────────────────┐
│ Welcome back, Todd                                      │
│ Here's what's happening with your sales pipeline today │
├─────────────────────────────────────────────────────────┤
│ [Stat Card] [Stat Card] [Stat Card] [Stat Card]        │ ← 4 columns
├─────────────────────────────────────────────────────────┤
│ ┌────────────────────────┬──────────────────────────┐  │
│ │ Recent Deals (Table)   │ Recent Activity (List)   │  │ ← 2fr + 1fr grid
│ │                        │                          │  │
│ │                        │                          │  │
│ │                        │                          │  │
│ └────────────────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Stats Grid:**
```css
display: grid
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
gap: 1.5rem
margin-bottom: 2rem

/* On mobile (<768px) */
grid-template-columns: 1fr
```

**Stats to Display:**
1. **Total Pipeline Value** (Orange) - Sum of all open deals weighted by probability
2. **Active Deals** (Blue) - Count of deals not in "Closed Won/Lost"
3. **Conversion Rate** (Teal) - % of deals closed won vs total closed
4. **New Contacts** (Lavender) - Count added this month

**Activity Section Grid:**
```css
display: grid
grid-template-columns: 2fr 1fr
gap: 1.5rem

/* On tablet (<1024px) */
grid-template-columns: 1fr
```

### Contacts List

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Contacts                                                │
│ Manage your LinkedIn connections and leads              │
│                                [+ New Contact] [Upload] │ ← Buttons right-aligned
├─────────────────────────────────────────────────────────┤
│ [Search: "Search contacts..."]  [Filter ▾] [Sort ▾]    │ ← Filter bar
├─────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ Table: Name | Company | Campaign | Owner | Date   │ │
│ │ [Avatar] John Smith | Acme Corp | Q4... | Todd... │ │
│ │ ...                                                │ │
│ └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Showing 1-50 of 247                    [Pagination]    │
└─────────────────────────────────────────────────────────┘
```

**Filter/Sort Bar:**
```css
display: flex
gap: 1rem
align-items: center
margin-bottom: 1.5rem

/* Search takes flex: 1 */
/* Filter and Sort are fixed width dropdowns */
```

### CSV Upload Flow

**Step 1: Upload Page**
```
┌─────────────────────────────────────────────────────────┐
│ Import Contacts from LinkedIn                          │
│ Upload your LinkedIn connections CSV export            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐│
││ ┌───────────────────────────────────────────────────┐││
│││ 📄                                                  │││ ← Drag-drop zone
│││ Drag & drop your CSV file here                     │││    Dashed border
│││ or click to browse                                 │││    2rem padding
│││                                                     │││
│││ Supported format: LinkedIn Connections.csv         │││
││└───────────────────────────────────────────────────┘││
│└─────────────────────────────────────────────────────┘│
│                                                         │
│ Select campaigns to associate with these contacts:     │
│ ☐ LinkedIn Outreach Q1 2025                            │ ← Checkboxes
│ ☐ Partner Network                                      │
│ ☐ Customer Referrals                                   │
│                                                         │
│                          [Cancel] [Upload and Process] │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Processing State**
```
┌─────────────────────────────────────────────────────────┐
│ Processing contacts...                                  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ 45%                    │ ← Progress bar
│ Parsing CSV and checking for duplicates                │
└─────────────────────────────────────────────────────────┘
```

**Step 3: Duplicate Modal (if duplicates found)**
```
┌────────────────────────────────────────┐
│ ⚠️ 12 Duplicate Contacts Found         │ ← Orange border-left (4px)
├────────────────────────────────────────┤
│ The following contacts already exist   │
│ in your database. Select which ones    │
│ you want to overwrite.                 │
│                                        │
│ ☐ John Smith                           │ ← Scrollable list
│   Existing: Acme Corp                  │    Gray subtext
│   New: TechCorp                        │    Shows diff
│                                        │
│ ☐ Sarah Chen                           │
│   Existing: Beta Inc                   │
│   New: Beta Inc                        │
│                                        │
│ [... 10 more ...]                      │
│                                        │
│ [Select All] [Deselect All]            │
├────────────────────────────────────────┤
│               [Cancel] [Proceed]       │
└────────────────────────────────────────┘
```

**Step 4: Success Confirmation**
```
┌────────────────────────────────────────┐
│ ✓ Import Successful                    │ ← Green checkmark
├────────────────────────────────────────┤
│ Imported: 182 contacts                 │
│ Skipped (duplicates): 12 contacts      │
│ Updated (overwrites): 0 contacts       │
│                                        │
│ All contacts have been added to the    │
│ selected campaigns.                    │
├────────────────────────────────────────┤
│          [View Contacts] [Import More] │
└────────────────────────────────────────┘
```

### Deal Detail View

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Deals              [Edit] [Change Stage ▾]   │ ← Breadcrumb + actions
├─────────────────────────────────────────────────────────┤
│ [Avatar] Alimex Manufacturing                           │
│ $125,000 deal • Negotiation • 68% probability           │ ← Deal summary
├─────────────────────────────────────────────────────────┤
│ ┌────────────────────┬───────────────────────────────┐ │
│ │ Deal Information   │ Activity Timeline             │ │ ← 2-column grid
│ │ • Contact: John... │ ┌───────────────────────────┐ │ │
│ │ • Owner: Todd      │ │ Today                     │ │ │
│ │ • Expected: Dec 15 │ │ 📧 Email sent to John...  │ │ │
│ │ • Stage: Negotiat..│ │                           │ │ │
│ │ • Probability: 68% │ │ Yesterday                 │ │ │
│ │                    │ │ 📞 Phone call with...     │ │ │
│ │ Notes:             │ │                           │ │ │
│ │ [Rich text editor] │ │ Dec 5                     │ │ │
│ │                    │ │ 📅 Meeting scheduled...   │ │ │
│ └────────────────────┴───────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Interaction Patterns

### Micro-interactions

**Hover Effects:**
- **Cards:** `transform: translateY(-4px)` + shadow increase (0.3s ease)
- **Buttons:** `transform: translateY(-2px)` + shadow increase (0.2s ease)
- **Nav Items:** Background color change to Surface0 (0.2s ease)
- **Table Rows:** Background tint (0.15s ease)

**Click Feedback:**
- **Buttons:** Scale down briefly `transform: scale(0.98)` on mousedown
- **Checkboxes:** Checkmark animation (slide in from left)
- **Inputs:** Border color change + box-shadow (0.2s ease)

**Loading States:**
- **Buttons:** Show spinner, disable, change text ("Loading..." or "Processing...")
- **Tables:** Skeleton rows with pulsing animation
- **Cards:** Shimmer effect over content

**Success/Error Feedback:**
- **Success:** Green toast notification (top-right, 3s duration, slide in)
- **Error:** Red toast notification (top-right, 5s duration, shake animation)
- **Validation:** Inline error text below field (red color, 0.2s fade in)

### Form Validation

**Real-Time Validation:**
- **Email:** Check RFC 5322 format on blur (not on every keystroke)
- **LinkedIn URL:** Regex validation on blur, show error if invalid format
- **Required Fields:** Red border + error text on blur if empty
- **Password:** Show strength meter (red → yellow → green) on keystroke

**Validation States:**
```css
/* Default */
border: 1px solid var(--mocha-surface1)

/* Valid (after blur) */
border: 1px solid var(--mocha-green)
/* Optional: Show green checkmark icon */

/* Invalid (after blur) */
border: 1px solid var(--mocha-red)
/* Show error text below field */

.error-text {
  color: var(--mocha-red)
  font-size: 0.875rem
  margin-top: 0.25rem
}
```

### Navigation Flow

**Page Transitions:**
- No full page reloads (SPA behavior)
- Instant navigation (<100ms)
- Main content fade-in animation (0.2s ease)

**Modal Behavior:**
- Open: Slide up from bottom + fade in overlay (0.3s ease)
- Close: Slide down + fade out overlay (0.2s ease)
- Escape key closes modal
- Click outside modal closes modal (with confirmation if form dirty)

**Breadcrumb Pattern:**
```html
<nav class="breadcrumb">
  <a href="/contacts">Contacts</a>
  <span> / </span>
  <span>John Smith</span>
</nav>

Color: var(--mocha-subtext0)
Link color: var(--innovaas-orange) on hover
Separator: var(--mocha-overlay1)
```

---

## Responsive Breakpoints

### Breakpoint Definitions

```css
/* Mobile First Approach */
Base: 0px - 767px (mobile)
Tablet: 768px - 1023px
Desktop: 1024px - 1439px
Large Desktop: 1440px+

/* Media Queries */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Mobile Adaptations (<768px)

**Layout Changes:**
- Sidebar → Hamburger menu (slide-out drawer overlay)
- Stats Grid → Single column
- Activity Section → Single column (Recent Deals on top, Activity below)
- Table → Card list view (responsive table-to-cards transformation)
- Search bar → Full width in header
- Buttons → Full width on mobile

**Typography Scaling:**
```css
Page Title: 1.5rem (mobile) vs 2rem (desktop)
Card Title: 1rem (mobile) vs 1.25rem (desktop)
Stat Value: 1.5rem (mobile) vs 2rem (desktop)
```

**Touch Targets:**
- Minimum 44×44px for all interactive elements (WCAG 2.1)
- Increased padding on buttons and nav items
- Larger tap areas for checkboxes and radio buttons

### Tablet Adaptations (768px - 1023px)

**Layout Changes:**
- Sidebar → Icon-only (60px width), expand on hover
- Stats Grid → 2 columns
- Activity Section → Single column or stacked
- Table → Full width with horizontal scroll if needed

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast Requirements:**
- **Normal Text (16px):** 4.5:1 contrast ratio minimum
- **Large Text (24px or 18px bold):** 3:1 contrast ratio minimum
- **UI Components:** 3:1 contrast ratio for borders, states

**Contrast Validation:**
- Mocha Text (#cdd6f4) on Mocha Base (#1e1e2e): ✓ 11.6:1
- Innovaas Orange (#F25C05) on Mocha Base: ✓ 5.2:1
- Mocha Subtext0 (#a6adc8) on Mocha Base: ✓ 7.1:1

**Keyboard Navigation:**
- All interactive elements keyboard accessible (tab order logical)
- Visible focus states (orange outline, 2px, 3px offset)
- Skip to main content link (hidden until focused)
- Modal trap focus (tab cycles within modal)

**Screen Reader Support:**
```html
<!-- ARIA Labels -->
<button aria-label="Open notifications">🔔</button>
<input aria-label="Search contacts" placeholder="Search...">

<!-- ARIA Live Regions -->
<div aria-live="polite" aria-atomic="true">
  <!-- Toast notifications -->
</div>

<!-- ARIA Expanded (Dropdowns) -->
<button aria-expanded="false" aria-haspopup="true">Filter ▾</button>

<!-- ARIA Describedby (Form Errors) -->
<input aria-describedby="email-error">
<span id="email-error">Invalid email format</span>
```

**Focus Indicators:**
```css
*:focus {
  outline: 2px solid var(--innovaas-orange)
  outline-offset: 3px
  border-radius: 4px
}

/* Exception: Custom focus styles for buttons */
button:focus {
  outline: none
  box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.5)
}
```

---

## Animation & Motion

### Animation Principles

**Performance:**
- Only animate `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (layout thrashing)
- Use `will-change` sparingly for complex animations

**Duration & Easing:**
```css
/* Quick Actions (hover, click) */
transition: all 0.2s ease

/* Medium Actions (modal open, card expand) */
transition: all 0.3s ease

/* Slow Actions (page transition, complex reveal) */
transition: all 0.5s ease

/* Custom Easing */
ease-out: cubic-bezier(0, 0, 0.2, 1) /* Deceleration */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* Smooth */
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important
    animation-iteration-count: 1 !important
    transition-duration: 0.01ms !important
  }
}
```

### Common Animations

**Modal Slide Up:**
```css
@keyframes slideUp {
  from {
    transform: translateY(20px)
    opacity: 0
  }
  to {
    transform: translateY(0)
    opacity: 1
  }
}

.modal {
  animation: slideUp 0.3s ease
}
```

**Skeleton Pulse (Loading):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.5 }
}

.skeleton {
  background: var(--mocha-surface0)
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite
}
```

**Toast Slide In:**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%)
    opacity: 0
  }
  to {
    transform: translateX(0)
    opacity: 1
  }
}

.toast {
  animation: slideInRight 0.3s ease
}
```

---

## Performance Budgets

### Load Time Targets

**Time to Interactive (TTI):**
- Dashboard: <3 seconds (3G connection)
- Contacts List: <2 seconds
- Detail Views: <1.5 seconds

**First Contentful Paint (FCP):**
- All pages: <1.5 seconds

**Largest Contentful Paint (LCP):**
- All pages: <2.5 seconds

### Asset Optimization

**Images:**
- Logo: SVG (infinitely scalable, <10KB)
- Icons: Inline SVG or icon font
- User avatars: Lazy load, WebP format, max 100KB

**JavaScript:**
- Total bundle: <300KB gzipped
- Code splitting by route
- Lazy load non-critical components

**CSS:**
- Critical CSS inline (<14KB)
- Non-critical CSS async load
- PurgeCSS removes unused Tailwind classes

---

## Appendix: Component Specifications

### Icon Library

**Icon System:** Heroicons (outline style)
**Icon Sizes:**
- Nav Icons: 20×20px
- Stat Icons: 24×24px (inside 40×40px container)
- Button Icons: 16×16px

**Common Icons:**
- Dashboard: Home (outline)
- Contacts: Users (outline)
- Deals: Currency Dollar (outline)
- Settings: Cog (outline)
- Search: Magnifying Glass (outline)
- Notifications: Bell (outline)
- Upload: Document Plus (outline)

### Spacing System

**Spacing Scale (rem units):**
```css
0.25rem = 4px   (xs)
0.5rem  = 8px   (sm)
0.75rem = 12px  (md)
1rem    = 16px  (base)
1.5rem  = 24px  (lg)
2rem    = 32px  (xl)
3rem    = 48px  (2xl)
4rem    = 64px  (3xl)
```

**Usage:**
- Card padding: 1.5rem (24px)
- Section spacing: 2rem (32px)
- Button padding: 0.5rem 1rem (8px 16px)
- Input padding: 0.75rem 1rem (12px 16px)

### Shadow System

**Shadow Levels:**
```css
/* Level 1: Subtle (cards at rest) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

/* Level 2: Medium (cards hover, buttons) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

/* Level 3: High (modals, dropdowns) */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)

/* Level 4: Extreme (critical modals) */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)
```

**Colored Shadows (Brand Elements):**
```css
/* Orange CTA buttons */
box-shadow: 0 2px 8px rgba(242, 92, 5, 0.3)
/* Hover */
box-shadow: 0 4px 12px rgba(242, 92, 5, 0.4)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-09
**Next Review:** After MVP user testing
**Maintained By:** Todd (INNOVAAS Design)
**Figma Reference:** nova-crm-mockup.html (static prototype)
