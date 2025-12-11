'use client';

/**
 * Deals Page
 *
 * List view of all deals with filtering, sorting, and stage tabs.
 * Story: 4.4 - Deal List View with Pipeline Stage Filtering
 */

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DealCard from './components/DealCard';
import DealDetailModal from '../components/DealDetailModal';
import { useToast } from '../contacts/components/ToastContext';

interface Deal {
  id: string;
  title: string;
  value: number | null;
  probability: number | null;
  status: 'Open' | 'Won' | 'Lost';
  expected_close_date: string | null;
  updated_at: string;
  closed_at: string | null;
  stage: {
    id: string;
    name: string;
    order_num: number;
  };
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  };
}

interface PipelineStage {
  id: string;
  name: string;
  order_num: number;
}

export default function DealsPage() {
  const { showToast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [activeTab, setActiveTab] = useState<'all' | 'won' | 'lost' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expected_close_date');
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  // Modal states
  const [showDealDetailModal, setShowDealDetailModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Fetch stages
  useEffect(() => {
    fetchStages();
  }, []);

  // Fetch deals when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeals();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [activeTab, searchQuery, sortBy]);

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/pipeline-stages');
      if (response.ok) {
        const data = await response.json();
        setStages(data.stages);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (activeTab !== 'all' && activeTab !== 'won' && activeTab !== 'lost') {
        // Specific stage selected
        params.append('stage_id', activeTab);
        params.append('status', 'Open');
      } else if (activeTab === 'won') {
        params.append('status', 'Won');
      } else if (activeTab === 'lost') {
        params.append('status', 'Lost');
      } else {
        // All - show only open deals
        params.append('status', 'Open');
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      params.append('sort', sortBy);
      params.append('order', sortBy === 'value' && sortBy.includes('High') ? 'desc' : 'asc');

      const response = await fetch(`/api/deals?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = await response.json();
      setDeals(data.deals);
      setStageCounts(data.stage_counts);
    } catch (error) {
      console.error('Error fetching deals:', error);
      showToast('Failed to load deals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setShowDealDetailModal(true);
  };

  const groupDealsByStage = () => {
    const grouped: Record<string, Deal[]> = {};

    deals.forEach((deal) => {
      const stageId = deal.stage.id;
      if (!grouped[stageId]) {
        grouped[stageId] = [];
      }
      grouped[stageId].push(deal);
    });

    return grouped;
  };

  const getTotalStageValue = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const isGroupedView = activeTab === 'all';
  const groupedDeals = isGroupedView ? groupDealsByStage() : null;

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#cdd6f4]">Deals</h1>
            <p className="mt-1 text-base text-[#a6adc8]">Track your sales opportunities</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a]"
          >
            <PlusIcon className="h-4 w-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4 border-b border-[#313244] pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-[#F25C05] text-[#F25C05]'
                : 'border-transparent text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            All Open
          </button>

          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveTab(stage.id)}
              className={`whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === stage.id
                  ? 'border-[#F25C05] text-[#F25C05]'
                  : 'border-transparent text-[#a6adc8] hover:text-[#cdd6f4]'
              }`}
            >
              {stage.name}{' '}
              <span className="ml-1 text-xs text-[#6c7086]">
                ({stageCounts[stage.id] || 0})
              </span>
            </button>
          ))}

          <button
            onClick={() => setActiveTab('won')}
            className={`whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'won'
                ? 'border-[#F25C05] text-[#F25C05]'
                : 'border-transparent text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            Won
          </button>

          <button
            onClick={() => setActiveTab('lost')}
            className={`whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'lost'
                ? 'border-[#F25C05] text-[#F25C05]'
                : 'border-transparent text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            Lost
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a6adc8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals by title or contact..."
            className="w-full rounded-lg border border-[#313244] bg-[#181825] pl-10 pr-4 py-2 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#a6adc8]">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-[#313244] bg-[#181825] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
          >
            <option value="expected_close_date">Expected Close Date</option>
            <option value="value_desc">Deal Value (High)</option>
            <option value="value_asc">Deal Value (Low)</option>
            <option value="updated_at">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Deals List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-[#313244] flex items-center justify-center">
              <PlusIcon className="h-8 w-8 text-[#a6adc8]" />
            </div>
            <h3 className="text-xl font-bold text-[#cdd6f4]">
              {searchQuery ? 'No deals match your search' : 'No deals yet'}
            </h3>
            <p className="mt-2 text-sm text-[#a6adc8]">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first deal to get started'}
            </p>
            {!searchQuery && (
              <button className="mt-6 flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a]">
                <PlusIcon className="h-4 w-4" />
                Create Deal
              </button>
            )}
          </div>
        ) : isGroupedView && groupedDeals ? (
          <div className="space-y-6">
            {stages
              .filter((stage) => groupedDeals[stage.id]?.length > 0)
              .map((stage) => {
                const stageDeals = groupedDeals[stage.id];
                const totalValue = getTotalStageValue(stageDeals);

                return (
                  <div key={stage.id}>
                    {/* Stage Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base font-bold uppercase text-[#cdd6f4]">
                        {stage.name} ({stageDeals.length} deals, {formatCurrency(totalValue)} total)
                      </h2>
                    </div>

                    {/* Deal Cards */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {stageDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          totalStages={stages.length}
                          onClick={() => handleViewDeal(deal.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                totalStages={stages.length}
                onClick={() => handleViewDeal(deal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDealId && (
        <DealDetailModal
          dealId={selectedDealId}
          isOpen={showDealDetailModal}
          onClose={() => {
            setShowDealDetailModal(false);
            setSelectedDealId(null);
          }}
          onDealUpdated={fetchDeals}
          onDealDeleted={fetchDeals}
        />
      )}
    </div>
  );
}
