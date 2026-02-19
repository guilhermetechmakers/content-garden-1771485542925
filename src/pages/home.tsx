import { Link } from 'react-router-dom'
import { Layout, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SeedCaptureAndStorage } from '@/components/seed-capture-and-storage'

export function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Quick capture</h1>
        <p className="text-caption text-muted-foreground mt-1">
          Capture seeds in under 30 seconds
        </p>
      </div>

      <SeedCaptureAndStorage
        showRecentSeeds={true}
        recentLimit={50}
        placeholder="Paste a link, type a thought, or describe what you're capturing…"
      />

      {/* CTAs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/canvases">
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Continue Canvas</h3>
                <p className="text-caption text-muted-foreground">
                  Pick up where you left off
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/drops">
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prepare Drop</h3>
                <p className="text-caption text-muted-foreground">
                  Bundle posts for the week
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-border bg-card border-electric/20">
        <CardContent className="py-4">
          <p className="text-caption text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Triage at least one cluster in
            Garden today to keep your feed organized.
          </p>
          <Button variant="link" className="p-0 h-auto text-primary mt-1" asChild>
            <Link to="/garden">Go to Garden</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
