export type StatusConfig = {
  colors: string;
  icon: string;
};

export const STATUS_MAPPINGS: Record<string, StatusConfig> = {
  Active: {
    colors: 'bg-primary/10 text-primary border-primary/30',
    icon: 'sync'
  },
  Completed: {
    colors: 'bg-success/10 text-success border-success/30',
    icon: 'check_circle'
  },
  Failed: {
    colors: 'bg-error/10 text-error border-error/30',
    icon: 'error'
  },
  'On Hold': {
    colors: 'bg-warning/10 text-warning border-warning/30',
    icon: 'pause_circle'
  }
};

export const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_MAPPINGS[status] ?? {
    colors: 'bg-surface-variant/50 text-on-surface-muted border-border',
    icon: 'help'
  };
};