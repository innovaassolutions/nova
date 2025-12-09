'use client';

/**
 * ContactsTable Component
 *
 * Desktop table view for contacts list with hover states and actions.
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

interface ContactsTableProps {
  contacts: Contact[];
  loading?: boolean;
  onViewContact: (contactId: string) => void;
}

export default function ContactsTable({ contacts, loading = false, onViewContact }: ContactsTableProps) {
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
          <p className="text-sm text-[#a6adc8]">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
        <div className="text-center">
          <p className="text-base text-[#a6adc8]">No contacts found</p>
          <p className="mt-1 text-sm text-[#6c7086]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#313244] bg-[#181825] p-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#313244]">
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Name
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Company
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Campaign(s)
            </th>
            <th className="hidden px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c] lg:table-cell">
              Owner
            </th>
            <th className="hidden px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c] xl:table-cell">
              Connected On
            </th>
            <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b border-[#313244] transition-colors duration-150 last:border-b-0 hover:bg-[rgba(242,92,5,0.03)]"
            >
              {/* Name Cell with Avatar */}
              <td className="px-2 py-4">
                <div className="flex items-center gap-3">
                  <ContactAvatar
                    firstName={contact.first_name}
                    lastName={contact.last_name}
                  />
                  <div>
                    <button
                      onClick={() => onViewContact(contact.id)}
                      className="font-bold text-[#cdd6f4] transition-colors duration-200 hover:text-[#F25C05]"
                    >
                      {contact.first_name} {contact.last_name}
                    </button>
                    {contact.position && (
                      <p className="text-sm text-[#6c7086]">{contact.position}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* Company Cell */}
              <td className="px-2 py-4">
                <span className="text-sm text-[#cdd6f4]">
                  {contact.company || '—'}
                </span>
              </td>

              {/* Campaign(s) Cell */}
              <td className="px-2 py-4">
                <CampaignBadges campaigns={contact.campaigns} />
              </td>

              {/* Owner Cell (hidden on small screens) */}
              <td className="hidden px-2 py-4 lg:table-cell">
                <span className="text-sm text-[#a6adc8]">
                  {contact.owner_id ? 'Assigned' : 'Unassigned'}
                </span>
              </td>

              {/* Connected On Cell (hidden on medium screens) */}
              <td className="hidden px-2 py-4 xl:table-cell">
                <span className="text-sm text-[#a6adc8]">
                  {formatDate(contact.connected_on)}
                </span>
              </td>

              {/* Actions Cell */}
              <td className="px-2 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onViewContact(contact.id)}
                    className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#F25C05]"
                    aria-label="View contact"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onViewContact(contact.id)}
                    className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#F25C05]"
                    aria-label="Edit contact"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
