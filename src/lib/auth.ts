import crypto from 'crypto';
import { connectToDatabase } from './mongodb';
import { User, IUser } from '@/models/User';

const AUTH_SECRET = process.env.AUTH_SECRET || 'mithila_gaadi_super_secure_sha256_secret_key_2026_mithilanchal';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AuthSessionPayload {
  userId: string;
  role: 'user' | 'captain' | 'admin';
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  exp: number;
}

// Cryptographic password hashing using PBKDF2 (10,000 rounds of SHA-512)
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const computedBuf = Buffer.from(computed, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');
    if (computedBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, hashBuf);
  } catch {
    return false;
  }
}

// Generate signed, tamper-proof session token
export function createSessionToken(user: {
  id?: string;
  _id?: any;
  role: 'user' | 'captain' | 'admin';
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}): string {
  const userId = user.id || (user._id ? user._id.toString() : 'usr_' + Date.now());
  const payload: AuthSessionPayload = {
    userId,
    role: user.role,
    name: user.name,
    email: user.email.toLowerCase(),
    phone: user.phone,
    avatar: user.avatar,
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

// Verify and decode session token
export function verifySessionToken(token: string): AuthSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payloadText = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload: AuthSessionPayload = JSON.parse(payloadText);

    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Master Pre-Seeded Accounts with Secure Credentials
export const SEED_CREDENTIALS = {
  admin: {
    name: 'Mithila System Admin',
    email: 'admin@mithilagaadi.com',
    phone: '+91 99999 00000',
    password: 'Admin@Mithila2026!',
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    dashboard: '/admin',
  },
  captain: {
    name: 'Vikram Sharma (Captain)',
    email: 'captain@mithilagaadi.com',
    phone: '+91 98765 00001',
    password: 'Captain@Mithila2026!',
    role: 'captain' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    dashboard: '/driver',
  },
  rider: {
    name: 'Aditya Kumar (Passenger)',
    email: 'rider@mithilagaadi.com',
    phone: '+91 98765 43210',
    password: 'Rider@Mithila2026!',
    role: 'user' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    dashboard: '/home',
  },
};

// In-Memory store for fast offline/fallback handling
const inMemoryUsers: Map<string, any> = new Map();

// Initialize in-memory seed users with securely hashed passwords
(() => {
  for (const [key, account] of Object.entries(SEED_CREDENTIALS)) {
    const { hash, salt } = hashPassword(account.password);
    inMemoryUsers.set(account.email.toLowerCase(), {
      id: `usr_${key}_1`,
      _id: `usr_${key}_1`,
      name: account.name,
      email: account.email.toLowerCase(),
      phone: account.phone,
      role: account.role,
      avatar: account.avatar,
      passwordHash: hash,
      salt: salt,
      walletBalance: account.role === 'admin' ? 100000 : 350,
      transactions: [
        { id: 'tx_1', type: 'Welcome Bonus', amount: 250, isCredit: true, date: new Date() },
      ],
      savedAddresses: [
        { id: 'addr_1', label: 'Home (घर)', address: 'Darbhanga Tower, Darbhanga' },
        { id: 'addr_2', label: 'Work (ऑफिस)', address: 'Mithila University Campus, Darbhanga' },
      ],
    });
  }
})();

// Seed database on startup
export async function seedInitialUsers() {
  try {
    const db = await connectToDatabase();
    if (!db) return;

    for (const account of Object.values(SEED_CREDENTIALS)) {
      const existing = await User.findOne({ email: account.email.toLowerCase() });
      if (!existing) {
        const { hash, salt } = hashPassword(account.password);
        await User.create({
          name: account.name,
          email: account.email.toLowerCase(),
          phone: account.phone,
          role: account.role,
          avatar: account.avatar,
          passwordHash: hash,
          salt: salt,
          walletBalance: account.role === 'admin' ? 100000 : 350,
        });
      }
    }
  } catch (err) {
    // In-memory will serve requests seamlessly
  }
}

// Find user by email or phone
export async function findUserByCredentials(identifier: string): Promise<any | null> {
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\s+/g, '');

  // 1. Check in-memory first for instant 0ms return
  for (const user of inMemoryUsers.values()) {
    if (
      user.email.toLowerCase() === clean ||
      user.phone.replace(/\s+/g, '') === cleanPhone
    ) {
      return user;
    }
  }

  // 2. Query MongoDB if not found in memory
  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await User.findOne({
        $or: [{ email: clean }, { phone: clean }, { phone: identifier.trim() }],
      }).lean();
      if (doc) {
        const u = { ...doc, id: (doc as any)._id.toString() };
        inMemoryUsers.set(u.email.toLowerCase(), u);
        return u;
      }
    }
  } catch (err) {
    // Fallback
  }

  return null;
}

// Authenticate user with password or quick-pin
export async function authenticateUser(
  identifier: string,
  passwordAttempt: string
): Promise<{ user: any; token: string } | null> {
  const user = await findUserByCredentials(identifier);
  if (!user) return null;

  // Validate password
  if (user.passwordHash && user.salt) {
    const isValid = verifyPassword(passwordAttempt, user.passwordHash, user.salt);
    if (!isValid) return null;
  } else {
    // Default safety check for mock fallback
    if (passwordAttempt.length < 4) return null;
  }

  const token = createSessionToken(user);
  return { user, token };
}

// Get user profile by ID
export async function getUserById(userId: string): Promise<any | null> {
  // 1. Fast in-memory lookup (0ms)
  for (const user of inMemoryUsers.values()) {
    if (user.id === userId || user._id === userId) {
      return user;
    }
  }

  // 2. Query MongoDB if not in memory
  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await User.findById(userId).lean();
      if (doc) {
        const u = { ...doc, id: (doc as any)._id.toString() };
        inMemoryUsers.set(u.email.toLowerCase(), u);
        return u;
      }
    }
  } catch (err) {
    // Fallback
  }

  return null;
}

// Update user wallet balance & record transaction
export async function updateUserWallet(
  userId: string,
  amount: number,
  isCredit: boolean,
  typeDescription: string
) {
  const tx = {
    id: 'tx_' + Date.now(),
    type: typeDescription,
    amount,
    isCredit,
    date: new Date(),
  };

  try {
    await connectToDatabase();
    const delta = isCredit ? amount : -amount;
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { walletBalance: delta },
        $push: { transactions: tx },
      },
      { new: true }
    ).lean();

    if (updated) {
      return { balance: (updated as any).walletBalance, transaction: tx };
    }
  } catch (err) {
    // Fallback to memory
  }

  for (const user of inMemoryUsers.values()) {
    if (user.id === userId || user._id === userId) {
      user.walletBalance = Math.max(0, user.walletBalance + (isCredit ? amount : -amount));
      if (!user.transactions) user.transactions = [];
      user.transactions.unshift(tx);
      return { balance: user.walletBalance, transaction: tx };
    }
  }

  return { balance: isCredit ? amount : 0, transaction: tx };
}
