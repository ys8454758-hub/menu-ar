import Link from "next/link";
import prisma from "@/lib/prisma";
import UploadDishForm from "@/components/dashboard/UploadDishForm";

export default async function NewDishPage() {
  let restaurant = null;

  try {
    // Fetch restaurant data on the server
    const restaurants = await prisma.restaurant.findMany({
      take: 1,
    });

    restaurant = restaurants.length > 0 ? restaurants[0] : null;
  } catch (error) {
    // Database not available during build - this is expected
    console.log("Database not available during build, skipping restaurant fetch");
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-void p-6 flex flex-col items-center justify-center">
        <p className="text-body-md font-body text-text-tertiary">
          Restaurant not found. Please complete setup.
        </p>
        <Link
          href="/dashboard/settings"
          className="mt-4 rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-display-lg font-display text-text-accent tracking-widest">
            Add New Dish
          </h1>
          <Link
            href="/dashboard/dishes"
            className="rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
          >
            Back to Menu
          </Link>
        </div>

        <UploadDishForm restaurantId={restaurant.id} />
      </div>
    </div>
  );
}