"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Phone, Settings } from "lucide-react";

interface RestaurantDetail {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string;
  phone: string | null;
  isActive: boolean;
  isOnMap: boolean;
  owner: {
    email: string;
    name: string;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  _count: {
    dishes: number;
  };
  createdAt: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchRestaurant();
  }, [params.id]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch(`/api/admin/restaurants/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      }
    } catch (err) {
      console.error("Failed to fetch restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
    try {
      const res = await fetch(`/api/admin/impersonate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: params.id }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Failed to impersonate:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-tertiary">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Restaurant not found</p>
        <Link href="/admin/restaurants" className="text-plasma hover:underline mt-4 inline-block">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/restaurants"
            className="p-2 border border-border hover:border-plasma/50 text-text-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-display-md font-display text-text-accent tracking-widest">
              {restaurant.name}
            </h1>
            <p className="text-body-sm font-mono text-text-tertiary">{restaurant.slug}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 border text-body-xs font-ui uppercase tracking-wider ${
            restaurant.isActive
              ? "border-success/50 text-success"
              : "border-ember/50 text-ember"
          }`}
        >
          {restaurant.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border bg-terminal p-4 space-y-4">
          <h2 className="text-body-sm font-ui text-text-secondary uppercase tracking-wider">
            Restaurant Info
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-text-tertiary mt-0.5" />
              <div>
                <p className="text-body-sm font-body text-text-primary">{restaurant.address}</p>
                <p className="text-body-xs text-text-tertiary">{restaurant.city}</p>
              </div>
            </div>
            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-tertiary" />
                <a href={`tel:${restaurant.phone}`} className="text-body-sm text-plasma">
                  {restaurant.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="border border-border bg-terminal p-4 space-y-4">
          <h2 className="text-body-sm font-ui text-text-secondary uppercase tracking-wider">
            Owner
          </h2>
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-text-tertiary mt-0.5" />
            <div>
              <p className="text-body-sm font-body text-text-primary">
                {restaurant.owner.name || "N/A"}
              </p>
              <p className="text-body-xs text-text-tertiary">{restaurant.owner.email}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-body-xs text-text-tertiary">
              Joined: {new Date(restaurant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="border border-border bg-terminal p-4 space-y-4">
          <h2 className="text-body-sm font-ui text-text-secondary uppercase tracking-wider">
            Subscription
          </h2>
          {restaurant.subscription ? (
            <div className="space-y-2">
              <p className="text-body-md font-ui text-plasma uppercase">
                {restaurant.subscription.plan}
              </p>
              <p className="text-body-xs text-text-tertiary">
                Status: {restaurant.subscription.status}
              </p>
              {restaurant.subscription.currentPeriodEnd && (
                <p className="text-body-xs text-text-tertiary">
                  Renews: {new Date(restaurant.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-body-sm text-text-tertiary">No subscription</p>
          )}
        </div>
      </div>

      <div className="border border-border bg-terminal p-4 space-y-4">
        <h2 className="text-body-sm font-ui text-text-secondary uppercase tracking-wider">
          Quick Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-display-sm font-display text-plasma">
              {restaurant._count.dishes}
            </p>
            <p className="text-body-xs font-body text-text-tertiary">Dishes</p>
          </div>
          <div>
            <p className="text-body-sm font-body text-text-secondary">
              {restaurant.isOnMap ? "Yes" : "No"}
            </p>
            <p className="text-body-xs font-body text-text-tertiary">On Map</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleImpersonate}
          className="flex-1 bg-plasma text-void px-4 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90"
        >
          Impersonate Restaurant
        </button>
        <Link
          href={`/admin/restaurants/${params.id}/edit`}
          className="flex items-center gap-2 px-4 py-3 border border-border text-text-secondary hover:border-plasma/50"
        >
          <Settings className="w-4 h-4" />
          Edit Settings
        </Link>
      </div>
    </div>
  );
}