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
