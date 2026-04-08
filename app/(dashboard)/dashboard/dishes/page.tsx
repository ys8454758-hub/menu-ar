"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number | null;
  slug: string;
  isArchived: boolean;
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurantAndDishes();
  }, []);

  async function loadRestaurantAndDishes() {
    try {
      // First get the restaurant
      const restaurantsResponse = await fetch("/api/restaurants");
      if (restaurantsResponse.ok) {
        const restaurants = await restaurantsResponse.json();
        if (restaurants.length > 0) {
          const restaurant = restaurants[0];
          setRestaurantId(restaurant.id);

          // Then get dishes for this restaurant
          const dishesResponse = await fetch(`/api/dishes?restaurantId=${restaurant.id}`);
          if (dishesResponse.ok) {
            const dishesData = await dishesResponse.json();
            setDishes(dishesData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void p-6 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-terminal/50 rounded mb-4"></div>
          <div className="h-4 w-32 bg-terminal/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-display-lg font-display text-text-accent tracking-widest">
            Menu Items
          </h1>
          <Link
            href="/dashboard/dishes/new"
            className="rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
          >
            + Add Dish
          </Link>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 md:flex-1 lg:flex-auto">
            <input
              type="text"
              className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:shadow-[0_0_10px_var(--color-plasma-glow)]"
              placeholder="Search dishes..."
            />
          </div>
          <div className="flex-1 md:flex-3 lg:flex-none space-x-3">
            <button
              className="flex-1 rounded-none border border-plasma bg-transparent text-plasma px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors"
            >
              All
            </button>
            <button
              className="flex-1 rounded-none border border-plasma bg-transparent text-plasma px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors"
            >
              Active
            </button>
            <button
              className="flex-1 rounded-none border border-plasma bg-transparent text-plasma px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors"
            >
              Archived
            </button>
          </div>
        </div>

        {/* Dishes list */}
        <div className="space-y-4">
          {dishes.length > 0 ? (
            dishes.map((dish) => (
              <div
                key={dish.id}
                className="border border-border bg-terminal p-6 rounded-none"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-body-lg font-body text-text-primary mb-2">
                      {dish.name}
                    </h3>
                    {dish.description && (
                      <p className="text-body-sm font-body text-text-secondary mb-3">
                        {dish.description}
                      </p>
                    )}
                    {dish.price && (
                      <p className="text-body-md font-mono text-plasma">
                        ${dish.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="rounded-none border border-plasma text-plasma px-3 py-1 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors">
                      Edit
                    </button>
                    <button className="rounded-none border border-ember text-ember px-3 py-1 font-ui text-xs tracking-widest uppercase hover:bg-ember/10 transition-colors">
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-body-md font-body text-text-tertiary">
                No dishes found
              </p>
              <Link
                href="/dashboard/dishes/new"
                className="rounded-none bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors"
              >
                Add your first dish
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}