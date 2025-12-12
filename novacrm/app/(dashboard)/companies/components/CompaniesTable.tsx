'use client';

/**
 * CompaniesTable Component
 *
 * Desktop table view for companies list with hover states and actions.
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

interface CompaniesTableProps {
  companies: Company[];
  loading?: boolean;
  onViewCompany: (companyId: string) => void;
  onEditCompany: (companyId: string) => void;
  onDeleteCompany: (companyId: string) => void;
}

export default function CompaniesTable({
  companies,
  loading = false,
  onViewCompany,
  onEditCompany,
  onDeleteCompany
}: CompaniesTableProps) {
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
    if (count === undefined || count === null) return '0 contacts';
    if (count === 1) return '1 contact';
    return `${count} contacts`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
          <p className="text-sm text-[#a6adc8]">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#313244] bg-[#181825] p-6">
        <div className="text-center">
          <p className="text-base text-[#a6adc8]">No companies found</p>
          <p className="mt-1 text-sm text-[#6c7086]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#313244] bg-[#181825] p-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#313244]">
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Company
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Industry
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Size
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Contacts
            </th>
            <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Deal Value
            </th>
            <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              className="border-b border-[#313244] transition-colors duration-150 last:border-b-0 hover:bg-[rgba(242,92,5,0.03)]"
            >
              {/* Company Cell with Avatar */}
              <td className="px-2 py-4">
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={company.name} />
                  <div>
                    <button
                      onClick={() => onViewCompany(company.id)}
                      className="font-bold text-[#cdd6f4] transition-colors duration-200 hover:text-[#F25C05]"
                    >
                      {company.name}
                    </button>
                  </div>
                </div>
              </td>

              {/* Industry Cell */}
              <td className="px-2 py-4">
                <span className="text-sm text-[#cdd6f4]">
                  {company.industry || '—'}
                </span>
              </td>

              {/* Size Cell */}
              <td className="px-2 py-4">
                <span className="text-sm text-[#cdd6f4]">
                  {company.size || '—'}
                </span>
              </td>

              {/* Contacts Count Cell */}
              <td className="px-2 py-4">
                <span className="text-sm text-[#cdd6f4]">
                  {formatContactCount(company.contacts_count)}
                </span>
              </td>

              {/* Deal Value Cell */}
              <td className="px-2 py-4">
                <span className="font-mono text-sm font-bold text-[#cdd6f4]">
                  {formatCurrency(company.deal_value)}
                </span>
              </td>

              {/* Actions Cell */}
              <td className="px-2 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onViewCompany(company.id)}
                    className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#F25C05]"
                    title="View company details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEditCompany(company.id)}
                    className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#F25C05]"
                    title="Edit company"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDeleteCompany(company.id)}
                    className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-red-400"
                    title="Delete company"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
