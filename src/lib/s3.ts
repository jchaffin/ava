import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'adelas-bucket'
const AWS_REGION = process.env.AWS_REGION || 'us-west-1'
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || null

// Debug: Log credential info (without exposing secrets)
console.log('AWS Config Check:')
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing')
console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing')
console.log('Region:', AWS_REGION)
console.log('Bucket:', BUCKET_NAME)

export interface S3UploadResult {
  key: string
  url: string
  cdnUrl?: string
}

export interface S3UploadOptions {
  folder?: string
  fileName?: string
  contentType?: string
  public?: boolean
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  file: Buffer | string,
  options: S3UploadOptions = {}
): Promise<S3UploadResult> {
  const {
    folder = 'uploads',
    fileName,
    contentType = 'image/jpeg',
    public: isPublic = true
  } = options

  // Generate the S3 key
  let key: string
  if (fileName) {
    // If fileName is provided, use it with the folder
    key = folder ? `${folder}/${fileName}` : fileName
  } else {
    // Generate unique filename if no fileName provided
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = contentType.split('/')[1] || 'jpg'
    key = `${folder}/${timestamp}-${randomString}.${extension}`
  }

  // Prepare upload parameters
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // 1 year cache for images
    ACL: ObjectCannedACL.public_read, // Make files publicly readable
  }

  try {
    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams))

    // Generate URLs
    const s3Url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`
    const cdnUrl = CLOUDFRONT_DOMAIN ? `https://${CLOUDFRONT_DOMAIN}/${key}` : undefined

    console.log('S3 Upload Result:', {
      bucket: BUCKET_NAME,
      region: AWS_REGION,
      key: key,
      s3Url: s3Url,
      cdnUrl: cdnUrl
    })

    // Use CDN URL if available, otherwise use direct S3 URL
    const finalUrl = cdnUrl || s3Url

    return {
      key,
      url: finalUrl,
      cdnUrl
    }
 } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload file to S3')
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }))
    console.log('Successfully deleted S3 object:', key)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete file from S3')
  }
}

/**
 * Generate a presigned URL for private files
 */
export async function generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Extract S3 key from URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Remove leading slash and bucket name if present
    const key = pathname.replace(/^\//, '').replace(/^[^\/]+\//, '')
    return key || null
  } catch {
    return null
  }
}

/**
 * Convert S3 key to URL
 */
export function s3KeyToUrl(key: string): string {
  if (!key) return ''
  
  // If it's already a URL, return it
  if (key.startsWith('http')) return key
  
  // Clean the key (remove any query parameters if present)
  const cleanKey = key.split('?')[0]
  
  // Remove leading slash to prevent double slashes in URL
  const normalizedKey = cleanKey.startsWith('/') ? cleanKey.slice(1) : cleanKey
  
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${normalizedKey}`
}

/**
 * Check if a string is an S3 key (doesn't start with http)
 */
export function isS3Key(str: string): boolean {
  return !str.startsWith('http')
}

/**
 * Extract S3 key from a full S3 URL (including presigned URLs)
 */
export function extractKeyFromS3Url(url: string): string | null {
  try {
    if (!url.includes('s3.amazonaws.com')) return null
    
    // Simple regex to extract the key from S3 URL
    // Matches: bucket.s3.region.amazonaws.com/key
    const match = url.match(/s3\.amazonaws\.com\/([^?]+)/)
    if (match) {
      const key = match[1]
      console.log('Extracted key from URL:', url, '->', key)
      return key
    }
    
    console.log('No match found for URL:', url)
    return null
  } catch (error) {
    console.error('Error extracting key:', error)
    return null
  }
}

/**
 * Generate product image URLs with the naming pattern
 */
export function generateProductImageUrls(baseImageUrl: string): string[] {
  const urls: string[] = []
  
  for (let i = 1; i <= 4; i++) {
    const imageUrl = baseImageUrl.replace('main', i.toString())
    urls.push(imageUrl)
  }
  
  return urls
}

/**
 * Upload product image and generate all 4 variants
 */
export async function uploadProductImage(
  file: Buffer,
  productId: string,
  imageIndex: number = 1
): Promise<S3UploadResult[]> {
  const results: S3UploadResult[] = []
  
  try {
    // Upload the main image
    const mainResult = await uploadToS3(file, {
      folder: `products/${productId}`,
      fileName: `main.jpg`,
      contentType: 'image/jpeg'
    })
    
    results.push(mainResult)
    
    // Generate URLs for all 4 variants
    const baseUrl = mainResult.cdnUrl || mainResult.url
    const allUrls = generateProductImageUrls(baseUrl)
    
    // Return all 4 URLs (the first one is the actual uploaded file)
    return allUrls.map((url, index) => ({
      key: mainResult.key.replace('main', (index + 1).toString()),
      url,
      cdnUrl: mainResult.cdnUrl ? mainResult.cdnUrl.replace('main', (index + 1).toString()) : undefined
    }))
    
  } catch (error) {
    console.error('Error uploading product image:', error)
    throw new Error('Failed to upload product image')
  }
}

/**
 * Delete all product images
 */
export async function deleteProductImages(productId: string): Promise<void> {
  try {
    // Delete all 4 image variants
    for (let i = 1; i <= 4; i++) {
      const key = `products/${productId}/${i}.jpg`
      await deleteFromS3(key)
    }
  } catch (error) {
    console.error('Error deleting product images:', error)
    throw new Error('Failed to delete product images')
  }
} 