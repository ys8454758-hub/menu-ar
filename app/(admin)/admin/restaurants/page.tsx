"use client";

import RestaurantTable from "@/components/admin/RestaurantTable";

export default function AdminRestaurantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md font-display text-text-accent tracking-widest">
          Restaurants
        </h1>
        <p className="text-body-sm font-body text-text-tertiary mt-1">
          Manage all registered restaurants
        </p>
      </div>

      <RestaurantTable />
    </div>
  );
}