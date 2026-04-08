import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function SettingsPage() {
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

  return (
    <div className="min-h-screen bg-void">
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-display-lg font-display text-text-accent tracking-widest">
            Restaurant Settings
          </h1>
          <Link
            href="/dashboard/dishes/new"
            className="rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
          >
            Add First Dish
          </Link>
        </div>

        {restaurant ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-body-lg font-body text-text-primary">
                Restaurant Information
              </h2>

              <div className="space-y-3">
                <label className="text-body-sm font-body text-text-secondary">
                  Restaurant Name
                </label>
                <p className="text-body-md font-mono text-text-primary">
                  {restaurant.name}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-body-sm font-body text-text-secondary">
                  Slug
                </label>
                <p className="text-body-md font-mono text-text-secondary">
                  {restaurant.slug}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-body-sm font-body text-text-secondary">
                  Phone
                </label>
                <p className="text-body-md font-mono text-text-primary">
                  {restaurant.phone || "Not set"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-body-sm font-body text-text-secondary">
                  WhatsApp
                </label>
                <p className="text-body-md font-mono text-text-primary">
                  {restaurant.whatsapp || "Not set"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-body-sm font-body text-text-secondary">
                  Address
                </label>
                <p className="text-body-md font-mono text-text-primary">
                  {restaurant.address || "Not set"}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h2 className="text-body-lg font-body text-text-primary">
                Subscription & Billing
              </h2>
              <div className="space-y-3">
                <p className="text-body-sm font-body text-text-secondary">
                  Status: Active
                </p>
                <p className="text-body-sm font-body text-text-secondary">
                  Plan: Starter
                </p>
                <p className="text-body-sm font-body text-text-secondary">
                  Next billing: Calculating...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-body-lg font-body text-text-secondary">
              No restaurant found. Please complete setup.
            </p>
            <Link
              href="/"
              className="mt-4 rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
            >
              Go to Setup Wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}