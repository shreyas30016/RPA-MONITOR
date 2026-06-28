export const StatusBadge = ({ status }: { status: string }) => {
  let color = 'on-surface-muted' // default (e.g. Archived, Stopped)
  
  const s = status.toLowerCase()
  if (s === 'active' || s === 'running' || s === 'completed') {
    color = 'success'
  } else if (s === 'maintenance' || s === 'paused' || s === 'pending') {
    color = 'warning'
  } else if (s === 'failed' || s === 'error') {
    color = 'error'
  } else if (s === 'in progress' || s === 'developing') {
    color = 'primary'
  }

  // Dynamic Tailwind classes for arbitrary colors using arbitrary values might not work with full mapping unless safelisted.
  // Instead, since it's a constrained set of colors, we map explicitly:
  
  const styles = {
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    error: 'border-error/20 bg-error/10 text-error',
    primary: 'border-primary/20 bg-primary/10 text-primary',
    'on-surface-muted': 'border-on-surface-muted/20 bg-on-surface-muted/10 text-on-surface-muted',
  }
  
  const dotStyles = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    primary: 'bg-primary',
    'on-surface-muted': 'bg-on-surface-muted',
  }

  const selectedStyle = styles[color as keyof typeof styles]
  const selectedDot = dotStyles[color as keyof typeof dotStyles]

  return (
    <span
      className={`px-2 py-0.5 rounded-sm text-xs font-medium border inline-flex items-center gap-1 ${selectedStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${selectedDot}`}></span>
      {status}
    </span>
  )
}
