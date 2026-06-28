// Feature 2 — Financial & Numeric Value Sanitation

export const formatCurrency = (value: number): string => {
  if (value == null || isNaN(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))
}

export const formatPercent = (value: number): string => {
  if (value == null || isNaN(value)) return '0.00%'
  return `${Math.max(-999.99, Math.min(999.99, value)).toFixed(2)}%`
}

export const formatNumber = (value: number): string => {
  if (value == null || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US').format(Math.max(0, value))
}

export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return formatCurrency(value)
}
