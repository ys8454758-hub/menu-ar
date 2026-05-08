"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  city: string;
  isActive: boolean;
  planId?: string;
  _count?: {
    dishes: number;
  };
  createdAt: string;
}

interface RestaurantTableProps {
  className?: string;
}

export default function RestaurantTable({ className }: RestaurantTableProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      }
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && r.isActive) ||
      (filter === "inactive" && !r.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full pl-10 pr-4 py-2 border border-border bg-surface text-text-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-2 text-body-xs font-ui uppercase tracking-wider",
                filter === f
                  ? "border border-plasma text-plasma"
                  : "border border-border text-text-secondary hover:border-plasma/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-tertiary">Loading...</div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  City
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Dishes
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-body-xs font-ui text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/restaurants/${restaurant.id}`}
                      className="text-body-sm font-ui text-text-accent hover:text-plasma"
                    >
                      {restaurant.name}
                    </Link>
                    <p className="text-body-xs font-mono text-text-tertiary">{restaurant.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-text-secondary">
                    {restaurant.city}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-text-secondary">
                    {restaurant.planId || "Free"}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-mono text-text-secondary">
                    {restaurant._count?.dishes || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-body-xs font-ui uppercase tracking-wider",
                        restaurant.isActive
                          ? "border border-success/50 text-success"
                          : "border border-ember/50 text-ember"
                      )}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/restaurants/${restaurant.id}`}
                      className="inline-flex items-center gap-1 text-body-xs font-ui text-text-secondary hover:text-plasma"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}