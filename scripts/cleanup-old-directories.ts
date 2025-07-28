import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Old directories to remove
const oldDirectories = [
  'antiageserum',
  'brserum', 
  'collagenserum',
  'hydserum',
  'hyserum',
  'iserum',
  'soothserum',
  'vitcserum',
  'collagenserum:bg',
  'hyserum:bg',
  'vitcserum:bg'
]

async function cleanupOldDirectories() {
  try {
    console.log('Starting cleanup of old directories...')
    
    const baseDir = path.join(__dirname, '..', 'public', 'images', 'products')
    
    for (const dir of oldDirectories) {
      const dirPath = path.join(baseDir, dir)
      
      if (fs.existsSync(dirPath)) {
        // Check if it's a directory
        const stats = fs.statSync(dirPath)
        if (stats.isDirectory()) {
          // Remove the directory and all its contents
          fs.rmSync(dirPath, { recursive: true, force: true })
          console.log(`✓ Removed: ${dir}`)
        }
      } else {
        console.log(`Directory not found: ${dir}`)
      }
    }
    
    console.log('\n✓ Cleanup completed!')
    
    // List remaining directories
    console.log('\nRemaining directories:')
    const remainingDirs = fs.readdirSync(baseDir).filter(dir => 
      fs.statSync(path.join(baseDir, dir)).isDirectory()
    )
    
    for (const dir of remainingDirs.sort()) {
      const dirPath = path.join(baseDir, dir)
      const files = fs.readdirSync(dirPath).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      )
      console.log(`  ${dir}: ${files.length} images`)
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

// Run the script
cleanupOldDirectories()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 