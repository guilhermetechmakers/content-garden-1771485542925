/**
 * Background worker for link scraping, video/audio transcription, screenshot OCR,
 * and metadata extraction. Enqueue jobs from API (e.g. after creating a seed with type link/voice/screenshot)
 * and process them here. Replace stubs with real services (e.g. OpenAI Whisper, Tesseract, link scrapers).
 */

import { seedRepository } from '../models/seed.js'

export type JobType = 'link_scrape' | 'transcribe' | 'ocr' | 'extract_metadata'

export interface WorkerJob {
  seedId: string
  type: JobType
  payload?: { url?: string; attachmentKey?: string }
}

const queue: WorkerJob[] = []
let processing = false

function processNext(): void {
  if (queue.length === 0) {
    processing = false
    return
  }
  processing = true
  const job = queue.shift()!
  runJob(job)
    .catch((err) => {
      console.error(`Worker job failed: ${job.seedId}`, err)
      seedRepository.update(job.seedId, { processing_status: 'failed' })
    })
    .finally(() => {
      setImmediate(processNext)
    })
}

/**
 * Enqueue a job for async processing (call from API after creating/updating a seed).
 */
export function enqueue(job: WorkerJob): void {
  queue.push(job)
  if (!processing) processNext()
}

async function runJob(job: WorkerJob): Promise<void> {
  const seed = seedRepository.findById(job.seedId)
  if (!seed) return

  seedRepository.update(job.seedId, { processing_status: 'processing' })

  switch (job.type) {
    case 'link_scrape':
      await scrapeLink(seed.id, job.payload?.url ?? seed.source_url ?? '')
      break
    case 'transcribe':
      await transcribeMedia(seed.id, job.payload?.attachmentKey)
      break
    case 'ocr':
      await runOcr(seed.id, job.payload?.attachmentKey)
      break
    case 'extract_metadata':
      await extractMetadata(seed.id)
      break
    default:
      seedRepository.update(job.seedId, { processing_status: 'failed' })
  }
}

async function scrapeLink(seedId: string, url: string): Promise<void> {
  if (!url) {
    seedRepository.update(seedId, { processing_status: 'completed' })
    return
  }
  // Stub: in production use cheerio/puppeteer or a link-preview service to fetch title, description, bullets.
  const seed = seedRepository.findById(seedId)
  if (!seed) return
  const title = seed.title || new URL(url).hostname
  seedRepository.update(seedId, {
    title,
    extracted_bullets: seed.extracted_bullets.length ? seed.extracted_bullets : ['[Link scraped – add extraction service]'],
    processing_status: 'completed',
  })
}

async function transcribeMedia(seedId: string, _attachmentKey?: string): Promise<void> {
  // Stub: in production use Whisper/AssemblyAI etc. to transcribe audio/video, then update seed.content.
  const seed = seedRepository.findById(seedId)
  if (!seed) return
  seedRepository.update(seedId, {
    content: seed.content || '[Transcription placeholder – integrate Whisper or similar]',
    processing_status: 'completed',
  })
}

async function runOcr(seedId: string, _attachmentKey?: string): Promise<void> {
  // Stub: in production use Tesseract or cloud OCR to extract text from screenshot/image, then update seed.content.
  const seed = seedRepository.findById(seedId)
  if (!seed) return
  seedRepository.update(seedId, {
    content: seed.content || '[OCR placeholder – integrate Tesseract or similar]',
    processing_status: 'completed',
  })
}

async function extractMetadata(seedId: string): Promise<void> {
  const seed = seedRepository.findById(seedId)
  if (!seed) return
  // Stub: extract tags/bullets from content (e.g. LLM or rules).
  seedRepository.update(seedId, {
    processing_status: 'completed',
  })
}

export const transcriptionWorker = {
  enqueue,
}
