import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ icon = 'inbox', title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 border border-border">
        <span className="material-symbols-outlined text-[32px] text-on-surface-muted">
          {icon}
        </span>
      </div>
      <h3 className="text-body-sm font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-body-sm text-on-surface-muted max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
