import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Link2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { loginSchema, type LoginFormData } from '@/lib/auth-validation'
import { useState } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithEmail, signInWithOAuth, signInWithMagicLink } = useAuth()
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [showMagicLinkInput, setShowMagicLinkInput] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signInWithEmail(data.email, data.password)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Signed in successfully')
    navigate(from, { replace: true })
  }

  const handleOAuth = async (provider: 'google' | 'apple' | 'linkedin_oidc') => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      toast.error(error.message)
      return
    }
  }

  const handleMagicLink = async () => {
    if (!magicLinkEmail) return
    const { error } = await signInWithMagicLink(magicLinkEmail)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Check your email for the magic link')
    setShowMagicLinkInput(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-fade-in">
        <Card className="border-border bg-card shadow-card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sign in
            </CardTitle>
            <CardDescription>
              Enter your credentials to access Content Garden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-caption text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-caption text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative flex justify-center text-caption text-muted-foreground bg-card px-2">
                  or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth('google')}
                  className="transition-all duration-200 hover:scale-[1.02]"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMagicLinkInput(!showMagicLinkInput)}
                  className="transition-all duration-200 hover:scale-[1.02]"
                >
                  <Mail className="h-4 w-4" />
                  Magic link
                </Button>
              </div>
              {showMagicLinkInput && (
                <div className="flex gap-2 animate-fade-in">
                  <Input
                    type="email"
                    placeholder="Email for magic link"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleMagicLink}
                    disabled={!magicLinkEmail}
                  >
                    <Link2 className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              )}
            </form>
            <p className="mt-4 text-center text-caption text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
