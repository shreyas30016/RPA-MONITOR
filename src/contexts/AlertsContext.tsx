import { createContext, useContext, useState, type ReactNode } from 'react';

export type AlertStatus = 'CRIT' | 'WARN' | 'RSLV' | 'MUTED';

export interface Alert {
  id: string;
  status: AlertStatus;
  title: string;
  description: string;
  target: string;
  time: string;
  acknowledged: boolean;
}

const INITIAL_ALERTS: Alert[] = [
  { id: 'ALT-9942', status: 'CRIT', title: 'High Memory Threshold Exceeded', description: 'Process Fin-recon consuming > 8GB RAM', target: 'Worker_Node_04', time: '10:42:15.004', acknowledged: false },
  { id: 'ALT-9941', status: 'CRIT', title: 'API Connection Timeout', description: 'Upstream CRM endpoint non-responsive for 30s', target: 'SalesSync_Prod_01', time: '10:38:02.112', acknowledged: false },
  { id: 'ALT-9940', status: 'WARN', title: 'Elevated Retry Rate', description: 'Selector parsing failed 3 times before success', target: 'Invoice_Proc_09', time: '10:35:44.981', acknowledged: false },
  { id: 'ALT-9939', status: 'WARN', title: 'Queue Depth Approaching Limit', description: 'Queue Nightly_Batch depth at 85% capacity', target: 'QueueManager_Sys', time: '10:15:00.000', acknowledged: false },
  { id: 'ALT-9938', status: 'RSLV', title: 'DB Connection Lost', description: 'Auto-resolved: Connection re-established after 12s', target: 'FinBot_Alpha_02', time: '09:42:11.332', acknowledged: true },
];

interface AlertsContextType {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  activeAlertsCount: number;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  // Active alerts are those that are NOT resolved and NOT muted
  const activeAlertsCount = alerts.filter(a => a.status !== 'RSLV' && a.status !== 'MUTED' && !a.acknowledged).length;

  return (
    <AlertsContext.Provider value={{ alerts, setAlerts, activeAlertsCount }}>
      {children}
    </AlertsContext.Provider>
  );
};
