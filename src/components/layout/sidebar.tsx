import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Leaf,
  Layout,
  Package,
  Plane,
  FileText,
  Library,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Home' },
  { to: '/garden', icon: Leaf, label: 'Garden' },
  { to: '/canvases', icon: Layout, label: 'Canvases' },
  { to: '/drops', icon: Package, label: 'Drops' },
  { to: '/runway', icon: Plane, label: 'Runway' },
  { to: '/snippets', icon: FileText, label: 'Snippets' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/describe-to-find-search', icon: Search, label: 'Describe-to-Find' },
] as const

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed
  const setCollapsed = (v: boolean) => {
    if (onCollapsedChange) onCollapsedChange(v)
    else setInternalCollapsed(v)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-[width] duration-300',
        collapsed ? 'w-[72px]' : 'w-56'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center border-b border-border px-3">
        {!collapsed && (
          <span className="truncate text-section font-bold text-primary">
            Content Garden
          </span>
        )}
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-input hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  )
}
