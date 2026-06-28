import { TopHeader } from '../components/layout/TopHeader';
import { Modal } from '../components/ui/Modal';
import { useState, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';

type WorkflowStatus = 'Running' | 'Scheduled' | 'Failed' | 'Disabled';

interface Workflow {
  id: string;
  name: string;
  icon: string;
  status: WorkflowStatus;
  robots: { active: number; total: number };
  successRate: string;
  metricLabel: string;
  metricValue: string;
  lastUpdate: string;
  owner: string;
  priority: string;
}

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'WRK-8924', name: 'Invoice Processing v2', icon: 'receipt_long', status: 'Running',
    robots: { active: 12, total: 15 }, successRate: '99.8%', metricLabel: 'Avg Time', metricValue: '1.2s',
    lastUpdate: '2 mins ago', owner: 'j.smith@corp.local', priority: 'High',
  },
  {
    id: 'WRK-7731', name: 'Nightly DB Sync', icon: 'database', status: 'Scheduled',
    robots: { active: 5, total: 5 }, successRate: '100%', metricLabel: 'Next Run', metricValue: '02:00',
    lastUpdate: '4 hrs ago', owner: 'system_scheduler', priority: 'Normal',
  },
  {
    id: 'WRK-1102', name: 'Client Onboarding Mailer', icon: 'mail', status: 'Failed',
    robots: { active: 0, total: 2 }, successRate: '42.1%', metricLabel: 'Error Code', metricValue: 'E-503',
    lastUpdate: 'SMTP Timeout', owner: 'a.jones@corp.local', priority: 'Critical',
  },
  {
    id: 'WRK-4491', name: 'Legacy File Archival', icon: 'folder_open', status: 'Running',
    robots: { active: 1, total: 1 }, successRate: '100%', metricLabel: 'Processed', metricValue: '1.2M',
    lastUpdate: '1 hr ago', owner: 'ops_team', priority: 'Low',
  },
];

const STATUS_STYLES: Record<WorkflowStatus, { border: string; bg: string; text: string; dot?: string }> = {
  Running: { border: 'bg-success', bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  Scheduled: { border: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
  Failed: { border: 'bg-error', bg: 'bg-error/10', text: 'text-error' },
  Disabled: { border: 'bg-on-surface-muted', bg: 'bg-surface-variant', text: 'text-on-surface-muted' },
};

const DEPLOYMENT_METRICS = {
  '1H': { value: '84', trend: 'arrow_upward', pct: '2% 1h', trendClass: 'text-success', data: [30, 32, 28, 35, 40, 38, 45, 50, 48, 55, 60] },
  '24H': { value: '1,248', trend: 'arrow_upward', pct: '12% 24h', trendClass: 'text-success', data: [20, 25, 15, 40, 35, 60, 55, 80, 70, 90, 85] },
  '7D': { value: '8,421', trend: 'arrow_downward', pct: '3% 7d', trendClass: 'text-error', data: [80, 75, 85, 70, 65, 50, 45, 60, 55, 40, 30] },
};

function generateSvgPath(data: number[], fill: boolean) {
  if (data.length === 0) return '';
  const step = 100 / (data.length - 1);
  let path = `M0,${100 - data[0]}`;
  for (let i = 1; i < data.length; i++) {
    path += ` L${i * step},${100 - data[i]}`;
  }
  if (fill) {
    path += ` L100,100 L0,100 Z`;
  }
  return path;
}

export const Automations = () => {
  const { addToast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeRange, setTimeRange] = useState('24H');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<Workflow | null>(null);
  const [editTarget, setEditTarget] = useState<Workflow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New workflow form
  const [newForm, setNewForm] = useState({ name: '', owner: '', robot: 'Auto-assign', schedule: 'On Demand', priority: 'Normal' });

  // Filtered data
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      const matchesSearch = !searchQuery ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, statusFilter]);

  const handleCreate = () => {
    const newWf: Workflow = {
      id: `WRK-${Math.floor(Math.random() * 9000) + 1000}`,
      name: newForm.name || 'Untitled Workflow',
      icon: 'smart_toy',
      status: 'Scheduled',
      robots: { active: 0, total: 1 },
      successRate: '—',
      metricLabel: 'Schedule',
      metricValue: newForm.schedule,
      lastUpdate: 'Just now',
      owner: newForm.owner || 'operator',
      priority: newForm.priority,
    };
    setWorkflows(prev => [newWf, ...prev]);
    setCreateModalOpen(false);
    setNewForm({ name: '', owner: '', robot: 'Auto-assign', schedule: 'On Demand', priority: 'Normal' });
    addToast('Automation created.', 'success');
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setWorkflows(prev => prev.map(w => w.id === editTarget.id ? editTarget : w));
    setEditModalOpen(false);
    setEditTarget(null);
    addToast('Automation updated.', 'success');
  };

  const handleToggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.status === 'Running') return { ...w, status: 'Disabled' as const, robots: { ...w.robots, active: 0 } };
      if (w.status === 'Disabled') return { ...w, status: 'Scheduled' as const };
      return w;
    }));
    addToast('Status updated.', 'info');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setWorkflows(prev => prev.filter(w => w.id !== deleteTarget));
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    addToast('Automation removed.', 'success');
  };

  const handleRetry = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'Scheduled' as const, lastUpdate: 'Retry queued' } : w));
    addToast('Retry queued.', 'success');
  };

  const openEdit = (w: Workflow) => {
    setEditTarget({ ...w });
    setEditModalOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <TopHeader title="Automations" />
      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <div className="flex flex-col gap-[var(--spacing-element-gap)]">

          {/* Top Section: Deployment History & New Automation */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 bg-surface border border-border rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4 z-10">
                <div>
                  <h2 className="font-label-caps text-on-surface-variant text-label-caps uppercase">Deployment History</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-data-lg text-data-lg text-on-surface">{DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].value}</span>
                    <span className={`font-data-sm flex items-center ${DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].trendClass}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].trend}
                      </span> 
                      {DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].pct}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {['1H', '24H', '7D'].map(r => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-2 py-1 rounded font-body-xs border transition-colors ${
                        timeRange === r
                          ? 'bg-surface-hover text-on-surface border-border-bright'
                          : 'bg-surface-container text-on-surface-variant border-border hover:bg-surface-hover'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-16 w-full mt-auto opacity-70 relative group cursor-crosshair" onMouseLeave={() => setHoverIndex(null)}>
                <svg className="w-full h-full transition-all duration-500 ease-in-out" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d={generateSvgPath(DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].data, true)} fill="url(#grad)" opacity="0.2" className="transition-all duration-500"></path>
                  <path d={generateSvgPath(DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].data, false)} fill="none" stroke="#adc6ff" strokeWidth="2" className="transition-all duration-500"></path>
                  <defs><linearGradient id="grad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#adc6ff"></stop><stop offset="100%" stopColor="#adc6ff" stopOpacity="0"></stop></linearGradient></defs>
                </svg>
                {/* Interactive Hover Overlay */}
                <div className="absolute inset-0 flex">
                  {DEPLOYMENT_METRICS[timeRange as keyof typeof DEPLOYMENT_METRICS].data.map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 h-full relative"
                      onMouseEnter={() => setHoverIndex(i)}
                    >
                      {hoverIndex === i && (
                        <>
                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-primary/40 pointer-events-none"></div>
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-background border border-primary pointer-events-none z-10"
                            style={{ top: `${100 - val}%`, marginTop: '-4px' }}
                          ></div>
                          <div 
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface-container-high border border-border px-2 py-1 rounded shadow-lg text-[10px] text-on-surface whitespace-nowrap z-20 pointer-events-none flex flex-col items-center"
                          >
                            <span className="font-bold text-primary">
                              {timeRange === '1H' ? Math.round(val * 0.8) : timeRange === '24H' ? Math.round(val * 15) : Math.round(val * 105)} runs
                            </span>
                            <span className="text-on-surface-muted text-[9px] mt-0.5">
                              {timeRange === '1H' ? `${i * 5}m ago` : timeRange === '24H' ? `${i * 2}h ago` : `${i}d ago`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* New Automation Card */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-center items-center text-center gap-3 transition-colors group hover:border-primary/50 hover:bg-surface-container-high"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
              </div>
              <div>
                <h3 className="font-body-sm font-semibold text-on-surface">New Automation</h3>
                <p className="font-body-xs text-on-surface-variant mt-1">Deploy a new RPA workflow</p>
              </div>
            </button>
          </section>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-2 rounded-lg border border-border">
            <div className="flex items-center w-full sm:w-auto bg-surface-container rounded px-3 py-1.5 border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-body-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-0 w-full sm:w-64 ml-2"
                placeholder="Search workflows by name or ID..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-border text-on-surface font-body-sm rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary appearance-none pr-8 outline-none"
              >
                <option>All</option>
                <option>Running</option>
                <option>Scheduled</option>
                <option>Failed</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          {/* Workflow Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-element-gap)]">
            {filteredWorkflows.map(w => {
              const style = STATUS_STYLES[w.status];
              return (
                <div key={w.id} className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 hover:border-border-bright transition-colors relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${style.border}`}></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded ${style.bg} flex items-center justify-center border border-${w.status === 'Failed' ? 'error' : w.status === 'Running' ? 'success' : w.status === 'Scheduled' ? 'warning' : 'border'}/20`}>
                        <span className={`material-symbols-outlined ${style.text}`}>{w.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-body-sm font-bold text-on-surface group-hover:text-primary transition-colors">{w.name}</h3>
                        <p className="font-data-sm text-on-surface-variant text-[12px]">ID: {w.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded ${style.bg} ${style.text} border border-${w.status === 'Failed' ? 'error' : w.status === 'Running' ? 'success' : w.status === 'Scheduled' ? 'warning' : 'border'}/20 font-label-caps text-[10px] flex items-center gap-1`}>
                      {style.dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} block`}></span>}
                      {w.status === 'Scheduled' && <span className="material-symbols-outlined text-[10px]">schedule</span>}
                      {w.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-b border-border py-3 my-1">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-on-surface-variant text-[10px]">Robots</span>
                      <span className="font-data-sm text-on-surface">{w.robots.active} <span className="text-on-surface-muted text-[10px]">/ {w.robots.total}</span></span>
                    </div>
                    <div className="flex flex-col border-l border-border pl-2">
                      <span className="font-label-caps text-on-surface-variant text-[10px]">Success</span>
                      <span className={`font-data-sm ${w.status === 'Failed' ? 'text-error' : 'text-success'}`}>{w.successRate}</span>
                    </div>
                    <div className="flex flex-col border-l border-border pl-2">
                      <span className="font-label-caps text-on-surface-variant text-[10px]">{w.metricLabel}</span>
                      <span className={`font-data-sm ${w.status === 'Failed' ? 'text-error' : 'text-on-surface'}`}>{w.metricValue}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className={`font-body-xs ${w.status === 'Failed' ? 'text-error' : 'text-on-surface-muted'} flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[14px]">{w.status === 'Failed' ? 'warning' : 'update'}</span> {w.lastUpdate}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setDetailDrawerOpen(w)} className="w-7 h-7 rounded bg-surface-container hover:bg-surface-hover border border-border flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" title="View Details">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <button onClick={() => openEdit(w)} className="w-7 h-7 rounded bg-surface-container hover:bg-surface-hover border border-border flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {w.status === 'Failed' ? (
                        <button onClick={() => handleRetry(w.id)} className="w-7 h-7 rounded bg-surface-container hover:bg-surface-hover border border-border flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Retry">
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                        </button>
                      ) : (
                        <button onClick={() => handleToggleStatus(w.id)} className="w-7 h-7 rounded bg-surface-container hover:bg-surface-hover border border-border flex items-center justify-center text-on-surface-variant hover:text-warning transition-colors" title={w.status === 'Disabled' ? 'Enable' : 'Disable'}>
                          <span className="material-symbols-outlined text-[16px]">{w.status === 'Disabled' ? 'play_circle' : 'stop_circle'}</span>
                        </button>
                      )}
                      <button onClick={() => openDelete(w.id)} className="w-7 h-7 rounded bg-surface-container hover:bg-surface-hover border border-border flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredWorkflows.length === 0 && (
              <div className="col-span-full text-center py-12 text-on-surface-muted">
                <span className="material-symbols-outlined text-[48px] mb-2 block opacity-30">search_off</span>
                No workflows match your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {detailDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setDetailDrawerOpen(null)} />
          <div className="fixed right-0 top-0 h-full w-[450px] bg-surface-container border-l border-border z-50 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-border bg-surface flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface mb-1">{detailDrawerOpen.name}</h2>
                <span className="text-xs text-on-surface-muted font-mono">{detailDrawerOpen.id}</span>
              </div>
              <button onClick={() => setDetailDrawerOpen(null)} className="w-8 h-8 rounded-full hover:bg-surface-hover flex items-center justify-center text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-[20px]">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {[
                ['Status', detailDrawerOpen.status],
                ['Owner', detailDrawerOpen.owner],
                ['Priority', detailDrawerOpen.priority],
                ['Active Robots', `${detailDrawerOpen.robots.active} / ${detailDrawerOpen.robots.total}`],
                ['Success Rate', detailDrawerOpen.successRate],
                [detailDrawerOpen.metricLabel, detailDrawerOpen.metricValue],
                ['Last Update', detailDrawerOpen.lastUpdate],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-body-xs text-on-surface-muted">{label}</span>
                  <span className="text-body-sm font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Create Automation Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Automation">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Workflow Name</label>
            <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Invoice Processing v3" />
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Owner</label>
            <input value={newForm.owner} onChange={e => setNewForm(f => ({ ...f, owner: e.target.value }))} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="user@corp.local" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Robot</label>
              <select value={newForm.robot} onChange={e => setNewForm(f => ({ ...f, robot: e.target.value }))} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>Auto-assign</option>
                <option>Worker_Node_01</option>
                <option>Worker_Node_02</option>
                <option>Worker_Node_04</option>
              </select>
            </div>
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Schedule</label>
              <select value={newForm.schedule} onChange={e => setNewForm(f => ({ ...f, schedule: e.target.value }))} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>On Demand</option>
                <option>Hourly</option>
                <option>Daily 02:00</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Priority</label>
            <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 font-body-sm font-semibold transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add</span> Create
          </button>
        </div>
      </Modal>

      {/* Edit Automation Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Automation">
        {editTarget && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Workflow Name</label>
                <input value={editTarget.name} onChange={e => setEditTarget(t => t ? { ...t, name: e.target.value } : t)} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Owner</label>
                <input value={editTarget.owner} onChange={e => setEditTarget(t => t ? { ...t, owner: e.target.value } : t)} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Priority</label>
                <select value={editTarget.priority} onChange={e => setEditTarget(t => t ? { ...t, priority: e.target.value } : t)} className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Cancel</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 font-body-sm font-semibold transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">save</span> Save
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Automation">
        <div className="p-6">
          <p className="text-body-sm text-on-surface">Are you sure you want to permanently delete automation <span className="font-mono text-error">{deleteTarget}</span>? This action cannot be undone.</p>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded bg-error text-white hover:bg-error/90 font-body-sm font-semibold transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">delete_forever</span> Delete
          </button>
        </div>
      </Modal>
    </>
  );
};
