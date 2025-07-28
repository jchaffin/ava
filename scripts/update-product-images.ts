import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ava'

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Import the Product model
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  images: [String],
  stock: Number,
  featured: Boolean,
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

// Get the last four digits of product ID
function getProductDirFromId(productId: string): string {
  return productId.slice(-4)
}

// Get available images for a product directory
function getAvailableImages(productDir: string): string[] {
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products', productDir)
  
  if (!fs.existsSync(imagesDir)) {
    console.log(`Directory not found: ${imagesDir}`)
    return []
  }
  
  const files = fs.readdirSync(imagesDir)
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  )
  
  return imageFiles.map(file => `/images/products/${productDir}/${file}`)
}

async function updateProductImages() {
  try {
    console.log('Starting product image update...')
    
    // Get all products
    const products = await Product.find({})
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      console.log(`\nProcessing: ${product.name} (ID: ${product._id})`)
      
      // Get the product directory from the last 4 digits of the ID
      const productDir = getProductDirFromId(product._id.toString())
      console.log(`  Using directory: ${productDir}`)
      
      // Get available images
      const availableImages = getAvailableImages(productDir)
      
      if (availableImages.length === 0) {
        console.log(`  No images found for: ${productDir}`)
        continue
      }
      
      // Update the product
      const mainImage = availableImages.find(img => img.includes('_main.')) || availableImages[0]
      
      await Product.findByIdAndUpdate(product._id, {
        image: mainImage,
        images: availableImages
      })
      
      console.log(`  Updated ${product.name}:`)
      console.log(`    Main image: ${mainImage}`)
      console.log(`    Total images: ${availableImages.length}`)
    }
    
    console.log('\n✓ All products updated successfully!')
    
  } catch (error) {
    console.error('Error updating products:', error)
  }
}

// Run the script
async function main() {
  await connectDB()
  await updateProductImages()
  await mongoose.disconnect()
  console.log('Script completed')
  process.exit(0)
}

main().catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
}) 