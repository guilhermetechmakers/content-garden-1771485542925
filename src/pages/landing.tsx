import { Link } from 'react-router-dom'
import { Leaf, Zap, Layout, Package, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-electric/5" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-electric/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-purple/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-hero font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in-up">
            Your content,{' '}
            <span className="bg-gradient-to-r from-primary to-electric bg-clip-text text-transparent">
              growing
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Capture seeds, curate your garden, compose on canvases, and ship weekly drops. A creator-first workspace for your ritual flow.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="shadow-glow-electric">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features - Bento-style */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-title font-bold text-foreground mb-2">How it works</h2>
          <p className="text-muted-foreground mb-12">Capture → Curate → Compose → Package → Runway</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'Capture', desc: 'Paste links, voice notes, screenshots, quick thoughts into your drive.' },
              { icon: Leaf, title: 'Garden', desc: 'Soft-clustered seeds with triage: Keep, Merge, Ignore.' },
              { icon: Layout, title: 'Canvas', desc: 'Compose narratives with nodes, AI grounded in your materials.' },
              { icon: Package, title: 'Drops', desc: 'Bundle 3–10 posts from a canvas; edit hooks, value, CTA.' },
              { icon: Plane, title: 'Runway', desc: 'Slot-based timeline for the next 7 posts; drag, schedule, mark posted.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={cn(
                  'rounded-card-lg border border-border bg-card p-6 card-hover animate-fade-in-up'
                )}
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-section font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-caption text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-title font-bold text-foreground">Start your ritual today</h2>
          <p className="mt-2 text-muted-foreground">Join creators who ship consistently.</p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/signup">Create account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="text-caption text-muted-foreground">© Content Garden</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-caption text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="text-caption text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/cookie" className="text-caption text-muted-foreground hover:text-foreground">Cookies</Link>
            <Link to="/help" className="text-caption text-muted-foreground hover:text-foreground">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
