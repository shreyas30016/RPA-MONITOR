import type { ReactNode } from 'react'

interface TopHeaderProps {
  title: string
  children?: ReactNode
}

export const TopHeader = ({ title, children }: TopHeaderProps) => {
  return (
    <header className="h-[var(--spacing-toolbar-height)] min-h-[var(--spacing-toolbar-height)] border-b border-border bg-background flex items-center px-6 justify-between gap-6 shrink-0">
      <div className="flex items-center gap-4 shrink-0">
        <h2 className="text-headline-md text-on-surface whitespace-nowrap">{title}</h2>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {children}
      </div>
    </header>
  )
}
