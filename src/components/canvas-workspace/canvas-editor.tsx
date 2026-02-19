/**
 * Center: freeform canvas with nodes, edges, drag/drop, zoom/pan, autosave.
 * Node types: seed, text, asset (image).
 */

import {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react'
import { ZoomIn, ZoomOut, Maximize2, History, MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CanvasNode, CanvasEdge, Canvas } from '@/types'
import type { Seed } from '@/api/seeds'

const NODE_WIDTH = 220
const NODE_MIN_HEIGHT = 60

function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface CanvasEditorProps {
  canvas: Canvas | null
  isNew: boolean
  onNodesChange: (nodes: CanvasNode[]) => void
  onEdgesChange: (edges: CanvasEdge[]) => void
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onOpenVersionHistory?: () => void
  onOpenComments?: () => void
  onPresence?: () => void
  /** Called when selection changes (for AI panel context) */
  onSelectionChange?: (selectedNodeIds: string[]) => void
}

export function CanvasEditor({
  canvas,
  isNew,
  onNodesChange,
  onEdgesChange,
  autosaveStatus,
  onOpenVersionHistory,
  onOpenComments,
  onPresence,
  onSelectionChange,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const nodes = canvas?.nodes ?? []
  const edges = canvas?.edges ?? []

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setViewport((v) => ({
        ...v,
        scale: Math.min(2, Math.max(0.25, v.scale + delta)),
      }))
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-canvas-node]')) return
      setIsPanning(true)
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y })
      setSelectedId(null)
      onSelectionChange?.([])
    },
    [viewport, onSelectionChange]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setViewport((v) => ({
          ...v,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }))
      }
      if (draggingNodeId) {
        const dx = e.clientX - dragOffset.x
        const dy = e.clientY - dragOffset.y
        const node = nodes.find((n) => n.id === draggingNodeId)
        if (node) {
          onNodesChange(
            nodes.map((n) =>
              n.id === draggingNodeId
                ? { ...n, position: { x: (dx - viewport.x) / viewport.scale, y: (dy - viewport.y) / viewport.scale } }
                : n
            )
          )
        }
      }
    },
    [isPanning, panStart, draggingNodeId, dragOffset, nodes, viewport, onNodesChange]
  )

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
    setDraggingNodeId(null)
  }, [])

  useEffect(() => {
    const onPointerUp = () => {
      setIsPanning(false)
      setDraggingNodeId(null)
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [])

  const zoomIn = useCallback(() => {
    setViewport((v) => ({ ...v, scale: Math.min(2, v.scale + 0.25) }))
  }, [])
  const zoomOut = useCallback(() => {
    setViewport((v) => ({ ...v, scale: Math.max(0.25, v.scale - 0.25) }))
  }, [])
  const fitView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 })
  }, [])

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation()
      setSelectedId(nodeId)
      onSelectionChange?.([nodeId])
      setDraggingNodeId(nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setDragOffset({
          x: e.clientX - (node.position.x * viewport.scale + viewport.x),
          y: e.clientY - (node.position.y * viewport.scale + viewport.y),
        })
      }
    },
    [nodes, viewport, onSelectionChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const seedJson = e.dataTransfer.getData('application/seed')
      if (seedJson) {
        try {
          const seed = JSON.parse(seedJson) as Seed
          const rect = containerRef.current?.getBoundingClientRect()
          if (!rect) return
          const x = (e.clientX - rect.left - viewport.x) / viewport.scale - NODE_WIDTH / 2
          const y = (e.clientY - rect.top - viewport.y) / viewport.scale - NODE_MIN_HEIGHT / 2
          const newNode: CanvasNode = {
            id: generateId(),
            type: 'seed',
            position: { x, y },
            data: {
              seedId: seed.id,
              title: seed.title,
              content: seed.content,
              extracted_bullets: seed.extracted_bullets,
            },
          }
          onNodesChange([...nodes, newNode])
        } catch {
          // ignore invalid drop
        }
      }
    },
    [nodes, viewport, onNodesChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const addTextNode = useCallback(() => {
    const centerX = 400 - NODE_WIDTH / 2
    const centerY = 300 - 40
    const newNode: CanvasNode = {
      id: generateId(),
      type: 'text',
      position: { x: centerX, y: centerY },
      data: { content: 'New text block' },
    }
    onNodesChange([...nodes, newNode])
    setSelectedId(newNode.id)
  }, [nodes, onNodesChange])

  const addAssetNode = useCallback(() => {
    const centerX = 400 - NODE_WIDTH / 2
    const centerY = 300 - 40
    const newNode: CanvasNode = {
      id: generateId(),
      type: 'asset',
      position: { x: centerX, y: centerY },
      data: { url: '', alt: 'Asset' },
    }
    onNodesChange([...nodes, newNode])
    setSelectedId(newNode.id)
  }, [nodes, onNodesChange])

  const deleteNode = useCallback(
    (nodeId: string) => {
      onNodesChange(nodes.filter((n) => n.id !== nodeId))
      onEdgesChange(edges.filter((e) => e.source !== nodeId && e.target !== nodeId))
      setSelectedId(null)
      onSelectionChange?.([])
    },
    [nodes, edges, onNodesChange, onEdgesChange, onSelectionChange]
  )

  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    nodes.forEach((n) => map.set(n.id, n.position))
    return map
  }, [nodes])

  return (
    <main
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-background"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ touchAction: 'none' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(54,54,60,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(54,54,60,0.3)_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
        }}
      />
      {/* Canvas content */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        }}
      >
        {/* Edges (SVG) */}
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="rgb(var(--border))"
              />
            </marker>
          </defs>
          {edges.map((edge) => {
            const src = nodePositions.get(edge.source)
            const tgt = nodePositions.get(edge.target)
            if (!src || !tgt) return null
            const sx = src.x + NODE_WIDTH / 2
            const sy = src.y + NODE_MIN_HEIGHT
            const tx = tgt.x + NODE_WIDTH / 2
            const ty = tgt.y
            return (
              <line
                key={edge.id}
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                stroke="rgb(var(--border))"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
            )
          })}
        </svg>
        {/* Nodes */}
        {nodes.map((node) => (
          <CanvasNodeCard
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            onPointerDown={(e) => handleNodePointerDown(e, node.id)}
            onDelete={() => deleteNode(node.id)}
            onContentChange={(content) => {
              onNodesChange(
                nodes.map((n) =>
                  n.id === node.id ? { ...n, data: { ...n.data, content } } : n
                )
              )
            }}
          />
        ))}
      </div>

      {/* Toolbar top */}
      <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 shadow-card backdrop-blur-sm">
        <span className="text-caption text-muted-foreground">
          {isNew ? 'New canvas' : canvas?.title ?? 'Canvas'} · {autosaveStatus === 'saving' && 'Saving…'}
          {autosaveStatus === 'saved' && 'Saved'}
          {autosaveStatus === 'idle' && !isNew && 'Autosave'}
          {autosaveStatus === 'error' && 'Error saving'}
        </span>
        {onOpenVersionHistory && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onOpenVersionHistory}
            aria-label="Version history"
          >
            <History className="h-4 w-4" />
          </Button>
        )}
        {onOpenComments && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onOpenComments}
            aria-label="Comments"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
        {onPresence && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPresence}
            aria-label="Presence"
          >
            <Users className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={zoomIn}
          className="transition-all duration-200 hover:scale-[1.02]"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={zoomOut}
          className="transition-all duration-200 hover:scale-[1.02]"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={fitView}
          className="transition-all duration-200 hover:scale-[1.02]"
          aria-label="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Add node buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={addTextNode}>
          + Text block
        </Button>
        <Button variant="secondary" size="sm" onClick={addAssetNode}>
          + Asset
        </Button>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="rounded-card-lg border border-dashed border-border bg-card/80 p-8 max-w-md text-center shadow-card">
            <p className="text-foreground font-medium">Drop seeds here or add blocks</p>
            <p className="text-caption text-muted-foreground mt-1">
              Drag from the left panel, or use the buttons to add text and assets.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

interface CanvasNodeCardProps {
  node: CanvasNode
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDelete: () => void
  onContentChange?: (content: string) => void
}

function CanvasNodeCard({
  node,
  isSelected,
  onPointerDown,
  onDelete,
  onContentChange,
}: CanvasNodeCardProps) {
  const { x, y } = node.position
  const isSeed = node.type === 'seed'
  const isText = node.type === 'text'
  const isAsset = node.type === 'asset' || node.type === 'image'

  const title =
    (node.data?.title as string) ??
    (node.data?.content as string)?.slice(0, 50) ??
    (isSeed ? 'Seed' : isText ? 'Text block' : 'Asset')
  const content = (node.data?.content as string) ?? ''
  const bullets = (node.data?.extracted_bullets as string[]) ?? []

  return (
    <div
      data-canvas-node
      className={cn(
        'absolute rounded-card-lg border bg-card shadow-card transition-all duration-200 min-w-[200px] max-w-[280px]',
        isSelected
          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
          : 'border-border hover:shadow-card-hover hover:border-electric/30'
      )}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
      }}
      onPointerDown={onPointerDown}
    >
      <div className="p-3">
        {isSeed && (
          <>
            <p className="font-medium text-foreground text-sm line-clamp-2">{title}</p>
            {bullets.length > 0 && (
              <ul className="mt-1 text-caption text-muted-foreground list-disc list-inside space-y-0.5">
                {bullets.slice(0, 3).map((b, i) => (
                  <li key={i} className="line-clamp-1">{b}</li>
                ))}
              </ul>
            )}
            {!bullets.length && content && (
              <p className="text-caption text-muted-foreground line-clamp-2 mt-1">{content}</p>
            )}
          </>
        )}
        {isText && (
          <>
            <p className="font-medium text-foreground text-sm">Text block</p>
            <p className="text-caption text-muted-foreground mt-1 line-clamp-3">
              {content || 'New text block'}
            </p>
            {onContentChange && (
              <textarea
                className="mt-2 w-full rounded border border-border bg-input px-2 py-1 text-sm text-foreground focus:border-electric focus:outline-none min-h-[60px]"
                placeholder="Edit content…"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </>
        )}
        {isAsset && (
          <>
            <p className="font-medium text-foreground text-sm">Asset</p>
            <p className="text-caption text-muted-foreground mt-1">
              {(node.data?.url as string) ? 'Image attached' : 'No asset'}
            </p>
          </>
        )}
      </div>
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
