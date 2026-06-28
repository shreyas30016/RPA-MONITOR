export interface RPARow {
  internal_uid: string
  project_id: string
  company_id: string
  project_name: string
  start_date: string
  completion_date: string
  project_status: 'Active' | 'Completed' | 'Failed' | 'On Hold' | string
  automation_type: string
  robots_deployed: number
  budget_usd: number
  annual_savings_usd: number
  roi_percent: number
  department: string
  implementation_partner: string
  country: string
  industry: string
  employee_hours_saved: number
  ai_enabled: string
  cloud_deployment: string
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  column: keyof RPARow
  direction: SortDirection
  priority: number  // for multi-column sort
}

export interface KPIState {
  totalRowsProcessed: number
  activeRobotsDeployed: number
  globalCumulativeSavings: number
}

export interface LayoutConfig {
  showGrid: boolean
  showKPI: boolean
  showFilters: boolean
  showSearch: boolean
  showPausePlay: boolean
}
