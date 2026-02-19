import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPTS = [
  'Seeds about content batching',
  'Canvas where I mentioned launch',
  'Drops from last week',
  'Voice note on engagement tips',
  'Screenshot of analytics',
]

export interface NLSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  recentSearches?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function NLSearchInput({
  value,
  onChange,
  onSearch,
  recentSearches = [],
  placeholder = "Describe what you're looking for…",
  disabled = false,
  className,
}: NLSearchInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (q) onSearch(q)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          role="searchbox"
          aria-label="Natural language search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          disabled={disabled}
          className="pl-12 h-12 text-base rounded-xl border-border bg-card/80 focus:border-electric focus:ring-2 focus:ring-electric/20 transition-all duration-200"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-lg bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-glow-electric transition-all duration-200"
          disabled={disabled || !value.trim()}
        >
          Search
        </Button>
      </form>

      <div className="space-y-3">
        <p className="text-caption font-medium text-muted-foreground">
          Example prompts
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(prompt)
                onSearch(prompt)
              }}
              className="rounded-lg border-border hover:border-electric/50 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02]"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption font-medium text-muted-foreground">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.slice(0, 5).map((q) => (
              <Button
                key={q}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(q)
                  onSearch(q)
                }}
                className="text-caption text-muted-foreground hover:text-foreground"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
