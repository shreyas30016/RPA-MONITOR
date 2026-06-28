import { useEffect, useRef } from 'react'
import type { KPIState } from '../types/rpa.types'
import { formatNumber, formatLargeNumber } from '../utils/formatters'

interface KPIStripProps {
  kpi: KPIState
}

export const KPIStrip = ({ kpi }: KPIStripProps) => {
  const rowsRef = useRef<HTMLSpanElement>(null)
  const robotsRef = useRef<HTMLSpanElement>(null)
  const savingsRef = useRef<HTMLSpanElement>(null)

  // Direct DOM mutation — zero re-render
  useEffect(() => {
    if (rowsRef.current)
      rowsRef.current.textContent = formatNumber(kpi.totalRowsProcessed)
    if (robotsRef.current)
      robotsRef.current.textContent = formatNumber(kpi.activeRobotsDeployed)
    if (savingsRef.current)
      savingsRef.current.textContent = formatLargeNumber(kpi.globalCumulativeSavings)
  }, [kpi])

  return (
    <div className="grid grid-cols-3 gap-px bg-slate-700 border border-slate-700 rounded-lg overflow-hidden">
      {[
        { label: 'TOTAL ROWS PROCESSED', ref: rowsRef, init: '0' },
        { label: 'ACTIVE ROBOTS DEPLOYED', ref: robotsRef, init: '0' },
        { label: 'GLOBAL CUMULATIVE SAVINGS', ref: savingsRef, init: '$0' },
      ].map(({ label, ref, init }) => (
        <div key={label} className="bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
            {label}
          </p>
          <span
            ref={ref}
            className="text-2xl font-mono font-bold text-amber-400 tabular-nums"
          >
            {init}
          </span>
        </div>
      ))}
    </div>
  )
}
