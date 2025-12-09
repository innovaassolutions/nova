'use client';

/**
 * Contacts Page
 *
 * Main page for viewing and managing contacts.
 * Allows manual contact creation via modal form.
 * Story: 2.2 - Contact Creation Form
 */

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ContactFormModal from './components/ContactFormModal';
import { useToast } from '../components/ToastContext';

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleContactCreated = () => {
    // Show success toast
    showToast('Contact created successfully!', 'success');
    // Will be used to refresh contacts list in Story 2.3
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-[1200px]">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#cdd6f4]">Contacts</h1>
          <p className="mt-1 text-sm text-[#a6adc8]">
            Manage your LinkedIn connections and contacts
          </p>
        </div>

        {/* New Contact Button */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white
                     transition-colors duration-200
                     hover:bg-[#ff6b1a]
                     focus:outline-none focus:ring-2 focus:ring-[#F25C05] focus:ring-offset-2 focus:ring-offset-[#1e1e2e]"
        >
          <PlusIcon className="h-5 w-5" />
          New Contact
        </button>
      </div>

      {/* Contacts List Placeholder - Will be implemented in Story 2.3 */}
      <div className="rounded-lg border border-[#313244] bg-[#181825] p-8">
        <p className="text-base text-[#a6adc8]">
          Contact list will be displayed here in Story 2.3.
        </p>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleContactCreated}
      />
    </div>
  );
}
