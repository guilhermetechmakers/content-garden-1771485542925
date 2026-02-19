import { Image, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mockPublished = [
  { id: '1', title: 'LinkedIn post', platform: 'LinkedIn', date: '2025-02-15', thumb: 'image' },
  { id: '2', title: 'X thread', platform: 'X', date: '2025-02-14', thumb: 'text' },
]

export function LibraryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Library</h1>
        <p className="text-caption text-muted-foreground">Published content and assets for repurpose</p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm">Published</Button>
        <Button variant="ghost" size="sm">Assets</Button>
      </div>

      <div>
        <h2 className="text-section font-semibold text-foreground mb-3">Published items</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockPublished.map((item) => (
            <Card key={item.id} hover className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-input">
                    {item.thumb === 'image' ? (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-caption text-muted-foreground">{item.platform} · {item.date}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="sm">Repurpose</Button>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="py-6">
          <h3 className="text-section font-semibold text-foreground mb-2">Repurpose suggestions (AI)</h3>
          <p className="text-caption text-muted-foreground">Get ideas to turn published content into new formats.</p>
          <Button variant="outline" size="sm" className="mt-3">Get suggestions</Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
        <Button variant="outline" size="sm">Sync</Button>
      </div>
    </div>
  )
}
