'use client';

/**
 * Contacts Page
 *
 * Main page for viewing and managing contacts with search/filter/sort.
 * Story: 2.2 - Contact Creation Form
 * Story: 2.3 - Contacts List with Search & Filter
 */

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import ContactFormModal from './components/ContactFormModal';
import ContactDetailModal from './components/ContactDetailModal';
import FilterBar from './components/FilterBar';
import ContactsTable from './components/ContactsTable';
import ContactCard from './components/ContactCard';
import { useToast } from '../components/ToastContext';

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

interface Campaign {
  id: string;
  name: string;
}

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const { showToast } = useToast();

  // Fetch contacts from API
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: searchTerm,
        filter,
        sort,
      });

      const response = await fetch(`/api/contacts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filter, sort, showToast]);

  // Fetch campaigns for filter dropdown
  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchContacts();
    fetchCampaigns();
  }, [fetchContacts, fetchCampaigns]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleContactCreated = () => {
    showToast('Contact created successfully!', 'success');
    setIsModalOpen(false);
    // Refresh contacts list
    fetchContacts();
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const handleViewContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContactId(null);
  };

  const handleContactUpdated = () => {
    fetchContacts();
  };

  const handleContactDeleted = () => {
    fetchContacts();
  };

  return (
    <div className="max-w-[1200px]">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#cdd6f4]">Contacts</h1>
          <p className="mt-1 text-sm text-[#a6adc8]">
            Manage your LinkedIn connections and leads
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            disabled
            className="flex items-center gap-2 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#6c7086] opacity-50 cursor-not-allowed"
            title="CSV upload coming in Epic 3"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload CSV
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#ff6b1a] focus:outline-none focus:ring-2 focus:ring-[#F25C05] focus:ring-offset-2 focus:ring-offset-[#1e1e2e]"
          >
            <PlusIcon className="h-5 w-5" />
            New Contact
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        campaigns={campaigns}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ContactsTable
          contacts={contacts}
          loading={loading}
          onViewContact={handleViewContact}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
              <p className="text-sm text-[#a6adc8]">Loading contacts...</p>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
            <div className="text-center">
              <p className="text-base text-[#a6adc8]">No contacts found</p>
              <p className="mt-1 text-sm text-[#6c7086]">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onViewContact={handleViewContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleContactCreated}
      />

      {/* Contact Detail Modal */}
      {selectedContactId && (
        <ContactDetailModal
          contactId={selectedContactId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onContactUpdated={handleContactUpdated}
          onContactDeleted={handleContactDeleted}
        />
      )}
    </div>
  );
}
