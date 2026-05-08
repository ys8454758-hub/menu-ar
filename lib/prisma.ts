import { PrismaClient } from '@prisma/client'

// Trim the DATABASE_URL and add a connection timeout if not present
let databaseUrl = process.env.DATABASE_URL?.trim();

if (databaseUrl && !databaseUrl.includes('connect_timeout')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}connect_timeout=30`;
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