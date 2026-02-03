import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_EXPIRY_DAYS = 7;
const REMEMBER_ME_EXPIRY_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userId: string, rememberMe: boolean = false): Promise<string> {
  const token = generateSessionToken();
  const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : SESSION_EXPIRY_DAYS;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });

  return token;
}

export async function setSessionCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : SESSION_EXPIRY_DAYS;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiryDays * 24 * 60 * 60,
    path: '/',
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getCurrentUser() {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return session.user;
}

export async function logout() {
  const token = await getSessionToken();

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return user;
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
