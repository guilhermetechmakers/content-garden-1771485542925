import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Seed } from '@/api/seeds'

export interface MergeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  seeds: Seed[]
  onMerge: (payload: {
    seed_ids: string[]
    title?: string
    tags?: string[]
    content?: string
    extracted_bullets?: string[]
  }) => void
  isMerging: boolean
}

export function MergeModal({
  open,
  onOpenChange,
  selectedIds,
  seeds,
  onMerge,
  isMerging,
}: MergeModalProps) {
  const [title, setTitle] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [content, setContent] = useState('')
  const [bulletsStr, setBulletsStr] = useState('')

  const defaultTitle =
    seeds.length > 0 ? seeds.map((s) => s.title).join(' / ').slice(0, 500) : ''
  const defaultTags = Array.from(new Set(seeds.flatMap((s) => s.tags ?? []))).join(', ')
  const defaultContent =
    seeds.length > 0
      ? seeds.map((s) => `## ${s.title}\n${s.content}`).join('\n\n')
      : ''
  const defaultBullets =
    seeds.length > 0 ? seeds.flatMap((s) => s.extracted_bullets ?? []).join('\n') : ''

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle)
      setTagsStr(defaultTags)
      setContent(defaultContent)
      setBulletsStr(defaultBullets)
    }
  }, [open, defaultTitle, defaultTags, defaultContent, defaultBullets])

  const handleSubmit = () => {
    if (selectedIds.length < 2) return
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const extracted_bullets = bulletsStr
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean)
    onMerge({
      seed_ids: selectedIds,
      title: title.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      content: content.trim() || undefined,
      extracted_bullets: extracted_bullets.length > 0 ? extracted_bullets : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className="max-h-[90vh] overflow-hidden flex flex-col max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Merge seeds</DialogTitle>
          <DialogDescription>
            Edit combined title, tags, content, and bullets. Original seeds are listed as
            provenance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto">
          {selectedIds.length < 2 && (
            <p className="text-caption text-primary">
              Select at least 2 seeds to merge (use Triage mode).
            </p>
          )}
          {/* Provenance list - prominent display per design spec */}
          <div className="rounded-lg border border-border bg-input/50 p-4">
            <h4 className="text-section font-medium text-foreground mb-2">
              Provenance ({seeds.length} seed{seeds.length !== 1 ? 's' : ''})
            </h4>
            <ul className="space-y-2">
              {seeds.map((s, i) => (
                <li
                  key={s.id}
                  className={cn(
                    'flex items-start gap-2 text-caption',
                    s.source_url && 'group'
                  )}
                >
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  {s.source_url ? (
                    <a
                      href={s.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate flex-1 min-w-0"
                    >
                      {s.title}
                    </a>
                  ) : (
                    <span className="text-foreground truncate">{s.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label htmlFor="merge-title" className="text-caption text-foreground block mb-1">
              Combined title
            </label>
            <Input
              id="merge-title"
              placeholder="Combined title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus:ring-electric/50 focus:border-electric"
            />
          </div>
          <div>
            <label htmlFor="merge-tags" className="text-caption text-foreground block mb-1">
              Tags (comma separated)
            </label>
            <Input
              id="merge-tags"
              placeholder="Tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="focus:ring-electric/50 focus:border-electric"
            />
          </div>
          <div>
            <label htmlFor="merge-content" className="text-caption text-foreground block mb-1">
              Content
            </label>
            <Textarea
              id="merge-content"
              rows={4}
              placeholder="Combined content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="focus:ring-electric/50 focus:border-electric"
            />
          </div>
          <div>
            <label htmlFor="merge-bullets" className="text-caption text-foreground block mb-1">
              Extracted bullets (one per line)
            </label>
            <Textarea
              id="merge-bullets"
              rows={3}
              placeholder="One bullet per line"
              value={bulletsStr}
              onChange={(e) => setBulletsStr(e.target.value)}
              className="focus:ring-electric/50 focus:border-electric"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isMerging || selectedIds.length < 2}
            className="hover:shadow-glow-electric"
          >
            {isMerging ? 'Merging…' : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
