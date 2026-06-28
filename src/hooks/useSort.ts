import { useState, useCallback } from 'react'
import type { SortConfig, RPARow } from '../types/rpa.types'

export const useSort = () => {
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([])

  // Feature 4: single click = replace sort
  // Feature 9: shift+click = add to multi-sort priority chain
  const handleHeaderClick = useCallback(
    (column: keyof RPARow, isShiftClick: boolean) => {
      setSortConfigs(prev => {
        const existing = prev.find(s => s.column === column)

        if (isShiftClick) {
          // Multi-column: toggle or add
          if (existing) {
            if (existing.direction === 'asc') {
              return prev.map(s =>
                s.column === column ? { ...s, direction: 'desc' } : s
              )
            } else {
              return prev.filter(s => s.column !== column)
            }
          } else {
            return [
              ...prev,
              { column, direction: 'asc', priority: prev.length },
            ]
          }
        } else {
          // Single column: replace all
          if (existing) {
            if (existing.direction === 'asc')
              return [{ column, direction: 'desc', priority: 0 }]
            if (existing.direction === 'desc') return []
          }
          return [{ column, direction: 'asc', priority: 0 }]
        }
      })
    },
    []
  )

  return { sortConfigs, handleHeaderClick }
}
