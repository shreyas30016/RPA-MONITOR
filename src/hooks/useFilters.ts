import { useState, useCallback } from 'react'

export const FILTERABLE_COLUMNS = [
  'automation_type',
  'department',
  'industry',
  'project_status',
] as const

export type FilterableColumn = typeof FILTERABLE_COLUMNS[number]

export const useFilters = () => {
  const [filters, setFilters] = useState<Record<FilterableColumn, string[]>>({
    automation_type: [],
    department: [],
    industry: [],
    project_status: [],
  })

  const setFilter = useCallback(
    (column: FilterableColumn, values: string[]) => {
      setFilters(prev => ({ ...prev, [column]: values }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({ automation_type: [], department: [], industry: [], project_status: [] })
  }, [])

  return { filters, setFilter, clearFilters }
}
