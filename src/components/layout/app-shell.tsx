import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { cn } from '@/lib/utils'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div
        className={cn(
          'transition-[margin-left] duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-56'
        )}
      >
        <TopNav sidebarCollapsed={sidebarCollapsed} />
        <main className="min-h-[calc(100vh-3.5rem)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
