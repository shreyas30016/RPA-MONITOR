import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden antialiased bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col md:ml-[var(--spacing-sidebar-width)] min-w-0 bg-background h-screen">
        <Outlet />
      </main>
    </div>
  )
}
