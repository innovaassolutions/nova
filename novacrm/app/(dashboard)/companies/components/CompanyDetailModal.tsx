'use client';

/**
 * Company Detail Modal Component
 *
 * Modal showing company details with linked contacts and deals.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CompanyDetailModalProps {
  isOpen: boolean;
  companyId: string | null;
  onClose: () => void;
  onEdit: (companyId: string) => void;
  onDelete: (companyId: string) => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  position: string | null;
  linkedin_url: string;
}

interface Deal {
  id: string;
  title: string;
  value: number | null;
  status: string | null;
}

interface CompanyData {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  notes: string | null;
  contacts: Contact[];
  deals: Deal[];
  contacts_count: number;
  deal_value: number;
}

export default function CompanyDetailModal({
  isOpen,
  companyId,
  onClose,
  onEdit,
  onDelete,
}: CompanyDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyData();
    }
  }, [isOpen, companyId]);

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

  const fetchCompanyData = async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <h2 className="text-xl font-bold text-[#cdd6f4]">Company Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#cdd6f4]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
                <p className="text-sm text-[#a6adc8]">Loading company data...</p>
              </div>
            </div>
          ) : company ? (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                <h3 className="mb-4 text-lg font-semibold text-[#cdd6f4]">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6c7086]">Name</p>
                    <p className="text-base font-medium text-[#cdd6f4]">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c7086]">Industry</p>
                    <p className="text-base text-[#cdd6f4]">{company.industry || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c7086]">Size</p>
                    <p className="text-base text-[#cdd6f4]">{company.size || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c7086]">Website</p>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-[#F25C05] hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <p className="text-base text-[#cdd6f4]">—</p>
                    )}
                  </div>
                  {company.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-[#6c7086]">Notes</p>
                      <p className="text-base text-[#cdd6f4] whitespace-pre-wrap">{company.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <p className="text-sm text-[#6c7086]">Total Contacts</p>
                  <p className="text-2xl font-bold text-[#cdd6f4]">{company.contacts_count}</p>
                </div>
                <div className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                  <p className="text-sm text-[#6c7086]">Total Deal Value</p>
                  <p className="text-2xl font-bold font-mono text-[#cdd6f4]">
                    {formatCurrency(company.deal_value)}
                  </p>
                </div>
              </div>

              {/* Contacts */}
              <div className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                <h3 className="mb-4 text-lg font-semibold text-[#cdd6f4]">
                  Contacts ({company.contacts.length})
                </h3>
                {company.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {company.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between rounded-lg border border-[#313244] p-3"
                      >
                        <div>
                          <p className="font-medium text-[#cdd6f4]">
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.position && (
                            <p className="text-sm text-[#6c7086]">{contact.position}</p>
                          )}
                        </div>
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-[#F25C05] hover:underline"
                          >
                            {contact.email}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6c7086]">No contacts linked to this company</p>
                )}
              </div>

              {/* Deals */}
              <div className="rounded-lg border border-[#313244] bg-[#181825] p-4">
                <h3 className="mb-4 text-lg font-semibold text-[#cdd6f4]">
                  Deals ({company.deals.length})
                </h3>
                {company.deals.length > 0 ? (
                  <div className="space-y-2">
                    {company.deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between rounded-lg border border-[#313244] p-3"
                      >
                        <div>
                          <p className="font-medium text-[#cdd6f4]">{deal.title}</p>
                          {deal.status && (
                            <p className="text-sm text-[#6c7086]">{deal.status}</p>
                          )}
                        </div>
                        <p className="font-mono text-sm font-bold text-[#cdd6f4]">
                          {formatCurrency(deal.value || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6c7086]">No deals associated with this company</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-base text-[#a6adc8]">Company not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {company && (
          <div className="flex justify-end gap-3 border-t border-[#313244] px-6 py-4">
            <button
              onClick={() => {
                onEdit(company.id);
                onClose();
              }}
              className="flex items-center gap-2 rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#313244]"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Company
            </button>
            <button
              onClick={() => {
                onDelete(company.id);
                onClose();
              }}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Company
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
