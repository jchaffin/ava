import mongoose from 'mongoose'
import connectDB from '../src/lib/mongoose'
import Product from '../src/models/Product'
import { uploadToS3 } from '../src/lib/s3'
import fs from 'fs'
import path from 'path'

async function uploadAdditionalImagesToS3() {
  try {
    console.log('Connecting to database...')
    await connectDB()
    
    console.log('Fetching all products...')
    const products = await Product.find({}).lean()
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      console.log(`\nProcessing additional images for product: ${product.name} (${product._id})`)
      
      // Map product names to their directory names
      const productDirMap: { [key: string]: string } = {
        'Hydrating Serum': 'hydserum',
        'Vitamin C Serum': 'vitcserum',
        'Collagen Serum': 'collagenserum',
        'Anti-Age Serum': 'antiageserum',
        'Brightening Serum': 'brserum',
        'Soothing Serum': 'soothserum',
        'Intensive Serum': 'iserum',
        'Hyaluronic Serum': 'hyserum'
      }
      
      const productDir = productDirMap[product.name]
      if (!productDir) {
        console.log(`  No directory mapping found for product: ${product.name}`)
        continue
      }
      
      console.log(`  Product directory: ${productDir}`)
      
      // Define the additional image files to look for
      const additionalImages = [
        '1.jpg',
        '2.jpg', 
        '3.jpg',
        '4.jpg',
        'carousel.jpg',
        'carousel_b.jpg',
        'email.jpg',
        'review.jpg',
        'shop.jpg',
        'small.jpg'
      ]
      
      const uploadedImages: string[] = []
      
      for (const imageFile of additionalImages) {
        const localImagePath = `/images/products/${productDir}/${imageFile}`
        const fullImagePath = path.join(process.cwd(), 'public', localImagePath)
        
        // Check if the file exists
        if (!fs.existsSync(fullImagePath)) {
          console.log(`    Image not found: ${localImagePath}`)
          continue
        }
        
        console.log(`    Uploading: ${localImagePath}`)
        
        try {
          // Read the image file
          const imageBuffer = fs.readFileSync(fullImagePath)
          
          // Upload to S3
          const uploadResult = await uploadToS3(imageBuffer, {
            folder: `products/${product._id}`,
            fileName: imageFile,
            contentType: 'image/jpeg'
          })
          
          console.log(`    Upload successful: ${uploadResult.key}`)
          uploadedImages.push(uploadResult.key)
          
        } catch (uploadError) {
          console.error(`    Error uploading ${imageFile}:`, uploadError)
        }
      }
      
      // Update the product with the uploaded image keys
      if (uploadedImages.length > 0) {
        await Product.findByIdAndUpdate(product._id, {
          images: uploadedImages
        })
        console.log(`  Updated database with ${uploadedImages.length} additional images`)
      } else {
        console.log('  No additional images uploaded')
      }
    }
    
    console.log('\nAdditional image upload process completed!')
    
  } catch (error) {
    console.error('Error in upload process:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

// Run the script
uploadAdditionalImagesToS3()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 