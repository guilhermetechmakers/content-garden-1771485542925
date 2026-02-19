import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CookiePage() {
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
            <CardTitle className="text-title">Cookie Policy</CardTitle>
            <p className="text-caption text-muted-foreground">Last updated: February 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert prose-sm max-w-none space-y-4">
            <p className="text-muted-foreground">
              Content Garden uses cookies and similar technologies to provide the service, keep you signed in, and improve your experience. We use essential cookies for authentication and session management, and optional analytics cookies to understand product usage. You can manage cookie preferences in your browser or Profile settings.
            </p>
            <p className="text-muted-foreground">
              For full details on data we collect and how we use it, see our{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
