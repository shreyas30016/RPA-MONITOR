import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export const Panel = ({ title, children, action, className = '' }: PanelProps) => {
  return (
    <section className={`bg-surface-container rounded-lg border border-border flex flex-col ${className}`}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-on-surface">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </section>
  )
}
