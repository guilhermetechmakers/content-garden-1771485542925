import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface GardenEmptyStateProps {
  className?: string
}

export function GardenEmptyState({ className }: GardenEmptyStateProps) {
  return (
    <Card
      className={cn(
        'border-border bg-card overflow-hidden',
        className
      )}
    >
      <CardContent className="py-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 mb-4">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-section font-semibold text-foreground mb-2">No seeds yet</h3>
        <p className="text-caption text-muted-foreground max-w-sm mx-auto mb-4">
          Capture links, voice notes, and quick thoughts from Home. They will appear here for
          triage and merging.
        </p>
        <p className="text-caption text-muted-foreground max-w-sm mx-auto mb-6">
          Use Triage mode to Keep, Merge, or Ignore seeds. Open seeds in Canvas to compose
          narratives.
        </p>
        <Link to="/">
          <Button className="transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-electric">
            Go to Home
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
