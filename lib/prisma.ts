import { PrismaClient } from '@prisma/client'

// Trim and optimize the DATABASE_URL for Supabase Free Tier
let databaseUrl = process.env.DATABASE_URL?.trim();

if (databaseUrl) {
  // If using the pooler port (6543), ensure pgbouncer=true is present
  if (databaseUrl.includes(':6543') && !databaseUrl.includes('pgbouncer=true')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl = `${databaseUrl}${separator}pgbouncer=true`;
  }
  
  // Add a reasonable connection timeout
  if (!databaseUrl.includes('connect_timeout')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl = `${databaseUrl}${separator}connect_timeout=30`;
  }
}

// Log connection attempt details (redacted for safety)
if (process.env.NODE_ENV === "production") {
  const redactedUrl = databaseUrl?.replace(/:([^@]+)@/, ':****@');
  console.log(`[Prisma] Connecting with URL: ${redactedUrl}`);
}

// Use a global variable to preserve the Prisma client across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // In production, we still want to see connection errors in the logs
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;