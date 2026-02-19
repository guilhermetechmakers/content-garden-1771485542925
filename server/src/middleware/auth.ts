import type { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/** Extend Express Request with user info */
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/**
 * Validates Supabase JWT from Authorization header.
 * On success, sets req.userId. When Supabase is not configured, allows anonymous.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!supabaseUrl || !supabaseServiceKey) {
    req.userId = 'anonymous'
    next()
    return
  }

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    res.status(401).json({ message: 'Missing token' })
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)
    if (error || !user) {
      res.status(401).json({ message: 'Invalid or expired token' })
      return
    }
    req.userId = user.id
    next()
  } catch {
    res.status(401).json({ message: 'Authentication failed' })
  }
}
