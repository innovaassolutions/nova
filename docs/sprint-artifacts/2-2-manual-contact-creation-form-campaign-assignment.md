# Story 2.2: Contact Creation Form - Manual LinkedIn Capture

Status: drafted

## Story

As a sales team member (Marcus),
I want a fast, simple form to manually capture LinkedIn connections,
so that I can log new contacts in under 2 minutes with campaign attribution.

## Acceptance Criteria

**AC1: Modal Opens from Contacts Page**
**Given** I am authenticated and on the Contacts page
**When** I click the "+ New Contact" button (orange primary button) [Source: UX§4.1, Epics Epic 2 Story 2.2]
**Then** a modal opens with the contact creation form [Source: UX§4.6]

**AC2: Modal Design Specifications**
**When** the modal opens
**Then** I see the following design [Source: UX§4.6]:
- Max-width: 600px
- Background: Mocha Mantle (#181825)
- Border: 1px solid Mocha Surface0
- Border-radius: 16px
- Overlay: rgba(0, 0, 0, 0.7) with backdrop-filter blur(4px)
- Animation: slideUp 0.3s ease
- Close button: X icon (top-right)

**AC3: Required Form Fields**
**When** the form loads
**Then** I see the following required fields [Source: Epics Epic 2 Story 2.2, UX§4.3]:

1. **First Name** (text input, required)
   - Label: "First Name" (0.875rem, weight 600, Mocha Subtext0)
   - Input: Surface0 background, Surface1 border, 10px border-radius
   - Validation: Cannot be empty
   - Error: "First name is required" (red text below field)

2. **Last Name** (text input, required)
   - Same styling as First Name
   - Validation: Cannot be empty
   - Error: "Last name is required"

3. **LinkedIn Profile URL** (text input, required)
   - Label: "LinkedIn Profile URL"
   - Placeholder: "https://www.linkedin.com/in/username"
   - Validation: Must match pattern `^https://www\.linkedin\.com/in/[a-zA-Z0-9_-]+/?$` [Source: Architecture§3.4.1]
   - Real-time validation on blur [Source: UX§8.2]
   - Error: "Please enter a valid LinkedIn profile URL"
   - Success indicator: Green border + checkmark icon when valid

**AC4: Optional Form Fields**
**And** I see the following optional fields [Source: Epics Epic 2 Story 2.2, UX§4.3]:

4. **Email** (text input, optional)
   - Validation: RFC 5322 format if provided
   - Error: "Please enter a valid email address"

5. **Company** (text input, optional)
   - Placeholder: "Company name"

6. **Position** (text input, optional)
   - Placeholder: "Job title"

7. **Connected On** (date picker, optional)
   - Label: "LinkedIn Connection Date"
   - Default: Today's date
   - Format: YYYY-MM-DD

8. **Campaign** (dropdown multi-select, required)
   - Label: "Assign to Campaign(s)"
   - Loads campaign names from campaigns table [Source: Architecture§2.3.3]
   - Allows multiple campaign selection
   - Styled dropdown with checkboxes [Source: UX§4.3]
   - At least one campaign must be selected
   - Error: "Please select at least one campaign"

9. **Lead Source** (dropdown, default: "LinkedIn")
   - Options: "LinkedIn", "Referral", "Other"
   - Default: "LinkedIn"

**AC5: Form Submission Success**
**When** I submit the form with valid data
**Then** the system [Source: Epics Epic 2 Story 2.2, Architecture§3.3]:
- Calls POST /api/contacts API route
- Creates contact record in contacts table
- Assigns owner_id to current logged-in user [Source: Architecture§3.1]
- Creates campaign_contacts associations for selected campaigns [Source: Architecture§2.3.4]
- Sets source, created_at, updated_at automatically
- Shows success toast: "Contact added successfully" (green, 3s duration) [Source: UX§8.1]
- Closes modal
- Refreshes contacts list to show new contact

**AC6: Form Validation Errors**
**When** validation fails
**Then** inline error messages appear below invalid fields [Source: UX§8.2]:
- Red text (Mocha Red #f38ba8)
- 0.875rem font size
- Specific error per field
- Submit button remains disabled until all errors resolved

**AC7: Performance Target**
**When** I use the form
**Then** I can complete contact entry in under 2 minutes [Source: Epics Epic 2 Story 2.2, FR10.1]

## Tasks / Subtasks

- [ ] 1. Create contacts page with modal trigger (AC: 1)
  - [ ] 1.1 Update app/(dashboard)/contacts/page.tsx from placeholder to functional page
  - [ ] 1.2 Add page header with "+ New Contact" button (orange primary, UX§4.1 styling)
  - [ ] 1.3 Add state management for modal open/close (useState)
  - [ ] 1.4 Implement button click handler to open modal

- [ ] 2. Create ContactFormModal component (AC: 2, 3, 4)
  - [ ] 2.1 Create file: app/(dashboard)/contacts/components/ContactFormModal.tsx
  - [ ] 2.2 Mark as 'use client' for form interactivity
  - [ ] 2.3 Implement modal overlay with backdrop blur (UX§4.6)
  - [ ] 2.4 Create modal container with max-width 600px, Mocha Mantle background
  - [ ] 2.5 Add modal header with title and X close button
  - [ ] 2.6 Implement slideUp animation (0.3s ease) on modal open
  - [ ] 2.7 Add click-outside-to-close functionality
  - [ ] 2.8 Add escape key to close modal

- [ ] 3. Implement form fields and validation (AC: 3, 4, 6)
  - [ ] 3.1 Set up form state management (React useState or useForm hook)
  - [ ] 3.2 Create FormField component for consistent styling
  - [ ] 3.3 Implement First Name field with required validation
  - [ ] 3.4 Implement Last Name field with required validation
  - [ ] 3.5 Implement LinkedIn URL field with regex validation on blur
  - [ ] 3.6 Add success indicator (green border + checkmark) for valid LinkedIn URL
  - [ ] 3.7 Implement Email field with RFC 5322 validation (optional)
  - [ ] 3.8 Implement Company field (optional text input)
  - [ ] 3.9 Implement Position field (optional text input)
  - [ ] 3.10 Implement Connected On date picker with default today's date
  - [ ] 3.11 Implement Lead Source dropdown with default "LinkedIn"

- [ ] 4. Create campaign multi-select dropdown (AC: 4)
  - [ ] 4.1 Create GET /api/campaigns API route to fetch available campaigns
  - [ ] 4.2 Fetch campaigns on modal open
  - [ ] 4.3 Create CampaignMultiSelect component with checkboxes
  - [ ] 4.4 Style dropdown per UX§4.3 specifications
  - [ ] 4.5 Implement multi-selection state (array of campaign IDs)
  - [ ] 4.6 Add validation: at least one campaign required
  - [ ] 4.7 Display selected campaign count badge

- [ ] 5. Implement form submission logic (AC: 5)
  - [ ] 5.1 Create POST /api/contacts API route in app/api/contacts/route.ts
  - [ ] 5.2 Get authenticated user from Supabase session (owner_id)
  - [ ] 5.3 Validate all required fields server-side
  - [ ] 5.4 Validate LinkedIn URL format server-side
  - [ ] 5.5 Insert contact record into contacts table
  - [ ] 5.6 Insert campaign associations into campaign_contacts table (transaction)
  - [ ] 5.7 Handle unique constraint violation on linkedin_url (duplicate detection)
  - [ ] 5.8 Return success response with new contact ID

- [ ] 6. Implement client-side submission handling (AC: 5, 6)
  - [ ] 6.1 Add loading state during submission (disable button, show spinner)
  - [ ] 6.2 Call POST /api/contacts with form data
  - [ ] 6.3 Handle success: show toast notification (green, 3s, "Contact added successfully")
  - [ ] 6.4 Handle success: close modal
  - [ ] 6.5 Handle success: trigger contacts list refresh (if list exists)
  - [ ] 6.6 Handle errors: display inline error messages
  - [ ] 6.7 Handle duplicate LinkedIn URL: show specific error message
  - [ ] 6.8 Prevent double submission with loading state

- [ ] 7. Create toast notification system (AC: 5)
  - [ ] 7.1 Create Toast component in app/(dashboard)/components/Toast.tsx
  - [ ] 7.2 Style toast per UX§8.1 (green for success, position top-right)
  - [ ] 7.3 Implement auto-dismiss after 3 seconds
  - [ ] 7.4 Add slide-in animation from right
  - [ ] 7.5 Create ToastContext for global toast management

- [ ] 8. Testing and validation (AC: 7, ALL)
  - [ ] 8.1 Test form with all valid data (happy path)
  - [ ] 8.2 Test LinkedIn URL validation with invalid formats
  - [ ] 8.3 Test LinkedIn URL validation with valid format + success indicator
  - [ ] 8.4 Test email validation with invalid format
  - [ ] 8.5 Test required field validation (first name, last name, LinkedIn URL, campaigns)
  - [ ] 8.6 Test campaign multi-select (select/deselect)
  - [ ] 8.7 Test duplicate LinkedIn URL handling
  - [ ] 8.8 Test modal close on overlay click, escape key, and X button
  - [ ] 8.9 Test form completion time (<2 minutes with realistic data entry)
  - [ ] 8.10 Verify database: contact inserted with correct owner_id
  - [ ] 8.11 Verify database: campaign_contacts associations created correctly

- [ ] 9. Finalize and commit (AC: ALL)
  - [ ] 9.1 Verify all acceptance criteria satisfied
  - [ ] 9.2 Test on deployed Vercel instance
  - [ ] 9.3 Commit changes with descriptive message
  - [ ] 9.4 Update story status to review

## Dev Notes

### Critical Implementation Patterns from Previous Stories

**Component Creation Pattern (from Story 1.5):** [Source: 1-5-protected-routes-session-management.md]
- Use 'use client' directive for components with useState, form handlers
- Place reusable components in `app/(dashboard)/components/`
- Place page-specific components in `app/(dashboard)/[page]/components/`
- Import Heroicons from '@heroicons/react/24/outline'
- Use Catppuccin Mocha colors exactly as specified in UX design

**Modal Pattern Established:**
```typescript
// ContactFormModal.tsx structure
'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContactFormModal({ isOpen, onClose, onSuccess }: ContactFormModalProps) {
  // Form state
  // Validation logic
  // Submit handler
  // Return JSX
}
```

**API Route Pattern (from Architecture):** [Source: Architecture.md§3.3]
```typescript
// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validate and insert
  // Return response
}
```

### Architecture Requirements

**Contact Creation API** [Source: Architecture.md§3.3]
- **Endpoint:** POST /api/contacts
- **Authentication:** Required (Supabase session)
- **Request Body:**
```typescript
{
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email?: string;
  company?: string;
  position?: string;
  connected_on?: string; // YYYY-MM-DD
  source: string; // Default: "LinkedIn"
  campaign_ids: string[]; // UUID array (required, min 1)
}
```

**Response:**
```typescript
// Success (201)
{
  success: true;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    // ... full contact object
  }
}

// Error (400/409/500)
{
  error: string;
  details?: any;
}
```

**LinkedIn URL Validation** [Source: Architecture.md§3.4.1]
```typescript
const linkedinUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

function validateLinkedInUrl(url: string): boolean {
  return linkedinUrlPattern.test(url);
}
```

**Email Validation (RFC 5322):**
```typescript
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
```

### Database Transaction Pattern

**Contact + Campaign Associations (Atomic):** [Source: Architecture.md§2.3.4]
```typescript
// Insert contact and campaign associations in transaction
const { data: contact, error: contactError } = await supabase
  .from('contacts')
  .insert({
    first_name,
    last_name,
    linkedin_url,
    email,
    company,
    position,
    connected_on,
    source: source || 'Manual Entry',
    owner_id: user.id, // From authenticated session
  })
  .select()
  .single();

if (contactError) {
  // Handle duplicate linkedin_url (unique constraint violation)
  if (contactError.code === '23505') {
    return NextResponse.json(
      { error: 'A contact with this LinkedIn URL already exists' },
      { status: 409 }
    );
  }
  throw contactError;
}

// Create campaign associations
const campaignAssociations = campaign_ids.map((campaign_id) => ({
  campaign_id,
  contact_id: contact.id,
}));

const { error: campaignError } = await supabase
  .from('campaign_contacts')
  .insert(campaignAssociations);

if (campaignError) throw campaignError;
```

### UX Design Specifications

**Modal Styling** [Source: UX-Design.md§4.6]
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  max-width: 600px;
  width: 90%;
  background: var(--mocha-mantle); /* #181825 */
  border: 1px solid var(--mocha-surface0); /* #313244 */
  border-radius: 16px;
  padding: 2rem;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Form Field Styling** [Source: UX-Design.md§4.3]
```css
.form-field-label {
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  color: var(--mocha-subtext0); /* #a6adc8 */
  margin-bottom: 0.5rem;
  display: block;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--mocha-surface0); /* #313244 */
  border: 1px solid var(--mocha-surface1); /* #45475a */
  border-radius: 10px;
  color: var(--mocha-text); /* #cdd6f4 */
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--innovaas-orange); /* #F25C05 */
  box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1);
}

.form-input.error {
  border-color: var(--mocha-red); /* #f38ba8 */
}

.form-input.success {
  border-color: var(--mocha-green); /* #a6e3a1 */
}

.form-error-message {
  color: var(--mocha-red); /* #f38ba8 */
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

**Button Styling** [Source: UX-Design.md§4.1]
```css
.button-primary {
  background: var(--innovaas-orange); /* #F25C05 */
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-primary:hover:not(:disabled) {
  background: var(--innovaas-orange-hover); /* #D94C04 */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 92, 5, 0.3);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Toast Notification** [Source: UX-Design.md§8.1]
```css
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: var(--mocha-green); /* #a6e3a1 */
  color: var(--mocha-base); /* #1e1e2e - dark text on green */
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.3s ease;
  z-index: 2000;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Campaign Multi-Select Component

**Design Pattern:**
```typescript
// CampaignMultiSelect.tsx
interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface CampaignMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CampaignMultiSelect({ selectedIds, onChange }: CampaignMultiSelectProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch campaigns from GET /api/campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data.campaigns));
  }, []);

  const toggleCampaign = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(cid => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Render dropdown with checkboxes
}
```

### Testing Checklist

**Happy Path:**
- [ ] Fill all required fields with valid data
- [ ] Select 2 campaigns
- [ ] Submit form
- [ ] Verify success toast appears
- [ ] Verify modal closes
- [ ] Verify contact appears in database with correct owner_id

**Edge Cases:**
- [ ] Empty required fields → show inline errors
- [ ] Invalid LinkedIn URL format → show error, no green checkmark
- [ ] Valid LinkedIn URL → show green border + checkmark
- [ ] Invalid email format (if provided) → show error
- [ ] No campaigns selected → show error
- [ ] Duplicate LinkedIn URL → show 409 error message
- [ ] Modal close methods: overlay click, escape key, X button

**Performance:**
- [ ] Form loads in <500ms
- [ ] Campaign dropdown populates in <1s
- [ ] Form submission completes in <2s
- [ ] Total time to add contact: <2 minutes (manual entry)

### File List

**Files to Create:**
- `app/(dashboard)/contacts/page.tsx` - Updated from placeholder to functional page with modal trigger
- `app/(dashboard)/contacts/components/ContactFormModal.tsx` - Main modal component
- `app/(dashboard)/contacts/components/CampaignMultiSelect.tsx` - Campaign dropdown component
- `app/(dashboard)/components/Toast.tsx` - Toast notification component (reusable)
- `app/(dashboard)/components/ToastContext.tsx` - Toast state management context
- `app/api/contacts/route.ts` - POST endpoint for contact creation
- `app/api/campaigns/route.ts` - GET endpoint for campaign list

**Files to Verify:**
- `app/lib/supabase/client.ts` - Supabase browser client (already exists from Story 1.2)
- `app/lib/supabase/server.ts` - Supabase server client (already exists from Story 1.2)

### References

- [Source: docs/epics.md Epic 2 Story 2.2] - Complete story requirements and acceptance criteria
- [Source: docs/UX-Design.md§4.1] - Button styling specifications
- [Source: docs/UX-Design.md§4.3] - Form field styling specifications
- [Source: docs/UX-Design.md§4.6] - Modal design specifications
- [Source: docs/UX-Design.md§8.1] - Toast notification specifications
- [Source: docs/UX-Design.md§8.2] - Inline validation error specifications
- [Source: docs/Architecture.md§2.3.2] - Contacts table schema
- [Source: docs/Architecture.md§2.3.3] - Campaigns table schema
- [Source: docs/Architecture.md§2.3.4] - Campaign_contacts junction table
- [Source: docs/Architecture.md§3.1] - Authentication and session management
- [Source: docs/Architecture.md§3.3] - API route patterns
- [Source: docs/Architecture.md§3.4.1] - LinkedIn URL validation regex
- [Source: docs/sprint-artifacts/1-5-protected-routes-session-management.md] - Component creation patterns

### Implementation Notes

**Estimated Completion Time:** 3-4 hours
- 45 min: Modal component and form fields
- 30 min: Campaign multi-select dropdown
- 45 min: API route with database transaction
- 30 min: Toast notification system
- 30 min: Form validation and error handling
- 45 min: Testing all scenarios

**Critical Success Factors:**
1. LinkedIn URL validation must work in real-time on blur
2. Campaign multi-select must allow selecting multiple campaigns
3. Database transaction must be atomic (contact + campaign associations)
4. Success toast must appear and auto-dismiss
5. Form must complete in under 2 minutes with realistic data

**Common Pitfalls to Avoid:**
- Forgetting to assign owner_id from authenticated user
- Not handling duplicate LinkedIn URL constraint violation
- Not using transaction for contact + campaign associations
- Not validating required fields server-side
- Not showing success feedback before closing modal

### Prerequisites

- Epic 1 Story 1.2 complete (requires contacts and campaigns tables) ✓ DONE
- Epic 1 Story 1.3 complete (requires authentication) ✓ DONE
- Epic 2 Story 2.1 complete (requires contacts table verified) ✓ READY-FOR-DEV

## Change Log

- 2025-12-09 (Initial Draft): Story created by BMad Master Ultimate Context Engine. Comprehensive analysis of Epic 2 Story 2.2 requirements, UX Design modal and form specifications (§4.1, §4.3, §4.6, §8.1, §8.2), Architecture database schema and API patterns (§2.3.2, §2.3.3, §2.3.4, §3.1, §3.3, §3.4.1), and previous Story 1.5 component creation patterns. All 9 form fields detailed with exact validation rules. Database transaction pattern for atomic contact + campaign association creation. Performance target <2 minutes established. Status: drafted → ready-for-dev.
