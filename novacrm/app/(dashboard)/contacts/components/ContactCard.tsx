'use client';

/**
 * ContactCard Component
 *
 * Mobile card view for contacts list (<768px).
 * Story: 2.3 - Contacts List with Search & Filter
 */

import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import ContactAvatar from '../../components/ContactAvatar';
import CampaignBadges from './CampaignBadges';

interface Contact {
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
    };
  }>;
}

interface ContactCardProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactCardProps) {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
      {/* Header with Avatar and Name */}
      <div className="mb-4 flex items-center gap-3">
        <ContactAvatar
          firstName={contact.first_name}
          lastName={contact.last_name}
          size="lg"
        />
        <div className="flex-1">
          <button
            onClick={() => console.log('View contact:', contact.id)}
            className="font-bold text-[#cdd6f4] transition-colors duration-200 hover:text-[#F25C05]"
          >
            {contact.first_name} {contact.last_name}
          </button>
          {contact.position && (
            <p className="text-sm text-[#6c7086]">{contact.position}</p>
          )}
        </div>
      </div>

      {/* Body with Company and Campaign Info */}
      <div className="mb-4 space-y-2 border-t border-[#313244] pt-4">
        {contact.company && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
              Company:
            </span>
            <span className="text-sm text-[#cdd6f4]">{contact.company}</span>
          </div>
        )}

        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
            Campaign:
          </span>
          <div className="flex-1">
            <CampaignBadges campaigns={contact.campaigns} />
          </div>
        </div>

        {contact.connected_on && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
              Connected:
            </span>
            <span className="text-sm text-[#a6adc8]">
              {formatDate(contact.connected_on)}
            </span>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="flex justify-end gap-2 border-t border-[#313244] pt-4">
        <button
          onClick={() => console.log('View contact:', contact.id)}
          className="flex items-center gap-2 rounded-lg bg-[#313244] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#45475a] hover:text-[#F25C05]"
          aria-label="View contact"
        >
          <EyeIcon className="h-5 w-5" />
          View
        </button>
        <button
          onClick={() => console.log('Edit contact:', contact.id)}
          className="flex items-center gap-2 rounded-lg bg-[#313244] px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#45475a] hover:text-[#F25C05]"
          aria-label="Edit contact"
        >
          <PencilIcon className="h-5 w-5" />
          Edit
        </button>
      </div>
    </div>
  );
}
