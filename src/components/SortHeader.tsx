import type { RPARow, SortConfig } from '../types/rpa.types'
import type { ColumnDef } from '../config/tableColumns'

interface SortHeaderProps {
  column: ColumnDef
  sortConfigs: SortConfig[]
  onClick: (e: React.MouseEvent, col: keyof RPARow) => void
}

export const SortHeader = ({ column, sortConfigs, onClick }: SortHeaderProps) => {
  const sortConfig = sortConfigs.find(s => s.column === column.key)
  const priority = sortConfigs.findIndex(s => s.column === column.key)

  return (
    <div
      className={`
        flex-shrink-0 px-4 py-3 flex items-center gap-1
        text-label-caps font-label-caps uppercase whitespace-nowrap
        ${column.sortable
          ? 'cursor-pointer hover:bg-surface-hover/50 text-on-surface-variant select-none'
          : 'text-on-surface-muted cursor-default'}
      `}
      style={{ width: column.width }}
      onClick={column.sortable ? (e) => onClick(e, column.key) : undefined}
      title={column.sortable ? 'Click to sort. Shift+click to multi-sort.' : undefined}
    >
      <span className="truncate">{column.label}</span>
      {sortConfig?.direction && (
        <span className="flex-shrink-0 text-primary text-[10px] ml-1 font-bold">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
          {sortConfigs.length > 1 && (
            <sup className="text-[8px] text-primary-container">{priority + 1}</sup>
          )}
        </span>
      )}
    </div>
  )
}
