"use client";

import { useState, useEffect } from "react";
import ModelSizeControl from "@/components/admin/ModelSizeControl";
import NutritionBulkImport from "@/components/admin/NutritionBulkImport";
import QRRedirectManager from "@/components/admin/QRRedirectManager";

interface Dish {
  id: string;
  name: string;
  slug: string;
  restaurant: { id: string; name: string; slug: string };
  model: { id: string; scaleX: number; scaleY: number; scaleZ: number; arSizeLocked: boolean } | null;
  nutrition: Record<string, number> | null;
  qrCode: { id: string; redirectUrl: string | null } | null;
}

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [view, setView] = useState<"list" | "models" | "nutrition" | "qr">("list");

  useEffect(() => {
    loadDishes();
  }, []);

  async function loadDishes() {
    try {
      const res = await fetch("/api/admin/dishes");
      if (res.ok) {
        const data = await res.json();
        setDishes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleModelSizeSave = async (data: { scaleX: number; scaleY: number; scaleZ: number; note?: string }) => {
    if (!selectedDish?.model) return;

    await fetch("/api/admin/model-size", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelId: selectedDish.model.id,
        ...data,
      }),
    });

    setSelectedDash(null);
  };

  const handleQrRedirectSave = async (redirectUrl: string) => {
    if (!selectedDish?.qrCode) return;

    await fetch(`/api/admin/qr/${selectedDish.qrCode.id}/redirect`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUrl }),
    });
  };

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.restaurant.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-pulse h-8 w-64 bg-terminal/50 rounded-none"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lg font-display text-text-accent tracking-widest">All Dishes</h1>
            <p className="text-body-sm font-mono text-text-tertiary mt-1">
              {dishes.length} dishes across all restaurants
            </p>
          </div>
          <div className="flex gap-2">
            {(["list", "models", "nutrition", "qr"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 border font-ui text-sm tracking-widest uppercase rounded-none transition-colors ${
                  view === v
                    ? "border-plasma bg-plasma/10 text-plasma"
                    : "border-border text-text-tertiary hover:border-plasma/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes..."
          className="w-full md:w-96 rounded-none border border-border bg-surface px-4 py-2 text-text-primary outline-none focus:border-plasma"
        />

        {/* Content */}
        {view === "list" && (
          <div className="space-y-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="border border-border bg-terminal p-4 rounded-none flex items-center justify-between"
              >
                <div>
                  <h3 className="text-body-md font-body text-text-primary">{dish.name}</h3>
                  <p className="text-body-xs font-mono text-text-tertiary">
                    {dish.restaurant.name} • {dish.slug}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${
                      dish.model
                        ? "border-success/50 text-success"
                        : "border-ember/50 text-ember"
                    }`}
                  >
                    {dish.model ? "3D" : "NO 3D"}
                  </span>
                  <span
                    className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${
                      dish.qrCode
                        ? "border-plasma/50 text-plasma"
                        : "border-ember/50 text-ember"
                    }`}
                  >
                    {dish.qrCode ? "QR" : "NO QR"}
                  </span>
                  <button
                    onClick={() => setSelectedDish(dish)}
                    className="rounded-none border border-plasma text-plasma px-3 py-1 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "models" && selectedDish?.model && (
          <ModelSizeControl
            modelId={selectedDish.model.id}
            dishName={selectedDish.name}
            currentScale={{
              x: selectedDish.model.scaleX,
              y: selectedDish.model.scaleY,
              z: selectedDish.model.scaleZ,
            }}
            currentDimensions={{}}
            arSizeLocked={selectedDish.model.arSizeLocked}
            onSave={handleModelSizeSave}
          />
        )}

        {view === "nutrition" && selectedDish && (
          <NutritionBulkImport
            restaurantId={selectedDish.restaurant.id}
            onSuccess={() => {}}
          />
        )}

        {view === "qr" && selectedDish?.qrCode && (
          <QRRedirectManager
            qrCodeId={selectedDish.qrCode.id}
            currentRedirect={selectedDish.qrCode.redirectUrl}
            dishName={selectedDish.name}
            onSave={handleQrRedirectSave}
          />
        )}
      </div>
    </div>
  );
}
