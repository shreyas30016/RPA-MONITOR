export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

export const MAIN_NAVIGATION: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { id: 'automations', label: 'Automations', icon: 'precision_manufacturing', path: '/automations' },
  { id: 'queue', label: 'Queue', icon: 'stacked_line_chart', path: '/queue' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics', path: '/analytics' },
  { id: 'alerts', label: 'Alerts', icon: 'notifications_active', path: '/alerts' },
  { id: 'audit-logs', label: 'Audit Logs', icon: 'history_edu', path: '/audit-logs' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
]

export const FOOTER_NAVIGATION: NavItem[] = [
  { id: 'help', label: 'Help', icon: 'help', path: '/help' },
  { id: 'logout', label: 'Logout', icon: 'logout', path: '/logout' },
]
