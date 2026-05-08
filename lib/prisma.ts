import { PrismaClient } from '@prisma/client'

// Trim the DATABASE_URL to prevent issues with trailing newlines or spaces
const databaseUrl = process.env.DATABASE_URL?.trim();

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
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;