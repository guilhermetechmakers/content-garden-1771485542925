import { User, CreditCard, Plug, Shield, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfilePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Profile & Settings</h1>
        <p className="text-caption text-muted-foreground">Account, billing, integrations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input placeholder="Creator" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <Button variant="secondary" size="sm">Save</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle className="text-base">Billing & Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Manage plan and payment.</CardDescription>
            <Button variant="outline" size="sm">Manage subscription</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Plug className="h-5 w-5" />
            <CardTitle className="text-base">Connected Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Google, schedulers, etc.</CardDescription>
            <Button variant="outline" size="sm">Add integration</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">2FA, password, sessions.</CardDescription>
            <Button variant="outline" size="sm">Security settings</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle className="text-base">Workspace & AI defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">Capture defaults, AI tone, preferences.</CardDescription>
          <Button variant="outline" size="sm">Edit defaults</Button>
        </CardContent>
      </Card>
    </div>
  )
}
