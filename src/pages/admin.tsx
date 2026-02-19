import { Users, Flag, CreditCard, BarChart3, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const adminSections = [
  { icon: Users, title: 'User Management', desc: 'Roles, invites, team' },
  { icon: Flag, title: 'Moderation Queue', desc: 'Flagged Seeds & Drops' },
  { icon: CreditCard, title: 'Billing & Usage', desc: 'Plans, usage, invoices' },
  { icon: BarChart3, title: 'Product Analytics', desc: 'DAU, Drops/week, retention' },
  { icon: FileText, title: 'System Logs', desc: 'Audit and errors' },
]

export function AdminPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-caption text-muted-foreground">Users, moderation, billing, analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map(({ icon: Icon, title, desc }) => (
          <Card key={title} hover className="border-border bg-card">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-caption">{desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm">Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
