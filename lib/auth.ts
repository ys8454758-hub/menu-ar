import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

// Server-side Supabase client (for API routes) - reads from cookies
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore - called from Server Component where cookies can't be set
                    }
                },
            },
        }
    );
}

// Get current user from API route (reads session from cookies)
export async function getCurrentUser(): Promise<User | null> {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        if (error || !user) return null;
        return user;
    } catch {
        return null;
    }
}

// Get current user from Authorization header (for API routes that use Bearer tokens)
export async function getCurrentUserFromToken(authHeader: string | null) {
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.replace("Bearer ", "");

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    );
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// Get user role from database
export async function getUserRole(userId: string) {
    const prisma = (await import("@/lib/prisma")).default;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    return user?.role ?? null;
}