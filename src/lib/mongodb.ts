import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rapido';

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

// 5-minute cooldown if MongoDB is offline so we never block requests
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // If already connected, return in 0ms
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  // If MongoDB previously timed out/failed, skip instantly to in-memory mode in 0ms
  const now = Date.now();
  if (now - cached.lastFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 200, // 200ms ultra-fast connect timeout
      connectTimeoutMS: 200,
    };

    // Hard timeout race to ensure no request ever waits more than 250ms
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 250));

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
