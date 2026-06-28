import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react'
import type { RPARow, KPIState, SortConfig } from '../types/rpa.types'
import type { FilterableColumn } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'
import { useFilters } from '../hooks/useFilters'
import { useFuzzySearch } from '../hooks/useFuzzySearch'
import { usePausePlay } from '../hooks/usePausePlay'
import { applyFilters, applySort } from '../utils/pipeline'

declare global {
  interface Window {
    initializeRpaStream: (
      callback: (batch: RPARow[]) => void,
      csvUrl: string
    ) => void
  }
}

interface StreamContextType {
  // Data
  masterData: RPARow[]
  viewData: RPARow[]
  kpi: KPIState
  isInitializing: boolean
  
  // Sort
  sortConfigs: SortConfig[]
  handleHeaderClick: (col: keyof RPARow, shift: boolean) => void
  
  // Filters
  filters: Record<FilterableColumn, string[]>
  setFilter: (col: FilterableColumn, values: string[]) => void
  clearFilters: () => void
  
  // Search
  query: string
  handleSearch: (v: string) => void
  isPending: boolean
  
  // Pause/Play
  isPaused: boolean
  queueSize: number
  pause: () => void
  play: () => void
}

const StreamContext = createContext<StreamContextType | null>(null)

export const useStreamContext = () => {
  const context = useContext(StreamContext)
  if (!context) {
    throw new Error('useStreamContext must be used within a StreamProvider')
  }
  return context
}

export const StreamProvider = ({ children }: { children: ReactNode }) => {
  // ── Master pool — NEVER useState ──────────────────
  const masterPoolRef = useRef<Map<string, RPARow>>(new Map())
  const queueSizeRef = useRef(0)

  // ── KPI state — updated via direct ref mutation ───
  const [kpi, setKPI] = useState<KPIState>({
    totalRowsProcessed: 0,
    activeRobotsDeployed: 0,
    globalCumulativeSavings: 0,
  })

  // ── View update trigger — single counter ──────────
  const [viewVersion, setViewVersion] = useState(0)
  const triggerViewUpdate = useCallback(() => {
    setViewVersion(v => v + 1)
  }, [])

  // ── Hooks ─────────────────────────────────────────
  const { sortConfigs, handleHeaderClick } = useSort()
  const { filters, setFilter, clearFilters } = useFilters()
  const { query, handleSearch, isPending } = useFuzzySearch()

  const { isPaused, checkPaused, enqueue, pause, play } = usePausePlay(
    useCallback((flushed: RPARow[]) => {
      flushed.forEach(row => masterPoolRef.current.set(row.internal_uid, row))
      queueSizeRef.current = 0
      triggerViewUpdate()
    }, [triggerViewUpdate])
  )

  // ── Stream callback ───────────────────────────────
  const [isInitializing, setIsInitializing] = useState(true)
  
  const handleBatch = useCallback((incomingBatch: RPARow[]) => {
    setIsInitializing(false)
    if (checkPaused()) {
      enqueue(incomingBatch)
      queueSizeRef.current += incomingBatch.length
      triggerViewUpdate() // trigger update so queue size badge updates
      return
    }

    incomingBatch.forEach(row => {
      masterPoolRef.current.set(row.internal_uid, row)
    })

    setKPI(prev => ({
      totalRowsProcessed: prev.totalRowsProcessed + incomingBatch.length,
      activeRobotsDeployed: prev.activeRobotsDeployed +
        incomingBatch.reduce((s, r) => s + (r.robots_deployed || 0), 0),
      globalCumulativeSavings: prev.globalCumulativeSavings +
        incomingBatch.reduce((s, r) => s + (r.annual_savings_usd || 0), 0),
    }))

    triggerViewUpdate()
  }, [checkPaused, enqueue, triggerViewUpdate])

  // ── Initialize stream ─────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && window.initializeRpaStream) {
      window.initializeRpaStream(handleBatch, '/automation_projects.csv')
    }
  }, [handleBatch])

  // ── Derived view — filter + sort pipeline ─────────
  const masterData = useMemo(() => {
    return Array.from(masterPoolRef.current.values())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewVersion])

  const viewData = useMemo(() => {
    const filtered = applyFilters(masterData, filters, query)
    return applySort(filtered, sortConfigs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterData, filters, query, sortConfigs])

  return (
    <StreamContext.Provider
      value={{
        masterData,
        viewData,
        kpi,
        isInitializing,
        sortConfigs,
        handleHeaderClick,
        filters,
        setFilter,
        clearFilters,
        query,
        handleSearch,
        isPending,
        isPaused,
        queueSize: queueSizeRef.current,
        pause,
        play,
      }}
    >
      {children}
    </StreamContext.Provider>
  )
}
