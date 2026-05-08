import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Trim and optimize the DATABASE_URL
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Use a global variable to preserve the Prisma client across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize the native pg driver
const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;