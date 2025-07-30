import { writeFile, unlink, mkdir, readdir, stat } from 'fs/promises'
import { join, dirname, basename, extname } from 'path'
import { existsSync } from 'fs'

// Local storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

export interface LocalUploadResult {
  success: boolean
  url: string
  key: string
  filename: string
  size: number
}

export interface LocalUploadOptions {
  folder?: string
  filename?: string
  overwrite?: boolean
}

/**
 * Upload a file to local storage
 */
export async function uploadToLocal(
  file: Buffer,
  originalName: string,
  options: LocalUploadOptions = {}
): Promise<LocalUploadResult> {
  try {
    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // Validate file extension
    const extension = extname(originalName).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`)
    }

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = options.filename || `${timestamp}-${randomString}${extension}`
    
    // Create folder path
    const folder = options.folder || 'general'
    const folderPath = join(UPLOAD_DIR, folder)
    
    console.log('Path details:', {
      uploadDir: UPLOAD_DIR,
      folder: folder,
      folderPath: folderPath,
      filename: filename,
      fullPath: join(folderPath, filename)
    })
    
    // Ensure directory exists
    await mkdir(folderPath, { recursive: true })
    
    // Create full file path
    const filePath = join(folderPath, filename)
    
    // Check if file exists and handle overwrite
    if (existsSync(filePath) && !options.overwrite) {
      throw new Error('File already exists')
    }
    
    // Write file to disk
    await writeFile(filePath, file)
    
    // Generate URL
    const url = `/images/${folder}/${filename}`
    const key = `${folder}/${filename}`
    
    console.log('Local Upload Result:', {
      filename,
      size: file.length,
      url,
      key
    })
    
    return {
      success: true,
      url,
      key,
      filename,
      size: file.length
    }
    
  } catch (error) {
    console.error('Error uploading to local storage:', error)
    console.error('Upload error details:', {
      originalName,
      options,
      fileSize: file.length,
      uploadDir: UPLOAD_DIR,
      folder: options.folder,
      filename: options.filename
    })
    throw new Error(`Failed to upload file to local storage: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFromLocal(key: string): Promise<void> {
  try {
    const filePath = join(UPLOAD_DIR, key)
    
    if (!existsSync(filePath)) {
      throw new Error('File not found')
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
export async function getFileInfo(key: string): Promise<{ exists: boolean; size?: number; modified?: Date }> {
  try {
    const filePath = join(UPLOAD_DIR, key)
    
    if (!existsSync(filePath)) {
      return { exists: false }
    }
    
    const stats = await stat(filePath)
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime
    }
    
  } catch (error) {
    console.error('Error getting file info:', error)
    return { exists: false }
  }
}

/**
 * List files in a directory
 */
export async function listFiles(folder: string = ''): Promise<Array<{ key: string; size: number; modified: Date }>> {
  try {
    const folderPath = join(UPLOAD_DIR, folder)
    
    if (!existsSync(folderPath)) {
      return []
    }
    
    const files = await readdir(folderPath, { withFileTypes: true })
    const fileList = []
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = join(folderPath, file.name)
        const stats = await stat(filePath)
        const key = folder ? `${folder}/${file.name}` : file.name
        
                 fileList.push({
           key,
           size: stats.size,
           modified: stats.mtime
         })
      }
    }
    
    return fileList
    
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number
  totalSize: number
  folders: string[]
}> {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return { totalFiles: 0, totalSize: 0, folders: [] }
    }
    
    const folders = await readdir(UPLOAD_DIR, { withFileTypes: true })
    const folderNames = folders.filter(f => f.isDirectory()).map(f => f.name)
    
    let totalFiles = 0
    let totalSize = 0
    
    for (const folderName of folderNames) {
      const files = await listFiles(folderName)
      totalFiles += files.length
      totalSize += files.reduce((sum, file) => sum + file.size, 0)
    }
    
    return {
      totalFiles,
      totalSize,
      folders: folderNames
    }
    
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return { totalFiles: 0, totalSize: 0, folders: [] }
  }
}

/**
 * Extract key from URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url.startsWith('/uploads/')) return null
  
  const key = url.replace('/uploads/', '')
  return key || null
}

/**
 * Convert key to URL
 */
export function keyToUrl(key: string): string {
  return `/uploads/${key}`
}

/**
 * Check if a string is a local storage key
 */
export function isLocalKey(str: string): boolean {
  return !str.startsWith('http') && !str.startsWith('/uploads/')
}

/**
 * Upload multiple files to local storage
 */
export async function uploadMultipleToLocal(
  files: Array<{ buffer: Buffer; originalName: string }>,
  options: LocalUploadOptions = {}
): Promise<LocalUploadResult[]> {
  const results: LocalUploadResult[] = []
  
  for (const file of files) {
    try {
      const result = await uploadToLocal(file.buffer, file.originalName, options)
      results.push(result)
    } catch (error) {
      console.error(`Error uploading ${file.originalName}:`, error)
      results.push({
        success: false,
        url: '',
        key: '',
        filename: file.originalName,
        size: 0
      })
    }
  }
  
  return results
}

/**
 * Clean up orphaned files
 */
export async function cleanupOrphanedFiles(validKeys: string[]): Promise<number> {
  try {
    const allFiles = await listFiles()
    const validKeySet = new Set(validKeys)
    let deletedCount = 0
    
    for (const file of allFiles) {
      if (!validKeySet.has(file.key)) {
        try {
          await deleteFromLocal(file.key)
          deletedCount++
        } catch (error) {
          console.error(`Error deleting orphaned file ${file.key}:`, error)
        }
      }
    }
    
    return deletedCount
    
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error)
    return 0
  }
} 