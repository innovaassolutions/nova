'use client';

/**
 * DealDetailModal Component
 *
 * Modal for viewing and editing deal details with stage timeline.
 * Story: 4.3 - Deal Detail View & Edit Modal
 */

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useToast } from './ToastContext';

interface Deal {
  id: string;
  title: string;
  value: number | null;
  probability: number | null;
  status: 'Open' | 'Won' | 'Lost';
  expected_close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  };
  stage: {
    id: string;
    name: string;
    order_num: number;
  };
  owner: {
    id: string;
    full_name: string;
  } | null;
}

interface StageHistoryEntry {
  id: string;
  changed_at: string;
  notes: string | null;
  from_stage: { name: string } | null;
  to_stage: { name: string } | null;
  changed_by_user: { full_name: string } | null;
}

interface PipelineStage {
  id: string;
  name: string;
  order_num: number;
}

interface DealDetailModalProps {
  dealId: string;
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated?: () => void;
  onDealDeleted?: () => void;
}

export default function DealDetailModal({
  dealId,
  isOpen,
  onClose,
  onDealUpdated,
  onDealDeleted,
}: DealDetailModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [history, setHistory] = useState<StageHistoryEntry[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [totalStages, setTotalStages] = useState(0);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editProbability, setEditProbability] = useState(50);
  const [editStageId, setEditStageId] = useState('');
  const [editExpectedCloseDate, setEditExpectedCloseDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'Open' | 'Won' | 'Lost'>('Open');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stage change confirmation modal
  const [showStageChangeModal, setShowStageChangeModal] = useState(false);
  const [stageChangeNotes, setStageChangeNotes] = useState('');
  const [pendingStageId, setPendingStageId] = useState('');

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch deal data
  useEffect(() => {
    if (isOpen && dealId) {
      fetchDeal();
      fetchStages();
    }
  }, [isOpen, dealId]);

  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${dealId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch deal');
      }

      const data = await response.json();
      setDeal(data.deal);
      setHistory(data.history || []);

      // Initialize edit form with current values
      setEditTitle(data.deal.title);
      setEditValue(data.deal.value?.toString() || '');
      setEditProbability(data.deal.probability || 50);
      setEditStageId(data.deal.stage.id);
      setEditExpectedCloseDate(data.deal.expected_close_date || '');
      setEditNotes(data.deal.notes || '');
      setEditStatus(data.deal.status);
    } catch (error) {
      console.error('Error fetching deal:', error);
      showToast('Failed to load deal details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/pipeline-stages');
      if (!response.ok) {
        throw new Error('Failed to fetch stages');
      }
      const data = await response.json();
      setStages(data.stages);
      setTotalStages(data.stages.length);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editTitle.trim()) {
      newErrors.title = 'Deal title is required';
    } else if (editTitle.length > 200) {
      newErrors.title = 'Deal title must be 200 characters or less';
    }

    if (editValue) {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = 'Value must be a positive number';
      } else if (numValue > 99999999.99) {
        newErrors.value = 'Value must be less than $99,999,999.99';
      }
    }

    if (editProbability < 0 || editProbability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (!editStageId) {
      newErrors.stageId = 'Please select a pipeline stage';
    }

    if (editNotes && editNotes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStageChange = (newStageId: string) => {
    if (newStageId !== deal?.stage.id) {
      setPendingStageId(newStageId);
      setShowStageChangeModal(true);
    } else {
      setEditStageId(newStageId);
    }
  };

  const confirmStageChange = () => {
    setEditStageId(pendingStageId);
    setShowStageChangeModal(false);
    setStageChangeNotes('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: editTitle.trim(),
        value: editValue ? parseFloat(editValue) : null,
        probability: editProbability || null,
        stage_id: editStageId,
        expected_close_date: editExpectedCloseDate || null,
        notes: editNotes.trim() || null,
        status: editStatus,
        stage_change_notes: editStageId !== deal?.stage.id ? stageChangeNotes : null,
      };

      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update deal');
      }

      showToast('Deal updated successfully', 'success');
      setIsEditMode(false);
      fetchDeal(); // Refresh data
      if (onDealUpdated) onDealUpdated();
    } catch (error: any) {
      console.error('Error updating deal:', error);
      showToast(error.message || 'Failed to update deal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      showToast('Deal deleted', 'success');
      setShowDeleteModal(false);
      onClose();
      if (onDealDeleted) onDealDeleted();
    } catch (error) {
      console.error('Error deleting deal:', error);
      showToast('Failed to delete deal', 'error');
    }
  };

  const handleClose = () => {
    if (isEditMode) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setIsEditMode(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = () => {
    if (!deal || totalStages === 0) return 0;
    return ((deal.stage.order_num - 1) / (totalStages - 1)) * 100;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Won':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Lost':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-[#313244] text-[#cdd6f4] border-[#313244]';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#313244] bg-[#181825] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
            </div>
          ) : deal ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {!isEditMode && (
                    <>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center gap-2 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244]"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                {/* Deal Header */}
                <div className="border-b border-[#313244] px-6 py-6">
                  {isEditMode ? (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={200}
                          className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-4 py-2 text-xl font-bold text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                        />
                        {errors.title && (
                          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-extrabold text-[#cdd6f4]">{deal.title}</h2>
                      <p className="mt-2 text-base font-semibold text-[#cdd6f4]">
                        {formatCurrency(deal.value)} • {deal.probability || 0}% probability
                      </p>
                    </>
                  )}
                </div>

                {/* Pipeline Progress Bar */}
                {!isEditMode && (
                  <div className="border-b border-[#313244] px-6 py-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#cdd6f4]">{deal.stage.name}</span>
                      <span className="text-[#a6adc8]">
                        Stage {deal.stage.order_num} of {totalStages}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#45475a]">
                      <div
                        className="h-full bg-gradient-to-r from-[#F25C05] to-[#ff6b1a] transition-all"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
                  {/* Left Column - Deal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#cdd6f4]">Deal Information</h3>

                    {/* Contact */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Contact</label>
                      <p className="text-base text-[#cdd6f4]">
                        {deal.contact.first_name} {deal.contact.last_name}
                      </p>
                      {deal.contact.company && (
                        <p className="text-sm text-[#a6adc8]">{deal.contact.company}</p>
                      )}
                    </div>

                    {/* Value */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Value</label>
                      {isEditMode ? (
                        <div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6adc8]">$</span>
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.replace(/[^0-9.]/g, ''))}
                              placeholder="0.00"
                              className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] pl-8 pr-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                            />
                          </div>
                          {errors.value && (
                            <p className="mt-1 text-xs text-red-400">{errors.value}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-[#cdd6f4]">{formatCurrency(deal.value)}</p>
                      )}
                    </div>

                    {/* Probability */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Probability</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={editProbability}
                            onChange={(e) => setEditProbability(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editProbability}
                            onChange={(e) => setEditProbability(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-20 rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-center text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                          />
                          <span className="text-[#a6adc8]">%</span>
                        </div>
                      ) : (
                        <p className="text-base text-[#cdd6f4]">{deal.probability || 0}%</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Status</label>
                      {isEditMode ? (
                        <div className="flex gap-3">
                          {['Open', 'Won', 'Lost'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setEditStatus(status as 'Open' | 'Won' | 'Lost')}
                              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                editStatus === status
                                  ? 'border-[#F25C05] bg-[#F25C05] text-white'
                                  : 'border-[#313244] bg-transparent text-[#cdd6f4] hover:bg-[#313244]'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span
                          className={`inline-block rounded-md border px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                            deal.status
                          )}`}
                        >
                          {deal.status}
                        </span>
                      )}
                    </div>

                    {/* Pipeline Stage */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Pipeline Stage</label>
                      {isEditMode ? (
                        <select
                          value={editStageId}
                          onChange={(e) => handleStageChange(e.target.value)}
                          className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                        >
                          {stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.order_num}. {stage.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-base text-[#cdd6f4]">{deal.stage.name}</p>
                      )}
                    </div>

                    {/* Expected Close Date */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Expected Close</label>
                      {isEditMode ? (
                        <input
                          type="date"
                          value={editExpectedCloseDate}
                          onChange={(e) => setEditExpectedCloseDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                        />
                      ) : (
                        <p className="text-base text-[#cdd6f4]">{formatDate(deal.expected_close_date)}</p>
                      )}
                    </div>

                    {/* Owner */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Owner</label>
                      <p className="text-base text-[#cdd6f4]">{deal.owner?.full_name || 'N/A'}</p>
                    </div>

                    {/* Created */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Created</label>
                      <p className="text-base text-[#cdd6f4]">{formatDate(deal.created_at)}</p>
                    </div>

                    {/* Updated */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Updated</label>
                      <p className="text-base text-[#cdd6f4]">{formatDate(deal.updated_at)}</p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-[#a6adc8]">Notes</label>
                      {isEditMode ? (
                        <div>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            maxLength={2000}
                            className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05] resize-none"
                            placeholder="Add notes..."
                          />
                          <div className="mt-1 flex justify-end">
                            <span className="text-xs text-[#6c7086]">{editNotes.length}/2000</span>
                          </div>
                          {errors.notes && (
                            <p className="text-xs text-red-400">{errors.notes}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-[#cdd6f4] whitespace-pre-wrap">
                          {deal.notes || 'No notes'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Stage Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#cdd6f4]">Stage Timeline</h3>

                    {history.length === 0 ? (
                      <p className="text-sm text-[#a6adc8]">No stage changes yet</p>
                    ) : (
                      <div className="space-y-4">
                        {history.map((entry, index) => (
                          <div key={entry.id} className="relative pl-6">
                            {/* Timeline line */}
                            {index < history.length - 1 && (
                              <div className="absolute left-1 top-6 h-full w-0.5 bg-[#45475a]"></div>
                            )}
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#F25C05]"></div>
                            {/* Content */}
                            <div>
                              <p className="text-sm font-medium text-[#cdd6f4]">
                                Moved to {entry.to_stage?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-[#a6adc8]">
                                {formatDateTime(entry.changed_at)} by {entry.changed_by_user?.full_name || 'Unknown'}
                              </p>
                              {entry.notes && (
                                <p className="mt-1 text-xs text-[#6c7086] italic">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              {isEditMode && (
                <div className="flex items-center justify-end gap-3 border-t border-[#313244] px-6 py-4">
                  <button
                    onClick={() => setIsEditMode(false)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Stage Change Confirmation Modal */}
      {showStageChangeModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={() => setShowStageChangeModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#313244] bg-[#1e1e2e] p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-[#cdd6f4]">
                Move deal to {stages.find((s) => s.id === pendingStageId)?.name}?
              </h3>
              <p className="mt-2 text-sm text-[#a6adc8]">
                This will update the deal stage and record the change in history.
              </p>
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                  Add notes about this stage change (optional)
                </label>
                <textarea
                  value={stageChangeNotes}
                  onChange={(e) => setStageChangeNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05] resize-none"
                  placeholder="Add notes..."
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowStageChangeModal(false)}
                  className="flex-1 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStageChange}
                  className="flex-1 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a]"
                >
                  Move to Stage
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#313244] bg-[#1e1e2e] p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <TrashIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[#cdd6f4]">Delete Deal?</h3>
              </div>
              <p className="mt-4 text-sm text-[#a6adc8]">
                This will permanently delete this deal and all history. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete Deal
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
