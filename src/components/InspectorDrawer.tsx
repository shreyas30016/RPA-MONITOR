import { useEffect, useRef } from 'react';
import type { RPARow } from '../types/rpa.types';
import { INSPECTOR_SECTIONS } from '../config/inspectorSections';
import { formatFieldLabel, formatFieldValue } from '../utils/fieldFormatters';
import { StatusBadge } from './StatusBadge';
import { copyToClipboard } from '../utils/exportUtils';
import { useToast } from '../contexts/ToastContext';

interface InspectorDrawerProps {
  selectedRow: RPARow | null;
  onClose: () => void;
}

export const InspectorDrawer = ({ selectedRow, onClose }: InspectorDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedRow) return null;

  // Track which fields have been rendered in sections
  const renderedFields = new Set<string>();

  const handleCopyJSON = async () => {
    const success = await copyToClipboard(JSON.stringify(selectedRow, null, 2));
    if (success) addToast('Copied to clipboard.', 'success');
  };

  const handleCopyField = async (label: string, value: unknown) => {
    const success = await copyToClipboard(String(value ?? ''));
    if (success) addToast(`${label} copied.`, 'info');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-[450px] bg-surface-container border-l border-border z-50 shadow-2xl flex flex-col transform transition-transform animate-slide-in-right"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-2 truncate max-w-[320px]">
              {selectedRow.project_name || 'Unnamed Project'}
            </h2>
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedRow.project_status} />
              <span className="text-xs text-on-surface-muted font-mono">{selectedRow.internal_uid}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-hover flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {INSPECTOR_SECTIONS.map((section) => {
            // Get fields that actually exist on this row
            const activeFields = section.fields.filter(field => field in selectedRow);
            if (activeFields.length === 0) return null;
            
            activeFields.forEach(f => renderedFields.add(String(f)));

            return (
              <div key={section.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-container-lowest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">{section.icon}</span>
                  <h3 className="font-label-caps text-on-surface font-semibold uppercase tracking-wider text-xs">
                    {section.label}
                  </h3>
                </div>
                <div className="p-4 grid gap-4">
                  {activeFields.map(field => (
                    <div key={String(field)} className="group flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-body-xs text-on-surface-muted mb-1">{formatFieldLabel(String(field))}</p>
                        <p className="text-body-sm font-medium text-on-surface">
                          {formatFieldValue(field, selectedRow[field as keyof RPARow])}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyField(formatFieldLabel(String(field)), selectedRow[field as keyof RPARow])}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-hover text-on-surface-muted hover:text-on-surface transition-all shrink-0 ml-2"
                        title="Copy value"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Metadata Section (unmapped fields) */}
          {(() => {
            const allKeys = Object.keys(selectedRow);
            const metadataKeys = allKeys.filter(
              k => !renderedFields.has(k) && k !== 'project_name' && k !== 'project_status' && k !== 'internal_uid'
            );

            if (metadataKeys.length === 0) return null;

            return (
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-container-lowest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">database</span>
                  <h3 className="font-label-caps text-on-surface font-semibold uppercase tracking-wider text-xs">
                    Metadata
                  </h3>
                </div>
                <div className="p-4 grid gap-4">
                  {metadataKeys.map(key => (
                    <div key={key} className="group flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-body-xs text-on-surface-muted mb-1">{formatFieldLabel(key)}</p>
                        <p className="text-body-sm font-medium text-on-surface break-all">
                          {formatFieldValue(key, (selectedRow as unknown as Record<string, unknown>)[key])}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyField(formatFieldLabel(key), (selectedRow as unknown as Record<string, unknown>)[key])}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-hover text-on-surface-muted hover:text-on-surface transition-all shrink-0 ml-2"
                        title="Copy value"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* JSON Preview */}
          <details className="group bg-surface border border-border rounded-lg overflow-hidden">
            <summary className="px-4 py-3 bg-surface-container-lowest flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">code</span>
                <h3 className="font-label-caps text-on-surface font-semibold uppercase tracking-wider text-xs">
                  Raw JSON
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyJSON(); }}
                  className="p-1 rounded hover:bg-surface-hover text-on-surface-muted hover:text-primary transition-colors"
                  title="Copy JSON"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </div>
            </summary>
            <div className="p-4 border-t border-border bg-[#0d1117] overflow-x-auto">
              <pre className="text-[11px] font-mono text-green-400">
                {JSON.stringify(selectedRow, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </>
  );
};
