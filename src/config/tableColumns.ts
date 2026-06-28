import type { RPARow } from '../types/rpa.types'

export interface ColumnDef {
  key: keyof RPARow
  label: string
  width: number
  sortable: boolean
}

export const COLUMNS: ColumnDef[] = [
  { key: 'project_id',            label: 'Project ID',      width: 110, sortable: false },
  { key: 'project_name',          label: 'Project Name',    width: 200, sortable: false },
  { key: 'project_status',        label: 'Status',          width: 110, sortable: false },
  { key: 'automation_type',       label: 'Type',            width: 140, sortable: false },
  { key: 'robots_deployed',       label: 'Robots',          width: 70,  sortable: false },
  { key: 'budget_usd',            label: 'Budget',          width: 110, sortable: true  },
  { key: 'annual_savings_usd',    label: 'Savings',         width: 110, sortable: false },
  { key: 'roi_percent',           label: 'ROI %',           width: 90,  sortable: true  },
  { key: 'employee_hours_saved',  label: 'Hrs Saved',       width: 90,  sortable: true  },
  { key: 'country',               label: 'Country',         width: 120, sortable: false },
  { key: 'industry',              label: 'Industry',        width: 160, sortable: false },
]
