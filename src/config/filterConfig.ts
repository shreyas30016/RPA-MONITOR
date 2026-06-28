import type { FilterableColumn } from '../hooks/useFilters'

export interface FilterConfig {
  key: FilterableColumn
  label: string
}

export const FILTER_CONFIG: FilterConfig[] = [
  { key: 'automation_type', label: 'Automation Type' },
  { key: 'department', label: 'Department' },
  { key: 'industry', label: 'Industry' },
]
