"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import DishCard from "@/components/dashboard/DishCard";
import DishGridCard from "@/components/dashboard/DishGridCard";
import { computeDishHealthScore } from "@/lib/health-score";
import { LayoutList, LayoutGrid, Plus, Search, UtensilsCrossed } from "lucide-react";

interface Dish {
  id: string; name: string; description: string; price: number | null;
  slug: string; isArchived: boolean; updatedAt: string;
  model: { id: string; qualityRating: number | null } | null;
  qrCode: { id: string } | null;
  badges: { type: string }[];
  scanEvents: { id: string }[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number; sugar: number } | null;
}

type FilterMode = "all" | "active" | "archived";
type SortMode = "name" | "health" | "scans" | "price";
type ViewMode = "list" | "grid";

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("active");
  const [sort, setSort] = useState<SortMode>("name");
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => { loadDishes(); }, []);

  async function loadDishes() {
    try {
      const res = await fetch("/api/restaurants");
      if (res.ok) {
        const restaurants = await res.json();
        if (restaurants.length > 0) {
          const dRes = await fetch(`/api/dishes?restaurantId=${restaurants[0].id}`);
          if (dRes.ok) setDishes(await dRes.json());
        }
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  const filteredDishes = useMemo(() => {
    let result = dishes;
    if (filter === "active") result = result.filter((d) => !d.isArchived);
    else if (filter === "archived") result = result.filter((d) => d.isArchived);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      switch (sort) {
        case "health": return computeDishHealthScore(b) - computeDishHealthScore(a);
        case "scans": return b.scanEvents.length - a.scanEvents.length;
        case "price": return (b.price || 0) - (a.price || 0);
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [dishes, filter, search, sort]);

  const handleArchive = (id: string) => setDishes((prev) => prev.map((d) => d.id === id ? { ...d, isArchived: true } : d));
  const handleRestore = (id: string) => setDishes((prev) => prev.map((d) => d.id === id ? { ...d, isArchived: false } : d));

  const activeCount = dishes.filter((d) => !d.isArchived).length;
  const archivedCount = dishes.filter((d) => d.isArchived).length;
  const avgHealth = dishes.length > 0 ? Math.round(dishes.reduce((s, d) => s + computeDishHealthScore(d), 0) / dishes.length) : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lg font-display text-text-accent tracking-widest">Menu Items</h1>
            <p className="text-body-sm font-mono text-text-tertiary mt-1">
              {activeCount} active · {archivedCount} archived · avg health {avgHealth}
            </p>
          </div>
          <Link href="/dashboard/dishes/new"
            className="flex items-center gap-2 bg-plasma text-void px-4 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 hover:shadow-plasma-glow transition-all duration-300">
            <Plus className="w-4 h-4" />
            Add Dish
          </Link>
        </div>

        {/* Stat mini-cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border bg-terminal p-4 space-y-2">
              <div className="h-3 w-16 bg-surface skeleton" /><div className="h-7 w-10 bg-surface skeleton" />
            </div>
          )) : (
            <>
              {[
                { label: "Total", value: dishes.length, color: "text-text-primary" },
                { label: "With 3D", value: dishes.filter((d) => d.model).length, color: "text-plasma" },
                { label: "With QR", value: dishes.filter((d) => d.qrCode).length, color: "text-neon-violet" },
                { label: "Avg Health", value: avgHealth, color: avgHealth >= 80 ? "text-success" : avgHealth >= 50 ? "text-amber-400" : "text-ember" },
              ].map(({ label, value, color }) => (
                <div key={label} className="border border-border bg-terminal p-4 hover:border-plasma/30 transition-colors">
                  <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">{label}</p>
                  <p className={`text-display-sm font-display ${color} mt-1`}>{value}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border bg-surface pl-10 pr-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-plasma focus:outline-none transition-colors"
              placeholder="Search dishes..."
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "active", "archived"] as FilterMode[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 border font-ui text-sm tracking-widest uppercase transition-all duration-200 ${filter === f ? "border-plasma bg-plasma/10 text-plasma" : "border-border text-text-tertiary hover:border-plasma/50 hover:text-text-primary"}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}
              className="border border-border bg-surface px-3 py-2 text-text-primary font-ui text-sm outline-none focus:border-plasma appearance-none cursor-pointer">
              <option value="name">Name</option>
              <option value="health">Health Score</option>
              <option value="scans">Most Scanned</option>
              <option value="price">Price</option>
            </select>

            {/* View toggle */}
            <div className="flex border border-border">
              <button onClick={() => setView("list")}
                className={`px-3 py-2 transition-colors ${view === "list" ? "bg-plasma/10 text-plasma" : "text-text-tertiary hover:text-text-primary"}`}
                aria-label="List view">
                <LayoutList className="w-4 h-4" />
              </button>
              <button onClick={() => setView("grid")}
                className={`px-3 py-2 transition-colors border-l border-border ${view === "grid" ? "bg-plasma/10 text-plasma" : "text-text-tertiary hover:text-text-primary"}`}
                aria-label="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dish list/grid */}
        {loading ? (
          view === "list" ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-terminal border border-border skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 bg-terminal border border-border skeleton" />)}
            </div>
          )
        ) : filteredDishes.length > 0 ? (
          view === "list" ? (
            <div className="space-y-3">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} id={dish.id} name={dish.name} description={dish.description}
                  price={dish.price} slug={dish.slug} isArchived={dish.isArchived}
                  hasModel={!!dish.model} hasQR={!!dish.qrCode}
                  healthScore={computeDishHealthScore(dish)} scanCount={dish.scanEvents.length}
                  onArchive={handleArchive} onRestore={handleRestore} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish) => (
                <DishGridCard key={dish.id} id={dish.id} name={dish.name} description={dish.description}
                  price={dish.price} slug={dish.slug} isArchived={dish.isArchived}
                  hasModel={!!dish.model} hasQR={!!dish.qrCode}
                  healthScore={computeDishHealthScore(dish)} scanCount={dish.scanEvents.length}
                  onArchive={handleArchive} onRestore={handleRestore} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 border border-border bg-terminal">
            <UtensilsCrossed className="w-12 h-12 text-text-tertiary/30 mx-auto mb-4" />
            <p className="text-body-md font-body text-text-tertiary mb-6">
              {search ? `No dishes matching "${search}"` : "No dishes found"}
            </p>
            {!search && (
              <Link href="/dashboard/dishes/new"
                className="inline-flex items-center gap-2 bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add your first dish
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}