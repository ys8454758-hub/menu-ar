"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, QrCode, Box, Percent, Plus, Crop, BarChart2 } from "lucide-react";

interface AnalyticsData {
    totalScans: number;
    dailyScans: Record<string, number>;
    topDishes: { id: string; name: string; scanCount: number; healthScore: number; hasModel: boolean }[];
    activeQRCodes: number;
    totalDishes: number;
    dishesWithModels: number;
    modelCoverage: number;
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon?: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="border border-border bg-terminal p-5 group hover:border-plasma/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-text-tertiary/50 group-hover:text-plasma/50 transition-colors" />}
            </div>
            <p className={`text-display-md font-display ${color} mt-2`}>{value}</p>
        </div>
    );
}

function SkeletonCard() {
    return <div className="border border-border bg-terminal p-5 space-y-3">
        <div className="h-3 w-24 bg-surface skeleton" />
        <div className="h-8 w-16 bg-surface skeleton" />
    </div>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border px-3 py-2">
                <p className="text-body-xs font-mono text-text-tertiary">{label}</p>
                <p className="text-body-sm font-mono text-plasma">{payload[0].value} scans</p>
            </div>
        );
    }
    return null;
};

export default function DashboardHome() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30d");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadAnalytics(); }, [period]);

    async function loadAnalytics() {
        setLoading(true);
        try {
            const rRes = await fetch("/api/restaurants");
            if (rRes.ok) {
                const restaurants = await rRes.json();
                if (restaurants.length > 0) {
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

    return (
        <div className="min-h-screen p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-lg font-display text-text-accent tracking-widest">Dashboard</h1>
                    <p className="text-body-sm font-mono text-text-tertiary mt-1">Your restaurant at a glance</p>
                </div>
                <div className="flex gap-2">
                    {(["7d", "30d", "90d"] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-4 py-2 border font-ui text-sm tracking-widest uppercase transition-all duration-200 ${period === p ? "border-plasma bg-plasma/10 text-plasma" : "border-border text-text-tertiary hover:border-plasma/50 hover:text-text-primary"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat cards */}
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
            <div className="border border-border bg-terminal p-6">
                <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase mb-6">Scan Activity</h2>
                {loading ? (
                    <div className="h-48 bg-surface skeleton" />
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                            <defs>
                                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4" }} />
                            <Area type="monotone" dataKey="scans" stroke="#D4AF37" strokeWidth={2} fill="url(#scanGradient)" dot={false} activeDot={{ r: 4, fill: "#D4AF37", stroke: "#1a1400" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center gap-3">
                        <BarChart2 className="w-8 h-8 text-text-tertiary/40" />
                        <p className="text-body-sm font-body text-text-tertiary">No scan data yet — generate QR codes and share them!</p>
                    </div>
                )}
            </div>

            {/* Top Dishes */}
            <div className="border border-border bg-terminal p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">Top Dishes</h2>
                    <Link href="/dashboard/dishes" className="text-body-sm font-ui text-plasma hover:text-plasma/80 transition-colors">View All →</Link>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 bg-surface skeleton" />
                        ))}
                    </div>
                ) : analytics?.topDishes && analytics.topDishes.length > 0 ? (
                    <div className="space-y-2">
                        {analytics.topDishes.slice(0, 5).map((dish, i) => (
                            <div key={dish.id} className="flex items-center gap-4 p-3 border border-border/50 bg-surface hover:border-plasma/30 transition-colors">
                                <span className="text-display-sm font-display text-text-tertiary w-6 text-center">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-body-md font-body text-text-primary truncate">{dish.name}</p>
                                    <p className="text-body-xs font-mono text-text-tertiary">{dish.scanCount} scans · Health: {dish.healthScore}</p>
                                </div>
                                <span className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${dish.hasModel ? "border-success/50 text-success" : "border-ember/50 text-ember"}`}>
                                    {dish.hasModel ? "3D" : "NO 3D"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 flex flex-col items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-text-tertiary/40" />
                        <p className="text-body-sm font-body text-text-tertiary">No scan data yet</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/dishes/new" className="border border-plasma bg-plasma/5 p-6 hover:bg-plasma/10 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-2">
                        <Plus className="w-5 h-5 text-plasma" />
                        <h3 className="text-body-lg font-ui text-plasma tracking-widest uppercase">Add Dish</h3>
                    </div>
                    <p className="text-body-sm font-body text-text-tertiary">Create a new menu item with 3D model</p>
                </Link>
                <Link href="/dashboard/qr-studio" className="border border-neon-violet bg-neon-violet/5 p-6 hover:bg-neon-violet/10 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-2">
                        <Crop className="w-5 h-5 text-neon-violet" />
                        <h3 className="text-body-lg font-ui text-neon-violet tracking-widest uppercase">QR Studio</h3>
                    </div>
                    <p className="text-body-sm font-body text-text-tertiary">Design and generate QR codes</p>
                </Link>
                <Link href="/dashboard/analytics" className="border border-success bg-success/5 p-6 hover:bg-success/10 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart2 className="w-5 h-5 text-success" />
                        <h3 className="text-body-lg font-ui text-success tracking-widest uppercase">Analytics</h3>
                    </div>
                    <p className="text-body-sm font-body text-text-tertiary">Detailed scan analytics and reports</p>
                </Link>
            </div>
        </div>
    );
}