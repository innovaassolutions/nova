'use client';

import { useState } from 'react';
import { LinkedInContact } from '@/lib/csv-parser';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface ContactWithSelection extends LinkedInContact {
  index: number;
  selected: boolean;
  campaignIds: string[];
}

interface ContactPreviewTableProps {
  contacts: LinkedInContact[];
  campaigns: Campaign[];
  onImport: (selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>) => void;
  onCancel: () => void;
}

export default function ContactPreviewTable({
  contacts,
  campaigns,
  onImport,
  onCancel,
}: ContactPreviewTableProps) {
  const [contactsWithSelection, setContactsWithSelection] = useState<ContactWithSelection[]>(
    contacts.map((contact, index) => ({
      ...contact,
      index,
      selected: true, // All selected by default
      campaignIds: [],
    }))
  );

  const selectedCount = contactsWithSelection.filter((c) => c.selected).length;
  const totalCount = contactsWithSelection.length;

  const toggleAll = () => {
    const newSelectState = selectedCount < totalCount;
    setContactsWithSelection((prev) =>
      prev.map((c) => ({ ...c, selected: newSelectState }))
    );
  };

  const toggleContact = (index: number) => {
    setContactsWithSelection((prev) =>
      prev.map((c) => (c.index === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const updateContactCampaigns = (index: number, campaignIds: string[]) => {
    setContactsWithSelection((prev) =>
      prev.map((c) => (c.index === index ? { ...c, campaignIds } : c))
    );
  };

  const applyBulkCampaign = (campaignId: string) => {
    setContactsWithSelection((prev) =>
      prev.map((c) => {
        if (!c.selected) return c;
        const newCampaignIds = c.campaignIds.includes(campaignId)
          ? c.campaignIds.filter((id) => id !== campaignId)
          : [...c.campaignIds, campaignId];
        return { ...c, campaignIds: newCampaignIds };
      })
    );
  };

  const handleImport = () => {
    const selectedContacts = contactsWithSelection
      .filter((c) => c.selected)
      .map((c) => ({
        contact: {
          firstName: c.firstName,
          lastName: c.lastName,
          url: c.url,
          email: c.email,
          company: c.company,
          position: c.position,
          connectedOn: c.connectedOn,
        },
        campaignIds: c.campaignIds,
      }));

    onImport(selectedContacts);
  };

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-600">
            {selectedCount} of {totalCount} contacts selected
          </span>
        </div>

        {/* Bulk campaign assignment */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Apply to selected:</span>
          <div className="flex gap-1">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => applyBulkCampaign(campaign.id)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300"
                title={campaign.description || ''}
              >
                {campaign.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact preview table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaigns
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactsWithSelection.map((contact) => (
                <tr
                  key={contact.index}
                  className={contact.selected ? 'bg-white' : 'bg-gray-50 opacity-60'}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={contact.selected}
                      onChange={() => toggleContact(contact.index)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                    {contact.email && (
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={contact.position}>
                      {contact.position || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CampaignMultiSelect
                      campaigns={campaigns}
                      selectedCampaignIds={contact.campaignIds}
                      onChange={(campaignIds) => updateContactCampaigns(contact.index, campaignIds)}
                      disabled={!contact.selected}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={selectedCount === 0}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Import {selectedCount} Contact{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

// Campaign multi-select dropdown component
function CampaignMultiSelect({
  campaigns,
  selectedCampaignIds,
  onChange,
  disabled,
}: {
  campaigns: Campaign[];
  selectedCampaignIds: string[];
  onChange: (campaignIds: string[]) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCampaign = (campaignId: string) => {
    if (selectedCampaignIds.includes(campaignId)) {
      onChange(selectedCampaignIds.filter((id) => id !== campaignId));
    } else {
      onChange([...selectedCampaignIds, campaignId]);
    }
  };

  const selectedNames = campaigns
    .filter((c) => selectedCampaignIds.includes(c.id))
    .map((c) => c.name);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-1.5 text-sm text-left bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {selectedCampaignIds.length === 0 ? (
          <span className="text-gray-400">No campaigns</span>
        ) : (
          <span className="text-gray-900">
            {selectedNames.length === 1
              ? selectedNames[0]
              : `${selectedNames.length} campaigns`}
          </span>
        )}
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 space-y-1">
              {campaigns.map((campaign) => (
                <label
                  key={campaign.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCampaignIds.includes(campaign.id)}
                    onChange={() => toggleCampaign(campaign.id)}
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </div>
                    {campaign.description && (
                      <div className="text-xs text-gray-500">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
