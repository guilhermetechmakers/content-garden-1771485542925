export type SeedType = 'link' | 'voice' | 'screenshot' | 'thought'

export interface Seed {
  id: string
  user_id: string
  type: SeedType
  title: string
  content: string
  tags: string[]
  extracted_bullets: string[]
  source_url?: string
  attachments: string[]
  created_at: string
}

export interface Cluster {
  id: string
  label: string
  seed_ids: string[]
  confidence?: number
}

export interface CanvasNode {
  id: string
  type: 'seed' | 'text' | 'image' | 'outline'
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
}

export interface Canvas {
  id: string
  title: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  metadata: Record<string, unknown>
  updated_at: string
}

export interface DropPost {
  id: string
  hook: string
  value: string
  example: string
  cta: string
  variants?: Record<string, string>
}

export interface Drop {
  id: string
  title: string
  canvas_id: string
  posts: DropPost[]
  status: 'draft' | 'ready' | 'exported'
  created_at: string
}

export interface RunwaySlot {
  id: string
  date: string
  time: string
  status: 'empty' | 'filled' | 'posted'
  post_id?: string
  checklist: { id: string; label: string; done: boolean }[]
}

export interface Snippet {
  id: string
  title: string
  content: string
  tags: string[]
  usage_count: number
}

export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}
