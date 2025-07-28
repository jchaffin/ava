import { writeFile, readFile, unlink, mkdir, access } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Local storage configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const PRODUCT_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products')

export interface LocalUploadResult {
  key: string
  url: string
  path: string
  size: number
  filename: string
}

export interface LocalUploadOptions {
  folder?: string
  fileName?: string
  contentType?: string
  productId?: string
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

/**
 * Upload a file to local storage
 */
export async function uploadToLocal(
  buffer: Buffer,
  options: LocalUploadOptions = {}
): Promise<LocalUploadResult> {
  try {
    const { folder = 'uploads', fileName, contentType = 'application/octet-stream', productId } = options
    
    // Generate filename if not provided
    const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`
    
    // Determine upload directory based on folder type
    let uploadDir: string
    let key: string
    
    if (folder === 'products' && productId) {
      // Product images go to /public/images/products/[productId]/
      uploadDir = path.join(PRODUCT_IMAGES_DIR, productId)
      key = `products/${productId}/${finalFileName}`
    } else {
      // Other uploads go to /public/uploads/[folder]/
      uploadDir = path.join(UPLOAD_DIR, folder)
      key = `${folder}/${finalFileName}`
    }
    
    // Ensure directory exists
    await ensureDirectoryExists(uploadDir)
    
    // Full file path
    const filePath = path.join(uploadDir, finalFileName)
    
    // Write file
    await writeFile(filePath, buffer)
    
    // Generate URL
    const url = key.startsWith('products/') 
      ? `/images/products/${productId}/${finalFileName}`
      : `/uploads/${folder}/${finalFileName}`
    
    return {
      key,
      url,
      path: filePath,
      size: buffer.length,
      filename: finalFileName
    }
  } catch (error) {
    console.error('Error uploading to local storage:', error)
    throw new Error('Failed to upload file to local storage')
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFromLocal(key: string): Promise<void> {
  try {
    let filePath: string
    
    if (key.startsWith('products/')) {
      // Product images
      const parts = key.split('/')
      const productId = parts[1]
      const filename = parts[2]
      filePath = path.join(PRODUCT_IMAGES_DIR, productId, filename)
    } else {
      // Other uploads
      filePath = path.join(UPLOAD_DIR, key)
    }
    
    // Check if file exists before deleting
    try {
      await access(filePath)
    } catch {
      console.log(`File not found: ${filePath}`)
      return
    }
    
    await unlink(filePath)
    console.log('Successfully deleted local file:', key)
  } catch (error) {
    console.error('Error deleting from local storage:', error)
    throw new Error('Failed to delete file from local storage')
  }
}

/**
 * Get file info from local storage
 */
export async function getLocalFileInfo(key: string): Promise<{
  exists: boolean
  size?: number
  path?: string
  url?: string
}> {
  try {
    let filePath: string
    let url: string
    
    if (key.startsWith('products/')) {
      const parts = key.split('/')
      const productId = parts[1]
      const filename = parts[2]
      filePath = path.join(PRODUCT_IMAGES_DIR, productId, filename)
      url = `/images/products/${productId}/${filename}`
    } else {
      filePath = path.join(UPLOAD_DIR, key)
      url = `/uploads/${key}`
    }
    
    try {
      await access(filePath)
      const stats = await readFile(filePath)
      return {
        exists: true,
        size: stats.length,
        path: filePath,
        url
      }
    } catch {
      return { exists: false }
    }
  } catch (error) {
    console.error('Error getting local file info:', error)
    return { exists: false }
  }
}

/**
 * List files in a directory
 */
export async function listLocalFiles(folder: string = ''): Promise<{
  key: string
  size: number
  lastModified: string
  url: string
  type: string
  folder: string
}[]> {
  try {
    const { readdir, stat } = await import('fs/promises')
    const files: any[] = []
    
    if (folder === 'products') {
      // List product images
      const productDirs = await readdir(PRODUCT_IMAGES_DIR)
      
      for (const productDir of productDirs) {
        const productPath = path.join(PRODUCT_IMAGES_DIR, productDir)
        const productStats = await stat(productPath)
        
        if (productStats.isDirectory()) {
          const productFiles = await readdir(productPath)
          
          for (const file of productFiles) {
            const filePath = path.join(productPath, file)
            const fileStats = await stat(filePath)
            
            files.push({
              key: `products/${productDir}/${file}`,
              size: fileStats.size,
              lastModified: fileStats.mtime.toISOString(),
              url: `/images/products/${productDir}/${file}`,
              type: 'image/jpeg', // Assume JPEG for now
              folder: `products/${productDir}`
            })
          }
        }
      }
    } else {
      // List uploads
      const uploadPath = path.join(UPLOAD_DIR, folder)
      
      if (existsSync(uploadPath)) {
        const uploadFiles = await readdir(uploadPath)
        
        for (const file of uploadFiles) {
          const filePath = path.join(uploadPath, file)
          const fileStats = await stat(filePath)
          
          files.push({
            key: `${folder}/${file}`,
            size: fileStats.size,
            lastModified: fileStats.mtime.toISOString(),
            url: `/uploads/${folder}/${file}`,
            type: 'application/octet-stream',
            folder
          })
        }
      }
    }
    
    return files
  } catch (error) {
    console.error('Error listing local files:', error)
    return []
  }
}

/**
 * Recursive function to count all files in a directory
 */
async function countFilesInDirectory(dirPath: string): Promise<{ totalFiles: number; totalSize: number }> {
  const { readdir, stat } = await import('fs/promises')
  let totalFiles = 0
  let totalSize = 0
  
  try {
    const items = await readdir(dirPath)
    console.log(`Scanning directory: ${dirPath} (${items.length} items)`)
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      
      try {
        const itemStats = await stat(itemPath)
        
        if (itemStats.isDirectory()) {
          // Recursively count files in subdirectories
          const subResult = await countFilesInDirectory(itemPath)
          totalFiles += subResult.totalFiles
          totalSize += subResult.totalSize
        } else {
          // Count files
          totalFiles++
          totalSize += itemStats.size
          console.log(`File: ${item} (${itemStats.size} bytes)`)
        }
      } catch (statError) {
        console.error(`Error getting stats for ${itemPath}:`, statError)
        // Skip this item and continue
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }
  
  console.log(`Directory ${dirPath}: ${totalFiles} files, ${totalSize} bytes`)
  return { totalFiles, totalSize }
}

/**
 * Get local storage stats
 */
export async function getLocalStorageStats(): Promise<{
  totalFiles: number
  totalSize: string
  uploadDir: string
  productImagesDir: string
}> {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    console.log('Scanning directory:', publicDir)
    
    // Count all files in the public directory
    if (existsSync(publicDir)) {
      const { totalFiles, totalSize } = await countFilesInDirectory(publicDir)
      console.log('Found files:', totalFiles, 'Total size (bytes):', totalSize)
      
      const formattedSize = formatFileSize(totalSize)
      console.log('Formatted size:', formattedSize)
      
      return {
        totalFiles,
        totalSize: formattedSize,
        uploadDir: UPLOAD_DIR,
        productImagesDir: PRODUCT_IMAGES_DIR
      }
    }
    
    console.log('Public directory does not exist')
    return {
      totalFiles: 0,
      totalSize: '0 Bytes',
      uploadDir: UPLOAD_DIR,
      productImagesDir: PRODUCT_IMAGES_DIR
    }
  } catch (error) {
    console.error('Error getting local storage stats:', error)
    return {
      totalFiles: 0,
      totalSize: '0 Bytes',
      uploadDir: UPLOAD_DIR,
      productImagesDir: PRODUCT_IMAGES_DIR
    }
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  console.log('Formatting file size:', bytes, 'bytes')
  
  if (bytes === 0) return '0 Bytes'
  if (bytes < 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  if (i < 0 || i >= sizes.length) {
    return '0 Bytes'
  }
  
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  console.log('Formatted result:', result)
  return result
}

// Client-safe functions moved to local-storage-client.ts
// Import them from there for client-side usage 