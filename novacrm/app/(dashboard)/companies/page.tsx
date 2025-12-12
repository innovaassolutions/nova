'use client';

/**
 * Companies Page
 *
 * Main page for viewing and managing companies with full CRUD capabilities.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from '../components/ToastContext';
import FilterBar from './components/FilterBar';
import CompaniesTable from './components/CompaniesTable';
import CompanyCard from './components/CompanyCard';
import CreateCompanyModal from './components/CreateCompanyModal';
import EditCompanyModal from './components/EditCompanyModal';
import DeleteCompanyModal from './components/DeleteCompanyModal';
import CompanyDetailModal from './components/CompanyDetailModal';

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contacts_count?: number;
  deal_value?: number;
}

export default function CompaniesPage() {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');

  const { showToast } = useToast();

  // Fetch distinct industries for filter dropdown
  const fetchIndustries = useCallback(async () => {
    try {
      const response = await fetch('/api/companies?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const uniqueIndustries = Array.from(
          new Set(
            data.companies
              .map((c: Company) => c.industry)
              .filter((industry: string | null) => industry !== null)
          )
        ).sort() as string[];
        setIndustries(uniqueIndustries);
      }
    } catch (err) {
      console.error('Error fetching industries:', err);
    }
  }, []);

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: searchTerm,
        industry: industryFilter,
        size: sizeFilter,
        sort: sortOption,
      });

      const response = await fetch(`/api/companies?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data.companies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please try again.');
      showToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, industryFilter, sizeFilter, sortOption, showToast]);

  // Initial data load
  useEffect(() => {
    fetchCompanies();
    fetchIndustries();
  }, [fetchCompanies, fetchIndustries]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCompanyCreated = () => {
    showToast('Company created successfully!', 'success');
    setIsCreateModalOpen(false);
    fetchCompanies();
  };

  const handleOpenEditModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCompanyId(null);
  };

  const handleCompanyUpdated = () => {
    showToast('Company updated successfully!', 'success');
    setIsEditModalOpen(false);
    setSelectedCompanyId(null);
    fetchCompanies();
  };

  const handleOpenDeleteModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCompanyId(null);
  };

  const handleCompanyDeleted = () => {
    showToast('Company deleted successfully!', 'success');
    setIsDeleteModalOpen(false);
    setSelectedCompanyId(null);
    fetchCompanies();
  };

  const handleOpenDetailModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCompanyId(null);
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleIndustryChange = (industry: string) => {
    setIndustryFilter(industry);
  };

  const handleSizeChange = (size: string) => {
    setSizeFilter(size);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleRetry = () => {
    fetchCompanies();
  };

  return (
    <div className="max-w-[1200px]">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#cdd6f4]">Companies</h1>
          <p className="mt-1 text-sm text-[#a6adc8]">
            Manage company information and relationships
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#ff6b1a] focus:outline-none focus:ring-2 focus:ring-[#F25C05] focus:ring-offset-2 focus:ring-offset-[#1e1e2e]"
          >
            <PlusIcon className="h-5 w-5" />
            New Company
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearchChange={handleSearchChange}
        onIndustryChange={handleIndustryChange}
        onSizeChange={handleSizeChange}
        onSortChange={handleSortChange}
        industries={industries}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={handleRetry}
              className="text-sm font-medium text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
            <p className="text-sm text-[#a6adc8]">Loading companies...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && companies.length === 0 && !error && (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
          <div className="text-center">
            <p className="text-base text-[#a6adc8]">No companies found</p>
            <p className="mt-1 text-sm text-[#6c7086]">
              {searchTerm || industryFilter !== 'all' || sizeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first company'}
            </p>
          </div>
        </div>
      )}

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block">
        <CompaniesTable
          companies={companies}
          loading={loading}
          onViewCompany={handleOpenDetailModal}
          onEditCompany={handleOpenEditModal}
          onDeleteCompany={handleOpenDeleteModal}
        />
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
              <p className="text-sm text-[#a6adc8]">Loading companies...</p>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
            <div className="text-center">
              <p className="text-base text-[#a6adc8]">No companies found</p>
              <p className="mt-1 text-sm text-[#6c7086]">
                {searchTerm || industryFilter !== 'all' || sizeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first company'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewCompany={handleOpenDetailModal}
                onEditCompany={handleOpenEditModal}
                onDeleteCompany={handleOpenDeleteModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCompanyCreated}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        isOpen={isEditModalOpen}
        companyId={selectedCompanyId}
        onClose={handleCloseEditModal}
        onSuccess={handleCompanyUpdated}
      />

      {/* Delete Company Modal */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        companyId={selectedCompanyId}
        companyName={companies.find(c => c.id === selectedCompanyId)?.name}
        onClose={handleCloseDeleteModal}
        onSuccess={handleCompanyDeleted}
      />

      {/* Company Detail Modal */}
      <CompanyDetailModal
        isOpen={isDetailModalOpen}
        companyId={selectedCompanyId}
        onClose={handleCloseDetailModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />
    </div>
  );
}
