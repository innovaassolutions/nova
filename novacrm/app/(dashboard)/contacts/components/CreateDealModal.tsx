'use client';

/**
 * CreateDealModal Component
 *
 * Modal for creating a new deal linked to a contact.
 * Story: 4.2 - Create Deal Form with Contact Linking
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../components/ToastContext';

interface PipelineStage {
  id: string;
  name: string;
  order_num: number;
  is_active: boolean;
}

interface CreateDealModalProps {
  contactId: string;
  contactName: string;
  contactCompany: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void;
}

export default function CreateDealModal({
  contactId,
  contactName,
  contactCompany,
  isOpen,
  onClose,
  onDealCreated,
}: CreateDealModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState(50);
  const [stageId, setStageId] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch pipeline stages
  useEffect(() => {
    if (isOpen) {
      fetchStages();
    }
  }, [isOpen]);

  const fetchStages = async () => {
    try {
      setLoadingStages(true);
      const response = await fetch('/api/pipeline-stages');

      if (!response.ok) {
        throw new Error('Failed to fetch pipeline stages');
      }

      const data = await response.json();
      setStages(data.stages);

      // Set default stage (first stage)
      if (data.stages.length > 0) {
        setStageId(data.stages[0].id);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      showToast('Failed to load pipeline stages', 'error');
    } finally {
      setLoadingStages(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Deal title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Deal title must be 200 characters or less';
    }

    // Value validation
    if (value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = 'Value must be a positive number';
      } else if (numValue > 99999999.99) {
        newErrors.value = 'Value must be less than $99,999,999.99';
      }
    }

    // Probability validation
    if (probability < 0 || probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    // Stage validation
    if (!stageId) {
      newErrors.stageId = 'Please select a pipeline stage';
    }

    // Expected close date validation
    if (expectedCloseDate) {
      const selectedDate = new Date(expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.expectedCloseDate = 'Close date cannot be in the past';
      }
    }

    // Notes validation
    if (notes && notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        contact_id: contactId,
        title: title.trim(),
        value: value ? parseFloat(value) : null,
        probability: probability || null,
        stage_id: stageId,
        expected_close_date: expectedCloseDate || null,
        notes: notes.trim() || null,
      };

      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }

      showToast('Deal created successfully', 'success');
      handleClose();
      onDealCreated();
    } catch (error: any) {
      console.error('Error creating deal:', error);
      showToast(error.message || 'Failed to create deal. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setValue('');
    setProbability(50);
    setStageId(stages[0]?.id || '');
    setExpectedCloseDate('');
    setNotes('');
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Check if form has data
      if (title || value || notes) {
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
          handleClose();
        }
      } else {
        handleClose();
      }
    }
  };

  const formatCurrencyInput = (val: string) => {
    // Remove non-numeric characters except decimal point
    return val.replace(/[^0-9.]/g, '');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#313244] bg-[#1e1e2e] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
            <h2 className="text-xl font-bold text-[#cdd6f4]">Create New Deal</h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {loadingStages ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Contact Context (Read-only) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#a6adc8]">For:</label>
                  <p className="text-base text-[#cdd6f4]">
                    {contactName}
                    {contactCompany && <span className="text-[#a6adc8]"> ({contactCompany})</span>}
                  </p>
                </div>

                {/* Deal Title */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Deal Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q1 Enterprise License"
                    maxLength={200}
                    className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.title && (
                      <p className="text-xs text-red-400">{errors.title}</p>
                    )}
                    <span className="ml-auto text-xs text-[#6c7086]">{title.length}/200</span>
                  </div>
                </div>

                {/* Deal Value */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Deal Value ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6adc8]">$</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(formatCurrencyInput(e.target.value))}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[#313244] bg-[#181825] pl-8 pr-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                    />
                  </div>
                  {errors.value && (
                    <p className="mt-1 text-xs text-red-400">{errors.value}</p>
                  )}
                </div>

                {/* Win Probability */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Win Probability (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={probability}
                      onChange={(e) => setProbability(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={probability}
                      onChange={(e) => setProbability(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-center text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                    />
                    <span className="text-[#a6adc8]">%</span>
                  </div>
                  {errors.probability && (
                    <p className="mt-1 text-xs text-red-400">{errors.probability}</p>
                  )}
                </div>

                {/* Pipeline Stage */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Pipeline Stage <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                  >
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.order_num}. {stage.name}
                      </option>
                    ))}
                  </select>
                  {errors.stageId && (
                    <p className="mt-1 text-xs text-red-400">{errors.stageId}</p>
                  )}
                </div>

                {/* Expected Close Date */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                  />
                  {errors.expectedCloseDate && (
                    <p className="mt-1 text-xs text-red-400">{errors.expectedCloseDate}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add context, next steps, or important details..."
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05] resize-none"
                  />
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-[#6c7086]">{notes.length}/2000</span>
                  </div>
                  {errors.notes && (
                    <p className="mt-1 text-xs text-red-400">{errors.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#313244] px-6 py-4">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || loadingStages}
              className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Create Deal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
