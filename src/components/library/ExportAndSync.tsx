import { Download, Cloud, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ExportAndSyncProps {
  onExport?: () => void
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
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-6">
        <h3 className="text-section font-semibold text-foreground mb-2">Export & sync</h3>
        <p className="text-caption text-muted-foreground mb-4">
          Export assets or sync with cloud drives (Google Drive, Dropbox).
        </p>
        <div className="flex flex-wrap gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Export assets
            </Button>
          )}
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              className="transition-transform duration-200 hover:scale-[1.02]"
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
