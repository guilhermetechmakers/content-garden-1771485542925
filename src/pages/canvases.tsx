import { Link } from 'react-router-dom'
import { Plus, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockCanvases = [
  { id: '1', title: 'Q1 content themes', updated_at: '2025-02-18T10:00:00Z', nodeCount: 12 },
  { id: '2', title: 'Launch thread', updated_at: '2025-02-17T14:30:00Z', nodeCount: 8 },
]

export function CanvasesPage() {
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
          <Card className="h-full border-dashed border-border bg-card/50 flex items-center justify-center min-h-[160px] hover:border-electric/50">
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <Layout className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Blank canvas</span>
            </CardContent>
          </Card>
        </Link>
        {mockCanvases.map((canvas) => (
          <Link key={canvas.id} to={`/canvases/${canvas.id}`}>
            <Card hover className="h-full border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate">{canvas.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-caption text-muted-foreground">
                  {canvas.nodeCount} nodes · Updated {new Date(canvas.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
