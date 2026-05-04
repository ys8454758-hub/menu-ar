// GET /api/health - Health check endpoint for monitoring
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    storage: false,
    environment: false,
  };

  const startTime = Date.now();

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  // Check environment variables
  checks.environment = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.DATABASE_URL
  );

  // Check storage (Supabase) is configured
  checks.storage = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const allHealthy = Object.values(checks).every(Boolean);
  const duration = Date.now() - startTime;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      checks,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache",
      },
    }
  );
}
