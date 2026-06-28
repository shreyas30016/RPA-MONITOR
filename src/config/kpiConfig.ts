import type { KPIState } from '../types/rpa.types'

export interface KPIConfig {
  id: keyof KPIState
  label: string
  initValue: string
  formatter: 'number' | 'currency'
}

export const KPI_CONFIG: KPIConfig[] = [
  { id: 'totalRowsProcessed', label: 'TOTAL ROWS PROCESSED', initValue: '0', formatter: 'number' },
  { id: 'activeRobotsDeployed', label: 'ACTIVE ROBOTS DEPLOYED', initValue: '0', formatter: 'number' },
  { id: 'globalCumulativeSavings', label: 'GLOBAL CUMULATIVE SAVINGS', initValue: '$0', formatter: 'currency' },
]
