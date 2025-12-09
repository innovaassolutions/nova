'use client';

/**
 * FilterBar Component
 *
 * Search and filter controls for contacts list.
 * Features debounced search (300ms) and filter/sort dropdowns.
 * Story: 2.3 - Contacts List with Search & Filter
 */

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  campaigns?: Array<{ id: string; name: string }>;
}

export default function FilterBar({
  onSearchChange,
  onFilterChange,
  onSortChange,
  campaigns = [],
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
    <div className="mb-6 flex gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f849c]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, company, or position..."
          className="w-full rounded-lg border border-[#45475a] bg-[#313244] py-3 pl-12 pr-4 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
        />
      </div>

      {/* Filter Dropdown */}
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-3 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      >
        <option value="all">All Contacts</option>
        <option value="my">My Contacts</option>
        <option value="unassigned">Unassigned</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={`campaign-${campaign.id}`}>
            {campaign.name}
          </option>
        ))}
      </select>

      {/* Sort Dropdown */}
      <select
        onChange={(e) => onSortChange(e.target.value)}
        defaultValue="recent"
        className="cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-3 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
      >
        <option value="recent">Recently Added</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="company">Company A-Z</option>
      </select>
    </div>
  );
}
