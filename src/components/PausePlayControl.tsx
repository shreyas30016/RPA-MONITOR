import { useSettings } from '../contexts/SettingsContext';

interface PausePlayProps {
  isPaused: boolean
  queueSize: number
  onPause: () => void
  onPlay: () => void
}

export const PausePlayControl = ({
  isPaused,
  queueSize,
  onPause,
  onPlay,
}: PausePlayProps) => {
  const { settings } = useSettings();
  const isOffline = !settings.webSockets;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={isPaused ? onPlay : onPause}
        disabled={isOffline}
        className={`
          px-3 py-1.5 rounded transition-colors flex items-center gap-1 font-body-xs font-bold
          ${isOffline
            ? 'opacity-50 cursor-not-allowed bg-surface-container text-on-surface-muted border border-border'
            : isPaused
            ? 'bg-warning/20 text-warning hover:bg-warning/30 border border-warning/30'
            : 'text-on-surface-muted hover:bg-surface-hover hover:text-on-surface border border-transparent'}
        `}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isOffline ? 'cloud_off' : isPaused ? 'play_arrow' : 'pause'}
        </span>
        {isOffline ? 'Offline' : isPaused ? 'Resume' : 'Pause'}
      </button>
      {isPaused && !isOffline && queueSize > 0 && (
        <span className="text-body-xs font-data-sm text-warning">
          {queueSize.toLocaleString()} queued
        </span>
      )}
      {!isPaused && !isOffline && (
        <span className="flex items-center gap-1.5 text-body-xs text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
          Live
        </span>
      )}
      {isOffline && (
        <span className="flex items-center gap-1.5 text-body-xs text-error">
          <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
          Offline
        </span>
      )}
    </div>
  );
};
