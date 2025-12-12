'use client';

/**
 * FilterBar Component for Companies
 *
 * Search and filter controls for companies list.
 * Features debounced search (300ms), industry/size filters, and sort options.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  onSearchChange: (search: string) => void;
  onIndustryChange: (industry: string) => void;
  onSizeChange: (size: string) => void;
  onSortChange: (sort: string) => void;
  industries?: string[];
}

export default function FilterBar({
  onSearchChange,
  onIndustryChange,
  onSizeChange,
  onSortChange,
  industries = [],
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      {/* Search Input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f849c]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search companies by name or industry..."
          className="w-full rounded-lg border border-[#45475a] bg-[#313244] py-3 pl-12 pr-4 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
        />
      </div>

      {/* Industry Filter Dropdown */}
      <select
        onChange={(e) => onIndustryChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-3 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      >
        <option value="all">All Industries</option>
        {industries.map((industry) => (
          <option key={industry} value={industry}>
            {industry}
          </option>
        ))}
      </select>

      {/* Size Filter Dropdown */}
      <select
        onChange={(e) => onSizeChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-3 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      >
        <option value="all">All Sizes</option>
        <option value="Startup">Startup</option>
        <option value="SMB">SMB</option>
        <option value="Enterprise">Enterprise</option>
      </select>

      {/* Sort Dropdown */}
      <select
        onChange={(e) => onSortChange(e.target.value)}
        defaultValue="name-asc"
        className="cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-3 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      >
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="contacts-desc">Most Contacts</option>
        <option value="deal-value-desc">Highest Deal Value</option>
      </select>
    </div>
  );
}
