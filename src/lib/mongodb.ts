import mongoose from 'mongoose';

// Check URI and ensure default database name if missing
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mithilacab';
if (MONGODB_URI.startsWith('mongodb+srv://') && (MONGODB_URI.endsWith('.mongodb.net/') || MONGODB_URI.endsWith('.mongodb.net'))) {
  MONGODB_URI = MONGODB_URI.replace(/\/?$/, '/mithilacab?retryWrites=true&w=majority');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  lastFailureTime: 0,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// 60-second cooldown if MongoDB is offline so we never block requests
const FAILURE_COOLDOWN_MS = 60 * 1000;

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // If already connected, return in 0ms
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If MongoDB previously timed out/failed, skip to in-memory mode until cooldown passes
  const now = Date.now();
  if (now - cached.lastFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5s timeout for cloud Atlas TLS connection
      connectTimeoutMS: 5000,
    };

    // Hard timeout race (5.5s) to guarantee no request hangs indefinitely
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5500));

    cached.promise = Promise.race([
      mongoose
        .connect(MONGODB_URI, opts)
        .then((mongooseInstance) => {
          cached.lastFailureTime = 0;
          return mongooseInstance;
        })
        .catch(() => {
          cached.lastFailureTime = Date.now();
          cached.promise = null;
          return null;
        }),
      timeoutPromise,
    ]).then((res) => {
      if (!res) {
        cached.lastFailureTime = Date.now();
        cached.promise = null;
      }
      return res;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.lastFailureTime = Date.now();
    cached.promise = null;
    return null;
  }
}
