import prisma from "@/lib/prisma";
import DishViewClient from "@/components/ar/DishViewClient";

interface ARPageProps {
  params: Promise<{
    restaurantSlug: string;
    dishSlug: string;
  }>;
}

export async function generateMetadata({ params }: ARPageProps) {
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
      return {
        title: `${dish.name} at ${dish.restaurant.name} | Livin3D`,
        description: dish.description || `View ${dish.name} in Augmented Reality`,
        openGraph: {
          title: `${dish.name} at ${dish.restaurant.name}`,
          description: dish.description || `View ${dish.name} in Augmented Reality`,
          images: dish.restaurant.logoUrl ? [{ url: dish.restaurant.logoUrl }] : undefined
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-body-md font-body text-text-primary">
            This dish is no longer available
          </p>
          <p className="text-body-sm font-body text-text-secondary">
            You are being redirected...
          </p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-2 border-ember rounded-full flex items-center justify-center mx-auto">
            <span className="text-ember text-body-lg">⚠️</span>
          </div>
          <p className="text-body-md font-body text-text-primary">
            This dish is no longer available
          </p>
          <p className="text-body-sm font-body text-text-secondary">
            Please check with your waiter or scan another QR code
          </p>
        </div>
      </div>
    );
  }

  return <DishViewClient dish={dish} />;
}