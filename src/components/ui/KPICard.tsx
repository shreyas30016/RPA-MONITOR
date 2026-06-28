import { forwardRef } from 'react'

interface KPICardProps {
  label: string
  initValue: string
  trend?: string
  trendUp?: boolean
  onClick?: () => void
}

export const KPICard = forwardRef<HTMLHeadingElement, KPICardProps>(
  ({ label, initValue, trend, trendUp = true, onClick }, ref) => {
    return (
      <div
        onClick={onClick}
        className={`bg-surface-container rounded-lg p-5 border border-border flex flex-col justify-between transition-colors ${
          onClick ? 'cursor-pointer hover:border-primary/50 hover:bg-surface-container-high active:scale-[0.99]' : ''
        }`}
      >
        <p className="text-label-caps text-on-surface-muted uppercase mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <h3
            ref={ref}
            className="text-data-lg text-on-surface kpi-value tabular-nums"
          >
            {initValue}
          </h3>
        </div>
        {trend && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-body-xs text-on-surface-muted">
              Last 24h:{' '}
              <span className={trendUp ? 'text-success' : 'text-error'}>
                {trend}
              </span>
            </p>
            <span
              className={`material-symbols-outlined text-[16px] ${
                trendUp ? 'text-success' : 'text-error'
              }`}
            >
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
          </div>
        )}
      </div>
    )
  }
)

KPICard.displayName = 'KPICard'
