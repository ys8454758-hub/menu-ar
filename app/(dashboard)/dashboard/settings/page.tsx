"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ImageIcon, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

import ProfileSettings from "@/components/settings/ProfileSettings";
import BrandingSettings from "@/components/settings/BrandingSettings";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Restaurant } from "@/types";

type TabId = "profile" | "branding" | "billing";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Restaurant Profile", icon: Building2 },
    { id: "branding", label: "Branding & Media", icon: ImageIcon },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const { 
        restaurant, 
        loading, 
        saving, 
        toast, 
        form, 
        setForm, 
        saveSettings, 
        updateImageField 
    } = useRestaurantSettings();

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="h-10 w-48 bg-terminal/50 animate-pulse rounded" />
                    <div className="h-80 bg-terminal/50 border border-border animate-pulse rounded-lg" />
                </div>
            </div>
        );
    }

    const handleImageUpload = (field: "logoUrl" | "coverImageUrl" | "bannerUrl") => (url: string) => {
        updateImageField(field, url);
    };

    return (
        <div className="min-h-screen p-6">
            {/* Notification Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-4 px-6 py-4 border shadow-2xl backdrop-blur-md rounded-xl transition-all animate-in slide-in-from-bottom-5 ${
                    toast.type === "success" ? "border-success/40 bg-success/10 text-success" : "border-ember/40 bg-ember/10 text-ember"
                }`}>
                    {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-body-sm font-ui tracking-widest uppercase font-bold">{toast.msg}</span>
                </div>
            )}

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-display-lg font-display text-text-accent tracking-widest uppercase">Settings</h1>
                        <p className="text-body-xs font-mono text-text-tertiary mt-2">
                            {restaurant?.slug ? `Active Slug: /${restaurant.slug}` : "Configure your restaurant's presence"}
                        </p>
                    </div>
                    <Link href="/dashboard/dishes/new"
                        className="bg-void border border-plasma text-plasma px-6 py-2 font-ui text-[10px] tracking-[0.2em] uppercase hover:bg-plasma hover:text-void transition-all rounded-md font-bold">
                        + New Dish
                    </Link>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-border/50">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button 
                            key={id} 
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-3 px-6 py-4 font-ui text-[11px] tracking-widest uppercase transition-all border-b-2 -mb-px ${
                                activeTab === id
                                    ? "border-plasma text-plasma font-bold"
                                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {!restaurant ? (
                        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-terminal/20">
                            <Building2 className="w-12 h-12 text-text-tertiary/20 mx-auto mb-4" />
                            <p className="text-body-sm text-text-tertiary uppercase tracking-widest">No restaurant data found</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "profile" && (
                                <ProfileSettings 
                                    form={form} 
                                    setForm={setForm} 
                                    onSave={saveSettings} 
                                    saving={saving} 
                                />
                            )}

                            {activeTab === "branding" && (
                                <BrandingSettings 
                                    restaurant={restaurant} 
                                    onImageUpload={handleImageUpload} 
                                />
                            )}

                            {activeTab === "billing" && (
                                <BillingInfo restaurant={restaurant} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Internal sub-component for billing (to keep file structure clean)
function BillingInfo({ restaurant }: { restaurant: Restaurant }) {
    return (
        <div className="border border-border bg-terminal p-8 space-y-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-6 bg-surface border border-border rounded-xl">
                <div>
                    <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Current Plan</p>
                    <p className="text-display-md font-display text-plasma">{restaurant.subscription?.plan ?? "STARTER"}</p>
                </div>
                <span className={`px-4 py-1.5 border font-ui text-[10px] tracking-widest uppercase rounded-full font-bold ${
                    restaurant.subscription?.status === "ACTIVE" ? "border-success/50 bg-success/5 text-success" : "border-ember/50 bg-ember/5 text-ember"
                }`}>
                    {restaurant.subscription?.status ?? "ACTIVE"}
                </span>
            </div>

            <div className="space-y-4">
                {[
                    { label: "Dishes Allowed", value: restaurant.subscription?.plan === "PRO" ? "Unlimited" : restaurant.subscription?.plan === "GROWTH" ? "50" : "10" },
                    { label: "QR Design Studio", value: restaurant.subscription?.plan !== "STARTER" ? "Included" : "Limited" },
                    { label: "Analytics Retention", value: restaurant.subscription?.plan === "PRO" ? "12 months" : restaurant.subscription?.plan === "GROWTH" ? "90 days" : "30 days" },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                        <span className="text-body-sm font-ui text-text-secondary tracking-wide">{label}</span>
                        <span className="text-body-sm font-mono text-plasma font-bold">{value}</span>
                    </div>
                ))}
            </div>

            <Link href="/register?plan=growth"
                className="block text-center bg-plasma text-void px-8 py-4 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-all rounded-lg font-bold">
                Upgrade Workspace
            </Link>
        </div>
    );
}