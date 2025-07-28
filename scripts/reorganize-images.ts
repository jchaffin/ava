import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Product ID to directory mapping based on the script output
const productMapping: Record<string, string> = {
  '6886a1002404343bf6487006': '7006', // Hydrating Serum
  '6886a1002404343bf6487007': '7007', // Vitamin C Serum
  '6886a1002404343bf6487008': '7008', // Collagen Serum
  '6886a1002404343bf6487009': '7009', // Anti-Age Serum
  '6886a1002404343bf648700a': '700a', // Brightening Serum
  '6886a1002404343bf648700b': '700b', // Soothing Serum
  '6886a1002404343bf648700c': '700c', // Intensive Serum
  '6886a1002404343bf648700d': '700d', // Hyaluronic Serum
}

// Map old directory names to product IDs
const oldDirMapping: Record<string, string> = {
  'hydserum': '6886a1002404343bf6487006',
  'vitcserum': '6886a1002404343bf6487007',
  'collagenserum': '6886a1002404343bf6487008',
  'antiageserum': '6886a1002404343bf6487009',
  'brserum': '6886a1002404343bf648700a',
  'soothserum': '6886a1002404343bf648700b',
  'iserum': '6886a1002404343bf648700c',
  'hyserum': '6886a1002404343bf648700d',
}

async function reorganizeImages() {
  try {
    console.log('Starting image reorganization...')
    
    const baseDir = path.join(__dirname, '..', 'public', 'images', 'products')
    
    // Create new directories and move images
    for (const [oldDir, productId] of Object.entries(oldDirMapping)) {
      const newDir = productMapping[productId]
      const oldPath = path.join(baseDir, oldDir)
      const newPath = path.join(baseDir, newDir)
      
      if (!fs.existsSync(oldPath)) {
        console.log(`Old directory not found: ${oldDir}`)
        continue
      }
      
      // Create new directory
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true })
        console.log(`Created directory: ${newDir}`)
      }
      
      // Move all files from old directory to new directory
      const files = fs.readdirSync(oldPath)
      for (const file of files) {
        const oldFilePath = path.join(oldPath, file)
        const newFilePath = path.join(newPath, file)
        
        if (fs.statSync(oldFilePath).isFile()) {
          fs.copyFileSync(oldFilePath, newFilePath)
          console.log(`  Copied: ${file} -> ${newDir}/${file}`)
        }
      }
      
      console.log(`✓ Moved all files from ${oldDir} to ${newDir}`)
    }
    
    console.log('\n✓ Image reorganization completed!')
    
    // List all new directories
    console.log('\nNew directory structure:')
    const newDirs = fs.readdirSync(baseDir).filter(dir => 
      fs.statSync(path.join(baseDir, dir)).isDirectory() && 
      /^[0-9a-f]{4}$/.test(dir)
    )
    
    for (const dir of newDirs.sort()) {
      const dirPath = path.join(baseDir, dir)
      const files = fs.readdirSync(dirPath).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      )
      console.log(`  ${dir}: ${files.length} images`)
    }
    
  } catch (error) {
    console.error('Error reorganizing images:', error)
  }
}

// Run the script
reorganizeImages()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 