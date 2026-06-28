import { TopHeader } from '../components/layout/TopHeader';
import { useState, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAlerts } from '../contexts/AlertsContext';
import { useSettings } from '../contexts/SettingsContext';

export const AlertsCenter = () => {
  const { alerts, setAlerts } = useAlerts();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCrit, setShowCrit] = useState(true);
  const [showWarn, setShowWarn] = useState(true);
  const [showRslv, setShowRslv] = useState(false);
  const [showMuted, setShowMuted] = useState(false);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    addToast(`Alert ${id} acknowledged.`, 'info');
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RSLV' as const, acknowledged: true } : a));
    addToast(`Alert ${id} resolved.`, 'success');
  };

  const handleMute = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'MUTED' as const } : a));
    addToast(`Alert ${id} muted.`, 'info');
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      // 1. Settings filter: if criticalOnly is true, only show CRIT alerts
      if (settings.criticalOnly && a.status !== 'CRIT') return false;

      // 2. Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match = a.title.toLowerCase().includes(query) ||
                      a.description.toLowerCase().includes(query) ||
                      a.target.toLowerCase().includes(query) ||
                      a.id.toLowerCase().includes(query);
        if (!match) return false;
      }
      
      // 3. Status checkbox filters
      if (!showCrit && a.status === 'CRIT') return false;
      if (!showWarn && a.status === 'WARN') return false;
      if (!showRslv && a.status === 'RSLV') return false;
      if (!showMuted && a.status === 'MUTED') return false;
      
      return true;
    });
  }, [alerts, searchQuery, showCrit, showWarn, showRslv, showMuted, settings.criticalOnly]);

  const critCount = alerts.filter(a => a.status === 'CRIT').length;
  const warnCount = alerts.filter(a => a.status === 'WARN').length;
  const rslvCount = alerts.filter(a => a.status === 'RSLV').length;
  const mutedCount = alerts.filter(a => a.status === 'MUTED').length;

  return (
    <>
      <TopHeader title="System Health" />
      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <div className="flex flex-col lg:flex-row gap-[var(--spacing-element-gap)] h-full">
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div>
              <h3 className="font-label-caps text-on-surface-muted mb-3">Search</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">search</span>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-surface border border-border rounded pl-9 pr-3 py-2 text-sm text-on-surface outline-none focus:border-primary" placeholder="Search alerts..." />
              </div>
            </div>
            <div>
              <h3 className="font-label-caps text-on-surface-muted mb-3">Severity Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 hover:bg-surface-hover rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                  <input checked={showCrit} onChange={e => setShowCrit(e.target.checked)} className="form-checkbox bg-surface border-border text-error rounded-sm h-4 w-4" type="checkbox" />
                  <span className="font-body-sm flex-1">Critical</span>
                  <span className="bg-error/10 text-error border border-error/20 font-data-sm text-xs px-1.5 py-0.5 rounded">{critCount}</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-surface-hover rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                  <input checked={showWarn} onChange={e => setShowWarn(e.target.checked)} className="form-checkbox bg-surface border-border text-warning rounded-sm h-4 w-4" type="checkbox" />
                  <span className="font-body-sm flex-1">Warning</span>
                  <span className="bg-warning/10 text-warning border border-warning/20 font-data-sm text-xs px-1.5 py-0.5 rounded">{warnCount}</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-surface-hover rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                  <input checked={showRslv} onChange={e => setShowRslv(e.target.checked)} className="form-checkbox bg-surface border-border text-on-surface-muted rounded-sm h-4 w-4" type="checkbox" />
                  <span className="font-body-sm flex-1 text-on-surface-muted">Resolved</span>
                  <span className="bg-surface-variant text-on-surface-muted border border-border font-data-sm text-xs px-1.5 py-0.5 rounded">{rslvCount}</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-surface-hover rounded cursor-pointer border border-transparent hover:border-border transition-colors">
                  <input checked={showMuted} onChange={e => setShowMuted(e.target.checked)} className="form-checkbox bg-surface border-border text-on-surface-muted rounded-sm h-4 w-4" type="checkbox" />
                  <span className="font-body-sm flex-1 text-on-surface-muted">Muted</span>
                  <span className="bg-surface-variant text-on-surface-muted border border-border font-data-sm text-xs px-1.5 py-0.5 rounded">{mutedCount}</span>
                </label>
              </div>
            </div>
          </aside>
          
          <div className="flex-1 flex flex-col gap-[var(--spacing-element-gap)] min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-element-gap)]">
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-error opacity-75"></div>
                <span className="font-label-caps text-on-surface-muted">Active Critical</span>
                <div className="font-data-lg text-4xl text-on-surface mt-2 mb-1">{critCount}</div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-warning opacity-75"></div>
                <span className="font-label-caps text-on-surface-muted">Active Warnings</span>
                <div className="font-data-lg text-4xl text-on-surface mt-2 mb-1">{warnCount}</div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-success opacity-75"></div>
                <span className="font-label-caps text-on-surface-muted">Total Resolved</span>
                <div className="font-data-lg text-4xl text-on-surface mt-2 mb-1">{rslvCount}</div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h2 className="font-headline-md text-[18px] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">emergency</span>
                  Active Alerts ({filteredAlerts.length})
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border bg-surface-container-lowest sticky top-0 z-10">
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Severity</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">ID</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant w-1/2">Incident Details</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Target Entity</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant text-right">Timestamp</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className={`border-b border-border transition-colors group hover:bg-surface-hover/50 ${alert.status === 'RSLV' ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          {alert.status === 'CRIT' && <span className="inline-flex items-center gap-1 bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded font-label-caps text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-error"></span> CRIT</span>}
                          {alert.status === 'WARN' && <span className="inline-flex items-center gap-1 bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded font-label-caps text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-warning"></span> WARN</span>}
                          {alert.status === 'RSLV' && <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-muted border border-border px-2 py-0.5 rounded font-label-caps text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-on-surface-muted"></span> RSLV</span>}
                        </td>
                        <td className="px-4 py-3 font-data-sm text-on-surface-muted">
                          {alert.id}
                          {alert.acknowledged && alert.status !== 'RSLV' && <span className="ml-2 text-primary material-symbols-outlined text-[14px] align-middle">visibility</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className={`font-medium ${alert.status === 'CRIT' ? 'text-error' : alert.status === 'WARN' ? 'text-warning' : 'line-through text-on-surface-muted'}`}>{alert.title}</span>
                            <span className="text-xs text-on-surface-muted truncate max-w-[250px] lg:max-w-md">{alert.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-data-sm text-xs">{alert.target}</td>
                        <td className="px-4 py-3 font-data-sm text-xs text-right text-on-surface-muted">{alert.time}</td>
                        <td className="px-4 py-3 text-right">
                          {alert.status !== 'RSLV' && (
                            <div className="flex items-center justify-end gap-2">
                              {!alert.acknowledged && (
                                <button onClick={() => handleAcknowledge(alert.id)} className="px-2 py-1 bg-surface-container border border-border rounded text-xs hover:bg-surface-hover transition-colors">Ack</button>
                              )}
                              <button onClick={() => handleResolve(alert.id)} className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded text-xs hover:bg-success/20 transition-colors">Resolve</button>
                              <button onClick={() => handleMute(alert.id)} className="px-2 py-1 bg-surface-container border border-border rounded text-xs hover:bg-surface-hover transition-colors text-on-surface-muted" title="Mute">
                                <span className="material-symbols-outlined text-[14px]">volume_off</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredAlerts.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-on-surface-muted">No alerts match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};