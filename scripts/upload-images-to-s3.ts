import mongoose from 'mongoose'
import connectDB from '../src/lib/mongoose'
import Product from '../src/models/Product'
import { uploadToS3 } from '../src/lib/s3'
import fs from 'fs'
import path from 'path'

async function uploadImagesToS3() {
  try {
    console.log('Connecting to database...')
    await connectDB()
    
    console.log('Fetching all products...')
    const products = await Product.find({}).lean()
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      console.log(`\nProcessing product: ${product.name} (${product._id})`)
      
      // Check if the image is already an S3 URL
      if (product.image && product.image.startsWith('http')) {
        console.log('  Image already uploaded to S3, skipping...')
        continue
      }
      
      // Get the local image path
      const localImagePath = product.image
      if (!localImagePath) {
        console.log('  No image path found, skipping...')
        continue
      }
      
      // Construct the full path to the image in the public folder
      const fullImagePath = path.join(process.cwd(), 'public', localImagePath)
      
      // Check if the file exists
      if (!fs.existsSync(fullImagePath)) {
        console.log(`  Image file not found: ${fullImagePath}`)
        continue
      }
      
      console.log(`  Uploading image: ${localImagePath}`)
      
      try {
        // Read the image file
        const imageBuffer = fs.readFileSync(fullImagePath)
        
        // Upload to S3
        const uploadResult = await uploadToS3(imageBuffer, {
          folder: `products/${product._id}`,
          fileName: 'main.jpg',
          contentType: 'image/jpeg'
        })
        
        console.log(`  Upload successful: ${uploadResult.url}`)
        
        // Update the product in the database with the S3 URL
        await Product.findByIdAndUpdate(product._id, {
          image: uploadResult.key // Store the S3 key, not the full URL
        })
        
        console.log(`  Database updated with S3 key: ${uploadResult.key}`)
        
      } catch (uploadError) {
        console.error(`  Error uploading image for ${product.name}:`, uploadError)
      }
    }
    
    console.log('\nImage upload process completed!')
    
  } catch (error) {
    console.error('Error in upload process:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

// Run the script
uploadImagesToS3()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 