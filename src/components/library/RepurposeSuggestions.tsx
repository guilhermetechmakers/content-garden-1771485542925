import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface RepurposeSuggestion {
  id: string
  sourceTitle: string
  idea: string
  format: string
}

interface RepurposeSuggestionsProps {
  suggestions?: RepurposeSuggestion[]
  isLoading?: boolean
  onGetSuggestions?: () => void
  onApply?: (suggestion: RepurposeSuggestion) => void
  className?: string
}

export function RepurposeSuggestions({
  suggestions = [],
  isLoading,
  onGetSuggestions,
  onApply,
  className,
}: RepurposeSuggestionsProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="text-section font-semibold text-foreground">Repurpose suggestions (AI)</h3>
        </div>
        <p className="text-caption text-muted-foreground mb-4">
          Get ideas to turn published content into new formats — carousels, threads, shorts.
        </p>
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-input" />
            ))}
          </div>
        )}
        {!isLoading && suggestions.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGetSuggestions}
            className="mt-2 transition-transform duration-200 hover:scale-[1.02]"
          >
            Get suggestions
          </Button>
        )}
        {!isLoading && suggestions.length > 0 && (
          <ul className="space-y-3" role="list">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border bg-input/30 p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                <p className="text-sm font-medium text-foreground">{s.idea}</p>
                <p className="text-caption text-muted-foreground mt-1">
                  From “{s.sourceTitle}” → {s.format}
                </p>
                {onApply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => onApply(s)}
                  >
                    Use idea
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
