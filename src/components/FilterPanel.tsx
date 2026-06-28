import { useMemo, useState, useRef, useEffect } from 'react'
import type { RPARow } from '../types/rpa.types'
import {
  FILTERABLE_COLUMNS,
  type FilterableColumn,
} from '../hooks/useFilters'

interface FilterPanelProps {
  data: RPARow[]
  filters: Record<FilterableColumn, string[]>
  onFilterChange: (col: FilterableColumn, values: string[]) => void
  onClear: () => void
}

const LABELS: Record<FilterableColumn, string> = {
  automation_type: 'Automation Type',
  department: 'Department',
  industry: 'Industry',
  project_status: 'Status',
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  label
}: {
  options: string[],
  selected: string[],
  onChange: (val: string[]) => void,
  label: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(o => o !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      <label htmlFor={`filter-btn-${label.replace(/\\s+/g, '-').toLowerCase()}`} className="text-label-caps text-on-surface-muted uppercase">
        {label}
      </label>
      <button 
        id={`filter-btn-${label.replace(/\\s+/g, '-').toLowerCase()}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-left bg-surface border border-border rounded px-3 py-1.5 text-body-sm text-on-surface min-w-[200px] max-w-[240px] flex justify-between items-center focus:outline-none focus:border-primary transition-colors hover:border-primary/50"
      >
        <span className="truncate pr-4">
          {selected.length === 0 ? 'All' : `${selected.length} selected`}
        </span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-muted">
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full max-h-64 overflow-y-auto bg-surface border border-border rounded shadow-[0_4px_24px_rgba(0,0,0,0.4)] py-1 custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-body-sm text-on-surface-muted italic">No options</div>
          ) : (
            options.map(opt => (
              <label 
                key={opt} 
                htmlFor={`filter-${label.replace(/\\s+/g, '-').toLowerCase()}-${opt.replace(/\\s+/g, '-').toLowerCase()}`}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  id={`filter-${label.replace(/\\s+/g, '-').toLowerCase()}-${opt.replace(/\\s+/g, '-').toLowerCase()}`}
                  name={`filter-${label.replace(/\\s+/g, '-').toLowerCase()}-${opt.replace(/\\s+/g, '-').toLowerCase()}`}
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="form-checkbox h-3.5 w-3.5 rounded-sm border-border bg-background text-primary"
                />
                <span className="text-body-sm text-on-surface truncate" title={opt}>{opt}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const FilterPanel = ({
  data,
  filters,
  onFilterChange,
  onClear,
}: FilterPanelProps) => {
  const options = useMemo(() => {
    const result: Record<FilterableColumn, string[]> = {
      automation_type: [],
      department: [],
      industry: [],
      project_status: [],
    }
    const sets: Record<FilterableColumn, Set<string>> = {
      automation_type: new Set(),
      department: new Set(),
      industry: new Set(),
      project_status: new Set(),
    }
    data.forEach(row => {
      FILTERABLE_COLUMNS.forEach(col => {
        const val = String(row[col] ?? '')
        if (val) sets[col].add(val)
      })
    })
    FILTERABLE_COLUMNS.forEach(col => {
      result[col] = Array.from(sets[col]).sort()
    })
    return result
  }, [data])

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-surface-container rounded-lg border border-border">
      {FILTERABLE_COLUMNS.map(col => (
        <MultiSelect
          key={col}
          label={LABELS[col]}
          options={options[col]}
          selected={filters[col]}
          onChange={vals => onFilterChange(col, vals)}
        />
      ))}
      <button
        onClick={onClear}
        className="mt-4 text-label-caps text-on-surface-muted hover:text-error transition-colors uppercase font-bold"
      >
        Clear all
      </button>
    </div>
  )
}
