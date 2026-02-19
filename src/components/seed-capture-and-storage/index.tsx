/**
 * Seed Capture & Storage – main feature component for quick capture and recent seeds.
 * Used by Home and can be embedded elsewhere (e.g. dashboard).
 */

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Link2, Mic, Image, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { seedCaptureAndStorageService, type Seed, type SeedType } from '@/services/seed-capture-and-storageService'

const quickActions: { icon: typeof Link2; label: string; color: string; type: SeedType }[] = [
  { icon: Link2, label: 'Paste link', color: 'text-electric', type: 'link' },
  { icon: Mic, label: 'Voice note', color: 'text-purple', type: 'voice' },
  { icon: Image, label: 'Screenshot', color: 'text-orange', type: 'screenshot' },
  { icon: MessageSquare, label: 'Quick thought', color: 'text-yellow', type: 'note' },
]

function isUrl(text: string): boolean {
  try {
    new URL(text.trim())
    return true
  } catch {
    return false
  }
}

export interface SeedCaptureAndStorageProps {
  /** Show recent seeds list below the capture bar */
  showRecentSeeds?: boolean
  /** Max recent seeds to show */
  recentLimit?: number
  /** Placeholder for the capture input */
  placeholder?: string
  /** Callback when a seed is captured */
  onCaptureSuccess?: () => void
}

export function SeedCaptureAndStorage({
  showRecentSeeds = true,
  recentLimit = 50,
  placeholder = "Paste a link, type a thought, or describe what you're capturing…",
  onCaptureSuccess,
}: SeedCaptureAndStorageProps) {
  const [captureValue, setCaptureValue] = useState('')
  const [pendingFileType, setPendingFileType] = useState<SeedType | null>(null)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [thoughtModalOpen, setThoughtModalOpen] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [thoughtInput, setThoughtInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seeds', { limit: recentLimit }],
    queryFn: () => seedCaptureAndStorageService.list({ limit: recentLimit }),
    enabled: showRecentSeeds,
  })

  const createMutation = useMutation({
    mutationFn: seedCaptureAndStorageService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      toast.success('Seed captured')
      onCaptureSuccess?.()
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to capture seed')
    },
  })

  const handleCapture = () => {
    const trimmed = captureValue.trim()
    if (!trimmed) {
      toast.error('Enter a link or quick thought')
      return
    }
    if (isUrl(trimmed)) {
      createMutation.mutate({
        type: 'link',
        title: trimmed,
        source_url: trimmed,
      })
    } else {
      createMutation.mutate({
        type: 'note',
        title: trimmed.slice(0, 80),
        content: trimmed,
      })
    }
    setCaptureValue('')
  }

  const handleFileUpload = async (file: File, type: SeedType) => {
    const contentType = file.type || 'application/octet-stream'
    const filename = file.name || `upload-${Date.now()}`
    try {
      const { uploadUrl, key } = await seedCaptureAndStorageService.getUploadUrl(
        filename,
        contentType
      )
      await seedCaptureAndStorageService.uploadToSignedUrl(uploadUrl, file, contentType)
      createMutation.mutate({
        type,
        title: file.name || (type === 'voice' ? 'Voice note' : 'Screenshot'),
        attachments: [{ key, contentType, name: file.name }],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleQuickAction = (type: SeedType) => {
    if (type === 'note') {
      setThoughtInput('')
      setThoughtModalOpen(true)
      return
    }
    if (type === 'link') {
      setLinkInput('')
      setLinkModalOpen(true)
      return
    }
    if (type === 'voice' || type === 'screenshot') {
      setPendingFileType(type)
      fileInputRef.current?.click()
    }
  }

  const handleQuickThoughtSubmit = () => {
    const trimmed = thoughtInput.trim()
    if (!trimmed) {
      toast.error('Enter a quick thought')
      return
    }
    createMutation.mutate({
      type: 'note',
      title: trimmed.slice(0, 80),
      content: trimmed,
    })
    setThoughtModalOpen(false)
    setThoughtInput('')
  }

  const handleLinkSubmit = () => {
    const trimmed = linkInput.trim()
    if (!trimmed) {
      toast.error('Enter a link')
      return
    }
    if (!isUrl(trimmed)) {
      toast.error('Please enter a valid URL')
      return
    }
    createMutation.mutate({
      type: 'link',
      title: trimmed,
      source_url: trimmed,
    })
    setLinkModalOpen(false)
    setLinkInput('')
  }

  const seeds = data?.seeds ?? []
  const isCapturing = createMutation.isPending

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder={placeholder}
                value={captureValue}
                onChange={(e) => setCaptureValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                className="pr-24"
                disabled={isCapturing}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                {quickActions.map(({ icon: Icon, label }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={label}
                        onClick={() =>
                          handleQuickAction(
                            quickActions.find((a) => a.label === label)!.type
                          )
                        }
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            <Button
              className="shrink-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-electric"
              onClick={handleCapture}
              disabled={isCapturing || !captureValue.trim()}
            >
              {isCapturing ? 'Capturing…' : 'Capture'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent showClose className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Paste link</DialogTitle>
            <DialogDescription>
              Enter a URL to capture. We'll extract metadata and create a seed.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
            className="border-border bg-input focus:ring-electric"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkSubmit}
              disabled={createMutation.isPending || !linkInput.trim()}
            >
              {createMutation.isPending ? 'Capturing…' : 'Capture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={thoughtModalOpen} onOpenChange={setThoughtModalOpen}>
        <DialogContent showClose className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Quick thought</DialogTitle>
            <DialogDescription>
              Capture an idea or note. It will appear in your Garden for triage.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="What's on your mind?"
            value={thoughtInput}
            onChange={(e) => setThoughtInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickThoughtSubmit()}
            className="border-border bg-input focus:ring-electric"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setThoughtModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickThoughtSubmit}
              disabled={createMutation.isPending || !thoughtInput.trim()}
            >
              {createMutation.isPending ? 'Capturing…' : 'Capture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="image/*,audio/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const type: SeedType =
              pendingFileType ??
              (file.type.startsWith('audio/')
                ? 'voice'
                : file.type.startsWith('video/')
                  ? 'video'
                  : 'screenshot')
            setPendingFileType(null)
            handleFileUpload(file, type)
          }
          e.target.value = ''
        }}
        aria-label="Upload file for voice or screenshot seed"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map(({ icon: Icon, label, color, type }) => (
          <Button
            key={label}
            variant="secondary"
            className={`h-auto flex-col gap-2 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${color}`}
            onClick={() => handleQuickAction(type)}
            type="button"
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {showRecentSeeds && (
        <div>
          <h2 className="text-section font-semibold text-foreground mb-3">Recent seeds</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="min-w-[280px] max-w-[280px] shrink-0">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Skeleton className="h-3 w-full rounded mb-2" />
                      <Skeleton className="h-3 w-2/3 rounded" />
                      <div className="mt-3 flex gap-1">
                        <Skeleton className="h-8 w-14 rounded" />
                        <Skeleton className="h-8 w-12 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : isError ? (
                <Card className="min-w-[280px] border-destructive/30 bg-card">
                  <CardContent className="py-6 text-center">
                    <p className="text-caption text-muted-foreground">
                      Could not load seeds. Check your connection and try again.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ['seeds'] })
                      }
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : seeds.length === 0 ? (
                <Card className="min-w-[280px] border-border bg-card">
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-caption text-muted-foreground">
                      No seeds yet. Paste a link or capture a quick thought above.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                seeds.map((seed: Seed) => (
                  <RecentSeedCard key={seed.id} seed={seed} />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

function RecentSeedCard({ seed }: { seed: Seed }) {
  const snippet =
    seed.content?.slice(0, 80) ||
    seed.extracted_bullets?.[0] ||
    (seed.source_url ? 'Link captured' : '—')
  return (
    <Card className="min-w-[280px] max-w-[280px] shrink-0 transition-all duration-300 hover:shadow-card-hover hover:brightness-105">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium truncate">{seed.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-caption text-muted-foreground line-clamp-2">{snippet}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-caption text-muted-foreground">{seed.type}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/garden">Triage</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/canvases?seed=${seed.id}`}>Open</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
