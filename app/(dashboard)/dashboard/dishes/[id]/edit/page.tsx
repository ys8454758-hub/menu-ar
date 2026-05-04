"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface DishData {
    id: string; name: string; description: string; price: number | null;
    slug: string; isArchived: boolean;
    model: { id: string; fileUrl: string; fileSizeKb: number } | null;
    qrCode: { id: string; targetUrl: string; reliabilityScore: number } | null;
    nutrition: {
        calories: number; protein: number; carbs: number; fat: number;
        fiber: number; sodium: number; sugar: number;
        servingSize: number | null; servingUnit: string | null;
        allergens: { name: string }[];
    } | null;
    badges: { type: string }[];
    ingredients: { name: string }[];
}

const BADGE_OPTIONS = [
    "VEGAN", "VEGETARIAN", "GLUTEN_FREE", "SPICY", "DAIRY_FREE",
    "NUT_FREE", "ORGANIC", "SUGAR_FREE", "KETO", "HALAL", "JAIN",
];

export default function EditDishPage() {
    const params = useParams();
    const router = useRouter();
    const dishId = params.id as string;

    const [dish, setDish] = useState<DishData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
    const [ingredientsText, setIngredientsText] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [fiber, setFiber] = useState("");
    const [allergensText, setAllergensText] = useState("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadDish(); }, [dishId]);

    async function loadDish() {
        try {
            const res = await fetch(`/api/dishes/${dishId}`);
            if (res.ok) {
                const data: DishData = await res.json();
                setDish(data);
                setName(data.name);
                setDescription(data.description || "");
                setPrice(data.price?.toString() || "");
                setSelectedBadges(data.badges.map((b) => b.type));
                setIngredientsText(data.ingredients.map((i) => i.name).join(", "));
                if (data.nutrition) {
                    setCalories(data.nutrition.calories?.toString() || "");
                    setProtein(data.nutrition.protein?.toString() || "");
                    setCarbs(data.nutrition.carbs?.toString() || "");
                    setFat(data.nutrition.fat?.toString() || "");
                    setFiber(data.nutrition.fiber?.toString() || "");
                    setAllergensText(data.nutrition.allergens.map((a) => a.name).join(", "));
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch(`/api/dishes/${dishId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, description, price: price ? parseFloat(price) : null,
                    badges: selectedBadges,
                    ingredients: ingredientsText.split(",").map((s) => s.trim()).filter(Boolean),
                    nutrition: {
                        calories: calories ? parseFloat(calories) : null,
                        protein: protein ? parseFloat(protein) : null,
                        carbs: carbs ? parseFloat(carbs) : null,
                        fat: fat ? parseFloat(fat) : null,
                        fiber: fiber ? parseFloat(fiber) : null,
                        allergens: allergensText.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                }),
            });
            if (res.ok) router.push("/dashboard/dishes");
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    }

    async function handleModelUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("dishId", dishId);
            const res = await fetch("/api/models/upload", { method: "POST", body: formData });
            if (res.ok) loadDish();
        } catch (err) { console.error(err); }
        finally { setUploading(false); }
    }

    function toggleBadge(badge: string) {
        setSelectedBadges((prev) =>
            prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen   p-6 flex items-center justify-center">
                <div className="animate-pulse h-8 w-64 bg-terminal/50 rounded-none"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen   p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard/dishes" className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors">← Back to Menu</Link>
                        <h1 className="text-display-lg font-display text-text-accent tracking-widest mt-2">Edit Dish</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                        className="rounded-none bg-plasma text-void px-6 py-2 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Basic Info */}
                <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Basic Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary focus:border-plasma outline-none" />
                        </div>
                        <div>
                            <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Price (₹)</label>
                            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary focus:border-plasma outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                            className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary focus:border-plasma outline-none resize-none" />
                    </div>
                    <div>
                        <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Ingredients (comma-separated)</label>
                        <input type="text" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)}
                            className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary focus:border-plasma outline-none"
                            placeholder="Tomato, Basil, Mozzarella..." />
                    </div>
                </div>

                {/* Badges */}
                <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Badges</h2>
                    <div className="flex flex-wrap gap-2">
                        {BADGE_OPTIONS.map((badge) => (
                            <button key={badge} onClick={() => toggleBadge(badge)}
                                className={`px-3 py-1.5 border font-ui text-xs tracking-widest uppercase transition-colors rounded-none ${selectedBadges.includes(badge) ? "border-plasma bg-plasma/10 text-plasma" : "border-border text-text-tertiary hover:border-plasma/50"
                                    }`}>
                                {badge.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nutrition */}
                <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Nutrition</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Calories", value: calories, setter: setCalories },
                            { label: "Protein (g)", value: protein, setter: setProtein },
                            { label: "Carbs (g)", value: carbs, setter: setCarbs },
                            { label: "Fat (g)", value: fat, setter: setFat },
                            { label: "Fiber (g)", value: fiber, setter: setFiber },
                        ].map((field) => (
                            <div key={field.label}>
                                <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">{field.label}</label>
                                <input type="number" value={field.value} onChange={(e) => field.setter(e.target.value)}
                                    className="w-full rounded-none border border-border bg-surface px-3 py-2 text-text-primary focus:border-plasma outline-none" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Allergens (comma-separated)</label>
                        <input type="text" value={allergensText} onChange={(e) => setAllergensText(e.target.value)}
                            className="w-full rounded-none border border-border bg-surface px-4 py-2 text-text-primary focus:border-plasma outline-none"
                            placeholder="Peanuts, Dairy, Gluten..." />
                    </div>
                </div>

                {/* 3D Model */}
                <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">3D Model</h2>
                    {dish?.model ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-body-sm font-body text-text-primary">Model uploaded</p>
                                <p className="text-body-xs font-mono text-text-tertiary">{dish.model.fileSizeKb} KB</p>
                            </div>
                            <label className="rounded-none border border-plasma text-plasma px-4 py-2 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors cursor-pointer">
                                Replace Model
                                <input type="file" accept=".glb,.gltf" onChange={handleModelUpload} className="hidden" disabled={uploading} />
                            </label>
                        </div>
                    ) : (
                        <div className="text-center py-8 border border-dashed border-border">
                            <p className="text-body-sm font-body text-text-tertiary mb-4">No 3D model uploaded</p>
                            <label className="inline-block rounded-none bg-plasma text-void px-4 py-2 font-ui text-xs tracking-widest uppercase hover:bg-plasma/90 transition-colors cursor-pointer">
                                {uploading ? "Uploading..." : "Upload GLB"}
                                <input type="file" accept=".glb,.gltf" onChange={handleModelUpload} className="hidden" disabled={uploading} />
                            </label>
                        </div>
                    )}
                </div>

                {/* QR Code */}
                <div className="border border-border bg-terminal p-6 rounded-none space-y-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">QR Code</h2>
                    {dish?.qrCode ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-body-sm font-body text-text-primary">QR code active</p>
                                <p className="text-body-xs font-mono text-text-tertiary">Reliability: {dish.qrCode.reliabilityScore}%</p>
                            </div>
                            <Link href={`/dashboard/qr-studio?dishId=${dishId}`}
                                className="rounded-none border border-neon-violet text-neon-violet px-4 py-2 font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/10 transition-colors">
                                Open QR Studio
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8 border border-dashed border-border">
                            <p className="text-body-sm font-body text-text-tertiary mb-4">No QR code generated</p>
                            <Link href={`/dashboard/qr-studio?dishId=${dishId}`}
                                className="inline-block rounded-none bg-neon-violet text-void px-4 py-2 font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/90 transition-colors">
                                Generate QR Code
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}