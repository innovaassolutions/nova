'use client';

/**
 * CompanyCard Component
 *
 * Mobile card view for companies list (<768px).
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CompanyAvatar from './CompanyAvatar';

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

interface CompanyCardProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
  onEditCompany: (companyId: string) => void;
  onDeleteCompany: (companyId: string) => void;
}

export default function CompanyCard({
  company,
  onViewCompany,
  onEditCompany,
  onDeleteCompany
}: CompanyCardProps) {
  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format contact count
  const formatContactCount = (count: number | undefined) => {
    if (count === undefined || count === null) return '0';
    return count.toString();
  };

  return (
    <div className="rounded-xl border border-[#313244] bg-[#181825] p-4 transition-all duration-200 hover:border-[#45475a]">
      {/* Header with Avatar and Name */}
      <div className="mb-4 flex items-start gap-3">
        <CompanyAvatar name={company.name} size="lg" />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onViewCompany(company.id)}
            className="mb-1 font-bold text-[#cdd6f4] transition-colors duration-200 hover:text-[#F25C05] text-left break-words"
          >
            {company.name}
          </button>
          {company.industry && (
            <p className="text-sm text-[#6c7086] truncate">{company.industry}</p>
          )}
        </div>
      </div>

      {/* Body with Company Details */}
      <div className="mb-4 space-y-3 border-t border-[#313244] pt-4">
        {/* Size */}
        {company.size && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
              Size:
            </span>
            <span className="text-sm text-[#cdd6f4]">{company.size}</span>
          </div>
        )}

        {/* Contacts Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
            Contacts:
          </span>
          <span className="text-sm font-medium text-[#cdd6f4]">
            {formatContactCount(company.contacts_count)}
          </span>
        </div>

        {/* Deal Value */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
            Deal Value:
          </span>
          <span className="font-mono text-sm font-bold text-[#cdd6f4]">
            {formatCurrency(company.deal_value)}
          </span>
        </div>

        {/* Website */}
        {company.website && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7f849c]">
              Website:
            </span>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#F25C05] hover:underline truncate max-w-[60%] text-right"
            >
              {company.website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="flex gap-2 border-t border-[#313244] pt-4">
        <button
          onClick={() => onViewCompany(company.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#313244] px-3 py-2.5 text-sm font-medium text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] hover:text-[#F25C05] active:scale-95"
          aria-label="View company"
        >
          <EyeIcon className="h-5 w-5" />
          View
        </button>
        <button
          onClick={() => onEditCompany(company.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#313244] px-3 py-2.5 text-sm font-medium text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] hover:text-[#F25C05] active:scale-95"
          aria-label="Edit company"
        >
          <PencilIcon className="h-5 w-5" />
          Edit
        </button>
        <button
          onClick={() => onDeleteCompany(company.id)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#313244] px-3 py-2.5 text-sm font-medium text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] hover:text-red-400 active:scale-95"
          aria-label="Delete company"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
