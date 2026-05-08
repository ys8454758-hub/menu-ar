import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Trim and optimize the DATABASE_URL
const databaseUrl = process.env.DATABASE_URL?.trim();

// Use a global variable to preserve the Prisma client across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (databaseUrl) {
  // Initialize the native pg driver
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  
  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
} else {
  // Fallback for build time if DATABASE_URL is missing
  prismaInstance = new PrismaClient({
    log: ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;