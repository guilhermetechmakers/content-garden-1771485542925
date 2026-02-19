import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function GardenSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i}>
          <Skeleton className="h-6 w-40 mb-3 rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((j) => (
              <Card key={j} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-6 w-24 rounded mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
