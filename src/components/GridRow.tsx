import { memo, useEffect, useRef } from 'react'
import type { RPARow } from '../types/rpa.types'
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters'
import { StatusBadge } from './StatusBadge'
import type { ColumnDef } from '../config/tableColumns'

interface GridRowProps {
  row: RPARow
  columns: ColumnDef[]
  height: number
  index: number
  isPaused: boolean
  onRowClick: (row: RPARow) => void
}

const isAlertRow = (row: RPARow): boolean =>
  row.project_status === 'Failed' || row.roi_percent < 0

const formatCell = (key: keyof RPARow, value: unknown): string => {
  if (key === 'budget_usd' || key === 'annual_savings_usd')
    return formatCurrency(value as number)
  if (key === 'roi_percent') return formatPercent(value as number)
  if (key === 'employee_hours_saved' || key === 'robots_deployed')
    return formatNumber(value as number)
  if (key === 'project_status') return '' // rendered as badge
  return String(value ?? '')
}

export const GridRow = memo(({ row, columns, height, index, isPaused, onRowClick }: GridRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null)
  const alert = isAlertRow(row)

  // Feature 3 — Flash animation on alert rows
  // CSS animation auto-expires — no JS timeout needed
  useEffect(() => {
    if (alert && rowRef.current) {
      rowRef.current.classList.remove('flash-alert')
      void rowRef.current.offsetWidth // force reflow to restart animation
      rowRef.current.classList.add('flash-alert')
    }
  }, [alert, row.project_status, row.roi_percent])

  return (
    <div
      ref={rowRef}
      onClick={() => isPaused && onRowClick(row)}
      className={`
        flex items-center border-b border-border
        transition-colors duration-100
        ${index % 2 === 0 ? 'bg-background' : 'bg-surface-container-lowest'}
        ${isPaused ? 'cursor-pointer hover:bg-surface-hover/80 hover:border-primary/50 group' : 'hover:bg-surface-hover/50'}
        ${alert ? 'alert-row' : ''}
      `}
      style={{ height }}
    >
      {columns.map(col => (
        <div
          key={col.key}
          className="flex-shrink-0 px-4 truncate"
          style={{ width: col.width }}
        >
          {col.key === 'project_status' ? (
            <StatusBadge status={row.project_status} />
          ) : (
            <span
              className={`
                text-body-sm whitespace-nowrap
                ${['budget_usd','annual_savings_usd','roi_percent','employee_hours_saved','robots_deployed'].includes(col.key)
                  ? 'text-right block font-data-sm tabular-nums text-on-surface-muted'
                  : 'text-on-surface'}
                ${col.key === 'roi_percent' && row.roi_percent < 0
                  ? 'text-error'
                  : ''}
                ${col.key === 'roi_percent' && row.roi_percent > 100
                  ? 'text-success'
                  : ''}
              `}
            >
              {formatCell(col.key, row[col.key])}
            </span>
          )}
        </div>
      ))}
    </div>
  )
})

GridRow.displayName = 'GridRow'
