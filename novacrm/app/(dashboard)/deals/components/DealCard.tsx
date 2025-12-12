'use client';

/**
 * DealCard Component
 *
 * Card component for displaying deal information in list views.
 * Story: 4.4 - Deal List View with Pipeline Stage Filtering
 */

interface DealCardProps {
  deal: {
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
  };
  totalStages: number;
  onClick: () => void;
}

export default function DealCard({ deal, totalStages, onClick }: DealCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getProgressPercentage = () => {
    if (totalStages === 0) return 0;
    return ((deal.stage.order_num - 1) / (totalStages - 1)) * 100;
  };

  const getStatusColor = () => {
    if (deal.status === 'Won') return 'border-l-green-400';
    if (deal.status === 'Lost') return 'border-l-red-400';
    return '';
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-[#313244] bg-[#181825] p-4 transition-all hover:border-[#F25C05] hover:shadow-lg cursor-pointer active:scale-[0.98] md:p-6 ${getStatusColor()}`}
      style={
        deal.status !== 'Open'
          ? { borderLeftWidth: '2px' }
          : undefined
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#cdd6f4] line-clamp-2 break-words md:text-lg">
            {deal.title}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-[#F25C05] whitespace-nowrap md:text-lg">
            {formatCurrency(deal.value)}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-2 text-sm text-[#a6adc8] break-words">
        {deal.contact.first_name} {deal.contact.last_name}
        {deal.contact.company && (
          <>
            {' '}• {deal.contact.company}
          </>
        )}
      </div>

      {/* Metrics */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#a6adc8] md:text-sm">
        <span>{deal.probability || 0}% probability</span>
        <span className="hidden sm:inline">•</span>
        <span className="break-words">
          {deal.status === 'Open' ? 'Close:' : deal.status === 'Won' ? 'Won:' : 'Lost:'}{' '}
          {deal.status === 'Open'
            ? formatDate(deal.expected_close_date)
            : formatDate(deal.closed_at)}
        </span>
      </div>

      {/* Progress Bar (only for Open deals) */}
      {deal.status === 'Open' && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-[#a6adc8]">
            <span>{deal.stage.name}</span>
            <span>
              {deal.stage.order_num} / {totalStages}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#45475a]">
            <div
              className="h-full bg-gradient-to-r from-[#F25C05] to-[#ff6b1a] transition-all"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Status Badge (only for Won/Lost) */}
      {deal.status !== 'Open' && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-block rounded-md border px-2 py-1 text-xs font-semibold ${
              deal.status === 'Won'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-red-500/20 text-red-400 border-red-500/50'
            }`}
          >
            {deal.status}
          </span>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 text-xs text-[#6c7086]">
        Last updated: {getRelativeTime(deal.updated_at)}
      </div>
    </div>
  );
}
