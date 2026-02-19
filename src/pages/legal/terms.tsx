import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TermsPage() {
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
            <CardTitle className="text-title">Terms of Service</CardTitle>
            <p className="text-caption text-muted-foreground">Last updated: February 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert prose-sm max-w-none">
            <p className="text-muted-foreground">
              By using Content Garden you agree to use the service in compliance with applicable laws and our acceptable use policy. You retain ownership of your content; we require a license to operate and improve the service. We may suspend accounts that violate these terms. For full terms, contact legal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
