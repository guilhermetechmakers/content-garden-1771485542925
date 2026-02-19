export type SeedType =
  | 'link'
  | 'note'
  | 'voice'
  | 'screenshot'
  | 'image'
  | 'audio'
  | 'video'

export type TriageStatus = 'kept' | 'ignored' | null

export interface Seed {
  id: string
  user_id: string
  type: SeedType
  title: string
  content: string
  tags: string[]
  extracted_bullets: string[]
  source_url?: string | null
  attachments: unknown[]
  created_at: string
  updated_at?: string
  triage_status?: TriageStatus
  merged_into_id?: string | null
}

export interface SeedCluster {
  id: string
  label: string
  seed_ids: string[]
  seeds?: Seed[]
  confidence?: number
}

export interface Cluster {
  id: string
  label: string
  seed_ids: string[]
  confidence?: number
}

export interface CanvasNode {
  id: string
  type: 'seed' | 'text' | 'image' | 'outline' | 'asset'
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
  user_id?: string
  title: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  metadata: Record<string, unknown>
  created_at?: string
  updated_at: string
}

export interface CanvasVersion {
  id: string
  canvas_id: string
  version: number
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  created_at: string
}

export type PlatformVariant = 'linkedin' | 'x' | 'short_video' | 'carousel'

export interface DropPost {
  id: string
  hook: string
  value: string
  example: string
  cta: string
  variants?: Record<string, string>
  asset_urls?: string[]
  seed_ids?: string[]
}

export interface Drop {
  id: string
  title: string
  canvas_id?: string | null
  canvas_source?: string | null
  posts: DropPost[]
  status: 'draft' | 'ready' | 'exported'
  created_at: string
  updated_at?: string
}

export type RunwaySlotStatus = 'empty' | 'filled' | 'posted'

export interface RunwaySlotChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface RunwaySlot {
  id: string
  user_id?: string
  date: string
  time: string
  status: RunwaySlotStatus
  post_id?: string | null
  drop_post_id?: string | null
  checklist: RunwaySlotChecklistItem[]
  post_notes?: string | null
  posted_at?: string | null
  created_at: string
  updated_at: string
}

/** Post card placed in a slot (from Drop or Library) */
export interface RunwaySlotPost {
  id: string
  hook: string
  value: string
  example?: string
  cta?: string
  platform?: string
  asset_urls?: string[]
}

/** Library record (container/folder) */
export interface Library {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
}

/** Published item in Library: thumbnails, platform, date, performance metrics */
export interface LibraryPublishedItem {
  id: string
  library_id?: string
  user_id: string
  title: string
  platform: string
  published_at: string
  thumbnail_url?: string | null
  asset_type: 'image' | 'video' | 'text' | 'carousel'
  performance_metrics?: LibraryItemMetrics
  tags?: string[]
  source_drop_id?: string | null
  runway_slot_id?: string | null
  created_at: string
  updated_at: string
}

export interface LibraryItemMetrics {
  impressions?: number
  likes?: number
  comments?: number
  shares?: number
  clicks?: number
}

/** Asset in Library: images, videos, files with usage provenance */
export interface LibraryAsset {
  id: string
  user_id: string
  library_id?: string
  name: string
  type: 'image' | 'video' | 'file'
  url: string
  usage_provenance?: string[]
  created_at: string
  updated_at: string
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

/** Describe-to-Find Search saved record (DB: describe_to_find_search) */
export interface DescribeToFindSearch {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

/** Result tier: exact match (Seed/Canvas), contextual snippet, or related Drop */
export type SearchResultTier = 'exact' | 'snippet' | 'drop'

/** Single search result item for display */
export interface SearchResultItem {
  id: string
  tier: SearchResultTier
  type: 'seed' | 'canvas' | 'drop' | 'snippet'
  title: string
  excerpt?: string
  matchedText?: string
  timecode?: string
  provenance?: string
  confidence?: number
  created_at?: string
  source_url?: string
  canvas_id?: string
  seed_id?: string
  drop_id?: string
}

/** Filters for refinement */
export interface DescribeToFindSearchFilters {
  type?: 'seed' | 'canvas' | 'drop' | 'snippet'
  dateFrom?: string
  dateTo?: string
  confidenceMin?: number
}

/** API response for describe-to-find search */
export interface DescribeToFindSearchResponse {
  exact: SearchResultItem[]
  snippets: SearchResultItem[]
  drops: SearchResultItem[]
  recentSearches?: string[]
}

/** AI Tools — actions for Canvas AI panel */
export type AIActionType =
  | 'draft_5_angles'
  | 'generate_hooks'
  | 'turn_into_thread'
  | 'summarize_seeds'

export interface AINodeContext {
  id: string
  title?: string
  content?: string
  extracted_bullets?: string[]
  seedId?: string
}

export interface AIProvenanceItem {
  type: 'seed' | 'canvas_node'
  id: string
  title?: string
}

export interface AIActionRequest {
  action: AIActionType
  canvasId?: string
  selectedNodeIds?: string[]
  tone?: string
  length?: string
  nodesContext?: AINodeContext[]
}

export interface AIActionResponse {
  result: AIActionResult
  provenance: AIProvenanceItem[]
  confidence: number
  creditsUsed?: number
}

export type AIActionResult =
  | { angles: string[]; tone: string; length: string }
  | { hooks: string[]; tone: string; length: string }
  | { thread: { step: number; text: string }[]; tone: string; length: string }
  | { summary: string; bullets: string[]; tone: string; length: string }
  | { error?: string }
