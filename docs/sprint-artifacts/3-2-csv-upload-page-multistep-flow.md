# Story 3.2: CSV Upload Page - Multistep Flow

Status: done

## Story

As a sales team member (Marcus),
I want a guided multi-step CSV upload interface with drag-and-drop,
so that I can easily import contacts and review them before final import.

## Acceptance Criteria

**AC1: Upload CSV Button and Modal Trigger**
**Given** I am on the Contacts page [Source: Epics Epic 3 Story 3.2]
**When** I click the "Upload CSV" button in the page header
**Then** a multi-step upload modal opens with:
- Modal width: 800px (wider than standard for data preview)
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0 (#313244)
- Border-radius: 16px
- Step indicator at top: 4 numbered circles (1-4) with connecting progress line
- Modal centers on screen with overlay backdrop

**AC2: Step 1 - File Upload with Drag-and-Drop**
**Given** the CSV upload modal is open on Step 1 [Source: Epics Epic 3 Story 3.2, UX§6.3]
**When** I see the upload interface
**Then** the screen displays:
- Title: "Step 1 of 4: Upload CSV File"
- Drag-and-drop zone with specifications (UX§6.3):
  - Height: 200px
  - Border: 2px dashed Mocha Surface1 (#45475a)
  - Border-radius: 12px
  - Background: Mocha Surface0 (#313244)
  - File icon: 48×48px, centered
  - Text: "📁 Drag and drop CSV file here or click to browse"
  - Subtext: "Supported: .csv files only"
- Help text: "Tip: Export from LinkedIn: Connections → Manage synced contacts → Download"
- Buttons: [Cancel] (left), [Next →] (right, disabled until file uploaded)

**AC3: Drag-and-Drop Hover State**
**Given** I am on Step 1 with the drag-and-drop zone visible [Source: Epics Epic 3 Story 3.2, UX§6.3]
**When** I drag a file over the drop zone
**Then** the zone visual state changes:
- Border: Changes to solid 2px Orange (#F25C05)
- Background: rgba(242,92,5,0.1)
- Hover state persists while file is over zone
**And** when I move the file away from the zone
**Then** the zone returns to default state

**AC4: File Selection and Validation**
**Given** I am on Step 1 [Source: Epics Epic 3 Story 3.2]
**When** I drop a file or click to browse and select a file
**Then** the system validates:
- File extension must be .csv
- File size must be ≤ 5MB
**And** if validation fails:
- Show error message: "Invalid file. Please upload a .csv file under 5MB."
- Zone displays error state (border: red, background: rgba red)
- [Next] button remains disabled
**And** if validation succeeds:
- Show loading spinner: "Parsing CSV..."
- Call `parseLinkedInCSV(file)` from Story 3.1
- Parse and validate all rows
- [Next] button becomes enabled when parsing completes

**AC5: Parsing Error Handling**
**Given** CSV parsing completed with validation errors [Source: Epics Epic 3 Story 3.2]
**When** the parser returns errors in CSVParseResult
**Then** display error summary:
- "Found X errors in CSV file"
- List first 10 errors with row numbers (e.g., "Row 15: Missing required fields")
- If > 10 errors: Show "and X more..." text
- [Download Error Report] button (generates .txt file with all errors)
- [Try Another File] button to return to file selection
- [Next] button remains disabled

**AC6: Step 2 - Preview Contacts and Campaign Assignment**
**Given** CSV parsed successfully and I clicked [Next] from Step 1 [Source: Epics Epic 3 Story 3.2, UX§6.3]
**When** Step 2 loads
**Then** the screen displays:
- Title: "Step 2 of 4: Preview Contacts"
- Summary: "Successfully parsed: X contacts"
- Campaign assignment section:
  - Label: "Assign to Campaign(s):"
  - Multi-select dropdown (same styling as Story 2.2)
  - Fetches campaigns from GET /api/campaigns
  - At least one campaign must be selected to proceed
- Preview table showing first 5 contacts:
  - Columns: Name, Company, Position, LinkedIn URL
  - Table styling matches Story 2.3 contacts list
  - If > 5 contacts: Show "... and X more" indicator below table
- Buttons: [← Back] (left), [Next: Check Duplicates →] (right, disabled until campaign selected)

**AC7: Campaign Selection Requirement**
**Given** I am on Step 2 [Source: Epics Epic 3 Story 3.2]
**When** no campaign is selected
**Then** the [Next: Check Duplicates] button is disabled (grayed out)
**And** when I select at least one campaign
**Then** the [Next: Check Duplicates] button becomes enabled (orange, clickable)

**AC8: Step 2 Navigation to Duplicate Check**
**Given** I have selected at least one campaign on Step 2 [Source: Epics Epic 3 Story 3.2, Architecture§3.4.2]
**When** I click [Next: Check Duplicates]
**Then** the system:
- Shows loading indicator: "Checking for duplicates..."
- Calls POST /api/contacts/check-duplicates with all parsed contacts
- Runs duplicate detection algorithm (Architecture §3.4.2):
  - Check by (first_name + last_name) OR linkedin_url match
  - Query existing contacts table
- Advances to Step 3 with results
- If no duplicates found: Skip Step 3, advance directly to Step 4

**AC9: Step 4 - Confirm and Import Summary (No Duplicates Path)**
**Given** duplicate check completed with zero duplicates [Source: Epics Epic 3 Story 3.2, UX§6.3]
**When** Step 4 loads
**Then** the screen displays:
- Title: "Step 4 of 4: Confirm Import"
- Import summary:
  - "✓ X new contacts" (green checkmark)
  - "⟳ 0 updated contacts (duplicates)" (gray)
  - "✗ 0 skipped (duplicates)" (gray)
  - Separator line
  - "X total from CSV"
- "Campaigns:" followed by comma-separated list of selected campaign names
- Warning: "⚠️ This action will modify your database"
- Buttons: [← Back] (left), [Import Contacts] (right, orange primary button)

**AC10: Final Import Execution**
**Given** I am on Step 4 confirmation screen [Source: Epics Epic 3 Story 3.2, FR3.6]
**When** I click [Import Contacts]
**Then** the system:
- Shows progress indicator: "Importing X of Y contacts..."
- Calls POST /api/contacts/bulk-import with:
  - All parsed contacts (contacts array)
  - Selected campaign IDs (campaign_ids array)
  - Empty overwrite_ids array (no duplicates to overwrite)
- Executes transaction-based import (all-or-nothing, FR3.6)
- On success: Displays import success modal (AC11)
- On error: Shows error message modal with [Retry] and [Cancel] buttons

**AC11: Import Success Confirmation Modal**
**Given** bulk import completed successfully [Source: Epics Epic 3 Story 3.2, FR3.7]
**When** the API returns success
**Then** display success modal:
- Title: "✅ Import Complete!" (green checkmark)
- Summary statistics:
  - "Successfully imported: X contacts"
  - "Updated: 0 contacts"
  - "Skipped: 0 duplicates"
- "All contacts assigned to:" followed by bullet list of campaign names
- [View Contacts] button (orange, navigates to /contacts page)
**And** when I click [View Contacts]
**Then**:
- Modal closes and clears all state
- Navigate to /contacts page
- Contacts list refreshes to show newly imported contacts

**AC12: Multi-Step Modal State Management**
**Given** the CSV upload modal is active [Source: Epics Epic 3 Story 3.2]
**When** navigating between steps
**Then** the modal maintains:
- Current step number (1-4) in React useState
- Uploaded file reference
- Parsed contacts array (CSVParseResult)
- Selected campaign IDs
- Duplicate detection results (if applicable)
**And** step indicator at top shows:
- Completed steps: Filled circle with checkmark (orange)
- Current step: Filled orange circle with number
- Future steps: Empty circle with number (gray outline)
- Connecting lines between circles (gray or orange if completed)

**AC13: Cancel and Back Button Behavior**
**Given** I am on any step in the upload flow [Source: Epics Epic 3 Story 3.2]
**When** I click [Cancel] button
**Then**:
- Show confirmation dialog: "Are you sure? All progress will be lost."
- If confirmed: Close modal, clear all state, return to contacts page
- If cancelled: Stay on current step
**And** when I click [← Back] button (Steps 2-4 only)
**Then**:
- Navigate to previous step
- Preserve all entered data (file, campaigns, selections)
- No confirmation required

**AC14: Component File Structure and Props**
**Given** I need to implement the CSV upload modal [Source: Epics Epic 3 Story 3.2]
**When** creating the component
**Then** create file: `app/(dashboard)/contacts/components/CSVUploadModal.tsx`
**And** component structure:
- 'use client' directive (modal requires client-side state)
- Props: `{ isOpen: boolean; onClose: () => void; onSuccess: () => void }`
- State management: React useState for step tracking, file data, campaign selection
- Child components:
  - Step1Upload (file upload UI)
  - Step2Preview (preview table + campaign selection)
  - Step4Confirm (summary + import trigger)
- Close modal: Call onClose() to clear state
- Success callback: Call onSuccess() to refresh contacts list

**AC15: Drag-and-Drop Implementation**
**Given** I need drag-and-drop file upload [Source: Epics Epic 3 Story 3.2]
**When** implementing the file upload zone
**Then** use HTML5 Drag and Drop API with:
- onDragOver event: Prevent default, set hover state
- onDragLeave event: Remove hover state
- onDrop event: Prevent default, validate file, trigger parsing
- onClick fallback: Hidden file input, trigger on click
- OR use react-dropzone library for cross-browser compatibility

**AC16: API Integration Requirements**
**Given** the modal needs backend connectivity [Source: Epics Epic 3 Story 3.2]
**When** implementing Step 1-4
**Then** integrate with APIs:
- **Step 2:** GET /api/campaigns (fetch campaign list for dropdown)
- **Step 3:** POST /api/contacts/check-duplicates (duplicate detection) - Story 3.3
- **Step 4:** POST /api/contacts/bulk-import (final import) - Story 3.4
**Note:** APIs for duplicate check and bulk import are implemented in Stories 3.3 and 3.4
**For this story:** Create placeholder API calls that return mock data or errors

## Tasks / Subtasks

- [ ] Task 1: Create CSV upload modal component structure (AC: 1, 14)
  - [ ] 1.1 Create file: `app/(dashboard)/contacts/components/CSVUploadModal.tsx`
  - [ ] 1.2 Define component props: `{ isOpen, onClose, onSuccess }`
  - [ ] 1.3 Add 'use client' directive for React hooks
  - [ ] 1.4 Set up React useState for step tracking (1-4), file, parsed contacts, selected campaigns
  - [ ] 1.5 Implement modal overlay with backdrop (UX specs: Mocha Mantle, 800px width)
  - [ ] 1.6 Create step indicator component (4 circles with connecting lines)
  - [ ] 1.7 Add modal header with title and close button
  - [ ] 1.8 Implement Cancel button with confirmation dialog (AC13)
  - [ ] 1.9 Set up conditional rendering for steps 1-4

- [ ] Task 2: Implement Step 1 - File Upload with Drag-and-Drop (AC: 2, 3, 4, 5, 15)
  - [ ] 2.1 Create Step1Upload child component
  - [ ] 2.2 Implement drag-and-drop zone UI (200px height, dashed border, file icon)
  - [ ] 2.3 Add drag-over hover state (orange border, rgba background)
  - [ ] 2.4 Implement file validation (extension: .csv, size: ≤5MB)
  - [ ] 2.5 Add error state display for invalid files
  - [ ] 2.6 Integrate parseLinkedInCSV function from Story 3.1
  - [ ] 2.7 Show loading spinner during parsing
  - [ ] 2.8 Handle parsing errors: display error summary, error list, [Download Error Report] button
  - [ ] 2.9 Enable [Next] button only after successful parsing
  - [ ] 2.10 Store parsed contacts in component state

- [ ] Task 3: Implement Step 2 - Preview and Campaign Assignment (AC: 6, 7, 8, 16)
  - [ ] 3.1 Create Step2Preview child component
  - [ ] 3.2 Display "Successfully parsed: X contacts" summary
  - [ ] 3.3 Implement campaign multi-select dropdown (same styling as Story 2.2)
  - [ ] 3.4 Fetch campaigns: GET /api/campaigns (create API route if not exists)
  - [ ] 3.5 Create preview table showing first 5 contacts (Name, Company, Position, LinkedIn URL)
  - [ ] 3.6 Apply table styling from Story 2.3
  - [ ] 3.7 Add "... and X more" indicator if > 5 contacts
  - [ ] 3.8 Disable [Next: Check Duplicates] button until campaign selected
  - [ ] 3.9 Implement [← Back] button to return to Step 1
  - [ ] 3.10 Store selected campaign IDs in component state

- [ ] Task 4: Integrate Step 3 duplicate check navigation (AC: 8)
  - [ ] 4.1 Add [Next: Check Duplicates] click handler
  - [ ] 4.2 Show loading indicator: "Checking for duplicates..."
  - [ ] 4.3 Call POST /api/contacts/check-duplicates (placeholder for Story 3.3)
  - [ ] 4.4 If zero duplicates: Skip to Step 4 directly
  - [ ] 4.5 If duplicates found: Advance to Step 3 (Story 3.3 implementation)
  - [ ] 4.6 Store duplicate check results in component state

- [ ] Task 5: Implement Step 4 - Confirm and Import (AC: 9, 10, 11)
  - [ ] 5.1 Create Step4Confirm child component
  - [ ] 5.2 Display import summary: new contacts count, campaigns list
  - [ ] 5.3 Add warning message: "⚠️ This action will modify your database"
  - [ ] 5.4 Implement [← Back] button to return to Step 2
  - [ ] 5.5 Implement [Import Contacts] button (orange primary CTA)
  - [ ] 5.6 Show progress indicator during import: "Importing X of Y contacts..."
  - [ ] 5.7 Call POST /api/contacts/bulk-import with contacts and campaign_ids
  - [ ] 5.8 Handle import errors: display error modal with [Retry] and [Cancel]
  - [ ] 5.9 On success: Display success modal (green checkmark, statistics, campaign list)
  - [ ] 5.10 Add [View Contacts] button that closes modal and navigates to /contacts

- [ ] Task 6: Implement step indicator UI component (AC: 12)
  - [ ] 6.1 Create StepIndicator subcomponent
  - [ ] 6.2 Render 4 circles with connecting lines
  - [ ] 6.3 Apply styles: completed (checkmark, orange), current (orange number), future (gray outline)
  - [ ] 6.4 Update indicator dynamically based on current step prop
  - [ ] 6.5 Add connecting lines between circles (gray or orange for completed)

- [ ] Task 7: Add "Upload CSV" button to Contacts page (AC: 1)
  - [ ] 7.1 Open `app/(dashboard)/contacts/page.tsx`
  - [ ] 7.2 Add state: `const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)`
  - [ ] 7.3 Add button to page header: "Upload CSV" (secondary button style)
  - [ ] 7.4 Position button next to "+ New Contact" button
  - [ ] 7.5 onClick: `setIsUploadModalOpen(true)`
  - [ ] 7.6 Render CSVUploadModal component with isOpen prop
  - [ ] 7.7 Pass onClose callback to close modal
  - [ ] 7.8 Pass onSuccess callback to refresh contacts list

- [ ] Task 8: Create API routes (placeholders for Stories 3.3-3.4) (AC: 16)
  - [ ] 8.1 Create `app/api/campaigns/route.ts` if not exists
  - [ ] 8.2 Implement GET /api/campaigns: Return list of campaigns from database
  - [ ] 8.3 Create placeholder `app/api/contacts/check-duplicates/route.ts`
  - [ ] 8.4 Placeholder duplicate check: Return mock result (0 duplicates for now)
  - [ ] 8.5 Create placeholder `app/api/contacts/bulk-import/route.ts`
  - [ ] 8.6 Placeholder bulk import: Return success with mock statistics
  - [ ] 8.7 Add TODO comments: "To be implemented in Story 3.3" and "Story 3.4"

- [ ] Task 9: Style components with TailwindCSS and UX specifications (AC: All)
  - [ ] 9.1 Apply modal container styles (Mocha Mantle, 800px width, border, border-radius)
  - [ ] 9.2 Apply drag-drop zone styles (dashed border, hover states, error states)
  - [ ] 9.3 Style step indicator (circles, numbers, connecting lines, color states)
  - [ ] 9.4 Apply button styles (primary orange, secondary gray, disabled states)
  - [ ] 9.5 Style preview table (match Story 2.3 contacts list styling)
  - [ ] 9.6 Apply modal header/footer styles (borders, padding)
  - [ ] 9.7 Add animations: modal slide-up, hover transitions, loading spinners
  - [ ] 9.8 Ensure responsive behavior (modal width on mobile: 95vw max)

- [ ] Task 10: Comprehensive testing (AC: All)
  - [ ] 10.1 Create test file: `__tests__/components/CSVUploadModal.test.tsx`
  - [ ] 10.2 Test: Modal opens and closes correctly
  - [ ] 10.3 Test: File validation (valid .csv, invalid extension, file too large)
  - [ ] 10.4 Test: Drag-and-drop hover states
  - [ ] 10.5 Test: CSV parsing integration (success and error scenarios)
  - [ ] 10.6 Test: Campaign selection enables/disables Next button
  - [ ] 10.7 Test: Step navigation (forward and back)
  - [ ] 10.8 Test: Cancel confirmation dialog
  - [ ] 10.9 Test: Import success flow and modal close
  - [ ] 10.10 Test: Error handling (parsing errors, API errors)
  - [ ] 10.11 Run all tests and verify 100% pass rate

## Dev Notes

### Critical Implementation Context

**Component Architecture:**
This story implements the primary user-facing UI for CSV import (Epic 3). The multi-step modal guides users through file upload → preview → duplicate resolution (Story 3.3) → import confirmation. This story focuses on Steps 1, 2, and 4, with Step 3 (duplicate resolution) handled in Story 3.3.

**Integration Points:**
- **Story 3.1 Dependency:** Uses `parseLinkedInCSV()` utility from `app/lib/csv-parser.ts`
- **Story 3.3 Integration:** Step 3 duplicate resolution modal (separate story)
- **Story 3.4 Integration:** POST /api/contacts/bulk-import endpoint (separate story)
- **Story 2.3 Styling:** Preview table matches existing contacts list table styles

**State Management Strategy:**
- React useState for multi-step form state (avoid complex state management for MVP)
- Single CSVUploadModal component manages all steps
- Child components (Step1Upload, Step2Preview, Step4Confirm) receive props and callbacks
- State preserved when navigating back/forward between steps

### Architecture Requirements

**Next.js 15 + React 19 Component Patterns** [Source: Architecture§Frontend]
- **'use client' Directive:** Required for components using hooks (useState, useEffect)
- **Server Components Default:** API routes are server-side by default
- **Import Paths:** Use `@/app/...` path aliases configured in tsconfig.json

**Modal Implementation Pattern:**
```typescript
// app/(dashboard)/contacts/components/CSVUploadModal.tsx
'use client'

import { useState } from 'react'
import { parseLinkedInCSV, type CSVParseResult } from '@/app/lib/csv-parser'

interface CSVUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CSVUploadModal({ isOpen, onClose, onSuccess }: CSVUploadModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])

  // Render step conditionally
  return (
    <div className="modal-overlay" style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="modal-container">
        <StepIndicator currentStep={currentStep} />
        {currentStep === 1 && <Step1Upload onNext={() => setCurrentStep(2)} />}
        {currentStep === 2 && <Step2Preview onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(1)} />}
        {currentStep === 4 && <Step4Confirm onBack={() => setCurrentStep(2)} onImport={handleImport} />}
      </div>
    </div>
  )
}
```

**Drag-and-Drop Implementation Options:**

1. **HTML5 Drag-and-Drop API (Native):**
```typescript
const [isDragOver, setIsDragOver] = useState(false)

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragOver(true)
}

const handleDragLeave = () => {
  setIsDragOver(false)
}

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  setIsDragOver(false)
  const file = e.dataTransfer.files[0]
  handleFileUpload(file)
}

<div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
>
  {/* Drop zone UI */}
</div>
```

2. **react-dropzone Library (Recommended):**
```typescript
import { useDropzone } from 'react-dropzone'

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: { 'text/csv': ['.csv'] },
  maxSize: 5 * 1024 * 1024, // 5MB
  onDrop: (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0])
    }
  }
})

<div {...getRootProps()} className={`drop-zone ${isDragActive ? 'drag-over' : ''}`}>
  <input {...getInputProps()} />
  {/* Drop zone UI */}
</div>
```

**CSV Parsing Integration:**
```typescript
import { parseLinkedInCSV, type CSVParseResult } from '@/app/lib/csv-parser'

const handleFileUpload = async (file: File) => {
  setIsLoading(true)
  setError(null)

  try {
    const result = await parseLinkedInCSV(file)

    if (result.errors.length > 0) {
      // Show error summary UI
      setParseErrors(result.errors)
    } else {
      // Success: store parsed contacts, enable Next button
      setParseResult(result)
      setCanProceedToStep2(true)
    }
  } catch (error) {
    setError('Failed to parse CSV file. Please ensure it is a valid LinkedIn export.')
  } finally {
    setIsLoading(false)
  }
}
```

**Campaign API Integration:**
```typescript
// Fetch campaigns for dropdown in Step 2
useEffect(() => {
  if (currentStep === 2) {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data.campaigns))
      .catch(err => console.error('Failed to fetch campaigns:', err))
  }
}, [currentStep])
```

**Placeholder API Routes (To Be Implemented in Stories 3.3-3.4):**
```typescript
// app/api/contacts/check-duplicates/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Implement in Story 3.3
  // For now, return mock result (0 duplicates)
  return NextResponse.json({
    duplicates: [],
    totalChecked: 0
  })
}

// app/api/contacts/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: Implement in Story 3.4
  // For now, return mock success
  const body = await request.json()
  return NextResponse.json({
    success: true,
    imported: body.contacts.length,
    skipped: 0,
    updated: 0
  })
}
```

### UX Design Specifications

**Modal Container Styling** [Source: UX§6.3, §4.6]
```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Modal Container */
.modal-container {
  background: var(--mocha-mantle, #181825);
  border: 1px solid var(--mocha-surface0, #313244);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

/* Tailwind Classes */
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8"
className="bg-[#181825] border border-[#313244] rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
```

**Drag-and-Drop Zone Styling** [Source: UX§6.3]
```css
/* Drop Zone Default */
.drop-zone {
  height: 200px;
  border: 2px dashed var(--mocha-surface1, #45475a);
  border-radius: 12px;
  background: var(--mocha-surface0, #313244);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover State (file dragging over) */
.drop-zone.drag-over {
  border: 2px solid var(--innovaas-orange, #F25C05);
  background: rgba(242, 92, 5, 0.1);
}

/* Tailwind Classes */
className="h-[200px] border-2 border-dashed border-[#45475a] rounded-xl bg-[#313244] flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          hover:border-[#F25C05] hover:bg-[rgba(242,92,5,0.05)]
          [&.drag-over]:border-solid [&.drag-over]:border-[#F25C05] [&.drag-over]:bg-[rgba(242,92,5,0.1)]"
```

**Step Indicator Component** [Source: UX§6.3]
```typescript
// Step circles with connecting lines
<div className="flex items-center justify-center gap-2 mb-8">
  {[1, 2, 3, 4].map((step, index) => (
    <React.Fragment key={step}>
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
        ${step < currentStep ? 'bg-[#F25C05] text-white' : ''}
        ${step === currentStep ? 'bg-[#F25C05] text-white ring-2 ring-[#F25C05] ring-offset-2 ring-offset-[#181825]' : ''}
        ${step > currentStep ? 'bg-transparent border-2 border-[#6c7086] text-[#6c7086]' : ''}
      `}>
        {step < currentStep ? '✓' : step}
      </div>
      {index < 3 && (
        <div className={`h-0.5 w-8 ${step < currentStep ? 'bg-[#F25C05]' : 'bg-[#45475a]'}`} />
      )}
    </React.Fragment>
  ))}
</div>
```

**Button Styling** [Source: UX§Buttons]
```typescript
// Primary Button (Import Contacts)
className="bg-[#F25C05] hover:bg-[#D94C04] text-white font-semibold px-4 py-2 rounded-lg shadow-[0_2px_8px_rgba(242,92,5,0.3)] hover:shadow-[0_4px_12px_rgba(242,92,5,0.4)] hover:-translate-y-0.5 transition-all duration-200"

// Secondary Button (Cancel, Back)
className="bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] font-semibold px-4 py-2 rounded-lg border border-[#45475a] transition-all duration-200"

// Disabled Button
className="bg-[#313244] text-[#6c7086] font-semibold px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
```

**Preview Table Styling** [Source: UX§Tables, Story 2.3]
```typescript
// Match existing contacts list table styles
<table className="w-full">
  <thead className="border-b border-[#313244]">
    <tr>
      <th className="text-left px-2 py-3 text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
        Name
      </th>
      {/* Other headers */}
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-[#313244] hover:bg-[rgba(242,92,5,0.03)] transition-colors">
      <td className="px-2 py-4 text-[#cdd6f4]">John Smith</td>
      {/* Other cells */}
    </tr>
  </tbody>
</table>
```

### Project Structure Context

**File Locations:** [Source: Previous stories, Architecture]
```
novacrm/
├── app/
│   ├── (dashboard)/
│   │   ├── contacts/
│   │   │   ├── page.tsx                     ← Add "Upload CSV" button here
│   │   │   └── components/
│   │   │       ├── CSVUploadModal.tsx       ← Main modal component (THIS STORY)
│   │   │       ├── Step1Upload.tsx          ← File upload step (optional: inline)
│   │   │       ├── Step2Preview.tsx         ← Preview step (optional: inline)
│   │   │       └── Step4Confirm.tsx         ← Confirm step (optional: inline)
│   ├── lib/
│   │   └── csv-parser.ts                    ← CSV parsing utility (Story 3.1)
│   └── api/
│       ├── campaigns/
│       │   └── route.ts                     ← GET /api/campaigns
│       └── contacts/
│           ├── check-duplicates/
│           │   └── route.ts                 ← POST (placeholder, Story 3.3)
│           └── bulk-import/
│               └── route.ts                 ← POST (placeholder, Story 3.4)
├── __tests__/
│   └── components/
│       └── CSVUploadModal.test.tsx          ← Component tests (THIS STORY)
└── package.json
```

**Component Organization Options:**
1. **Single File Approach:** All steps inline in CSVUploadModal.tsx (simpler, recommended for MVP)
2. **Multi-File Approach:** Separate files for each step (cleaner, better for large components)

Choose single-file approach for MVP unless individual step components exceed ~150 lines.

### Established Code Patterns

**Import Conventions:** [Source: Recent commits, Story 3.1]
```typescript
// External libraries first
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Internal utilities
import { parseLinkedInCSV, type CSVParseResult } from '@/app/lib/csv-parser'
import { createClient } from '@/app/lib/supabase/client'

// Types last
import type { Campaign } from '@/app/lib/types'
```

**Modal Component Pattern:**
```typescript
// Use conditional rendering based on isOpen prop
if (!isOpen) return null

// OR use style display none
<div style={{ display: isOpen ? 'flex' : 'none' }}>
  {/* Modal content */}
</div>
```

**API Route Pattern:**
```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, description, status')
    .eq('status', 'Active')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ campaigns: data })
}
```

**Error Handling Pattern:**
```typescript
try {
  const result = await someAsyncOperation()
  // Success handling
} catch (error) {
  console.error('Operation failed:', error)
  setError(error instanceof Error ? error.message : 'Unknown error occurred')
}
```

### Previous Story Learnings

**From Story 3.1 (CSV Parser):**
- `parseLinkedInCSV()` utility exists and is fully tested
- Returns CSVParseResult with contacts, errors, totalRows, validRows
- Handles blank emails, special characters, date parsing automatically
- Vitest testing framework configured (v4.0.15)
- Run tests: `npm test` or `npm run test:watch`

**From Story 2.3 (Contacts List):**
- Contacts list page: `app/(dashboard)/contacts/page.tsx`
- Table styling: Mocha theme with hover effects
- Search/filter patterns established
- Pagination UI patterns

**From Story 2.2 (Contact Creation):**
- Form components use 'use client' directive
- Input styling: Mocha Surface0 background, orange focus states
- Supabase client: `await createClient()` in API routes
- Multi-select dropdown patterns

**From Story 1.4 (Application Layout):**
- Dashboard layout: `app/(dashboard)/layout.tsx`
- Sidebar navigation: 280px width (desktop)
- Header with search bar
- Modal z-index: Use z-50 or higher for overlay

**Key Architectural Decisions:** [Source: Previous stories]
- Next.js 15: Use App Router, Server Components default
- React 19: 'use client' for hooks
- TailwindCSS: Utility-first styling, no CSS modules
- Catppuccin Mocha + Innovaas Orange color scheme
- TypeScript strict mode enabled
- Supabase for database operations

### Testing Requirements

**Testing Framework:** Vitest + React Testing Library [Source: Story 3.1]

**Test File Template:**
```typescript
// __tests__/components/CSVUploadModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import CSVUploadModal from '@/app/(dashboard)/contacts/components/CSVUploadModal'

describe('CSVUploadModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal when isOpen is true', () => {
    render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(<CSVUploadModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    expect(container.firstChild).toBeNull()
  })

  it('should validate file extension (.csv required)', async () => {
    render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/drag and drop/i)

    fireEvent.change(input, { target: { files: [invalidFile] } })

    await waitFor(() => {
      expect(screen.getByText(/Invalid file/i)).toBeInTheDocument()
    })
  })

  // Add more test cases for:
  // - File size validation
  // - CSV parsing integration
  // - Campaign selection
  // - Step navigation
  // - Import success flow
  // - Error handling
})
```

**Test Coverage Requirements:**
- Modal open/close behavior
- File validation (extension, size)
- Drag-and-drop hover states
- CSV parsing integration
- Campaign dropdown and selection
- Step navigation (forward/back)
- Cancel confirmation dialog
- Import success and error scenarios
- API integration (mock fetch calls)

**Run Tests:**
```bash
npm test                    # Run all tests once
npm run test:watch          # Watch mode for development
npm run test:ui             # Vitest UI (visual test runner)
```

### Success Criteria Summary

**Definition of Done for This Story:**
1. ✅ CSV upload modal component created and integrated into contacts page
2. ✅ Step 1: File upload with drag-and-drop, validation, parsing integration
3. ✅ Step 2: Preview table, campaign selection, duplicate check navigation
4. ✅ Step 4: Confirm summary, import execution, success modal
5. ✅ Step indicator UI with visual state (completed, current, future steps)
6. ✅ All UX specifications implemented (colors, spacing, animations)
7. ✅ API routes created: GET /api/campaigns, placeholder duplicate check & bulk import
8. ✅ Comprehensive unit tests created (modal behavior, file validation, step navigation)
9. ✅ All tests pass (npm test)
10. ✅ No regressions in existing functionality

**Story Completion Checklist:**
- [ ] CSVUploadModal component created with all steps
- [ ] "Upload CSV" button added to contacts page
- [ ] Drag-and-drop file upload functional
- [ ] CSV parsing integrated with error handling
- [ ] Campaign dropdown fetches and displays campaigns
- [ ] Step navigation works (forward/back)
- [ ] Import flow completes successfully (placeholder API)
- [ ] All UX specs applied (colors, spacing, animations)
- [ ] API routes created (campaigns, placeholders for duplicates & import)
- [ ] Comprehensive tests created and passing
- [ ] Code committed with descriptive message
- [ ] Story status updated to "review"

### References

- [Source: Epics Epic 3 Story 3.2] - Complete story requirements and technical notes
- [Source: Architecture§CSV Import Architecture] - CSV parser, file handling, API patterns
- [Source: Architecture§Frontend] - Next.js 15, React 19, component patterns
- [Source: UX§6.3] - Multi-step modal design specifications
- [Source: UX§4.6] - Modal container styling
- [Source: UX§Buttons] - Button styling variants
- [Source: UX§Tables] - Table styling patterns
- [Source: Story 3.1] - CSV parser utility, testing framework
- [Source: Story 2.3] - Contacts list page, table styling
- [Source: Story 2.2] - Form patterns, multi-select dropdowns
- [Source: FR3.6, FR3.7] - Import requirements, success confirmation

## Dev Agent Record

### Context Reference

Story created by BMad Master create-story workflow with comprehensive context analysis.

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via BMad Master / create-story workflow

### Debug Log References

None

### Completion Notes List

Story created with comprehensive developer context:
- All 16 acceptance criteria detailed with exact specifications
- 10 major tasks with 60+ subtasks for complete implementation
- UX design specifications with exact colors, spacing, and animations
- Code examples for drag-and-drop, API integration, styling
- Previous story learnings integrated (Story 3.1 parser, Story 2.2-2.3 patterns)
- Architecture compliance ensured (Next.js 15, React 19, Supabase)
- Testing strategy with test file template and coverage requirements
- References to source documents for developer verification

### File List

**New Files to be Created:**
- `novacrm/app/(dashboard)/contacts/components/CSVUploadModal.tsx` - Multi-step CSV upload modal
- `novacrm/app/api/campaigns/route.ts` - GET campaigns API (if not exists)
- `novacrm/app/api/contacts/check-duplicates/route.ts` - Placeholder duplicate check API
- `novacrm/app/api/contacts/bulk-import/route.ts` - Placeholder bulk import API
- `novacrm/__tests__/components/CSVUploadModal.test.tsx` - Component test suite

**Files to be Modified:**
- `novacrm/app/(dashboard)/contacts/page.tsx` - Add "Upload CSV" button and modal integration

### Change Log

**2025-12-10:**
- Story created with comprehensive context analysis
- All Epic 3 Story 3.2 requirements documented
- UX specifications extracted and formatted for developer use
- Architecture patterns identified and documented
- Previous story learnings integrated (CSV parser, testing framework)
- Placeholder API routes specified for Stories 3.3-3.4 integration
- Story marked ready-for-dev
