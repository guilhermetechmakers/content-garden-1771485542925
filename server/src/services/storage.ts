/**
 * S3-compatible file storage: signed upload/download URLs.
 * Encryption-at-rest is handled by the bucket (e.g. S3 SSE-S3 or SSE-KMS).
 * Use CDN domain in getPublicUrl when serving assets via CDN.
 */

import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET = process.env.S3_BUCKET ?? 'content-garden-uploads'
const REGION = process.env.AWS_REGION ?? 'us-east-1'
const UPLOAD_EXPIRY_SEC = Number(process.env.SIGNED_UPLOAD_EXPIRY_SEC) || 3600
const DOWNLOAD_EXPIRY_SEC = Number(process.env.SIGNED_DOWNLOAD_EXPIRY_SEC) || 86400
const CDN_BASE = process.env.CDN_BASE_URL ?? ''

const s3 = new S3Client({
  region: REGION,
  endpoint: process.env.S3_ENDPOINT ?? undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

/**
 * Generate a unique storage key for a user upload (avoids collisions, supports encryption-at-rest by path).
 */
export function buildKey(userId: string, filename: string, prefix = 'seeds'): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
  const timestamp = Date.now()
  return `${prefix}/${userId}/${timestamp}_${safeName}`
}

/**
 * Return a signed URL for uploading a file (PUT). Client uploads with PUT to this URL.
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  options?: { expiresInSeconds?: number }
): Promise<{ uploadUrl: string; key: string }> {
  const expiresIn = options?.expiresInSeconds ?? UPLOAD_EXPIRY_SEC
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn })
  return { uploadUrl, key }
}

/**
 * Return a signed URL for downloading a file (GET). Use for private assets.
 */
export async function getSignedDownloadUrl(
  key: string,
  options?: { expiresInSeconds?: number }
): Promise<string> {
  const expiresIn = options?.expiresInSeconds ?? DOWNLOAD_EXPIRY_SEC
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn })
}

/**
 * Public URL when using a CDN in front of the bucket (read-through or origin).
 */
export function getPublicUrl(key: string): string {
  if (CDN_BASE) {
    return `${CDN_BASE.replace(/\/$/, '')}/${key}`
  }
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}

export const storageService = {
  buildKey,
  getSignedUploadUrl,
  getSignedDownloadUrl,
  getPublicUrl,
}
