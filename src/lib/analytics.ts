/**
 * Analytics events for Garden curation actions.
 * Dispatch custom events for external analytics to listen to.
 */

export type CurationAction = 'keep' | 'ignore' | 'merge' | 'bulk_keep' | 'bulk_ignore'

export interface CurationEventDetail {
  action: CurationAction
  seedIds?: string[]
  mergedSeedId?: string
  clusterLabel?: string
}

export function trackCuration(detail: CurationEventDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('garden:curation', { detail, bubbles: true })
  )
}

/** Runway slot analytics: slot assigned, marked posted, undo */
export type RunwaySlotAction = 'slot_assigned' | 'marked_posted' | 'undo'

export interface RunwaySlotEventDetail {
  action: RunwaySlotAction
  slotId?: string
  postId?: string
  previousSlotId?: string
}

export function trackRunwaySlot(detail: RunwaySlotEventDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('runway:slot', { detail, bubbles: true })
  )
}
