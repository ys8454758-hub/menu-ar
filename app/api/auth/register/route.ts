import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, restaurantName, slug, userId } = await req.json();

    if (!email || !restaurantName || !slug || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug is taken
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (existingRestaurant) {
      return NextResponse.json({ error: "Restaurant URL slug is already taken" }, { status: 400 });
    }

    // Create User and Restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          id: userId, // Match Supabase UID
          email,
          name,
          role: "OWNER",
        },
      });

      // 2. Create Restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug,
          ownerId: user.id,
          isActive: true,
          city: "Bengaluru",
          // Initialize Themes
          badgeTheme: {
            create: {
              vegColor: "#39FF14",
              nonVegColor: "#FF6B35",
              jainColor: "#FFD700",
              veganColor: "#00FFD1",
            },
          },
          qrBrandTheme: {
            create: {
              foregroundColor: "#00FFD1",
              backgroundColor: "#0A0A0F",
              themeName: "Cyberpunk",
            },
          },
          menuTheme: {
            create: {
              themeName: "terminal",
            },
          },
          // Initialize Subscription (Active/Unlimited)
          subscription: {
            create: {
              plan: "PRO",
              status: "ACTIVE",
            },
          },
        },
      });

      return { user, restaurant };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Registration error full details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      { error: `Failed to create restaurant profile: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
