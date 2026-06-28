import { TopHeader } from '../components/layout/TopHeader';
import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { useStreamContext } from '../contexts/StreamContext';
import { Modal } from '../components/ui/Modal';

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'streaming' | 'security';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'tune' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'streaming', label: 'Streaming', icon: 'speed' },
  { id: 'security', label: 'Security', icon: 'shield' },
];

export const Settings = () => {
  const { addToast } = useToast();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { pause, play } = useStreamContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('streaming');
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Local form state
  const [form, setForm] = useState(settings);

  // Sync form if settings change externally
  useEffect(() => {
    setForm(settings);
  }, [settings]);


  const handleReset = () => { 
    resetSettings();
    addToast('Settings reset to defaults.', 'info'); 
  };

  const handleToggle = (key: keyof typeof settings, label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    
    if (key === 'webSockets') {
      if (val) play();
      else pause();
    }
    
    updateSettings({ [key]: val });
    setForm(f => ({ ...f, [key]: val }));
    addToast(`${label} ${val ? 'enabled' : 'disabled'}.`, 'success');
  };

  const handleEnable2FA = () => {
    updateSettings({ twoFactor: true });
    setForm(f => ({ ...f, twoFactor: true }));
    setIs2FAModalOpen(false);
    addToast('Two-Factor Authentication enabled successfully.', 'success');
  };
  
  const handleDisable2FA = () => {
    updateSettings({ twoFactor: false });
    setForm(f => ({ ...f, twoFactor: false }));
    addToast('Two-Factor Authentication disabled.', 'info');
  };

  return (
    <>
      <TopHeader title="Settings" />
      <div className="flex-1 overflow-y-auto p-[var(--spacing-container-padding)]">
        <header className="mb-[var(--spacing-section-margin)] flex justify-between items-end border-b border-border pb-4">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-muted mt-1">Manage your enterprise workspace configuration and security preferences.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-4 py-2 bg-transparent border border-border text-on-surface rounded hover:bg-surface-hover transition-colors font-body-sm text-body-sm">Reset</button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <nav className="w-full lg:w-48 flex-shrink-0 space-y-1 border-r border-border pr-4 hidden md:block">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`block w-full text-left px-3 py-2 rounded transition-colors font-body-sm text-body-sm flex items-center justify-between ${
                  activeTab === tab.id
                    ? 'text-primary font-bold bg-surface-hover border-l-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-hover'
                }`}
              >
                {tab.label}
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 max-w-4xl space-y-[var(--spacing-section-margin)]">

            {/* General */}
            {activeTab === 'general' && (
              <section className="bg-surface border border-border rounded-lg p-6">
                <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tune</span> General
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant">Workspace Name</label>
                    <input value={form.workspaceName} onChange={e => setForm(f => ({ ...f, workspaceName: e.target.value }))} className="w-full bg-surface-container border border-border text-on-surface rounded px-3 py-2 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant">Timezone</label>
                    <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} className="w-full bg-surface-container border border-border text-on-surface rounded px-3 py-2 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none">
                      <option>UTC-5 (EST)</option>
                      <option>UTC-8 (PST)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+5:30 (IST)</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <section className="bg-surface border border-border rounded-lg p-6">
                <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">palette</span> Appearance
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-label-caps text-on-surface-muted uppercase mb-2 block">UI Density</label>
                    <div className="flex gap-2">
                      {['compact', 'comfortable', 'spacious'].map(d => (
                        <button 
                          key={d}
                          onClick={() => {
                            setForm({ ...form, density: d });
                            updateSettings({ density: d });
                            addToast(`UI Density set to ${d}.`, 'info');
                          }}
                          className={`px-4 py-2 rounded font-body-sm text-body-sm transition-colors capitalize ${
                            form.density === d ? 'bg-primary/10 border border-primary text-primary' : 'bg-surface-container border border-border text-on-surface-muted hover:bg-surface-hover hover:text-on-surface'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-label-caps text-on-surface-muted uppercase mb-2 block mt-6">Theme</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setForm({ ...form, theme: 'dark' });
                          updateSettings({ theme: 'dark' });
                          addToast('Dark theme enabled.', 'info');
                        }}
                        className={`px-4 py-2 rounded font-body-sm text-body-sm transition-colors ${
                          form.theme === 'dark' ? 'bg-primary/10 border border-primary text-primary' : 'bg-surface-container border border-border text-on-surface-muted hover:bg-surface-hover hover:text-on-surface'
                        }`}
                      >
                        Dark
                      </button>
                      <button 
                        onClick={() => {
                          setForm({ ...form, theme: 'light' });
                          updateSettings({ theme: 'light' });
                          addToast('Light theme enabled.', 'info');
                        }}
                        className={`px-4 py-2 rounded font-body-sm text-body-sm transition-colors ${
                          form.theme === 'light' ? 'bg-primary/10 border border-primary text-primary' : 'bg-surface-container border border-border text-on-surface-muted hover:bg-surface-hover hover:text-on-surface'
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <section className="bg-surface border border-border rounded-lg p-6">
                <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications</span> Notifications
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifs' as const, label: 'Email Notifications', desc: 'Receive alerts via email for critical events.' },
                    { key: 'inAppNotifs' as const, label: 'In-App Notifications', desc: 'Show notification bell in the header bar.' },
                    { key: 'criticalOnly' as const, label: 'Critical Alerts Only', desc: 'Suppress warnings and info-level notifications.' },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-border rounded">
                      <div>
                        <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">{opt.label}</h3>
                        <p className="font-body-xs text-body-xs text-on-surface-muted">{opt.desc}</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          checked={form[opt.key as keyof typeof settings] as boolean}
                          onChange={handleToggle(opt.key as keyof typeof settings, opt.label)}
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-surface-container appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out"
                          id={opt.key}
                          type="checkbox"
                        />
                        <label className="toggle-label block overflow-hidden h-5 rounded-full bg-border cursor-pointer transition-colors duration-200" htmlFor={opt.key}></label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Streaming (original content) */}
            {activeTab === 'streaming' && (
              <section className="bg-surface border border-border rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">speed</span> Telemetry & Streaming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant">Update Frequency (ms)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-muted">timer</span>
                      </span>
                      <input onChange={e => setForm(f => ({ ...f, updateFrequency: e.target.value }))} className="w-full bg-surface-container border border-border text-on-surface font-data-sm text-data-sm rounded pl-10 pr-3 py-2 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none" placeholder="e.g. 100" type="number" value={form.updateFrequency} />
                    </div>
                    <p className="text-on-surface-muted font-body-xs text-body-xs mt-1">Lower values increase CPU overhead. Min: 50ms.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant">Data Batch Size</label>
                    <select value={form.batchSize} onChange={e => setForm(f => ({ ...f, batchSize: e.target.value }))} className="w-full bg-surface-container border border-border text-on-surface font-data-sm text-data-sm rounded px-3 py-2 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none appearance-none">
                      <option value="10k">10,000 records</option>
                      <option value="50k">50,000 records</option>
                      <option value="100k">100,000 records</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {[
                    { key: 'webSockets' as const, label: 'Enable WebSockets Streaming', desc: 'Use persistent connections for real-time dashboard updates.' },
                    { key: 'compression' as const, label: 'Compression (GZIP)', desc: 'Compress telemetry payloads to reduce bandwidth.' },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-border rounded">
                      <div>
                        <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">{opt.label}</h3>
                        <p className="font-body-xs text-body-xs text-on-surface-muted">{opt.desc}</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          checked={form[opt.key as keyof typeof settings] as boolean} 
                          onChange={handleToggle(opt.key as keyof typeof settings, opt.label)} 
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-surface-container appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out" 
                          id={opt.key} 
                          type="checkbox" 
                        />
                        <label className="toggle-label block overflow-hidden h-5 rounded-full bg-border cursor-pointer transition-colors duration-200" htmlFor={opt.key}></label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <section className="bg-surface border border-border rounded-lg p-6">
                <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span> Security
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-label-caps text-label-caps text-on-surface-variant">Session Timeout (minutes)</label>
                    <select value={form.sessionTimeout} onChange={e => setForm(f => ({ ...f, sessionTimeout: e.target.value }))} className="w-full bg-surface-container border border-border text-on-surface rounded px-3 py-2 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-border rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">Two-Factor Authentication</h3>
                        {form.twoFactor && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Enabled</span>}
                      </div>
                      <p className="font-body-xs text-body-xs text-on-surface-muted mt-1">Require TOTP code for login. Recommended for admin accounts.</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        checked={form.twoFactor} 
                        onChange={(e) => e.target.checked ? setIs2FAModalOpen(true) : handleDisable2FA()} 
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-surface-container appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out" 
                        id="twoFactor" 
                        type="checkbox" 
                      />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-border cursor-pointer transition-colors duration-200" htmlFor="twoFactor"></label>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Keyboard Shortcuts (always visible) */}
            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="font-headline-md text-[18px] text-on-surface mb-4 border-b border-border pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">keyboard</span> Global Keyboard Shortcuts
              </h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant w-1/3">Action</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant w-1/3">Context</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Shortcut</th>
                  </tr>
                </thead>
                <tbody className="font-data-sm text-data-sm">
                  {[
                    ['Pause Stream', 'Dashboard', 'Ctrl + P'],
                    ['Global Search', 'Global', 'Ctrl + K'],
                    ['Close Drawer', 'Any', 'Esc'],
                    ['Submit Form', 'Modals', 'Enter'],
                  ].map(([action, context, shortcut]) => (
                    <tr key={String(action)} className="border-b border-border hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 text-on-surface">{action}</td>
                      <td className="py-3 px-4 text-on-surface-muted">{context}</td>
                      <td className="py-3 px-4 text-right">
                        {String(shortcut).split(' + ').map((k, i) => (
                          <span key={i}>
                            {i > 0 && ' + '}
                            <kbd className="bg-surface-bright border border-border rounded px-2 py-1 font-data-sm text-on-surface">{k}</kbd>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>

      <Modal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} title="Enable Two-Factor Authentication">
        <div className="p-6">
          <p className="text-body-sm text-on-surface mb-4">Scan the QR code below with your authenticator app to enable 2FA for this account.</p>
          <div className="w-48 h-48 mx-auto bg-surface border border-border flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[64px] text-on-surface-muted">qr_code_2</span>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter 6-digit code" className="flex-1 bg-surface-container border border-border rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary" />
            <button onClick={handleEnable2FA} className="bg-primary text-white px-4 py-2 rounded text-body-sm hover:bg-primary/90 transition-colors">Verify</button>
          </div>
        </div>
      </Modal>
    </>
  );
};
