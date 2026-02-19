import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
}

interface AuthContextValue extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string, options?: { displayName?: string }) => Promise<{ error: Error | null }>
  signInWithOAuth: (provider: 'google' | 'apple' | 'linkedin_oidc') => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  resendVerification: (email: string) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
  })

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setState((s) => ({
      ...s,
      user: session?.user ?? null,
      session,
      isLoading: false,
      isInitialized: true,
    }))
  }, [])

  useEffect(() => {
    refreshSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        isLoading: false,
        isInitialized: true,
      }))
    })

    return () => subscription.unsubscribe()
  }, [refreshSession])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }, [])

  const signUpWithEmail = useCallback(
    async (email: string, password: string, options?: { displayName?: string }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: options?.displayName
          ? { data: { display_name: options.displayName } }
          : undefined,
      })
      return { error: error ?? null }
    },
    []
  )

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'apple' | 'linkedin_oidc') => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      })
      return { error: error ?? null }
    },
    []
  )

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error: error ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
    })
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ?? null }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    return { error: error ?? null }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      signInWithMagicLink,
      signOut,
      resetPassword,
      resendVerification,
      refreshSession,
    }),
    [
      state,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      signInWithMagicLink,
      signOut,
      resetPassword,
      resendVerification,
      refreshSession,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
