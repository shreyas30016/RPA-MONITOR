import { useMemo, useCallback } from 'react'
import { useVirtualScroll } from '../hooks/useVirtualScroll'
import { GridRow } from './GridRow'
import { SortHeader } from './SortHeader'
import type { RPARow, SortConfig } from '../types/rpa.types'
import { COLUMNS } from '../config/tableColumns'

interface DataGridProps {
  data: RPARow[]
  sortConfigs: SortConfig[]
  onHeaderClick: (col: keyof RPARow, shift: boolean) => void
  isPaused: boolean
  onRowClick: (row: RPARow) => void
}

export const DataGrid = ({ data, sortConfigs, onHeaderClick, isPaused, onRowClick }: DataGridProps) => {
  const {
    containerRef,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    ROW_HEIGHT,
  } = useVirtualScroll(data.length)

  const visibleRows = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  )

  const handleHeaderClick = useCallback(
    (e: React.MouseEvent, col: keyof RPARow) => {
      onHeaderClick(col, e.shiftKey)
    },
    [onHeaderClick]
  )

  return (
    <div className="flex flex-col h-full bg-surface-container rounded-lg border border-border overflow-hidden relative">
      <div className="flex-1 overflow-x-auto flex flex-col">
        <div className="min-w-max flex flex-col h-full">
          {/* Sticky header */}
          <div className="flex-shrink-0 flex border-b border-border bg-surface shadow-sm sticky top-0 z-10">
        {COLUMNS.map(col => (
          <SortHeader
            key={col.key}
            column={col}
            sortConfigs={sortConfigs}
            onClick={handleHeaderClick}
          />
        ))}
      </div>

      {/* Scrollable virtual body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-background"
        style={{ willChange: 'scroll-position' }}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Offset container for visible rows */}
          <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
            {visibleRows.map((row, i) => (
              <GridRow
                key={row.internal_uid}
                row={row}
                columns={COLUMNS}
                height={ROW_HEIGHT}
                index={startIndex + i}
                isPaused={isPaused}
                onRowClick={onRowClick}
              />
            ))}
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Footer row count */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-surface">
        <span className="text-body-xs font-data-sm text-on-surface-muted">
          {data.length.toLocaleString()} items
        </span>
      </div>
    </div>
  )
}
