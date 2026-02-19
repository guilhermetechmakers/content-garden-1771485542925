import { Link } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export function EmailVerificationPage() {
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setResending(true)
    await new Promise((r) => setTimeout(r, 800))
    setResending(false)
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-title mt-4">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to your email. Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>
            {sent && (
              <p className="text-center text-caption text-primary">
                Verification email sent. Check your inbox.
              </p>
            )}
            <p className="text-center text-caption text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
