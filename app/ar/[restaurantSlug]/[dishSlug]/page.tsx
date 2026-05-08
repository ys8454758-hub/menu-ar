import prisma from "@/lib/prisma";
import DishViewClient from "@/components/ar/DishViewClient";
import { Metadata } from "next";

interface ARPageProps {
  params: Promise<{
    restaurantSlug: string;
    dishSlug: string;
  }>;
}

export async function generateMetadata({ params }: ARPageProps): Promise<Metadata> {
  const { restaurantSlug, dishSlug } = await params;

  try {
    const dish = await prisma.dish.findFirst({
      where: {
        slug: dishSlug,
        restaurant: {
          slug: restaurantSlug
        }
      },
      include: {
        restaurant: true,
        model: true
      }
    });

    if (dish) {
      const links: { rel: string; href: string; as?: string }[] = [];
      if (dish.model?.glbUrl) {
        links.push({ rel: "preload", href: dish.model.glbUrl, as: "fetch" });
      }

      return {
        title: `${dish.name} at ${dish.restaurant.name} | Livin3D`,
        description: dish.description || `View ${dish.name} in Augmented Reality`,
        openGraph: {
          title: `${dish.name} at ${dish.restaurant.name}`,
          description: dish.description || `View ${dish.name} in Augmented Reality`,
          images: dish.restaurant.logoUrl ? [{ url: dish.restaurant.logoUrl }] : undefined
        },
        other: {
          "model-url": dish.model?.glbUrl || "",
        }
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Livin3D | Dish Not Found',
    description: 'This dish is no longer available'
  };
}

export default async function ARViewerPage({ params }: ARPageProps) {
  const { restaurantSlug, dishSlug } = await params;

  let dish = null;
  let redirectUrl = null;

  try {
    dish = await prisma.dish.findFirst({
      where: {
        slug: dishSlug,
        restaurant: {
          slug: restaurantSlug
        }
      },
      include: {
        restaurant: true,
        model: true,
        nutrition: {
          include: {
            allergens: true
          }
        },
        badges: true,
        ingredients: true,
        qrCode: true
      }
    });

    if (!dish) {
      const qrCode = await prisma.qRCode.findFirst({
        where: {
          uniqueCode: dishSlug
        }
      });

      if (qrCode?.redirectUrl) {
        redirectUrl = qrCode.redirectUrl;
      }
    }

    if (dish?.isArchived) {
      const qrCode = await prisma.qRCode.findFirst({
        where: {
          dishId: dish.id
        }
      });

      if (qrCode?.redirectUrl) {
        redirectUrl = qrCode.redirectUrl;
      }
    }
  } catch (error) {
    console.error('Error fetching dish:', error);
  }

  if (redirectUrl) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <div className="w-16 h-16 border border-plasma/30 bg-plasma/10 flex items-center justify-center mx-auto">
            <span className="text-display-md font-display text-plasma">L</span>
          </div>
          <div className="space-y-2">
            <p className="text-body-md font-body text-text-primary">This dish is no longer available</p>
            <p className="text-body-sm font-body text-text-tertiary">You are being redirected...</p>
          </div>
          <div className="w-48 h-px bg-surface mx-auto overflow-hidden">
            <div className="h-full bg-plasma animate-[loading_2s_linear_infinite]" />
          </div>
          <p className="text-[10px] font-mono text-text-tertiary/40 tracking-widest">POWERED BY LIVIN3D</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <div className="w-16 h-16 border border-ember/30 bg-ember/10 flex items-center justify-center mx-auto">
            <span className="text-display-md font-display text-ember">!</span>
          </div>
          <div className="space-y-2">
            <p className="text-body-md font-body text-text-primary">Dish not found</p>
            <p className="text-body-sm font-body text-text-tertiary">Please check with your waiter or scan another QR code</p>
          </div>
          <p className="text-[10px] font-mono text-text-tertiary/40 tracking-widest">POWERED BY LIVIN3D</p>
        </div>
      </div>
    );
  }

  return <DishViewClient dish={dish} />;
}