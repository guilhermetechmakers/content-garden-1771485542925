import { Link, useLocation } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'

export function EmailVerificationPage() {
  const { resendVerification } = useAuth()
  const location = useLocation()
  const email = (location.state as { email?: string })?.email ?? ''
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    const targetEmail = email || prompt('Enter your email address')
    if (!targetEmail) return
    setResending(true)
    const { error } = await resendVerification(targetEmail)
    setResending(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
    toast.success('Verification email sent. Check your inbox.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-fade-in">
        <Card className="border-border bg-card shadow-card-hover">
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
              className="w-full transition-all duration-200 hover:scale-[1.02]"
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
              <p className="text-center text-caption text-primary animate-fade-in">
                Verification email sent. Check your inbox.
              </p>
            )}
            <p className="text-center text-caption text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline transition-colors">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
