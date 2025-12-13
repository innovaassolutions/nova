'use client';

/**
 * LogActivityModal Component
 *
 * Modal for logging activities related to contacts and deals.
 * Story: 7.2 - Log Activity Modal with Activity Type Selection
 */

import { useState } from 'react';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useToast } from './ToastContext';

type ActivityType = 'Email' | 'Call' | 'Meeting' | 'LinkedIn Message' | 'WhatsApp' | 'Note';

interface ActivityTypeOption {
  value: ActivityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const activityTypes: ActivityTypeOption[] = [
  { value: 'Email', label: 'Email', icon: EnvelopeIcon },
  { value: 'Call', label: 'Call', icon: PhoneIcon },
  { value: 'Meeting', label: 'Meeting', icon: UserGroupIcon },
  { value: 'LinkedIn Message', label: 'LinkedIn Message', icon: BriefcaseIcon },
  { value: 'WhatsApp', label: 'WhatsApp', icon: ChatBubbleLeftIcon },
  { value: 'Note', label: 'Note', icon: DocumentTextIcon },
];

interface LogActivityModalProps {
  contactId?: string;
  dealId?: string;
  contactName?: string;
  isOpen: boolean;
  onClose: () => void;
  onActivityLogged: () => void;
}

export default function LogActivityModal({
  contactId,
  dealId,
  contactName,
  isOpen,
  onClose,
  onActivityLogged,
}: LogActivityModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [activityType, setActivityType] = useState<ActivityType>('Email');
  const [subject, setSubject] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [description, setDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date/time to now when modal opens
  useState(() => {
    if (isOpen && !activityDate) {
      const now = new Date();
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setActivityDate(localDateTime);
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Activity type validation
    if (!activityType) {
      newErrors.activityType = 'Activity type is required';
    }

    // Subject validation
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject must be 200 characters or less';
    }

    // Activity date validation
    if (!activityDate) {
      newErrors.activityDate = 'Activity date is required';
    } else {
      const selectedDate = new Date(activityDate);
      const now = new Date();

      if (selectedDate > now) {
        newErrors.activityDate = 'Activity date cannot be in the future';
      }
    }

    // Description validation
    if (description && description.length > 5000) {
      newErrors.description = 'Notes must be 5000 characters or less';
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
        contact_id: contactId || undefined,
        deal_id: dealId || undefined,
        activity_type: activityType,
        subject: subject.trim(),
        description: description.trim() || undefined,
        activity_date: new Date(activityDate).toISOString(),
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log activity');
      }

      showToast('Activity logged successfully', 'success');
      handleClose();
      onActivityLogged();
    } catch (error: any) {
      console.error('Error logging activity:', error);
      showToast(error.message || 'Failed to log activity. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setActivityType('Email');
    setSubject('');
    setDescription('');
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setActivityDate(localDateTime);
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Check if form has data
      if (subject || description) {
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
          handleClose();
        }
      } else {
        handleClose();
      }
    }
  };

  // Get the icon component for the selected activity type
  const getActivityIcon = (type: ActivityType) => {
    const option = activityTypes.find((opt) => opt.value === type);
    return option?.icon || DocumentTextIcon;
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
            <h2 className="text-xl font-bold text-[#cdd6f4]">Log Activity</h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="space-y-6">
              {/* Contact Context (if provided) */}
              {contactName && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#a6adc8]">For:</label>
                  <p className="text-base text-[#cdd6f4]">{contactName}</p>
                </div>
              )}

              {/* Activity Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                  Activity Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3
                                sm:grid-cols-3
                                md:grid-cols-6">
                  {activityTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = activityType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setActivityType(type.value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-[#F25C05] bg-[#F25C05]/10 text-[#F25C05]'
                            : 'border-[#313244] bg-[#181825] text-[#a6adc8] hover:border-[#45475a] hover:bg-[#313244]'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.activityType && (
                  <p className="mt-1 text-xs text-red-400">{errors.activityType}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Follow-up call about proposal"
                  maxLength={200}
                  className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                />
                <div className="mt-1 flex justify-between">
                  {errors.subject && (
                    <p className="text-xs text-red-400">{errors.subject}</p>
                  )}
                  <span className="ml-auto text-xs text-[#6c7086]">{subject.length}/200</span>
                </div>
              </div>

              {/* Activity Date & Time */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                  Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                />
                {errors.activityDate && (
                  <p className="mt-1 text-xs text-red-400">{errors.activityDate}</p>
                )}
              </div>

              {/* Notes/Description */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#cdd6f4]">
                  Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this activity, sentiment, next steps..."
                  rows={6}
                  maxLength={5000}
                  className="w-full rounded-lg border border-[#313244] bg-[#181825] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05] resize-none"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-[#6c7086]">{description.length}/5000</span>
                </div>
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                )}
              </div>
            </div>
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
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Log Activity
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
