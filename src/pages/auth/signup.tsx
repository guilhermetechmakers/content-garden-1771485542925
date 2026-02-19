import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { signupSchema, type SignupFormData } from '@/lib/auth-validation'

export function SignupPage() {
  const navigate = useNavigate()
  const { signUpWithEmail, signInWithOAuth } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupFormData) => {
    const { error } = await signUpWithEmail(data.email, data.password, {
      displayName: data.displayName,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Account created. Check your email to verify.')
    navigate('/email-verification', { state: { email: data.email } })
  }

  const handleOAuth = async (provider: 'google' | 'apple' | 'linkedin_oidc') => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      toast.error(error.message)
      return
    }
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
              Create account
            </CardTitle>
            <CardDescription>
              Start your content ritual with Content Garden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name (optional)</Label>
                <Input
                  id="displayName"
                  placeholder="Creator"
                  {...register('displayName')}
                  autoComplete="name"
                />
              </div>
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
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-caption text-destructive">{errors.password.message}</p>
                )}
                <p className="text-caption text-muted-foreground">
                  Min 8 chars, at least one letter and one number
                </p>
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative flex justify-center text-caption text-muted-foreground bg-card px-2">
                  or
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleOAuth('google')}
              >
                Continue with Google
              </Button>
            </form>
            <p className="mt-4 text-center text-caption text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
