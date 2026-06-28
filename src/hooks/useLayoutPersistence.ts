import { useState, useEffect, useCallback } from 'react'
import type { LayoutConfig } from '../types/rpa.types'

const STORAGE_KEY = 'rpa_monitor_layout_v1'

const DEFAULT_LAYOUT: LayoutConfig = {
  showGrid: true,
  showKPI: true,
  showFilters: true,
  showSearch: true,
  showPausePlay: true,
}

export const useLayoutPersistence = () => {
  const [layout, setLayout] = useState<LayoutConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_LAYOUT, ...JSON.parse(stored) } : DEFAULT_LAYOUT
    } catch {
      return DEFAULT_LAYOUT
    }
  })

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {}
  }, [layout])

  const togglePanel = useCallback((key: keyof LayoutConfig) => {
    setLayout(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return { layout, togglePanel }
}
