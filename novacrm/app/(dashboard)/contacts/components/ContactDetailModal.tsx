'use client';

/**
 * ContactDetailModal Component
 *
 * View and edit contact details with notes support (Markdown).
 * Story: 2.4 - Contact Detail View & Edit Modal
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, ArrowLeftIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import ContactAvatar from '../../components/ContactAvatar';
import CampaignBadges from './CampaignBadges';
import CreateDealModal from './CreateDealModal';
import DealDetailModal from '../../components/DealDetailModal';
import { useToast } from '../../components/ToastContext';

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
  notes: string | null;
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

interface Deal {
  id: string;
  title: string;
  value: number | null;
  probability: number | null;
  status: 'Open' | 'Won' | 'Lost';
  expected_close_date: string | null;
  stage: {
    id: string;
    name: string;
    order_num: number;
  };
}

interface ContactDetailModalProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated: () => void;
  onContactDeleted: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ContactDetailModal({
  contactId,
  isOpen,
  onClose,
  onContactUpdated,
  onContactDeleted,
}: ContactDetailModalProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showDealDetailModal, setShowDealDetailModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Edit form state
  const [editData, setEditData] = useState<Partial<Contact>>({});

  // Fetch contact data
  useEffect(() => {
    if (isOpen && contactId) {
      fetchContact();
      fetchUsers();
    }
  }, [isOpen, contactId]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/${contactId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }

      const data = await response.json();
      setContact(data.contact);
      setEditData(data.contact);

      // Fetch deals for this contact
      await fetchDeals();
    } catch (err) {
      console.error('Error fetching contact:', err);
      showToast('Failed to load contact details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch(`/api/deals?contact_id=${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setShowDealDetailModal(true);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setEditData(contact || {});
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData(contact || {});
  };

  const handleSave = async () => {
    if (!contact) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      showToast('Contact updated successfully!', 'success');
      setIsEditMode(false);
      await fetchContact();
      onContactUpdated();
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast('Failed to update contact', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      showToast('Contact deleted successfully', 'success');
      onContactDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast('Failed to delete contact', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#313244] bg-[#1e1e2e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
            </div>
          ) : contact ? (
            <div className="flex h-full max-h-[90vh] flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm text-[#a6adc8] transition-colors hover:text-[#cdd6f4]"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </button>
                <div className="flex gap-2">
                  {!isEditMode ? (
                    <>
                      <button
                        onClick={() => setShowCreateDealModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a]"
                      >
                        <PlusIcon className="h-4 w-4" />
                        New Deal
                      </button>
                      <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244]"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a] disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Contact Header */}
                <div className="mb-6 flex items-start gap-4">
                  <ContactAvatar
                    firstName={contact.first_name}
                    lastName={contact.last_name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#cdd6f4]">
                      {contact.first_name} {contact.last_name}
                    </h2>
                    {contact.position && contact.company && (
                      <p className="mt-1 text-base text-[#a6adc8]">
                        {contact.position} at {contact.company}
                      </p>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-2 inline-block text-sm text-[#89b4fa] transition-colors hover:text-[#F25C05]"
                      >
                        {contact.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column: Contact Information */}
                  <div className="space-y-4 rounded-xl border border-[#313244] bg-[#181825] p-6">
                    <h3 className="text-lg font-semibold text-[#cdd6f4]">Contact Information</h3>

                    {!isEditMode ? (
                      <div className="space-y-3">
                        <InfoRow label="LinkedIn" value={
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#89b4fa] transition-colors hover:text-[#F25C05]"
                          >
                            View Profile →
                          </a>
                        } />
                        <InfoRow label="Company" value={contact.company || '—'} />
                        <InfoRow label="Position" value={contact.position || '—'} />
                        <InfoRow label="Connected On" value={contact.connected_on ? formatDate(contact.connected_on) : '—'} />
                        <InfoRow label="Source" value={contact.source} />
                        <InfoRow
                          label="Owner"
                          value={
                            contact.owner_id
                              ? users.find(u => u.id === contact.owner_id)?.name || 'Assigned'
                              : 'Unassigned'
                          }
                        />
                        <div>
                          <p className="mb-2 text-sm font-semibold text-[#a6adc8]">Campaigns</p>
                          <CampaignBadges campaigns={contact.campaigns} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <InputField
                          label="Company"
                          value={editData.company || ''}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        />
                        <InputField
                          label="Position"
                          value={editData.position || ''}
                          onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                        />
                        <InputField
                          label="Email"
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-semibold text-[#a6adc8]">Assign to</label>
                          <select
                            value={editData.owner_id || ''}
                            onChange={(e) => setEditData({ ...editData, owner_id: e.target.value || null })}
                            className="mt-1 w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                          >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#313244] pt-3 text-xs text-[#6c7086]">
                      <p>Created: {formatDate(contact.created_at)}</p>
                      <p>Updated: {formatDate(contact.updated_at)}</p>
                    </div>
                  </div>

                  {/* Right Column: Notes */}
                  <div className="space-y-4 rounded-xl border border-[#313244] bg-[#181825] p-6">
                    <h3 className="text-lg font-semibold text-[#cdd6f4]">Notes</h3>

                    {!isEditMode ? (
                      <div className="prose prose-invert max-w-none">
                        {contact.notes ? (
                          <pre className="whitespace-pre-wrap text-sm text-[#cdd6f4]">{contact.notes}</pre>
                        ) : (
                          <p className="text-sm text-[#6c7086]">No notes yet. Click Edit to add notes.</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Add notes here... Markdown supported!"
                          className="min-h-[300px] w-full rounded-lg border border-[#313244] bg-[#1e1e2e] p-3 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                        />
                        <p className="mt-2 text-xs text-[#6c7086]">
                          Tip: Use Markdown for formatting (e.g., **bold**, *italic*, - bullets)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deals Section */}
                <div className="mt-6 space-y-4 rounded-xl border border-[#313244] bg-[#181825] p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#cdd6f4]">Deals ({deals.length})</h3>
                  </div>

                  {deals.length === 0 ? (
                    <p className="text-sm text-[#6c7086]">No deals yet. Click "New Deal" to create one.</p>
                  ) : (
                    <div className="space-y-3">
                      {deals.map((deal) => (
                        <div
                          key={deal.id}
                          onClick={() => handleViewDeal(deal.id)}
                          className="flex items-center justify-between rounded-lg border border-[#313244] bg-[#1e1e2e] p-4 transition-all hover:border-[#F25C05] hover:shadow-lg cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-semibold text-[#cdd6f4]">{deal.title}</h4>
                              <span
                                className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                  deal.status === 'Open'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                    : deal.status === 'Won'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                                }`}
                              >
                                {deal.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-[#a6adc8]">
                              <span>{formatCurrency(deal.value)}</span>
                              <span>•</span>
                              <span>{deal.probability || 0}% probability</span>
                              <span>•</span>
                              <span>{deal.stage.name}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDeal(deal.id);
                            }}
                            className="rounded-lg border border-[#313244] bg-transparent p-2 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && contact && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#1e1e2e] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[#cdd6f4]">Delete Contact?</h3>
              <p className="mt-3 text-sm text-[#a6adc8]">
                This will permanently delete <span className="font-semibold text-[#cdd6f4]">{contact.first_name} {contact.last_name}</span>. This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete Contact
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Deal Modal */}
      {contact && (
        <CreateDealModal
          contactId={contact.id}
          contactName={`${contact.first_name} ${contact.last_name}`}
          contactCompany={contact.company}
          isOpen={showCreateDealModal}
          onClose={() => setShowCreateDealModal(false)}
          onDealCreated={fetchContact}
        />
      )}

      {/* Deal Detail Modal */}
      {selectedDealId && (
        <DealDetailModal
          dealId={selectedDealId}
          isOpen={showDealDetailModal}
          onClose={() => {
            setShowDealDetailModal(false);
            setSelectedDealId(null);
          }}
          onDealUpdated={fetchDeals}
          onDealDeleted={fetchDeals}
        />
      )}
    </>
  );
}

// Helper Components
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#a6adc8]">{label}</p>
      <p className="mt-1 text-sm text-[#cdd6f4]">{value}</p>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function InputField({ label, value, onChange, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#a6adc8]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      />
    </div>
  );
}
