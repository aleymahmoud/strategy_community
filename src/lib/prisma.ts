import { PrismaClient } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const globalForPrisma = globalThis as unknown as {
  primaryPrisma: PrismaClient | undefined;
  fallbackPrisma: PrismaClient | undefined;
  useFallback: boolean;
};

// Primary client (Neon)
const primaryPrisma = globalForPrisma.primaryPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.primaryPrisma = primaryPrisma;

// Fallback client (Supabase) — only created if env var is set
const fallbackUrl = process.env.DATABASE_URL_FALLBACK;
const fallbackPrisma = fallbackUrl
  ? (globalForPrisma.fallbackPrisma ?? new PrismaClient({ datasourceUrl: fallbackUrl }))
  : null;
if (process.env.NODE_ENV !== "production" && fallbackPrisma) {
  globalForPrisma.fallbackPrisma = fallbackPrisma;
}

if (globalForPrisma.useFallback === undefined) globalForPrisma.useFallback = false;

function isConnectionError(error: unknown): boolean {
  const msg = String(error);
  return (
    msg.includes("Can't reach database") ||
    msg.includes("Connection refused") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("Server has closed the connection") ||
    msg.includes("Connection timed out") ||
    msg.includes("Too many connections") ||
    msg.includes("fetch failed") ||
    msg.includes("network")
  );
}

function getActive(): PrismaClient {
  return globalForPrisma.useFallback && fallbackPrisma ? fallbackPrisma : primaryPrisma;
}

function wrapWithFallback(fn: any, fallbackFn: any) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (!globalForPrisma.useFallback && fallbackFn && isConnectionError(error)) {
        console.warn(`[DB] Primary failed, switching to fallback`);
        globalForPrisma.useFallback = true;
        return await fallbackFn(...args);
      }
      throw error;
    }
  };
}

// Proxy that auto-fails-over from primary to fallback on connection errors
export const prisma: PrismaClient = new Proxy(primaryPrisma, {
  get(_, prop: string | symbol) {
    const active = getActive();
    const value = (active as any)[prop];

    // Prisma model delegates (member, event, etc.) — wrap their query methods
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return new Proxy(value, {
        get(modelTarget: any, modelProp: string | symbol) {
          const method = modelTarget[modelProp];
          if (typeof method !== "function") return method;

          if (!fallbackPrisma || globalForPrisma.useFallback) {
            return method.bind(modelTarget);
          }

          const fbModel = (fallbackPrisma as any)[prop];
          const fbMethod = fbModel?.[modelProp];
          return wrapWithFallback(
            method.bind(modelTarget),
            fbMethod ? fbMethod.bind(fbModel) : null
          );
        },
      });
    }

    // Top-level functions ($transaction, $queryRaw, etc.)
    if (typeof value === "function") {
      if (!fallbackPrisma || globalForPrisma.useFallback) {
        return value.bind(active);
      }

      const fbMethod = (fallbackPrisma as any)[prop];
      return wrapWithFallback(
        value.bind(active),
        fbMethod ? fbMethod.bind(fallbackPrisma) : null
      );
    }

    return value;
  },
});

export default prisma;
