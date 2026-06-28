import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Automations } from './pages/Automations'
import { QueueMonitor } from './pages/QueueMonitor'
import { Analytics } from './pages/Analytics'
import { AlertsCenter } from './pages/AlertsCenter'
import { AuditLogs } from './pages/AuditLogs'
import { Settings } from './pages/Settings'
import { HelpCenter } from './pages/HelpCenter'
import { LoginScreen } from './pages/LoginScreen'
import { StreamProvider } from './contexts/StreamContext'
import { ToastProvider } from './contexts/ToastContext'
import { AlertsProvider } from './contexts/AlertsContext'
import { SettingsProvider, useSettings } from './contexts/SettingsContext'
import { useEffect } from 'react'

const ThemeManager = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();
  
  useEffect(() => {
    document.body.className = `bg-background text-on-surface density-${settings.density} theme-${settings.theme}`;
  }, [settings.density, settings.theme]);

  return <>{children}</>;
};

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AlertsProvider>
          <StreamProvider>
            <ThemeManager>
              <Router>
        <Routes>
          {/* Login screen — no layout wrapper */}
          <Route path="/login" element={<LoginScreen />} />

          {/* App routes — inside layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/queue" element={<QueueMonitor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertsCenter />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpCenter />} />
          </Route>
        </Routes>
              </Router>
            </ThemeManager>
          </StreamProvider>
        </AlertsProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}
