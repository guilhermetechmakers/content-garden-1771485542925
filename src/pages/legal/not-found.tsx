import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-in">
        <Leaf className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-title font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn’t exist or was moved.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
