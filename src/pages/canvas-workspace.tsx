/**
 * Canvas Workspace (Visual Composer): split-pane editor with Seeds (left),
 * freeform canvas (center), AI panel (right). Version history, Publish/Export,
 * collaboration primitives and Snippets/Assets integration points.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  SeedsPanel,
  CanvasEditor,
  AIPanel,
  VersionHistoryDialog,
} from '@/components/canvas-workspace'
import {
  getCanvas,
  createCanvas,
  updateCanvas,
} from '@/api/canvases'
import { createDropFromCanvas } from '@/api/drops'
import type { Canvas, CanvasNode, CanvasEdge } from '@/types'
import type { Seed } from '@/api/seeds'

const AUTOSAVE_DEBOUNCE_MS = 2000

interface UpdateCanvasArgs {
  id: string
  payload: { nodes: CanvasNode[]; edges: CanvasEdge[]; title?: string }
}

export function CanvasWorkspacePage() {
  const { canvasId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = canvasId === 'new' || !canvasId

  const [localCanvas, setLocalCanvas] = useState<Canvas | null>(null)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [snippetModalOpen, setSnippetModalOpen] = useState(false)
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: serverCanvas, isLoading } = useQuery({
    queryKey: ['canvas', canvasId],
    queryFn: () => getCanvas(canvasId!),
    enabled: !isNew && !!canvasId,
  })

  const createMutation = useMutation({
    mutationFn: createCanvas,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['canvases'] })
      navigate(`/canvases/${created.id}`, { replace: true })
      setLocalCanvas(created)
      toast.success('Canvas created')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to create canvas')
      setAutosaveStatus('error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateCanvasArgs) => updateCanvas(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId] })
      queryClient.invalidateQueries({ queryKey: ['canvases'] })
      setAutosaveStatus('saved')
    },
    onError: () => {
      setAutosaveStatus('error')
      toast.error('Failed to save canvas')
    },
  })

  const createDropMutation = useMutation({
    mutationFn: ({ canvasId: cid, title }: { canvasId: string; title?: string }) =>
      createDropFromCanvas(cid, title),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['drops'] })
      navigate(`/drops/${created.id}`)
      toast.success('Drop created from canvas')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to create drop')
    },
  })

  useEffect(() => {
    if (serverCanvas && !isNew) {
      setLocalCanvas(serverCanvas)
    }
  }, [serverCanvas, isNew])

  const scheduleAutosave = useCallback(
    (nodes: CanvasNode[], edges: CanvasEdge[], title?: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (isNew) return
      const id = localCanvas?.id ?? canvasId
      if (!id) return
      setAutosaveStatus('idle')
      saveTimeoutRef.current = setTimeout(() => {
        setAutosaveStatus('saving')
        updateMutation.mutate({
          id,
          payload: { nodes, edges, title },
        })
      }, AUTOSAVE_DEBOUNCE_MS)
    },
    [isNew, localCanvas?.id, canvasId, updateMutation]
  )

  const handleNodesChange = useCallback(
    (nodes: CanvasNode[]) => {
      setLocalCanvas((prev) => {
        if (!prev) return null
        const next = { ...prev, nodes }
        scheduleAutosave(next.nodes, next.edges, next.title)
        return next
      })
    },
    [scheduleAutosave]
  )

  const handleEdgesChange = useCallback(
    (edges: CanvasEdge[]) => {
      setLocalCanvas((prev) => {
        if (!prev) return null
        const next = { ...prev, edges }
        scheduleAutosave(next.nodes, next.edges, next.title)
        return next
      })
    },
    [scheduleAutosave]
  )

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const handleAddSeedToCanvas = useCallback(
    (seed: Seed) => {
      const centerX = 300
      const centerY = 200
      const newNode: CanvasNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: 'seed',
        position: { x: centerX, y: centerY },
        data: {
          seedId: seed.id,
          title: seed.title,
          content: seed.content,
          extracted_bullets: seed.extracted_bullets,
        },
      }
      if (localCanvas) {
        handleNodesChange([...localCanvas.nodes, newNode])
      } else if (isNew) {
        createMutation.mutate({
          title: 'Untitled canvas',
          nodes: [newNode],
          edges: [],
        })
      }
    },
    [localCanvas, isNew, createMutation, handleNodesChange]
  )

  const handleRestoreVersion = useCallback(
    (version: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
      setLocalCanvas((prev) =>
        prev ? { ...prev, nodes: version.nodes, edges: version.edges } : null
      )
      if (localCanvas?.id) {
        updateMutation.mutate({
          id: localCanvas.id,
          payload: { nodes: version.nodes, edges: version.edges },
        })
      }
      toast.success('Version restored')
    },
    [localCanvas, updateMutation]
  )

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedNodeIds(ids)
  }, [])

  if (!isNew && isLoading && !serverCanvas) {
    return (
      <div className="flex h-[calc(100vh-3.5rem-3rem)] -m-6 items-center justify-center bg-background">
        <div className="text-caption text-muted-foreground">Loading canvas…</div>
      </div>
    )
  }

  const canvas = localCanvas ?? (isNew ? null : serverCanvas ?? null)

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] -m-6 animate-fade-in">
      <SeedsPanel
        canvasId={canvas?.id ?? canvasId ?? undefined}
        onAddSeedToCanvas={handleAddSeedToCanvas}
        onInsertSnippet={() => setSnippetModalOpen(true)}
        onInsertAsset={() => setAssetModalOpen(true)}
      />
      <CanvasEditor
        canvas={canvas}
        isNew={isNew}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        autosaveStatus={autosaveStatus}
        onOpenVersionHistory={() => setVersionHistoryOpen(true)}
        onOpenComments={() => toast.info('Comments will be available in a future update.')}
        onPresence={() => toast.info('Presence and collaboration coming soon.')}
        onSelectionChange={handleSelectionChange}
      />
      <AIPanel
        aiAvailable={true}
        canvasId={canvas?.id ?? canvasId ?? undefined}
        selectedNodeIds={selectedNodeIds}
        nodes={canvas?.nodes ?? []}
        onPublishToDrop={() => {
          const id = canvas?.id ?? canvasId
          if (id) {
            createDropMutation.mutate({ canvasId: id, title: canvas?.title })
          } else {
            toast.error('Save your canvas first to create a Drop.')
          }
        }}
        isPublishLoading={createDropMutation.isPending}
      />

      <VersionHistoryDialog
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        canvasId={canvas?.id ?? null}
        onRestore={handleRestoreVersion}
      />

      <Dialog open={snippetModalOpen} onOpenChange={setSnippetModalOpen}>
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>Insert Snippet</DialogTitle>
            <DialogDescription>
              Browse and insert reusable snippets (hooks, CTAs) from your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnippetModalOpen(false)}>
              Cancel
            </Button>
            <Button asChild>
              <a href="/snippets">Open Snippets</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assetModalOpen} onOpenChange={setAssetModalOpen}>
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>Insert Asset</DialogTitle>
            <DialogDescription>
              Choose an image or file from your library to add to the canvas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button asChild>
              <a href="/library">Open Library</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
