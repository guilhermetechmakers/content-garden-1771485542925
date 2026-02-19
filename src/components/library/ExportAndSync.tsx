import { useState } from 'react'
import { Download, Cloud, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type ExportFormat = 'assets' | 'csv' | 'json'

interface ExportAndSyncProps {
  onExport?: (format?: ExportFormat) => void
  onSync?: () => void
  isSyncing?: boolean
  lastSyncAt?: string | null
  className?: string
}

export function ExportAndSync({
  onExport,
  onSync,
  isSyncing,
  lastSyncAt,
  className,
}: ExportAndSyncProps) {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <Card className={cn('border-border bg-card transition-all duration-200 hover:border-border/80', className)}>
      <CardContent className="py-6">
        <h3 className="text-section font-semibold text-foreground mb-2">Export & sync</h3>
        <p className="text-caption text-muted-foreground mb-4">
          Export assets or sync with cloud drives (Google Drive, Dropbox).
        </p>
        <div className="flex flex-wrap gap-2">
          {onExport && (
            <DropdownMenu open={exportOpen} onOpenChange={setExportOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden />
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="border-border bg-card">
                <DropdownMenuItem onClick={() => { onExport('assets'); setExportOpen(false) }}>
                  Export assets (ZIP)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onExport('csv'); setExportOpen(false) }}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onExport('json'); setExportOpen(false) }}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            >
              {isSyncing ? (
                <span className="mr-2 h-4 w-4 animate-pulse">...</span>
              ) : (
                <Cloud className="h-4 w-4 mr-2" aria-hidden />
              )}
              {isSyncing ? 'Syncing…' : 'Sync to cloud'}
            </Button>
          )}
        </div>
        {lastSyncAt && (
          <p className="mt-3 flex items-center gap-1.5 text-caption text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
            Last synced {new Date(lastSyncAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
