import { Link } from 'react-router-dom'
import { BookOpen, MessageCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const faqs = [
  { q: 'How do I capture my first Seed?', a: 'Use the Quick Capture bar on Home: paste a link, type a thought, or use the buttons for voice note, screenshot, or quick thought. Seeds are stored in your Garden.' },
  { q: 'What is the Garden triage flow?', a: 'In Garden, Seeds are grouped into soft clusters by topic. Use Triage Mode to Keep, Merge, or Ignore seeds. Merging combines multiple seeds with a single title and provenance list.' },
  { q: 'How do I create a Drop from a Canvas?', a: 'In the Canvas workspace, use the Publish/Export button to create a Drop. You can then edit post cards (Hook, Value, Example, CTA) and attach assets.' },
  { q: 'What is the Runway?', a: 'The Runway is a slot-based timeline for the next 7 posts. Drag posts from Drops or Library into slots, complete the checklist, and mark as Posted when you publish.' },
]

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>
        <div>
          <h1 className="text-title font-bold text-foreground">About & Help</h1>
          <p className="text-caption text-muted-foreground mt-1">
            Guides, FAQs, and support
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle className="text-base">Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              New to Content Garden? Start with Capture → Curate → Compose → Package → Runway.
            </CardDescription>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <CardTitle className="text-base">FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {faqs.map(({ q, a }, i) => (
                <li key={i}>
                  <p className="font-medium text-foreground">{q}</p>
                  <p className="mt-1 text-caption text-muted-foreground">{a}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-base">Contact support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Can&apos;t find what you need? Send us a message.
            </CardDescription>
            <form className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="help-email">Email</Label>
                <Input id="help-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="help-message">Message</Label>
                <textarea
                  id="help-message"
                  placeholder="Describe your question or issue…"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-input px-3 py-2 text-body ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button type="submit" size="sm">Send</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
