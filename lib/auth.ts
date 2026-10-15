import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthSession } from '@/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'marko-polo-super-secure-dev-secret-key-32chars!';
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);
export const COOKIE_NAME = 'marko_auth_token';

// 7 days expiration
const SESSION_EXPIRATION = '7d';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Securely hashes a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plain text password against hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a signed JWT for the authenticated user session
 */
export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(SECRET_KEY);
}

/**
 * Verifies and decodes a session JWT
 */
export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });

    if (!payload.userId || !payload.email || !payload.name) {
      return null;
    }

    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session from incoming HTTP-only cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

/**
 * Sets the HTTP-only session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clears the session cookie on logout
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Throws an error or returns session for server operations requiring authentication
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

