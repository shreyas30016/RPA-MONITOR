import { useRef, useEffect, useState, useCallback } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import { KPICard } from '../components/ui/KPICard'
import { Panel } from '../components/ui/Panel'
import { DataGrid } from '../components/DataGrid'
import { FilterPanel } from '../components/FilterPanel'
import { SearchBar } from '../components/SearchBar'
import { PausePlayControl } from '../components/PausePlayControl'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'

import { useStreamContext } from '../contexts/StreamContext'
import { KPI_CONFIG } from '../config/kpiConfig'
import { formatNumber, formatLargeNumber } from '../utils/formatters'
import { InspectorDrawer } from '../components/InspectorDrawer'
import { Modal } from '../components/ui/Modal'
import type { RPARow } from '../types/rpa.types'
import { useToast } from '../contexts/ToastContext'
import { useSettings } from '../contexts/SettingsContext'
import { AnalyticsOverlay } from '../components/AnalyticsOverlay'
import { exportAsCSV } from '../utils/exportUtils'

const BandwidthMetric = () => {
  const { settings } = useSettings();
  const [rate, setRate] = useState(0);

  useEffect(() => {
    if (!settings.webSockets) {
      setRate(0);
      return;
    }
    
    // Base rate
    const base = settings.compression ? 24 : 142;
    setRate(base);
    
    // Fluctuate every 1 second
    const interval = setInterval(() => {
      const diff = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      setRate(base + diff);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [settings.compression, settings.webSockets]);

  return <span>{rate}/s</span>;
}

export const Dashboard = () => {
  const { addToast } = useToast()
  const {
    masterData,
    viewData,
    kpi,
    isInitializing,
    sortConfigs,
    handleHeaderClick,
    filters,
    setFilter,
    clearFilters,
    query,
    handleSearch,
    isPending,
    isPaused,
    queueSize,
    pause,
    play,
  } = useStreamContext()

  // Refs for KPI mutation
  const kpiRefs = useRef<Record<string, HTMLHeadingElement | null>>({})
  const [selectedRow, setSelectedRow] = useState<RPARow | null>(null)
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  // Handlers for Drawer/Modal

  const handlePlayWithAnalytics = useCallback(() => {
    play()
    setIsAnalyticsOpen(false)
  }, [play])

  // Auto-close drawer if unpaused
  useEffect(() => {
    if (!isPaused) setSelectedRow(null)
  }, [isPaused])

  const handleRowClick = useCallback((row: RPARow) => {
    if (isPaused) setSelectedRow(row)
  }, [isPaused])

  useEffect(() => {
    KPI_CONFIG.forEach(config => {
      const el = kpiRefs.current[config.id]
      if (el) {
        const val = kpi[config.id]
        el.textContent = config.formatter === 'currency' 
          ? formatLargeNumber(val as number) 
          : formatNumber(val as number)
      }
    })
  }, [kpi])

  // KPI click handlers — apply relevant filter/sort
  const handleKPIClick = (kpiId: string) => {
    if (kpiId === 'totalRowsProcessed') {
      // Sort by most recent activity
      handleHeaderClick('start_date' as keyof RPARow, false)
      addToast('Sorted by start date.', 'info')
    } else if (kpiId === 'activeRobotsDeployed') {
      // Filter to Active only
      setFilter('project_status', ['Active'])
      addToast('Filtered: Active projects only.', 'info')
    } else if (kpiId === 'globalCumulativeSavings') {
      // Sort by savings descending
      handleHeaderClick('annual_savings_usd' as keyof RPARow, false)
      addToast('Sorted by annual savings.', 'info')
    }
  }

  const handleExportCSV = () => {
    if (viewData.length === 0) {
      addToast('No data to export.', 'error')
      return
    }
    exportAsCSV(viewData as unknown as Record<string, unknown>[], `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`)
    addToast(`Export complete. ${viewData.length} records downloaded.`, 'success')
  }

  return (
    <>
      <TopHeader title="Enterprise Control Center">
        <div className="hidden lg:flex items-center gap-2 mr-2">
          <span className="text-body-xs text-on-surface-muted">Stream Rate:</span>
          <span className="font-data-sm text-data-sm text-primary">
            <BandwidthMetric />
          </span>
        </div>
        <SearchBar value={query} onChange={handleSearch} isPending={isPending} />
        <PausePlayControl
          isPaused={isPaused}
          queueSize={queueSize}
          onPause={pause}
          onPlay={handlePlayWithAnalytics}
        />
        
        <button 
          onClick={() => setIsAnalyticsOpen(true)}
          disabled={!isPaused}
          className={`px-3 py-1.5 rounded border font-body-xs transition-colors flex items-center gap-1 ${
            !isPaused 
              ? 'border-border text-on-surface-muted opacity-50 cursor-not-allowed bg-surface-container' 
              : 'border-[#2563EB] text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB]/20'
          }`}
          title={!isPaused ? 'Pause stream to view analytics' : 'Open Analytics Overlay'}
        >
          <span className="material-symbols-outlined text-[16px]">monitoring</span> Analytics View
        </button>

        <button 
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded border border-border text-on-surface font-body-xs hover:bg-surface-hover transition-colors flex items-center gap-1"
          title="Export current view as CSV"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export
        </button>
        <button 
          onClick={() => setIsNewRunModalOpen(true)}
          className="px-3 py-1.5 rounded bg-primary-container text-on-primary-container font-body-xs hover:bg-primary-fixed transition-colors flex items-center gap-1 font-bold"
        >
          <span className="material-symbols-outlined text-[16px]">add</span> New Run
        </button>
      </TopHeader>

      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-element-gap)] mb-[var(--spacing-section-margin)]">
          {KPI_CONFIG.map(config => (
            <KPICard
              key={config.id}
              label={config.label}
              initValue={config.initValue}
              ref={el => { kpiRefs.current[config.id] = el }}
              onClick={() => handleKPIClick(config.id)}
            />
          ))}
        </div>

        <div className="mb-[var(--spacing-element-gap)]">
          <FilterPanel
            data={masterData}
            filters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
          />
        </div>

        <Panel title="Live Operations Matrix" className="h-[600px] flex flex-col">
          {isInitializing ? (
            <LoadingState message="Connecting to data stream..." />
          ) : viewData.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="No operations found"
              description="No records match your current filters and search query."
            />
          ) : (
            <DataGrid
              data={viewData}
              sortConfigs={sortConfigs}
              onHeaderClick={handleHeaderClick}
              isPaused={isPaused}
              onRowClick={handleRowClick}
            />
          )}
        </Panel>
      </div>
      <InspectorDrawer 
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
      />

      <Modal 
        isOpen={isNewRunModalOpen} 
        onClose={() => setIsNewRunModalOpen(false)}
        title="Initialize New Automation Run"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Project Name</label>
            <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option>Finance Core Recon (FIN-882)</option>
              <option>HR Onboarding Flow (HR-101)</option>
              <option>IT Asset Sync (IT-334)</option>
              <option>Supply Chain Audit (SC-209)</option>
            </select>
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Automation Type</label>
            <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option>Data Extraction</option>
              <option>Document Processing</option>
              <option>Workflow Orchestration</option>
              <option>API Integration</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Priority</label>
              <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>Standard</option>
                <option>High</option>
                <option>Critical (Bypass Queue)</option>
              </select>
            </div>
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Environment</label>
              <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>Production Cluster A</option>
                <option>Staging</option>
                <option>Dev Sandbox</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Assigned Robot</label>
            <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option>Worker_Node_01 (Available)</option>
              <option>Worker_Node_02 (Available)</option>
              <option>Worker_Node_04 (Busy)</option>
              <option>Auto-assign</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button 
            onClick={() => setIsNewRunModalOpen(false)}
            className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              setIsNewRunModalOpen(false)
              addToast('Automation queued successfully.', 'success')
            }}
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 font-body-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span> Start Run
          </button>
        </div>
      </Modal>

      <AnalyticsOverlay 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
        data={masterData} 
      />
    </>
  )
}
