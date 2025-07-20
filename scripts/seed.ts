import mongoose from 'mongoose'
import connectDB from '../src/lib/mongoose'
import Product from '../src/models/Product'
import User from '../src/models/User'
import bcrypt from 'bcryptjs'

// Product data for AVA skincare
const products = [
  {
    name: 'Hydrating Serum',
    description: 'A powerful hydrating serum formulated with hyaluronic acid and vitamin B5 to deeply moisturize and plump the skin. Perfect for all skin types, this lightweight formula provides intense hydration without feeling greasy.',
    price: 49.99,
    image: '/images/products/hydserum/hydserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 150,
    featured: true,
  },
  {
    name: 'Vitamin C Serum',
    description: 'Brighten and even your skin tone with our potent Vitamin C serum. Formulated with 20% L-ascorbic acid, this antioxidant-rich serum helps reduce dark spots, improve skin texture, and protect against environmental damage.',
    price: 59.99,
    image: '/images/products/vitcserum/vitcserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 120,
    featured: true,
  },
  {
    name: 'Collagen Serum',
    description: 'Boost your skin\'s natural collagen production with our advanced collagen serum. This peptide-rich formula helps reduce fine lines, improve elasticity, and restore youthful firmness to aging skin.',
    price: 69.99,
    image: '/images/products/collagenserum/collagenserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 100,
    featured: true,
  },
  {
    name: 'Anti-Age Serum',
    description: 'Our comprehensive anti-aging serum combines retinol, peptides, and antioxidants to target multiple signs of aging. This powerful formula helps reduce wrinkles, improve skin texture, and restore radiance.',
    price: 79.99,
    image: '/images/products/antiageserum/antiageserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 80,
    featured: true,
  },
  {
    name: 'Brightening Serum',
    description: 'Illuminate your complexion with our brightening serum. Formulated with niacinamide and alpha arbutin, this gentle yet effective serum helps fade dark spots and even skin tone for a radiant glow.',
    price: 54.99,
    image: '/images/products/brserum/brserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 110,
    featured: false,
  },
  {
    name: 'Soothing Serum',
    description: 'Calm and comfort sensitive skin with our soothing serum. Enriched with aloe vera, chamomile, and centella asiatica, this gentle formula reduces redness and irritation while strengthening the skin barrier.',
    price: 44.99,
    image: '/images/products/soothserum/soothserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 90,
    featured: false,
  },
  {
    name: 'Intensive Serum',
    description: 'Target specific skin concerns with our intensive serum. This concentrated formula delivers powerful active ingredients deep into the skin to address stubborn issues and provide visible results.',
    price: 64.99,
    image: '/images/products/iserum/iserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 75,
    featured: false,
  },
  {
    name: 'Hyaluronic Serum',
    description: 'Experience intense hydration with our hyaluronic acid serum. This lightweight formula contains multiple molecular weights of hyaluronic acid to provide both surface and deep hydration for plump, dewy skin.',
    price: 39.99,
    image: '/images/products/hyserum/hyserum_main.jpg',
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    stock: 130,
    featured: false,
  },
]

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@ava.com',
  password: 'admin123',
  role: 'admin' as const,
}

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@ava.com',
  password: 'test123',
  role: 'user' as const,
}

// Demo user data
const demoUser = {
  name: 'Demo User',
  email: 'demo@ava.com',
  password: 'demo123',
  role: 'user' as const,
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Connected to database')
    
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Product.deleteMany({})
    await User.deleteMany({ email: { $in: [adminUser.email, testUser.email, demoUser.email] } })
    console.log('✅ Cleared existing data')
    
    // Seed products
    console.log('📦 Seeding products...')
    const createdProducts = await Product.insertMany(products)
    console.log(`✅ Created ${createdProducts.length} products`)
    
    // Seed admin user
    console.log('👤 Creating admin user...')
    const admin = await User.create({
      ...adminUser,
    })
    console.log(`✅ Created admin user: ${admin.email}`)
    
    // Seed test user
    console.log('👤 Creating test user...')
    const testUserDoc = await User.create({
      ...testUser,
    })
    console.log(`✅ Created test user: ${testUserDoc.email}`)
    
    // Seed demo user
    console.log('👤 Creating demo user...')
    const demoUserDoc = await User.create({
      ...demoUser,
    })
    console.log(`✅ Created demo user: ${demoUserDoc.email}`)
    
    // Display summary
    console.log('\n📊 Seeding Summary:')
    console.log(`   Products: ${createdProducts.length}`)
    console.log(`   Admin User: ${admin.email} (password: ${adminUser.password})`)
    console.log(`   Test User: ${testUserDoc.email} (password: ${testUser.password})`)
    console.log(`   Demo User: ${demoUserDoc.email} (password: ${demoUser.password})`)
    
    console.log('\n🎉 Database seeding completed successfully!')
    
    // Display featured products
    const featuredProducts = createdProducts.filter(p => p.featured)
    console.log('\n⭐ Featured Products:')
    featuredProducts.forEach(product => {
      console.log(`   - ${product.name}: $${product.price}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the seeder
seedDatabase() 