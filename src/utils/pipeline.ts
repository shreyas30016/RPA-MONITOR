import type { RPARow, SortConfig } from '../types/rpa.types'

export const applyFilters = (
  data: RPARow[],
  filters: Record<string, string[]>,
  searchQuery: string
): RPARow[] => {
  let result = data

  // Categorical filters
  Object.entries(filters).forEach(([key, values]) => {
    if (values.length > 0) {
      result = result.filter(row =>
        values.includes(String(row[key as keyof RPARow]))
      )
    }
  })

  // Fuzzy search — Feature 10
  if (searchQuery.trim()) {
    const terms = searchQuery.toLowerCase().trim().split(/\s+/)
    result = result.filter(row => {
      const searchable = [
        row.project_name,
        row.company_id,
        row.implementation_partner,
        row.country,
      ].join(' ').toLowerCase()

      return terms.every(term => searchable.includes(term))
    })
  }

  return result
}

export const applySort = (
  data: RPARow[],
  sortConfigs: SortConfig[]
): RPARow[] => {
  if (sortConfigs.length === 0) return data

  const sorted = sortConfigs
    .slice()
    .sort((a, b) => a.priority - b.priority)

  return [...data].sort((a, b) => {
    for (const config of sorted) {
      if (!config.direction) continue
      const aVal = a[config.column]
      const bVal = b[config.column]
      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      if (cmp !== 0) return config.direction === 'asc' ? cmp : -cmp
    }
    return 0
  })
}
