/**
 * Per-user upload quotas and throttling.
 */

const DEFAULT_DAILY_UPLOAD_LIMIT = 100
const DEFAULT_RATE_LIMIT_PER_MINUTE = 10

const dailyCounts = new Map<string, { date: string; count: number }>()
const minuteCounts = new Map<string, { minute: number; count: number }>()

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMinuteKey(): number {
  return Math.floor(Date.now() / 60_000)
}

export function checkUploadQuota(userId: string): { allowed: boolean; reason?: string } {
  const dailyLimit = Number(process.env.UPLOAD_DAILY_LIMIT) || DEFAULT_DAILY_UPLOAD_LIMIT
  const today = getTodayKey()
  const daily = dailyCounts.get(userId)
  if (daily) {
    if (daily.date !== today) {
      dailyCounts.set(userId, { date: today, count: 0 })
    } else if (daily.count >= dailyLimit) {
      return { allowed: false, reason: 'Daily upload limit reached' }
    }
  }

  const rateLimit = Number(process.env.UPLOAD_RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT_PER_MINUTE
  const minKey = getMinuteKey()
  const rateKey = `${userId}:${minKey}`
  const rate = minuteCounts.get(rateKey)
  if (rate && rate.count >= rateLimit) {
    return { allowed: false, reason: 'Too many uploads; try again in a minute' }
  }

  return { allowed: true }
}

export function recordUpload(userId: string): void {
  const today = getTodayKey()
  const daily = dailyCounts.get(userId)
  if (!daily || daily.date !== today) {
    dailyCounts.set(userId, { date: today, count: 1 })
  } else {
    daily.count += 1
  }

  const minKey = getMinuteKey()
  const rateKey = `${userId}:${minKey}`
  const rate = minuteCounts.get(rateKey)
  if (!rate) {
    minuteCounts.set(rateKey, { minute: minKey, count: 1 })
  } else {
    rate.count += 1
  }
}
