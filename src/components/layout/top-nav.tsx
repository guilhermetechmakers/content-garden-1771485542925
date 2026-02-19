import { Link } from 'react-router-dom'
import { User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopNavProps {
  sidebarCollapsed?: boolean
  title?: string
}

export function TopNav({ sidebarCollapsed, title }: TopNavProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80'
      )}
    >
      <div
        className={cn(
          'transition-[margin] duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-56'
        )}
      />
      <div className="flex flex-1 items-center gap-4">
        {title && (
          <h1 className="text-section font-semibold text-foreground">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link to="/profile" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
