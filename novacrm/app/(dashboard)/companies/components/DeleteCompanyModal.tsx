'use client';

/**
 * Delete Company Confirmation Modal
 *
 * Modal for confirming company deletion with impact warning.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  companyId: string | null;
  companyName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCompanyModal({
  isOpen,
  companyId,
  companyName,
  onClose,
  onSuccess
}: DeleteCompanyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactsCount, setContactsCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Fetch contacts count when modal opens
  useEffect(() => {
    if (isOpen && companyId) {
      fetchContactsCount();
    }
  }, [isOpen, companyId]);

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

  const fetchContactsCount = async () => {
    if (!companyId) return;

    setIsLoadingCount(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setContactsCount(data.company.contacts_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch contacts count:', error);
      setContactsCount(0);
    } finally {
      setIsLoadingCount(false);
    }
  };

  const handleDelete = async () => {
    if (!companyId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      onSuccess();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border-4 border-red-500 bg-[#1e1e2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-[#cdd6f4]">Delete Company</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#cdd6f4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-base text-[#cdd6f4]">
            Are you sure you want to delete{' '}
            <span className="font-bold text-red-400">{companyName || 'this company'}</span>?
          </p>

          {isLoadingCount ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#313244] p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F25C05] border-t-transparent"></div>
              <p className="text-sm text-[#a6adc8]">Checking linked contacts...</p>
            </div>
          ) : contactsCount !== null && contactsCount > 0 ? (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-400">
                <strong>Warning:</strong> This company has {contactsCount}{' '}
                {contactsCount === 1 ? 'contact' : 'contacts'} linked to it. These contacts will
                not be deleted, but their company field will be cleared.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6c7086]">
              This action cannot be undone.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#313244] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#313244] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              'Delete Company'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
