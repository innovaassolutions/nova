'use client';

/**
 * Delete Campaign Modal Component
 *
 * Confirmation modal for deleting campaigns with contact impact warning.
 * Story: 3.5 - Campaign CRUD Interface
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  contact_count: number;
}

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: Campaign;
}

export default function DeleteCampaignModal({
  isOpen,
  onClose,
  onSuccess,
  campaign,
}: DeleteCampaignModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
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
  }, [isOpen, isDeleting, onClose]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete campaign');
      }

      onSuccess();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete campaign');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

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
            Delete Campaign?
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
            disabled={isDeleting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-[#f38ba8]/10 p-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-[#f38ba8]" />
            </div>
          </div>

          {/* Campaign Name */}
          <p className="mb-4 text-center text-base text-[#cdd6f4]">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{campaign.name}</span>?
          </p>

          {/* Impact Warning */}
          {campaign.contact_count > 0 && (
            <div className="mb-4 rounded-lg bg-[#f38ba8]/10 p-4">
              <p className="mb-2 text-sm font-medium text-[#f38ba8]">
                This campaign has {campaign.contact_count}{' '}
                {campaign.contact_count === 1 ? 'contact' : 'contacts'} assigned
              </p>
              <p className="text-sm text-[#a6adc8]">
                Contacts will not be deleted, only the campaign association will be
                removed.
              </p>
            </div>
          )}

          {/* Message */}
          <p className="mb-6 text-center text-sm text-[#a6adc8]">
            This action cannot be undone. All campaign associations will be removed.
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#313244] px-4 py-2
                         text-sm font-medium text-[#cdd6f4]
                         transition-colors hover:bg-[#313244]"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-[#f38ba8] px-4 py-2
                         text-sm font-medium text-[#1e1e2e]
                         transition-all duration-200
                         hover:bg-[#f5a3b3]
                         disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
