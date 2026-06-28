import { TopHeader } from '../components/layout/TopHeader';
import { useState, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';
import { exportAsCSV } from '../utils/exportUtils';

type DateRange = 'Last 30 Days' | 'This Quarter' | 'YTD';
type Department = 'All' | 'Finance' | 'HR' | 'IT' | 'Operations';

import { useStreamContext } from '../contexts/StreamContext';
import { formatLargeNumber, formatNumber } from '../utils/formatters';

export const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>('Last 30 Days');
  const [department, setDepartment] = useState<Department>('All');
  const { addToast } = useToast();
  const { masterData } = useStreamContext();

  const metrics = useMemo(() => {
    let multiplier = 1;
    if (dateRange === 'This Quarter') multiplier = 3;
    if (dateRange === 'YTD') multiplier = 6;

    const filteredData = department === 'All' 
      ? masterData 
      : masterData.filter(d => d.department === department);

    const baseSavings = filteredData.reduce((acc, row) => acc + (row.annual_savings_usd || 0), 0) || 1420000;
    const baseHours = filteredData.reduce((acc, row) => acc + (row.employee_hours_saved || 0), 0) || 14205;
    const activeRobots = filteredData.filter(r => r.project_status === 'Active').length || 84;
    const totalRobots = filteredData.length || 100;
    const totalFailures = filteredData.filter(r => r.project_status === 'Failed').length;

    const workflowMap = new Map<string, number>();
    filteredData.forEach(row => {
      const current = workflowMap.get(row.project_name) || 0;
      workflowMap.set(row.project_name, current + (row.employee_hours_saved || 0));
    });
    const sortedWorkflows = Array.from(workflowMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => {
        const pct = baseHours > 0 ? Math.round((entry[1] / baseHours) * 100) : 0;
        return { name: entry[0], hours: formatNumber(entry[1] * multiplier) + ' hrs', pct };
      });

    // Fallback if empty (e.g. initial load)
    if (sortedWorkflows.length === 0) {
      sortedWorkflows.push({ name: 'Invoice Processing (AP-01)', hours: '3,420 hrs', pct: 85 });
    }

    return {
      roi: formatLargeNumber(baseSavings * multiplier),
      roiChange: '+' + (12.4 + multiplier * 2).toFixed(1) + '%',
      hoursSaved: formatNumber(baseHours * multiplier),
      hoursChange: '+' + (5.2 + multiplier).toFixed(1) + '%',
      activeRobots: activeRobots,
      totalRobots: totalRobots,
      robotWarning: totalFailures > 0 ? 'High Failures' : ((activeRobots / (totalRobots || 1)) > 0.9 ? 'High Load' : 'Nominal'),
      workflows: sortedWorkflows
    };
  }, [dateRange, department, masterData]);

  const utilizationData = useMemo(() => {
    const baseSeed = dateRange === 'YTD' ? 40 : dateRange === 'This Quarter' ? 30 : 20;
    const deptSeed = department === 'All' ? 10 : department.length * 5;
    
    const blocks = Array.from({ length: 48 }).map((_, i) => {
      const timeOfDayFactor = 1 - Math.abs((i - 24) / 24); 
      const noise = (Math.sin(i * baseSeed) * Math.cos(i * deptSeed)) * 30;
      let val = 20 + (timeOfDayFactor * 50) + noise;
      return Math.max(5, Math.min(100, Math.round(val)));
    });

    let maxSum = 0;
    let peakIndex = 0;
    for (let i = 0; i <= blocks.length - 4; i++) {
      const sum = blocks[i] + blocks[i+1] + blocks[i+2] + blocks[i+3];
      if (sum > maxSum) {
        maxSum = sum;
        peakIndex = i;
      }
    }

    const formatTime = (index: number) => {
      const hours = Math.floor(index / 2);
      const mins = index % 2 === 0 ? '00' : '30';
      return `${hours.toString().padStart(2, '0')}:${mins}`;
    };

    const peakTimeStr = `${formatTime(peakIndex)} - ${formatTime(peakIndex + 4)} EST`;
    return { blocks, peakTimeStr };
  }, [dateRange, department]);

  const handleExport = () => {
    const exportData = metrics.workflows.map(w => ({
      Workflow: w.name,
      'Hours Saved': w.hours,
      'Utilization %': `${w.pct}%`,
      'Date Range': dateRange,
      Department: department,
    }));
    exportAsCSV(exportData as Record<string, unknown>[], 'rpa-analytics-report.csv');
    addToast('Export complete.', 'success');
  };

  return (
    <>
      <TopHeader title="Executive Overview" />
      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <div className="flex justify-between items-end border-b border-border pb-4 mb-6">
          <div>
            <p className="text-on-surface-muted font-body-sm text-body-sm">Global RPA performance and ROI metrics.</p>
          </div>
          <div className="flex gap-2">
            <select
              value={department}
              onChange={e => setDepartment(e.target.value as Department)}
              className="bg-surface border border-border text-on-surface rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            >
              <option>All</option>
              <option>Finance</option>
              <option>HR</option>
              <option>IT</option>
              <option>Operations</option>
            </select>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as DateRange)}
              className="bg-surface border border-border text-on-surface rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            >
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>YTD</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-surface border border-border text-on-surface rounded px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">download</span> Export
            </button>
          </div>
        </div>

        {/* ROI Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-element-gap)] mb-6">
          <div className="bg-surface border border-border p-5 rounded-lg hover:border-border-bright transition-colors flex flex-col justify-between cursor-pointer group" onClick={() => addToast(`Total ROI for ${dateRange}: ${metrics.roi}`, 'info')}>
            <div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">Total ROI (Est)</div>
              <div className="font-data-lg text-data-lg text-primary">{metrics.roi}</div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded text-xs flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> {metrics.roiChange}</span>
              <span className="text-on-surface-muted text-xs">vs last period</span>
            </div>
          </div>
          <div className="bg-surface border border-border p-5 rounded-lg hover:border-border-bright transition-colors flex flex-col justify-between cursor-pointer group" onClick={() => addToast(`Hours saved for ${dateRange}: ${metrics.hoursSaved}`, 'info')}>
            <div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">Hours Saved</div>
              <div className="font-data-lg text-data-lg text-on-surface">{metrics.hoursSaved}</div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded text-xs flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span> {metrics.hoursChange}</span>
            </div>
          </div>
          <div className="bg-surface border border-border p-5 rounded-lg hover:border-border-bright transition-colors flex flex-col justify-between cursor-pointer group" onClick={() => addToast(`${metrics.activeRobots} of ${metrics.totalRobots} robots active. Status: ${metrics.robotWarning}`, 'info')}>
            <div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">Active Robots</div>
              <div className="font-data-lg text-data-lg text-on-surface">{metrics.activeRobots} <span className="text-on-surface-muted text-sm font-body-sm font-normal">/ {metrics.totalRobots}</span></div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className={`${metrics.robotWarning === 'Nominal' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'} border px-2 py-0.5 rounded text-xs flex items-center`}>
                <span className="material-symbols-outlined text-[14px] mr-1">{metrics.robotWarning === 'Nominal' ? 'check_circle' : 'warning'}</span> {metrics.robotWarning}
              </span>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-element-gap)]">
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-4 border-b border-border pb-2">Top Performing Workflows</h3>
            <div className="space-y-4">
              {metrics.workflows.map(w => (
                <div key={w.name} className="group cursor-default">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface">{w.name}</span>
                    <span className="font-data-sm text-data-sm text-primary">{w.hours}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 relative">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${w.pct}%` }}></div>
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 right-0 bg-surface border border-border px-2 py-0.5 rounded text-[10px] text-on-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {w.pct}% utilization
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-4 border-b border-border pb-2">Robot Utilization Grid</h3>
            <div className="flex-1 flex items-center justify-center bg-background rounded border border-border p-4 relative">
              <div className="grid grid-cols-12 gap-1 w-full h-full opacity-80">
                {utilizationData.blocks.map((pct, i) => (
                  <div
                    key={i}
                    className="rounded-sm transition-colors relative group cursor-default"
                    style={{ backgroundColor: `rgba(173, 198, 255, ${pct / 100})` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface border border-border px-1 rounded text-[9px] text-on-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {pct}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-surface/90 px-3 py-1 rounded border border-border text-xs text-on-surface shadow-sm">Peak: {utilizationData.peakTimeStr}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
