import mongoose from 'mongoose';
import dns from 'node:dns';

// Ensure SRV DNS resolution succeeds across Node.js runtime and Windows / cloud hosts
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Non-fatal if runtime restricts changing DNS servers
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/storynest';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: 'storynest',
      maxPoolSize: 20,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev/build, use pre-built in prod
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`Connected to MongoDB Atlas (database: ${mongooseInstance.connection.name})`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export const connectDB = connectToDatabase;
