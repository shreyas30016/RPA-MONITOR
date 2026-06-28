import { TopHeader } from '../components/layout/TopHeader';
import { useStreamContext } from '../contexts/StreamContext';
import { useState, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/ui/Modal';

type QueueStatus = 'Processing' | 'Failed' | 'Pending' | 'Cancelled';
type Priority = 'Low' | 'Normal' | 'High' | 'Critical';

interface QueueItem {
  id: string;
  project: string;
  worker: string;
  status: QueueStatus;
  enqueued: string;
  priority: Priority;
}

const INITIAL_QUEUE: QueueItem[] = [
  { id: 'Q-10023', project: 'Finance Recon Batch', worker: 'Worker_Node_04', status: 'Processing', enqueued: '10:45:02', priority: 'High' },
  { id: 'Q-10022', project: 'HR Onboarding (EU)', worker: 'Worker_Node_01', status: 'Failed', enqueued: '10:44:11', priority: 'Normal' },
  { id: 'Q-10021', project: 'Supply Chain Sync', worker: 'Unassigned', status: 'Pending', enqueued: '10:42:00', priority: 'Low' },
  { id: 'Q-10020', project: 'Audit Log Archival', worker: 'Worker_Node_02', status: 'Processing', enqueued: '10:40:15', priority: 'Normal' },
  { id: 'Q-10019', project: 'Client Report Gen', worker: 'Unassigned', status: 'Pending', enqueued: '10:38:30', priority: 'Critical' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-surface-variant text-on-surface-muted border-border',
  Normal: 'bg-primary/10 text-primary border-primary/20',
  High: 'bg-warning/10 text-warning border-warning/20',
  Critical: 'bg-error/10 text-error border-error/20',
};

export const QueueMonitor = () => {
  const { isPaused } = useStreamContext();
  const { addToast } = useToast();
  
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredQueue = useMemo(() => {
    return queue.filter(q => {
      const matchesSearch = !searchQuery || q.project.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [queue, searchQuery, statusFilter]);

  const handleRetry = (id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'Pending' as const, worker: 'Unassigned' } : q));
    addToast(`Retry queued.`, 'success');
  };

  const handlePriorityChange = (id: string, priority: Priority) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, priority } : q));
    addToast(`Priority updated to ${priority}.`, 'info');
  };

  const confirmCancel = (id: string) => {
    setItemToCancel(id);
    setCancelModalOpen(true);
  };

  const handleCancelExecute = () => {
    if (itemToCancel) {
      setQueue(prev => prev.map(q => q.id === itemToCancel ? { ...q, status: 'Cancelled' as const } : q));
      addToast(`Run cancelled.`, 'info');
    }
    setCancelModalOpen(false);
    setItemToCancel(null);
  };

  const processingCount = queue.filter(q => q.status === 'Processing').length;
  const pendingCount = queue.filter(q => q.status === 'Pending').length;
  const failedCount = queue.filter(q => q.status === 'Failed').length;

  return (
    <>
      <TopHeader title="Queue Monitor" />
      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <div className="mb-[var(--spacing-section-margin)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-muted">Real-time throughput and execution state tracking.</p>
          </div>
          <span className="px-2 py-1 rounded bg-surface border border-border text-on-surface-variant font-data-sm text-data-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-success animate-pulse'}`}></span> {isPaused ? 'Paused' : 'Live Sync'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-element-gap)] mb-[var(--spacing-section-margin)]">
          <div className="bg-surface border border-border rounded-lg p-4">
            <span className="font-label-caps text-on-surface-muted">Total Enqueued</span>
            <div className="font-data-lg text-3xl text-on-surface mt-1">{queue.length}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <span className="font-label-caps text-on-surface-muted">Processing</span>
            <div className="font-data-lg text-3xl text-primary mt-1">{processingCount}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <span className="font-label-caps text-on-surface-muted">Pending</span>
            <div className="font-data-lg text-3xl text-warning mt-1">{pendingCount}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <span className="font-label-caps text-on-surface-muted">Failed</span>
            <div className="font-data-lg text-3xl text-error mt-1">{failedCount}</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border bg-surface-container-lowest">
            <h2 className="font-headline-md text-[16px] text-on-surface">Active Queue</h2>
            <div className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search queue..." className="bg-background border border-border rounded px-3 py-1 text-sm outline-none focus:border-primary w-48" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-background border border-border rounded px-3 py-1 text-sm outline-none focus:border-primary">
                <option>All</option>
                <option>Processing</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-surface-container-lowest">
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Item ID</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Project Name</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Worker Node</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Status</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Priority</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant">Enqueued At</th>
                  <th className="py-3 px-4 font-label-caps text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-on-surface">
                {filteredQueue.map(item => (
                  <tr key={item.id} className={`border-b border-border hover:bg-surface-hover transition-colors group ${item.status === 'Cancelled' ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4 font-data-sm text-on-surface-muted">{item.id}</td>
                    <td className="py-3 px-4 font-medium">{item.project}</td>
                    <td className="py-3 px-4 text-on-surface-muted font-data-sm">{item.worker}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-caps text-[10px] 
                        ${item.status === 'Processing' ? 'bg-primary/10 text-primary border border-primary/20' : 
                          item.status === 'Failed' ? 'bg-error/10 text-error border border-error/20' : 
                          item.status === 'Cancelled' ? 'bg-surface-variant text-on-surface-muted border border-border' :
                          'bg-warning/10 text-warning border border-warning/20'}`}>
                        {item.status === 'Processing' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.status !== 'Cancelled' ? (
                        <select
                          value={item.priority}
                          onChange={e => handlePriorityChange(item.id, e.target.value as Priority)}
                          className={`text-[10px] font-label-caps px-2 py-0.5 rounded border outline-none cursor-pointer ${PRIORITY_COLORS[item.priority]}`}
                        >
                          <option className="bg-surface text-on-surface" value="Low">Low</option>
                          <option className="bg-surface text-on-surface" value="Normal">Normal</option>
                          <option className="bg-surface text-on-surface" value="High">High</option>
                          <option className="bg-surface text-on-surface" value="Critical">Critical</option>
                        </select>
                      ) : (
                        <span className="text-[10px] font-label-caps text-on-surface-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-data-sm text-on-surface-muted">{item.enqueued}</td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'Cancelled' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.status === 'Failed' && (
                            <button onClick={() => handleRetry(item.id)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-success transition-colors" title="Retry">
                              <span className="material-symbols-outlined text-[18px]">refresh</span>
                            </button>
                          )}
                          <button onClick={() => confirmCancel(item.id)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors" title="Cancel">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-muted">No items match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Confirm Cancellation">
        <div className="p-6">
          <p className="text-body-sm text-on-surface">Are you sure you want to cancel item <span className="font-mono text-error">{itemToCancel}</span>? This action cannot be undone.</p>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button onClick={() => setCancelModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Abort</button>
          <button onClick={handleCancelExecute} className="px-4 py-2 rounded bg-error text-white hover:bg-error/90 font-body-sm font-semibold transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">cancel</span> Confirm Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};