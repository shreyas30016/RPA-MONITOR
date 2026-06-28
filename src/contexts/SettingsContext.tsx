import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppSettings {
  workspaceName: string;
  theme: string;
  timezone: string;
  density: string;
  emailNotifs: boolean;
  inAppNotifs: boolean;
  criticalOnly: boolean;
  updateFrequency: string;
  batchSize: string;
  webSockets: boolean;
  compression: boolean;
  sessionTimeout: string;
  twoFactor: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  workspaceName: 'Obsidian Enterprise',
  theme: 'dark',
  timezone: 'UTC-5 (EST)',
  density: 'comfortable',
  emailNotifs: true,
  inAppNotifs: true,
  criticalOnly: false,
  updateFrequency: '200',
  batchSize: '50k',
  webSockets: true,
  compression: true,
  sessionTimeout: '30',
  twoFactor: false,
};

const SETTINGS_STORAGE_KEY = 'obsidian_enterprise_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save settings to localStorage', e);
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove settings from localStorage', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
