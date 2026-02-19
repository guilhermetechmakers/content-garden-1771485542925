import { Calendar, CheckCircle, Circle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const next7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return { id: String(i), date: d.toISOString().slice(0, 10), time: '09:00', status: i === 0 ? 'filled' as const : i === 1 ? 'posted' as const : 'empty' as const }
})

export function RunwayPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Runway</h1>
        <p className="text-caption text-muted-foreground">Next 7 posts — drag from Drops or Library</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button variant="outline" size="sm">Undo</Button>
        <Button variant="outline" size="sm">History</Button>
        <Button variant="secondary" size="sm">Quick post</Button>
      </div>

      {/* Slots lane */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {next7Days.map((slot) => (
          <Card
            key={slot.id}
            className={cn(
              'border-border bg-card min-h-[180px]',
              slot.status === 'empty' && 'border-dashed'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="text-caption text-muted-foreground">{slot.time}</span>
            </CardHeader>
            <CardContent className="pt-0">
              {slot.status === 'empty' && (
                <div className="rounded-lg border-2 border-dashed border-border p-4 text-center text-caption text-muted-foreground">
                  <p>Drop post here</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Suggest
                  </Button>
                </div>
              )}
              {slot.status === 'filled' && (
                <div className="rounded-lg border border-border bg-input/30 p-3">
                  <p className="text-sm line-clamp-2">Post preview copy… Hook and value here.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="secondary" size="sm">Mark Posted</Button>
                    <div className="flex gap-1">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
              {slot.status === 'posted' && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-sm line-clamp-2">Posted content preview…</p>
                  <div className="mt-2 flex items-center gap-1 text-caption text-primary">
                    <CheckCircle className="h-4 w-4" />
                    Posted
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <h3 className="text-section font-semibold text-foreground mb-2">Empty slot suggest</h3>
          <p className="text-caption text-muted-foreground">AI-suggested posts from your Drops to fill empty slots.</p>
          <Button variant="outline" size="sm" className="mt-3">Load suggestions</Button>
        </CardContent>
      </Card>
    </div>
  )
}
