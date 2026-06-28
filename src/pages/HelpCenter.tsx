import { TopHeader } from '../components/layout/TopHeader';
import { Modal } from '../components/ui/Modal';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export const HelpCenter = () => {
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleSupportSubmit = () => {
    setSupportModalOpen(false);
    addToast('Support ticket successfully created. Our team will contact you shortly.', 'success');
  };

  return (
    <>
      <TopHeader title="Help Center" />
      <div className="flex-1 overflow-y-auto bg-background p-[var(--spacing-container-padding)]">
        <div className="max-w-5xl mx-auto space-y-8">
          {/*  Hero Search  */}
          <section className="bg-surface border border-border rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <h1 className="font-headline-md text-headline-md text-on-surface">How can we help?</h1>
              <p className="font-body-sm text-body-sm text-on-surface-muted max-w-lg">Search our technical documentation, troubleshooting guides, and API references.</p>
              <div className="w-full max-w-2xl relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted">search</span>
                <input className="w-full bg-surface-container border border-border rounded-lg py-4 pl-12 pr-16 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-muted focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner" placeholder="Search Documentation..." type="text"/>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="font-data-sm text-data-sm bg-surface-bright border border-border px-2 py-1 rounded text-on-surface-muted shadow-sm">Ctrl</kbd>
                  <kbd className="font-data-sm text-data-sm bg-surface-bright border border-border px-2 py-1 rounded text-on-surface-muted shadow-sm">K</kbd>
                </div>
              </div>
            </div>
          </section>

          {/*  Categorized Grid  */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => setDocModalOpen(true)} className="bg-surface text-left border border-border rounded-lg p-6 hover:border-border-bright hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
              </div>
              <h3 className="font-headline-md text-[18px] text-on-surface mb-2 group-hover:text-primary transition-colors">Getting Started</h3>
              <p className="font-body-sm text-body-sm text-on-surface-muted mb-4 flex-1">Initial setup, core concepts, and first automation run.</p>
            </button>
            
            <button onClick={() => setDocModalOpen(true)} className="bg-surface text-left border border-border rounded-lg p-6 hover:border-border-bright hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-4 text-tertiary border border-tertiary/20">
                <span className="material-symbols-outlined text-[24px]">code</span>
              </div>
              <h3 className="font-headline-md text-[18px] text-on-surface mb-2 group-hover:text-primary transition-colors">API Reference</h3>
              <p className="font-body-sm text-body-sm text-on-surface-muted mb-4 flex-1">Endpoints, authentication, and webhook configurations.</p>
            </button>

            <button onClick={() => setDocModalOpen(true)} className="bg-surface text-left border border-border rounded-lg p-6 hover:border-border-bright hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4 text-warning border border-warning/20">
                <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
              </div>
              <h3 className="font-headline-md text-[18px] text-on-surface mb-2 group-hover:text-primary transition-colors">Troubleshooting</h3>
              <p className="font-body-sm text-body-sm text-on-surface-muted mb-4 flex-1">Common errors, performance tuning, and FAQ.</p>
            </button>
          </section>

          {/*  Support CTA  */}
          <section className="bg-surface-container border border-border rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-headline-md text-[16px] text-on-surface mb-1">Still need help?</h4>
              <p className="font-body-sm text-body-sm text-on-surface-muted">Our engineering support team is available 24/7.</p>
            </div>
            <button onClick={() => setSupportModalOpen(true)} className="bg-transparent border border-border text-on-surface font-body-sm text-body-sm px-6 py-2 rounded hover:bg-surface-hover hover:border-border-bright transition-all whitespace-nowrap flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">support_agent</span> Contact Support
            </button>
          </section>
        </div>
      </div>

      <Modal isOpen={docModalOpen} onClose={() => setDocModalOpen(false)} title="Documentation Viewer" width="max-w-3xl">
        <div className="p-6">
          <div className="bg-surface-container-lowest border border-border rounded p-4 text-on-surface-muted font-mono text-sm h-64 overflow-y-auto">
            <p className="text-primary mb-2"># Getting Started with Precision RPA</p>
            <p className="mb-4">Welcome to the official documentation. Here you will find everything you need to know to deploy your first automation cluster.</p>
            <p className="text-primary mb-2">## Installation</p>
            <p className="mb-4">npm install @precision-rpa/core</p>
            <p className="text-primary mb-2">## Configuration</p>
            <p>1. Initialize the client using your API key.</p>
            <p>2. Configure the webhook endpoints in settings.</p>
            <p>3. Start the main event loop.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container flex justify-end">
          <button onClick={() => setDocModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Close</button>
        </div>
      </Modal>

      <Modal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} title="Contact Enterprise Support">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Subject</label>
            <input type="text" className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Brief summary of the issue"/>
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Description</label>
            <textarea className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24" placeholder="Provide detailed steps to reproduce or explain your query..."></textarea>
          </div>
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-muted mb-1">Priority Level</label>
            <select className="w-full bg-surface border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              <option>P4 - Low</option>
              <option>P3 - Normal</option>
              <option>P2 - High</option>
              <option>P1 - Critical (System Down)</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button onClick={() => setSupportModalOpen(false)} className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors">Cancel</button>
          <button onClick={handleSupportSubmit} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 font-body-sm font-semibold transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">send</span> Submit Ticket
          </button>
        </div>
      </Modal>
    </>
  );
};