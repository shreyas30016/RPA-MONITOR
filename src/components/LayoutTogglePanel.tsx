import type { LayoutConfig } from '../types/rpa.types'

interface LayoutTogglePanelProps {
  layout: LayoutConfig
  onToggle: (key: keyof LayoutConfig) => void
}

const PANEL_LABELS: Record<keyof LayoutConfig, string> = {
  showGrid:      'Grid Window',
  showKPI:       'KPI Strip',
  showFilters:   'Filters Panel',
  showSearch:    'Search Bar',
  showPausePlay: 'Stream Control',
}

export const LayoutTogglePanel = ({
  layout,
  onToggle,
}: LayoutTogglePanelProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-[9px] font-mono text-slate-600
                     uppercase tracking-widest">Panels:</span>
    {(Object.keys(PANEL_LABELS) as (keyof LayoutConfig)[]).map(key => (
      <button
        key={key}
        onClick={() => onToggle(key)}
        className={`
          text-[10px] font-mono px-2 py-1 rounded border
          transition-colors duration-150
          ${layout[key]
            ? 'bg-slate-700 border-slate-600 text-slate-300'
            : 'bg-transparent border-slate-700/50 text-slate-600'}
        `}
      >
        {PANEL_LABELS[key]}
      </button>
    ))}
  </div>
)
