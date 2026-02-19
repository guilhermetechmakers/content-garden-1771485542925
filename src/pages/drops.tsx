/**
 * Drops page: Drop list + editor with Hook → Value → Example → CTA.
 * Platform variants, assets, auto-suggest mix, AI re-run, export to Runway.
 */

import { useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, FileText, Sparkles, Wand2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  listDrops,
  getDrop,
  updateDrop,
} from '@/api/drops'
import {
  PostVariantsPanel,
  AssetsPanel,
  ExportButtons,
  DraggablePostCard,
} from '@/components/drops'
import { cn } from '@/lib/utils'
import type { DropPost } from '@/types'

function validatePost(post: DropPost): Partial<Record<keyof DropPost, string>> {
  const errors: Partial<Record<keyof DropPost, string>> = {}
  if (!post.hook?.trim()) errors.hook = 'Hook is required'
  if (!post.value?.trim()) errors.value = 'Value is required'
  return errors
}

export function DropsPage() {
  const { dropId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedPostIndex, setSelectedPostIndex] = useState(0)

  const { data: drops = [], isLoading: dropsLoading } = useQuery({
    queryKey: ['drops'],
    queryFn: listDrops,
  })

  const { data: drop, isLoading: dropLoading } = useQuery({
    queryKey: ['drop', dropId],
    queryFn: () => getDrop(dropId!),
    enabled: !!dropId,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateDrop>[1] }) =>
      updateDrop(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['drop', id] })
      queryClient.invalidateQueries({ queryKey: ['drops'] })
    },
    onError: () => toast.error('Failed to save'),
  })

  const handlePostUpdate = useCallback(
    (index: number) => (updates: Partial<DropPost>) => {
      if (!drop || !dropId) return
      const posts = [...drop.posts]
      const existing = posts[index]
      if (!existing) return
      posts[index] = { ...existing, ...updates }
      updateMutation.mutate({ id: dropId, payload: { posts } })
    },
    [drop, dropId, updateMutation]
  )

  const handlePostDelete = useCallback(
    (index: number) => () => {
      if (!drop || !dropId) return
      const posts = drop.posts.filter((_, i) => i !== index)
      if (posts.length === 0) {
        toast.error('Drop must have at least one post')
        return
      }
      updateMutation.mutate({ id: dropId, payload: { posts } })
    },
    [drop, dropId, updateMutation]
  )

  const handlePostVariantChange = useCallback(
    (postIndex: number) => (variant: string, content: string) => {
      if (!drop || !dropId) return
      const posts = [...drop.posts]
      const p = posts[postIndex]
      if (!p) return
      posts[postIndex] = {
        ...p,
        variants: { ...(p.variants ?? {}), [variant]: content },
      }
      updateMutation.mutate({ id: dropId, payload: { posts } })
    },
    [drop, dropId, updateMutation]
  )

  const handlePostAssetsChange = useCallback(
    (postIndex: number) => (urls: string[]) => {
      if (!drop || !dropId) return
      const posts = [...drop.posts]
      const p = posts[postIndex]
      if (!p) return
      posts[postIndex] = { ...p, asset_urls: urls }
      updateMutation.mutate({ id: dropId, payload: { posts } })
    },
    [drop, dropId, updateMutation]
  )

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value.trim()
      if (!dropId || !value || value === drop?.title) return
      updateMutation.mutate({ id: dropId, payload: { title: value } })
    },
    [dropId, drop?.title, updateMutation]
  )

  const handleAutoSuggest = useCallback(() => {
    toast.info('Auto-suggest mix will run when AI is configured.')
  }, [])

  const handleAiRerun = useCallback(() => {
    toast.info('AI re-run will run when AI tools are configured.')
  }, [])

  const selectedPost = drop?.posts[selectedPostIndex]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Drops</h1>
          <p className="text-caption text-muted-foreground">3–10 post bundles from a canvas</p>
        </div>
        <Button asChild>
          <Link to="/canvases">
            <Plus className="h-4 w-4 mr-2" />
            New Drop from Canvas
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        {/* Drop list */}
        <div className="space-y-2">
          <h2 className="text-section font-semibold text-foreground">Your drops</h2>
          {dropsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="py-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-input" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-input" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!dropsLoading && drops.length === 0 && (
            <Card className="border-border bg-card border-dashed">
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-caption text-muted-foreground">No drops yet</p>
                <Button asChild className="mt-4">
                  <Link to="/canvases">Create from Canvas</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {!dropsLoading &&
            drops.map((d) => (
              <Card
                key={d.id}
                hover
                className={cn(
                  'cursor-pointer border-border bg-card transition-all duration-200',
                  dropId === d.id && 'ring-1 ring-primary shadow-glow-electric'
                )}
                onClick={() => navigate(`/drops/${d.id}`)}
              >
                <CardContent className="py-4">
                  <p className="font-medium text-sm text-foreground">{d.title}</p>
                  <p className="text-caption text-muted-foreground">
                    {d.canvas_source ?? d.canvas_id ?? 'No canvas'} · {d.posts?.length ?? 0} posts
                  </p>
                  <span
                    className={cn(
                      'text-caption',
                      d.status === 'ready' ? 'text-primary' : d.status === 'exported' ? 'text-accent' : 'text-muted-foreground'
                    )}
                  >
                    {d.status}
                  </span>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Drop editor */}
        <div className="space-y-4 min-w-0">
          {dropLoading && dropId && (
            <Card className="border-border bg-card">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          )}
          {!dropLoading && drop && (
            <>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <Input
                    defaultValue={drop.title}
                    key={drop.id}
                    onBlur={handleTitleBlur}
                    className="text-title font-bold border-0 bg-transparent px-0 focus-visible:ring-0 h-auto"
                    placeholder="Drop title"
                  />
                  <p className="text-caption text-muted-foreground">
                    Hook → Value → Example → CTA · Drag posts to Runway
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {drop.posts.map((post, i) => (
                    <div
                      key={post.id}
                      className={cn(
                        'transition-opacity',
                        selectedPostIndex === i && 'ring-2 ring-primary/30 rounded-card-lg'
                      )}
                    >
                      <DraggablePostCard
                        post={post}
                        dropId={drop.id}
                        index={i}
                        onUpdate={handlePostUpdate(i)}
                        onDelete={drop.posts.length > 1 ? handlePostDelete(i) : undefined}
                        validationErrors={validatePost(post)}
                      />
                      <div className="mt-2 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPostIndex(i)}
                          className={cn(
                            'text-caption',
                            selectedPostIndex === i && 'ring-1 ring-primary'
                          )}
                        >
                          Edit variants & assets
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={handleAutoSuggest}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Auto-suggest mix
                </Button>
                <Button variant="secondary" size="sm" onClick={handleAiRerun}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI re-run
                </Button>
              </div>

              <ExportButtons dropId={drop.id} />
            </>
          )}
          {!dropId && !dropLoading && (
            <Card className="border-border bg-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-caption text-muted-foreground">Select a drop or create one from a canvas.</p>
                <Button asChild className="mt-4">
                  <Link to="/canvases">Open Canvas</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel: variants & assets */}
        {drop && selectedPost && (
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <PostVariantsPanel
              post={selectedPost}
              onVariantChange={handlePostVariantChange(selectedPostIndex)}
              selectedPostIndex={selectedPostIndex}
            />
            <AssetsPanel
              post={selectedPost}
              onAssetsChange={handlePostAssetsChange(selectedPostIndex)}
              selectedPostIndex={selectedPostIndex}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
