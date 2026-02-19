import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-title">Privacy Policy</CardTitle>
            <p className="text-caption text-muted-foreground">Last updated: February 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert prose-sm max-w-none">
            <p className="text-muted-foreground">
              Content Garden collects and processes data necessary to provide the service: account info, content you create (Seeds, Canvases, Drops), and usage data. We use encryption at rest and in transit. We do not sell your personal data. You can export or delete your data from Profile settings. For full details, contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
