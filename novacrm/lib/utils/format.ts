/**
 * Utility functions for formatting numbers, currency, and percentages
 * Story 6.1: Dashboard Page with Four Key Stat Cards
 * AC14: Currency Formatting, AC7: Percentage Formatting
 */

/**
 * Format a number as USD currency
 * AC14: Uses Intl.NumberFormat with 2 decimal places
 *
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "$650,000.00")
 *
 * @example
 * formatCurrency(650000) // "$650,000.00"
 * formatCurrency(0) // "$0.00"
 * formatCurrency(null) // "$0.00"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number as a percentage
 * AC7: Rounds to 1 decimal place, handles edge cases
 *
 * @param value - The numeric value to format (0-100 scale)
 * @returns Formatted percentage string (e.g., "45.5%") or "N/A" for invalid values
 *
 * @example
 * formatPercentage(45.5) // "45.5%"
 * formatPercentage(0) // "0.0%"
 * formatPercentage(null) // "N/A"
 * formatPercentage(NaN) // "N/A"
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return 'N/A'
  }

  return value.toFixed(1) + '%'
}
