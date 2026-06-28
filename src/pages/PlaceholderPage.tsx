import { TopHeader } from '../components/layout/TopHeader'
import { EmptyState } from '../components/ui/EmptyState'

export const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <>
      <TopHeader title={title}>
        <button className="px-3 py-1.5 rounded text-on-surface-muted hover:bg-surface-hover transition-colors flex items-center gap-1 font-body-xs opacity-50 cursor-not-allowed" disabled title="Coming Soon">
          <span className="material-symbols-outlined text-[16px]">help</span> Help
        </button>
      </TopHeader>
      <div className="flex-1 p-[var(--spacing-container-padding)]">
        <div className="bg-surface-container rounded-lg border border-border h-full flex flex-col items-center justify-center">
          <EmptyState
            icon="construction"
            title={`${title} is under construction`}
            description="This module is currently being built and will be available in the next release."
          />
        </div>
      </div>
    </>
  )
}
