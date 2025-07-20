import { MongoClient, MongoClientOptions } from 'mongodb'

// Global type declaration for development mode
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// MongoDB connection options
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  retryWrites: true, // Retry write operations if they fail
  retryReads: true, // Retry read operations if they fail
  w: 'majority', // Write concern for data durability
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect().then((client) => {
      console.log('✅ Connected to MongoDB (Development)')
      return client
    }).catch((error) => {
      console.error('❌ MongoDB connection error (Development):', error)
      throw error
    })
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect().then((client) => {
    console.log('✅ Connected to MongoDB (Production)')
    return client
  }).catch((error) => {
    console.error('❌ MongoDB connection error (Production):', error)
    throw error
  })
}

// Graceful shutdown for production
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    try {
      const client = await clientPromise
      await client.close()
      console.log('✅ MongoDB connection closed through app termination')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error)
      process.exit(1)
    }
  })
}

export default clientPromise