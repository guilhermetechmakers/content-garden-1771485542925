import { cn } from '@/lib/utils'

export function AuthLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-background',
        className
      )}
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-pulse rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-hidden
        />
        <p className="text-caption text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}
