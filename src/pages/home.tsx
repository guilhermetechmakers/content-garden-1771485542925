import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Link2, Mic, Image, MessageSquare, Layout, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  listSeeds,
  createSeed,
  getUploadSignedUrl,
  uploadFileToSignedUrl,
  type Seed,
  type SeedType,
} from '@/api/seeds'

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

export function HomePage() {
  const [captureValue, setCaptureValue] = useState('')
  const [pendingFileType, setPendingFileType] = useState<SeedType | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seeds'],
    queryFn: () => listSeeds(50),
  })

  const createMutation = useMutation({
    mutationFn: createSeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      toast.success('Seed captured')
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
      const { uploadUrl, key } = await getUploadSignedUrl(filename, contentType)
      await uploadFileToSignedUrl(uploadUrl, file, contentType)
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
      const thought = prompt('Quick thought:')
      if (thought?.trim()) {
        createMutation.mutate({
          type: 'note',
          title: thought.slice(0, 80),
          content: thought.trim(),
        })
      }
      return
    }
    if (type === 'link') {
      const url = prompt('Paste link:')
      if (url?.trim() && isUrl(url.trim())) {
        createMutation.mutate({
          type: 'link',
          title: url.trim(),
          source_url: url.trim(),
        })
      } else if (url?.trim()) {
        toast.error('Please enter a valid URL')
      }
      return
    }
    if (type === 'voice' || type === 'screenshot') {
      setPendingFileType(type)
      fileInputRef.current?.click()
    }
  }

  const seeds = data?.seeds ?? []
  const isCapturing = createMutation.isPending

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Quick capture</h1>
        <p className="text-caption text-muted-foreground mt-1">
          Capture seeds in under 30 seconds
        </p>
      </div>

      {/* Hidden file input for voice/screenshot */}
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

      {/* Quick Capture Bar */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Paste a link, type a thought, or describe what you're capturing…"
                value={captureValue}
                onChange={(e) => setCaptureValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                className="pr-24"
                disabled={isCapturing}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                {quickActions.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={label}
                    onClick={() => handleQuickAction(quickActions.find((a) => a.label === label)!.type)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
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

      {/* Quick Buttons */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map(({ icon: Icon, label, color, type }) => (
          <Button
            key={label}
            variant="secondary"
            className={cn(
              'h-auto flex-col gap-2 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
              color
            )}
            onClick={() => handleQuickAction(type)}
            type="button"
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Recent Seeds */}
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
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['seeds'] })}
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
                <SeedCard key={seed.id} seed={seed} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* CTAs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/canvases">
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Continue Canvas</h3>
                <p className="text-caption text-muted-foreground">
                  Pick up where you left off
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/drops">
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prepare Drop</h3>
                <p className="text-caption text-muted-foreground">
                  Bundle posts for the week
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-border bg-card border-electric/20">
        <CardContent className="py-4">
          <p className="text-caption text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Triage at least one cluster in
            Garden today to keep your feed organized.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SeedCard({ seed }: { seed: Seed }) {
  const snippet =
    seed.content?.slice(0, 80) ||
    seed.extracted_bullets?.[0] ||
    (seed.source_url ? 'Link captured' : '—')
  return (
    <Card className="min-w-[280px] max-w-[280px] shrink-0 transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium truncate">{seed.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-caption text-muted-foreground line-clamp-2">{snippet}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-caption text-muted-foreground">{seed.type}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              Keep
            </Button>
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
