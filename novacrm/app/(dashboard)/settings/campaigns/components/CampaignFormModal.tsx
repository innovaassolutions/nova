'use client';

/**
 * Campaign Form Modal Component
 *
 * Modal for creating and editing campaigns.
 * Story: 3.5 - Campaign CRUD Interface
 */

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'Active' | 'Inactive';
}

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign?: Campaign | null;
}

interface FormData {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface FormErrors {
  name?: string;
  description?: string;
}

export default function CampaignFormModal({
  isOpen,
  onClose,
  onSuccess,
  campaign,
}: CampaignFormModalProps) {
  const isEditing = !!campaign;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        status: campaign.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [campaign, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Campaign name must be 100 characters or less';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/campaigns/${campaign.id}` : '/api/campaigns';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: data.error });
        } else {
          throw new Error(data.error || 'Failed to save campaign');
        }
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert(error instanceof Error ? error.message : 'Failed to save campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const charactersRemaining = 500 - formData.description.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-md
                   rounded-2xl border border-[#313244] bg-[#181825]
                   shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <h2 className="text-xl font-semibold text-[#cdd6f4]">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Campaign Name */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#cdd6f4]">
              Campaign Name <span className="text-[#f38ba8]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border bg-[#1e1e2e] px-4 py-2.5
                         text-sm text-[#cdd6f4] placeholder-[#6c7086]
                         transition-all duration-200
                         border-[#313244] focus:border-[#89b4fa] focus:outline-none focus:ring-2 focus:ring-[#89b4fa]/20"
              placeholder="e.g., Q4 SaaS Outreach"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[#cdd6f4]">
                Description
              </label>
              <span className="text-xs text-[#6c7086]">
                {charactersRemaining}/500
              </span>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border bg-[#1e1e2e] px-4 py-2.5
                         text-sm text-[#cdd6f4] placeholder-[#6c7086]
                         transition-all duration-200
                         border-[#313244] focus:border-[#89b4fa] focus:outline-none focus:ring-2 focus:ring-[#89b4fa]/20"
              placeholder="Optional description of this campaign"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-[#f38ba8]">{errors.description}</p>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[#cdd6f4]">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="h-4 w-4 border-[#313244] bg-[#1e1e2e] text-[#f2835a]
                             focus:ring-2 focus:ring-[#f2835a]/20"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-[#cdd6f4]">Active</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="h-4 w-4 border-[#313244] bg-[#1e1e2e] text-[#f2835a]
                             focus:ring-2 focus:ring-[#f2835a]/20"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-[#cdd6f4]">Inactive</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#313244] px-4 py-2
                         text-sm font-medium text-[#cdd6f4]
                         transition-colors hover:bg-[#313244]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#f2835a] px-4 py-2
                         text-sm font-medium text-[#1e1e2e]
                         transition-all duration-200
                         hover:bg-[#f38f6a]
                         disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
