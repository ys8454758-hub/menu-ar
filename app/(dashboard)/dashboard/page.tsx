"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, QrCode, Box, Percent, Plus, Crop, BarChart2, UtensilsCrossed, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";

interface AnalyticsData {
    totalScans: number;
    dailyScans: Record<string, number>;
    topDishes: { id: string; name: string; scanCount: number; healthScore: number; hasModel: boolean }[];
    activeQRCodes: number;
    totalDishes: number;
    dishesWithModels: number;
    modelCoverage: number;
}

function StatCard({
    label,
    value,
    color,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    color: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className={`relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-5 group hover:border-plasma/30 transition-all duration-500 overflow-hidden`}>
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Ambient glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-plasma/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-start justify-between mb-3">
                <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-text-tertiary/40 group-hover:text-plasma/60 transition-colors duration-300" />}
            </div>
            <p className={`relative text-display-md font-display ${color} mt-1 tracking-wider`}>{value}</p>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="border border-plasma/10 bg-terminal/60 p-5 space-y-3 animate-pulse">
            <div className="h-3 w-24 bg-surface/80 rounded" />
            <div className="h-8 w-16 bg-surface/80 rounded" />
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-terminal/95 backdrop-blur-sm border border-plasma/20 px-4 py-2.5 shadow-lg">
                <p className="text-body-xs font-mono text-text-tertiary mb-1">{label}</p>
                <p className="text-body-sm font-mono text-plasma font-bold">{payload[0].value} scans</p>
            </div>
        );
    }
    return null;
};

const ONBOARDING_STEPS = [
    { id: "dish", label: "Add your first dish", href: "/dashboard/dishes/new", icon: UtensilsCrossed },
    { id: "qr", label: "Generate a QR code", href: "/dashboard/qr-studio", icon: QrCode },
    { id: "theme", label: "Set your menu theme", href: "/dashboard/menu-themes", icon: Crop },
    { id: "analytics", label: "Check your analytics", href: "/dashboard/analytics", icon: BarChart2 },
];

export default function DashboardHome() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30d");
    const [restaurantName, setRestaurantName] = useState("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadAnalytics(); }, [period]);

    async function loadAnalytics() {
        setLoading(true);
        try {
            const rRes = await fetch("/api/restaurants");
            if (rRes.ok) {
                const restaurants = await rRes.json();
                if (restaurants.length > 0) {
                    setRestaurantName(restaurants[0].name);
                    const aRes = await fetch(`/api/analytics/report?restaurantId=${restaurants[0].id}&period=${period}`);
                    if (aRes.ok) setAnalytics(await aRes.json());
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    const chartData = analytics?.dailyScans
        ? Object.entries(analytics.dailyScans).slice(-14).map(([date, count]) => ({
            date: date.slice(5),
            scans: count,
        }))
        : [];

    const isNewUser = !loading && (analytics?.totalDishes ?? 0) === 0;
    const completedSteps = new Set(
        isNewUser ? [] : [
            (analytics?.totalDishes ?? 0) > 0 ? "dish" : null,
            (analytics?.activeQRCodes ?? 0) > 0 ? "qr" : null,
            (analytics?.totalScans ?? 0) > 0 ? "analytics" : null,
        ].filter(Boolean)
    );

    return (
        <div className="min-h-screen p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Welcome back</p>
                    <h1 className="text-display-lg font-display text-text-accent tracking-widest">
                        {restaurantName || "Dashboard"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    {(["7d", "30d", "90d"] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-4 py-2 border font-ui text-xs tracking-widest uppercase transition-all duration-200 ${period === p ? "border-plasma bg-plasma/10 text-plasma shadow-[0_0_12px_rgba(212,175,55,0.1)]" : "border-plasma/20 text-text-tertiary hover:border-plasma/50 hover:text-text-primary"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Onboarding Checklist — only visible to new users */}
            {isNewUser && (
                <div className="relative border border-plasma/20 bg-terminal/40 backdrop-blur-sm p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/50 to-transparent" />
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-5 h-5 text-plasma" />
                        <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Get Started with Livin3D</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {ONBOARDING_STEPS.map((step, i) => {
                            const done = completedSteps.has(step.id);
                            return (
                                <Link key={step.id} href={step.href}
                                    className={`flex items-center gap-3 p-4 border transition-all duration-300 group ${done ? "border-success/30 bg-success/5" : "border-plasma/10 bg-surface/20 hover:border-plasma/30 hover:bg-plasma/5"}`}>
                                    <div className="flex-shrink-0">
                                        {done ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-text-tertiary/40 group-hover:text-plasma/60 transition-colors" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-ui text-text-tertiary tracking-widest uppercase mb-0.5">Step {i + 1}</p>
                                        <p className={`text-body-xs font-ui truncate ${done ? "text-success" : "text-text-primary"}`}>{step.label}</p>
                                    </div>
                                    {!done && <ArrowRight className="w-3 h-3 text-text-tertiary/40 group-hover:text-plasma transition-colors flex-shrink-0" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/dishes/new" className="flex items-center gap-2 bg-plasma text-void px-5 py-2.5 font-ui text-xs tracking-widest uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300">
                    <Plus className="w-4 h-4" /> Add Dish
                </Link>
                <Link href="/dashboard/qr-studio" className="flex items-center gap-2 border border-plasma/40 text-plasma px-5 py-2.5 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 hover:border-plasma transition-all duration-300">
                    <QrCode className="w-4 h-4" /> Generate QR
                </Link>
                <Link href="/dashboard/analytics" className="flex items-center gap-2 border border-plasma/10 text-text-secondary px-5 py-2.5 font-ui text-xs tracking-widest uppercase hover:border-plasma/30 hover:text-text-primary transition-all duration-300">
                    <BarChart2 className="w-4 h-4" /> Analytics
                </Link>
                <Link href="/dashboard/badges" className="flex items-center gap-2 border border-plasma/10 text-text-secondary px-5 py-2.5 font-ui text-xs tracking-widest uppercase hover:border-plasma/30 hover:text-text-primary transition-all duration-300">
                    <UtensilsCrossed className="w-4 h-4" /> Badges
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatCard label="Total Scans" value={analytics?.totalScans || 0} color="text-plasma" icon={TrendingUp} />
                        <StatCard label="Active QR Codes" value={analytics?.activeQRCodes || 0} color="text-neon-violet" icon={QrCode} />
                        <StatCard label="Total Dishes" value={analytics?.totalDishes || 0} color="text-text-primary" icon={Box} />
                        <StatCard label="3D Coverage" value={`${analytics?.modelCoverage || 0}%`} color="text-success" icon={Percent} />
                    </>
                )}
            </div>

            {/* Scan Activity Chart */}
            <div className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-body-sm font-ui text-text-accent tracking-widest uppercase">Scan Activity</h2>
                    {!loading && analytics && (
                        <span className="text-[10px] font-mono text-plasma border border-plasma/20 px-2 py-1">
                            {analytics.totalScans} total
                        </span>
                    )}
                </div>
                {loading ? (
                    <div className="h-48 bg-surface/30 animate-pulse rounded" />
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                            <defs>
                                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 4" stroke="#374151" strokeOpacity={0.4} vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.5 }} />
                            <Area type="monotone" dataKey="scans" stroke="#D4AF37" strokeWidth={2} fill="url(#scanGradient)" dot={false} activeDot={{ r: 4, fill: "#D4AF37", stroke: "#1a1400", strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center gap-3">
                        <BarChart2 className="w-8 h-8 text-text-tertiary/20" />
                        <p className="text-body-sm font-body text-text-tertiary text-center max-w-xs">No scan data yet — generate QR codes and share them with your customers.</p>
                        <Link href="/dashboard/qr-studio" className="text-plasma text-xs font-ui tracking-widest uppercase hover:underline">
                            Go to QR Studio →
                        </Link>
                    </div>
                )}
            </div>

            {/* Top Dishes */}
            <div className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-body-sm font-ui text-text-accent tracking-widest uppercase">Top Dishes</h2>
                    <Link href="/dashboard/dishes" className="text-xs font-ui text-plasma/70 hover:text-plasma transition-colors tracking-widest uppercase">View All →</Link>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 bg-surface/30 animate-pulse rounded" />
                        ))}
                    </div>
                ) : analytics?.topDishes && analytics.topDishes.length > 0 ? (
                    <div className="space-y-2">
                        {analytics.topDishes.slice(0, 5).map((dish, i) => (
                            <div key={dish.id} className="flex items-center gap-4 p-3.5 border border-plasma/5 bg-surface/10 hover:border-plasma/20 hover:bg-plasma/5 transition-all duration-300 group">
                                <span className="text-body-xs font-mono text-text-tertiary/50 w-4 text-right">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-body-sm font-body text-text-primary truncate group-hover:text-text-primary">{dish.name}</p>
                                    <p className="text-body-xs font-mono text-text-tertiary">{dish.scanCount} scans</p>
                                </div>
                                <span className={`px-2 py-0.5 border font-ui text-[10px] tracking-widest ${dish.hasModel ? "border-success/30 text-success bg-success/5" : "border-ember/30 text-ember bg-ember/5"}`}>
                                    {dish.hasModel ? "3D ✓" : "NO 3D"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-text-tertiary/20" />
                        <p className="text-body-sm font-body text-text-tertiary">No dishes yet</p>
                        <Link href="/dashboard/dishes/new" className="text-plasma text-xs font-ui tracking-widest uppercase hover:underline">
                            Add Your First Dish →
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                {[
                    { href: "/dashboard/dishes/new", icon: Plus, label: "Add Dish", desc: "Create a new menu item with 3D model", color: "plasma" },
                    { href: "/dashboard/qr-studio", icon: Crop, label: "QR Studio", desc: "Design and generate branded QR codes", color: "neon-violet" },
                    { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics", desc: "Detailed scan analytics and reports", color: "success" },
                ].map((card) => (
                    <Link key={card.href} href={card.href}
                        className={`relative border border-${card.color}/15 bg-${card.color}/5 p-6 hover:bg-${card.color}/10 hover:border-${card.color}/30 transition-all duration-300 group overflow-hidden`}>
                        <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-${card.color}/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className={`flex items-center gap-3 mb-2`}>
                            <card.icon className={`w-5 h-5 text-${card.color}`} />
                            <h3 className={`text-body-sm font-ui text-${card.color} tracking-widest uppercase`}>{card.label}</h3>
                        </div>
                        <p className="text-body-xs font-body text-text-tertiary relative">{card.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}