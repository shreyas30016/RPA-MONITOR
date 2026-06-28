'use client'

import { useRef, useCallback } from 'react'
import type { RPARow, KPIState } from '../types/rpa.types'

interface StreamEngineOptions {
  onViewUpdate: () => void     // triggers virtual scroll repaint
  onKPIUpdate: (kpi: KPIState) => void  // triggers KPI display update
  isPaused: () => boolean
  onPauseQueue: (batch: RPARow[]) => void
}

export const useStreamEngine = ({
  onViewUpdate,
  onKPIUpdate,
  isPaused,
  onPauseQueue,
}: StreamEngineOptions) => {
  // Master data pool — NEVER in useState
  const masterPoolRef = useRef<Map<string, RPARow>>(new Map())
  const kpiRef = useRef<KPIState>({
    totalRowsProcessed: 0,
    activeRobotsDeployed: 0,
    globalCumulativeSavings: 0,
  })

  const processBatch = useCallback((incomingBatch: RPARow[]) => {
    if (isPaused()) {
      onPauseQueue(incomingBatch)
      return
    }

    // Update master pool using uid as key (deduplicates updates)
    incomingBatch.forEach(row => {
      masterPoolRef.current.set(row.internal_uid, row)
    })

    // Update KPI running sums
    kpiRef.current.totalRowsProcessed += incomingBatch.length
    kpiRef.current.activeRobotsDeployed += incomingBatch.reduce(
      (sum, row) => sum + (row.robots_deployed || 0), 0
    )
    kpiRef.current.globalCumulativeSavings += incomingBatch.reduce(
      (sum, row) => sum + (row.annual_savings_usd || 0), 0
    )

    // Trigger ONLY necessary updates
    onKPIUpdate({ ...kpiRef.current })
    onViewUpdate()
  }, [isPaused, onPauseQueue, onKPIUpdate, onViewUpdate])

  const getMasterArray = useCallback((): RPARow[] => {
    return Array.from(masterPoolRef.current.values())
  }, [])

  return { processBatch, getMasterArray, kpiRef }
}
