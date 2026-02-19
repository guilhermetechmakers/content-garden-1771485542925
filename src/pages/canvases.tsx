import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listCanvases } from '@/api/canvases'

export function CanvasesPage() {
  const { data: canvases = [], isLoading } = useQuery({
    queryKey: ['canvases'],
    queryFn: async () => {
      try {
        return await listCanvases()
      } catch {
        return []
      }
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Canvases</h1>
          <p className="text-caption text-muted-foreground">Compose narratives with seeds and AI</p>
        </div>
        <Button asChild>
          <Link to="/canvases/new">
            <Plus className="h-4 w-4 mr-2" />
            New canvas
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/canvases/new">
          <Card className="h-full border-dashed border-border bg-card/50 flex items-center justify-center min-h-[160px] hover:border-electric/50 transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <Layout className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Blank canvas</span>
            </CardContent>
          </Card>
        </Link>
        {isLoading &&
          [1, 2].map((i) => (
            <Card key={i} className="h-full border-border bg-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 rounded" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-1/2 rounded" />
              </CardContent>
            </Card>
          ))}
        {!isLoading &&
          canvases.map((canvas) => (
            <Link key={canvas.id} to={`/canvases/${canvas.id}`}>
              <Card className="h-full border-border bg-card transition-all duration-200 hover:shadow-card-hover hover:border-electric/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">{canvas.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-caption text-muted-foreground">
                    {canvas.nodes?.length ?? 0} nodes · Updated{' '}
                    {canvas.updated_at
                      ? new Date(canvas.updated_at).toLocaleDateString()
                      : '—'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  )
}
