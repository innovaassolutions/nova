/**
 * SkeletonCard Component
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * AC11: Loading State - Skeleton Cards
 *
 * Displays pulsing placeholder elements while data loads
 * Matches StatCard dimensions and layout
 */

export default function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#313244] bg-[#181825] p-6">
      {/* Top accent bar skeleton */}
      <div className="absolute left-0 right-0 top-0 h-[3px] animate-pulse bg-[#313244]" />

      {/* Icon skeleton - top right */}
      <div className="absolute right-6 top-6 size-10 animate-pulse rounded-[10px] bg-[#313244]" />

      {/* Label skeleton */}
      <div className="mb-2 h-[14px] w-[40%] animate-pulse rounded bg-[#313244]" />

      {/* Value skeleton */}
      <div className="mb-3 h-[32px] w-[60%] animate-pulse rounded-md bg-[#313244]" />

      {/* Badge skeleton */}
      <div className="mb-2 h-[24px] w-[30%] animate-pulse rounded-md bg-[#313244]" />

      {/* Subtext skeleton */}
      <div className="h-[14px] w-[50%] animate-pulse rounded bg-[#313244]" />
    </div>
  )
}
