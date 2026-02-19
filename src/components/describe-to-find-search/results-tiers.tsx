import { Leaf, Package, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SearchResultItem } from '@/types'
import { ResultCard } from './result-cards'
import { cn } from '@/lib/utils'

const TIER_CONFIG = {
  exact: {
    label: 'Exact matches',
    sublabel: 'Seeds & Canvases',
    icon: Leaf,
    emptyMessage: 'No exact matches. Try different words or check Garden.',
  },
  snippet: {
    label: 'Contextual snippets',
    sublabel: 'Related content',
    icon: FileText,
    emptyMessage: 'Semantic search will show related snippets here.',
  },
  drop: {
    label: 'Related Drops',
    sublabel: 'Drops that reference your query',
    icon: Package,
    emptyMessage: 'Drops that reference your query will appear here.',
  },
} as const

export interface ResultsTiersProps {
  exact: SearchResultItem[]
  snippets: SearchResultItem[]
  drops: SearchResultItem[]
  isLoading?: boolean
  onOpenInContext?: (item: SearchResultItem, context: 'garden' | 'canvas') => void
  className?: string
}

export function ResultsTiers({
  exact,
  snippets,
  drops,
  isLoading = false,
  onOpenInContext,
  className,
}: ResultsTiersProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {(['exact', 'snippet', 'drop'] as const).map((tier, i) => (
          <Card
            key={tier}
            className="border-border bg-card animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-20 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const sections: { tier: keyof typeof TIER_CONFIG; items: SearchResultItem[] }[] = [
    { tier: 'exact', items: exact },
    { tier: 'snippet', items: snippets },
    { tier: 'drop', items: drops },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {sections.map(({ tier, items }, sectionIndex) => {
        const config = TIER_CONFIG[tier]
        const Icon = config.icon
        return (
          <section
            key={tier}
            className="animate-fade-in-up"
            style={{ animationDelay: `${sectionIndex * 80}ms` }}
            aria-labelledby={`results-${tier}`}
          >
            <Card className="border-border bg-card shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h2
                      id={`results-${tier}`}
                      className="text-section font-semibold text-foreground"
                    >
                      {config.label}
                    </h2>
                    <p className="text-caption text-muted-foreground">
                      {config.sublabel}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {items.length === 0 ? (
                  <p className="text-caption text-muted-foreground py-4">
                    {config.emptyMessage}
                  </p>
                ) : (
                  <ul className="space-y-3" role="list">
                    {items.map((item) => (
                      <li key={item.id}>
                        <ResultCard
                          item={item}
                          onOpenInContext={onOpenInContext}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        )
      })}
    </div>
  )
}
