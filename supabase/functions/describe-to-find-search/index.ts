// Describe-to-Find Search — Supabase Edge Function
// All request handling, validation, and data access run here.
// Client calls via supabase.functions.invoke('describe-to-find-search', { body: { q, type?, dateFrom?, dateTo?, confidenceMin? } })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchFilters {
  type?: string
  dateFrom?: string
  dateTo?: string
  confidenceMin?: number
}

interface SearchBody {
  q: string
  type?: string
  dateFrom?: string
  dateTo?: string
  confidenceMin?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') ?? (await req.json().catch(() => ({})) as SearchBody).q
    if (!q || typeof q !== 'string' || !q.trim()) {
      return new Response(
        JSON.stringify({ message: 'Query "q" is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const type = url.searchParams.get('type') ?? undefined
    const dateFrom = url.searchParams.get('dateFrom') ?? undefined
    const dateTo = url.searchParams.get('dateTo') ?? undefined
    const confidenceMinParam = url.searchParams.get('confidenceMin')
    const confidenceMin = confidenceMinParam != null ? Number(confidenceMinParam) : undefined

    // TODO: Validate JWT, get user_id, query seeds/canvases/drops with RLS
    // TODO: Run NL search (embedding + similarity or full-text) and apply filters
    const filters: SearchFilters = { type, dateFrom, dateTo, confidenceMin }

    const exact: unknown[] = []
    const snippets: unknown[] = []
    const drops: unknown[] = []
    const recentSearches: string[] = []

    return new Response(
      JSON.stringify({ exact, snippets, drops, recentSearches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e instanceof Error ? e.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
