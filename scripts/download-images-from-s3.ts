import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'adelas-bucket'

async function downloadImage(key: string, localPath: string): Promise<void> {
  try {
    console.log(`Downloading: ${key} -> ${localPath}`)
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const response = await s3Client.send(command)
    
    if (!response.Body) {
      throw new Error('No body in response')
    }
    
    // Ensure directory exists
    const dir = path.dirname(localPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Convert stream to buffer and save
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    
    fs.writeFileSync(localPath, buffer)
    console.log(`✓ Downloaded: ${key}`)
  } catch (error) {
    console.error(`✗ Failed to download ${key}:`, error)
  }
}

async function listAllImages(): Promise<string[]> {
  try {
    console.log('Listing all images in S3 bucket...')
    
    const allKeys: string[] = []
    let continuationToken: string | undefined
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      })
      
      const response = await s3Client.send(command)
      
      if (response.Contents) {
        const keys = response.Contents
          .map(obj => obj.Key)
          .filter((key): key is string => !!key && key.includes('products/'))
        allKeys.push(...keys)
      }
      
      continuationToken = response.NextContinuationToken
    } while (continuationToken)
    
    console.log(`Found ${allKeys.length} product images`)
    return allKeys
  } catch (error) {
    console.error('Error listing images:', error)
    return []
  }
}

async function downloadAllImages(): Promise<void> {
  try {
    console.log('Starting image download process...')
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Region: ${process.env.AWS_REGION || 'us-west-1'}`)
    
    const imageKeys = await listAllImages()
    
    if (imageKeys.length === 0) {
      console.log('No images found to download')
      return
    }
    
    const baseDir = path.join(__dirname, '..', 'public', 'images')
    
    // Group images by product ID
    const productImages: Record<string, string[]> = {}
    
    imageKeys.forEach(key => {
      const parts = key.split('/')
      if (parts.length >= 3 && parts[0] === 'products') {
        const productId = parts[1]
        if (!productImages[productId]) {
          productImages[productId] = []
        }
        productImages[productId].push(key)
      }
    })
    
    console.log(`Found ${Object.keys(productImages).length} products with images`)
    
    // Download images for each product
    for (const [productId, keys] of Object.entries(productImages)) {
      console.log(`\nProcessing product: ${productId}`)
      
      for (const key of keys) {
        const filename = path.basename(key)
        const localPath = path.join(baseDir, productId, filename)
        
        await downloadImage(key, localPath)
      }
    }
    
    console.log('\n✓ All images downloaded successfully!')
    
    // Generate a summary
    console.log('\nDownload Summary:')
    for (const [productId, keys] of Object.entries(productImages)) {
      console.log(`  ${productId}: ${keys.length} images`)
    }
    
  } catch (error) {
    console.error('Error downloading images:', error)
  }
}

// Run the script
downloadAllImages()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 