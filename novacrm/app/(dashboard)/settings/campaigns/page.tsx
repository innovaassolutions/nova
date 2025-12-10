'use client';

/**
 * Campaign Management Page
 *
 * Admin interface for creating, editing, and managing campaigns.
 * Story: 3.5 - Campaign CRUD Interface
 */

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CampaignFormModal from './components/CampaignFormModal';
import DeleteCampaignModal from './components/DeleteCampaignModal';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'Active' | 'Inactive';
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadCampaigns();
  };

  const handleEditSuccess = () => {
    setEditingCampaign(null);
    loadCampaigns();
  };

  const handleDeleteSuccess = () => {
    setDeletingCampaign(null);
    loadCampaigns();
  };

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#cdd6f4]">
            Campaign Management
          </h1>
          <p className="text-base text-[#a6adc8]">
            Manage campaigns for organizing leads and contacts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2
                     rounded-lg bg-[#f2835a] px-4 py-2.5
                     text-sm font-medium text-[#1e1e2e]
                     transition-all duration-200
                     hover:bg-[#f38f6a] hover:shadow-md hover:shadow-[#f2835a]/20"
        >
          <PlusIcon className="h-5 w-5" />
          New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-lg border border-[#313244] bg-[#181825]">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-[#a6adc8]">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mb-2 text-[#cdd6f4]">No campaigns yet</p>
            <p className="text-sm text-[#a6adc8]">
              Create your first campaign to start organizing contacts
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#313244] bg-[#1e1e2e]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
                    Campaign Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
                    Contacts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#a6adc8]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313244]">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="transition-colors duration-150 hover:bg-[#1e1e2e]"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#cdd6f4]">
                        {campaign.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-md truncate text-sm text-[#a6adc8]">
                        {campaign.description || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${
                            campaign.status === 'Active'
                              ? 'bg-[#a6e3a1]/10 text-[#a6e3a1]'
                              : 'bg-[#6c7086]/10 text-[#6c7086]'
                          }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#a6adc8]">
                        {campaign.contact_count}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCampaign(campaign)}
                          className="rounded p-1.5 text-[#89b4fa] transition-colors
                                     hover:bg-[#89b4fa]/10"
                          title="Edit campaign"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeletingCampaign(campaign)}
                          className="rounded p-1.5 text-[#f38ba8] transition-colors
                                     hover:bg-[#f38ba8]/10"
                          title="Delete campaign"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CampaignFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingCampaign && (
        <CampaignFormModal
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={handleEditSuccess}
          campaign={editingCampaign}
        />
      )}

      {deletingCampaign && (
        <DeleteCampaignModal
          isOpen={!!deletingCampaign}
          onClose={() => setDeletingCampaign(null)}
          onSuccess={handleDeleteSuccess}
          campaign={deletingCampaign}
        />
      )}
    </div>
  );
}
