import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '@/types';

export function useRestaurantSettings() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [form, setForm] = useState({ name: "", address: "", phone: "", whatsapp: "" });

    const showToast = useCallback((type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const loadRestaurant = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/restaurants");
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    const r = data[0];
                    setRestaurant(r);
                    setForm({ 
                        name: r.name || "", 
                        address: r.address || "", 
                        phone: r.phone || "", 
                        whatsapp: r.whatsapp || "" 
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRestaurant();
    }, [loadRestaurant]);

    const saveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!restaurant) return;
        setSaving(true);
        try {
            const res = await fetch("/api/restaurants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ restaurantId: restaurant.id, ...form }),
            });
            if (res.ok) {
                const updated = await res.json();
                setRestaurant(prev => ({ ...prev!, ...updated }));
                showToast("success", "Settings saved successfully!");
                return true;
            } else {
                showToast("error", "Failed to save settings. Please try again.");
                return false;
            }
        } catch {
            showToast("error", "Network error — changes not saved.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const updateImageField = (field: keyof Restaurant, url: string) => {
        setRestaurant(prev => prev ? { ...prev, [field]: url || null } : prev);
        showToast("success", "Image updated successfully!");
    };

    return {
        restaurant,
        loading,
        saving,
        toast,
        form,
        setForm,
        saveSettings,
        updateImageField,
        refresh: loadRestaurant
    };
}
