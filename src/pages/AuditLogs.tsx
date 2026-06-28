import { TopHeader } from '../components/layout/TopHeader';
import { useState, useMemo } from 'react';
import { exportToCSV } from '../utils/exportUtils';

type AuditLog = {
  id: string;
  time: string;
  user: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failed' | 'Denied';
  ip: string;
  metadata: string;
};

const MOCK_LOGS: AuditLog[] = [
  { id: 'EVT-90021', time: '10:45:11', user: 'system_auth', action: 'Token Refreshed', resource: 'API Gateway', status: 'Success', ip: '10.0.4.12', metadata: '{"token_id": "xyz123", "lifetime": 3600}' },
  { id: 'EVT-90020', time: '10:44:59', user: 'j.smith@corp.local', action: 'Config Update', resource: 'QueueManager', status: 'Success', ip: '192.168.1.104', metadata: '{"changed": ["retry_limit"]}' },
  { id: 'EVT-90019', time: '10:42:15', user: 'a.jones@corp.local', action: 'Manual Override', resource: 'FinBot_09', status: 'Failed', ip: '192.168.1.55', metadata: '{"error": "Unauthorized role for override."}' },
  { id: 'EVT-90018', time: '10:35:00', user: 'system_scheduler', action: 'Batch Trigger', resource: 'Nightly_Recon', status: 'Success', ip: '10.0.2.22', metadata: '{"records": 45000}' },
  { id: 'EVT-90017', time: '10:15:22', user: 'm.doe@corp.local', action: 'Data Export', resource: 'Telemetry DB', status: 'Denied', ip: '192.168.1.19', metadata: '{"reason": "DLP Policy Blocked Export."}' },
];

export const AuditLogs = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      if (statusFilter && log.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!log.id.toLowerCase().includes(query) && 
            !log.user.toLowerCase().includes(query) && 
            !log.ip.toLowerCase().includes(query) &&
            !log.action.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, statusFilter]);

  const handleExportCSV = async () => {
    if (filteredLogs.length === 0) return;
    
    const exportData = filteredLogs.map(log => ({
      'Event ID': log.id,
      'Time (UTC)': log.time,
      'User / Principal': log.user,
      Action: log.action,
      Resource: log.resource,
      Status: log.status,
      'Source IP': log.ip,
      'Metadata JSON': log.metadata
    }));
    
    await exportToCSV(exportData as Record<string, unknown>[], `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleFilterClick = () => {
    setStatusFilter(prev => {
      if (prev === null) return 'Success';
      if (prev === 'Success') return 'Failed';
      if (prev === 'Failed') return 'Denied';
      return null;
    });
  };

  return (
    <>
      <TopHeader title="Audit & Security Logs" />
      <div className="flex-1 overflow-y-auto bg-background p-[var(--spacing-container-padding)]">
        <div className="max-w-6xl mx-auto space-y-[var(--spacing-section-margin)]">
          
          {/*  Header  */}
          <header className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-1">System Audit Trail</h1>
              <p className="font-body-sm text-body-sm text-on-surface-muted">Immutable ledger of all system events, authentication attempts, and configuration changes.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">search</span>
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none w-64" 
                  placeholder="Search event ID, user, or IP..." 
                  type="text"
                />
              </div>
              <button onClick={handleFilterClick} className="whitespace-nowrap px-3 py-2 bg-surface border border-border rounded-lg text-on-surface hover:bg-surface-hover flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> {statusFilter ? `Filter: ${statusFilter}` : 'Filter'}
              </button>
              <button onClick={handleExportCSV} className="whitespace-nowrap px-3 py-2 bg-surface border border-border rounded-lg text-on-surface hover:bg-surface-hover flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
              </button>
            </div>
          </header>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-surface-container-lowest">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Event ID</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Time (UTC)</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">User / Principal</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Action</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Resource</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Status</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Source IP</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {filteredLogs.map(log => (
                    <tr key={log.id} onClick={() => setSelectedLog(log)} className="border-b border-border hover:bg-surface-hover/50 transition-colors cursor-pointer group">
                      <td className="py-3 px-4 font-data-sm text-on-surface-muted group-hover:text-primary transition-colors">{log.id}</td>
                      <td className="py-3 px-4 text-on-surface-muted font-data-sm">{log.time}</td>
                      <td className="py-3 px-4 text-on-surface">{log.user}</td>
                      <td className="py-3 px-4 font-medium text-on-surface">{log.action}</td>
                      <td className="py-3 px-4 text-on-surface-muted">{log.resource}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-caps text-[10px] 
                          ${log.status === 'Success' ? 'bg-success/10 text-success border border-success/20' : 
                            log.status === 'Failed' ? 'bg-warning/10 text-warning border border-warning/20' : 
                            'bg-error/10 text-error border border-error/20'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-data-sm text-on-surface-muted text-right">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedLog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-container border-l border-border z-50 shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
            <div className="p-6 border-b border-border bg-surface flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface mb-2">{selectedLog.action}</h2>
                <span className="text-xs text-on-surface-muted font-mono">{selectedLog.id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-hover flex items-center justify-center text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-container-lowest">
                  <h3 className="font-label-caps text-on-surface font-semibold uppercase tracking-wider text-xs">Event Details</h3>
                </div>
                <div className="p-4 grid gap-4">
                  <div>
                    <p className="text-body-xs text-on-surface-muted mb-1">Time (UTC)</p>
                    <p className="text-body-sm font-medium text-on-surface">{selectedLog.time}</p>
                  </div>
                  <div>
                    <p className="text-body-xs text-on-surface-muted mb-1">User / Principal</p>
                    <p className="text-body-sm font-medium text-on-surface">{selectedLog.user}</p>
                  </div>
                  <div>
                    <p className="text-body-xs text-on-surface-muted mb-1">Target Resource</p>
                    <p className="text-body-sm font-medium text-on-surface">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <p className="text-body-xs text-on-surface-muted mb-1">Source IP</p>
                    <p className="text-body-sm font-medium text-on-surface">{selectedLog.ip}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-container-lowest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">code</span>
                  <h3 className="font-label-caps text-on-surface font-semibold uppercase tracking-wider text-xs">Metadata JSON</h3>
                </div>
                <div className="p-4 bg-[#0d1117] overflow-x-auto">
                  <pre className="text-[11px] font-mono text-green-400">
                    {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};