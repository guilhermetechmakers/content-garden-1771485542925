// Runway Slots — Supabase Edge Function
// Slot CRUD, assign/unassign, mark posted, undo. All logic server-side.
// Client calls via supabase.functions.invoke('runway-slots', { body: { action, ... } })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Action =
  | 'list'
  | 'get'
  | 'create'
  | 'update'
  | 'delete'
  | 'assign'
  | 'unassign'
  | 'mark_posted'
  | 'undo'
  | 'history'

interface RunwaySlotsBody {
  action: Action
  slotId?: string
  date?: string
  time?: string
  postId?: string
  dropPostId?: string
  checklist?: { id: string; label: string; done: boolean }[]
  postNotes?: string
  limit?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as RunwaySlotsBody
    const { action } = body
    if (!action) {
      return new Response(
        JSON.stringify({ message: 'action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Verify JWT and get user_id (e.g. createClient with auth), then use Supabase client for CRUD
    // const supabase = createClient(...)
    // const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    // const userId = user?.id
    const userId = 'anonymous'

    switch (action) {
      case 'list': {
        // Return next 7 slots (empty/filled/posted) for user
        const slots = [
          { id: '1', date: new Date().toISOString().slice(0, 10), time: '09:00', status: 'empty', checklist: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', date: new Date(Date.now() + 864e5).toISOString().slice(0, 10), time: '09:00', status: 'filled', post_id: 'p1', checklist: [{ id: 'c1', label: 'Image', done: true }, { id: 'c2', label: 'Caption', done: true }], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ]
        return new Response(JSON.stringify({ slots }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'get': {
        if (!body.slotId) {
          return new Response(JSON.stringify({ message: 'slotId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        const slot = { id: body.slotId, date: new Date().toISOString().slice(0, 10), time: '09:00', status: 'filled', post_id: 'p1', checklist: [], post_notes: null, posted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        return new Response(JSON.stringify(slot), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'assign': {
        if (!body.slotId || (!body.postId && !body.dropPostId)) {
          return new Response(JSON.stringify({ message: 'slotId and (postId or dropPostId) required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        // Instrumentation: slot_assigned
        const result = { ok: true, slotId: body.slotId, postId: body.postId ?? body.dropPostId }
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'unassign': {
        if (!body.slotId) {
          return new Response(JSON.stringify({ message: 'slotId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        return new Response(JSON.stringify({ ok: true, slotId: body.slotId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'mark_posted': {
        if (!body.slotId) {
          return new Response(JSON.stringify({ message: 'slotId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        const postedAt = new Date().toISOString()
        // Instrumentation: marked_posted
        return new Response(JSON.stringify({ ok: true, slotId: body.slotId, posted_at: postedAt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'undo': {
        if (!body.slotId) {
          return new Response(JSON.stringify({ message: 'slotId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        // Instrumentation: undo
        return new Response(JSON.stringify({ ok: true, slotId: body.slotId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'history': {
        const limit = Math.min(Number(body.limit) ?? 20, 50)
        const history: unknown[] = []
        return new Response(JSON.stringify({ history }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      case 'create':
      case 'update':
      case 'delete': {
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      default:
        return new Response(JSON.stringify({ message: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e instanceof Error ? e.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
