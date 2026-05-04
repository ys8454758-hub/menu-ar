import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug } from "@/lib/slug-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, address, phone, logoUrl } = body;

    // Get current user
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const existingRestaurants = await prisma.restaurant.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingRestaurants.map((r: { slug: string }) => r.slug);
    const slug = generateSlug(name, existingSlugs);

    // Create the restaurant using Prisma
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        description,
        address,
        phone,
        logoUrl,
        ownerId: user.id
      }
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch restaurants owned by the user
    const restaurants = await prisma.restaurant.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        subscription: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(restaurants || []);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request, new NextResponse());
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, name, address, phone, whatsapp, isActive, isOnMap, menuQrUrl, menuQrPdfUrl } = body;

    if (!restaurantId) return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });

    // Validate ownership or admin
    const existing = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { owner: true }
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dataToUpdate: {
        name?: string;
        address?: string;
        phone?: string;
        whatsapp?: string;
        isActive?: boolean;
        isOnMap?: boolean;
        menuQrUrl?: string;
        menuQrPdfUrl?: string;
        logoUrl?: string;
        coverImageUrl?: string;
        bannerUrl?: string;
    } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (address !== undefined) dataToUpdate.address = address;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (whatsapp !== undefined) dataToUpdate.whatsapp = whatsapp;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (isOnMap !== undefined) dataToUpdate.isOnMap = isOnMap;
    if (menuQrUrl !== undefined) dataToUpdate.menuQrUrl = menuQrUrl;
    if (menuQrPdfUrl !== undefined) dataToUpdate.menuQrPdfUrl = menuQrPdfUrl;
    if (body.logoUrl !== undefined) dataToUpdate.logoUrl = body.logoUrl;
    if (body.coverImageUrl !== undefined) dataToUpdate.coverImageUrl = body.coverImageUrl;
    if (body.bannerUrl !== undefined) dataToUpdate.bannerUrl = body.bannerUrl;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: dataToUpdate,
      include: { subscription: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error patching restaurant:", error);
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}