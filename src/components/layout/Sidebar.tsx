import { NavLink, useNavigate } from 'react-router-dom'
import { MAIN_NAVIGATION, FOOTER_NAVIGATION } from '../../config/navigation'
import { Modal } from '../ui/Modal'
import { useState } from 'react'
import { useAlerts } from '../../contexts/AlertsContext'
import { useSettings } from '../../contexts/SettingsContext'

export const Sidebar = () => {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { activeAlertsCount } = useAlerts();
  const { settings } = useSettings();

  const handleLogout = () => {
    setLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <>
      <aside className="hidden md:flex flex-col bg-surface-container fixed left-0 top-0 h-screen w-[var(--spacing-sidebar-width)] border-r border-border transition-all duration-200 ease-in-out py-4 z-40">
        <div className="px-6 pb-6 border-b border-border mb-4">
          <h1 className="text-nav-logo text-on-surface truncate" title={settings.workspaceName}>{settings.workspaceName}</h1>
          <p className="text-body-sm text-on-surface-muted mt-1">Precision RPA v4.2</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {MAIN_NAVIGATION.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-container/10 border-primary font-bold border-l-[3px]'
                    : 'text-on-surface-muted border-l-4 border-transparent hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-body-sm ${(item.badge || (item.id === 'alerts' && activeAlertsCount > 0)) ? 'flex-1' : ''}`}>
                    {item.label}
                  </span>
                  {item.badge && settings.inAppNotifs && (
                    <span className="bg-error/20 text-error font-data-sm text-xs px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.id === 'alerts' && activeAlertsCount > 0 && settings.inAppNotifs && (
                    <span className="bg-error/20 text-error font-data-sm text-xs px-1.5 py-0.5 rounded">
                      {activeAlertsCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mt-auto border-t border-border pt-4 space-y-1">
          <div className="px-3 py-2 mb-2 bg-surface-container-high/50 rounded border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-label-caps text-on-surface-muted uppercase">
                System Health
              </span>
              <span className="flex items-center gap-1 text-[10px] text-success font-bold">
                <span className="w-1 h-1 rounded-full bg-success"></span> Online
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-success w-full"></div>
            </div>
          </div>

          {FOOTER_NAVIGATION.map((item) => {
            // Logout gets special handling
            if (item.id === 'logout') {
              return (
                <button
                  key={item.id}
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-muted hover:bg-error/10 hover:text-error transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {item.icon}
                  </span>
                  <span className="text-body-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-muted hover:bg-surface-container-high hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
                <span className="text-body-sm">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="mt-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-border flex items-center justify-center relative">
              <span className="material-symbols-outlined text-[18px] text-on-surface-muted">person</span>
              {settings.twoFactor && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[2px]">
                  <span className="material-symbols-outlined text-[12px] text-success" title="2FA Protected">verified</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-body-sm text-on-surface leading-tight flex items-center gap-2">
                System Operator
                {settings.twoFactor && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider border border-success/20">Protected</span>}
              </p>
              <p className="text-body-xs text-success leading-tight mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Confirm Logout">
        <div className="p-6">
          <p className="text-body-sm text-on-surface">
            Are you sure you want to sign out? Your current session and any unsaved preferences will be cleared.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-container-lowest flex justify-end gap-3">
          <button
            onClick={() => setLogoutModalOpen(false)}
            className="px-4 py-2 rounded border border-border text-on-surface hover:bg-surface-hover font-body-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-error text-white hover:bg-error/90 font-body-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>
      </Modal>
    </>
  )
}
