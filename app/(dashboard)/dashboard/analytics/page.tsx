"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, QrCode, Box, Activity, Download } from "lucide-react";

interface AnalyticsReport {
    totalScans: number;
    dailyScans: Record<string, number>;
    topDishes: { id: string; name: string; scanCount: number; healthScore: number; hasModel: boolean }[];
    activeQRCodes: number;
    totalDishes: number;
    dishesWithModels: number;
    modelCoverage: number;
    avgHealthScore: number;
    scanTrend: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border px-3 py-2 shadow-lg">
                <p className="text-body-xs font-mono text-text-tertiary mb-1">{label}</p>
                <p className="text-body-sm font-mono text-plasma">{payload[0].value} scans</p>
            </div>
        );
    }
    return null;
};

function SkeletonBox({ h = "h-48" }: { h?: string }) {
    return <div className={`${h} bg-surface skeleton`} />;
}

export default function AnalyticsPage() {
    const [report, setReport] = useState<AnalyticsReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30d");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadReport(); }, [period]);

    async function loadReport() {
        setLoading(true);
        try {
            const rRes = await fetch("/api/restaurants");
            if (rRes.ok) {
                const restaurants = await rRes.json();
                if (restaurants.length > 0) {
                    const aRes = await fetch(`/api/analytics/report?restaurantId=${restaurants[0].id}&period=${period}`);
                    if (aRes.ok) setReport(await aRes.json());
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    const chartData = report?.dailyScans
        ? Object.entries(report.dailyScans).map(([date, count]) => ({ date: date.slice(5), scans: count }))
        : [];

    const trend = report?.scanTrend ?? 0;
    const trendColor = trend >= 0 ? "text-success" : "text-ember";

    // Donut chart data for device breakdown (placeholder until API supports it)
    const deviceData = [
        { name: "Mobile", value: 72, color: "#D4AF37" },
        { name: "Desktop", value: 20, color: "#10B981" },
        { name: "Tablet", value: 8, color: "#9CA3AF" },
    ];

    const stats = [
        { label: "Total Scans", value: report?.totalScans ?? 0, color: "text-plasma", icon: Activity },
        { label: "Scan Trend", value: `${trend >= 0 ? "+" : ""}${trend}%`, color: trendColor, icon: trend >= 0 ? TrendingUp : TrendingDown },
        { label: "Active QR", value: report?.activeQRCodes ?? 0, color: "text-neon-violet", icon: QrCode },
        { label: "3D Coverage", value: `${report?.modelCoverage ?? 0}%`, color: "text-plasma", icon: Box },
        { label: "Avg Health", value: report?.avgHealthScore ?? 0, color: (report?.avgHealthScore ?? 0) >= 80 ? "text-success" : (report?.avgHealthScore ?? 0) >= 50 ? "text-amber-400" : "text-ember", icon: Activity },
        { label: "Total Dishes", value: report?.totalDishes ?? 0, color: "text-text-primary", icon: Box },
    ];

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors">← Overview</Link>
                        <h1 className="text-display-lg font-display text-text-accent tracking-widest mt-2">Analytics</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            {(["7d", "30d", "90d"] as const).map((p) => (
                                <button key={p} onClick={() => setPeriod(p)}
                                    className={`px-4 py-2 border font-ui text-sm tracking-widest uppercase transition-all duration-200 ${period === p ? "border-plasma bg-plasma/10 text-plasma" : "border-border text-text-tertiary hover:border-plasma/50"}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-border text-text-tertiary font-ui text-sm tracking-widest uppercase hover:border-plasma hover:text-plasma transition-all duration-200">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-border bg-terminal p-4 space-y-2">
                                <div className="h-3 w-20 bg-surface skeleton" />
                                <div className="h-7 w-12 bg-surface skeleton" />
                            </div>
                        ))
                        : stats.map(({ label, value, color, icon: Icon }) => (
                            <div key={label} className="border border-border bg-terminal p-4 group hover:border-plasma/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">{label}</p>
                                    <Icon className="w-3 h-3 text-text-tertiary/40 group-hover:text-plasma/40 transition-colors" />
                                </div>
                                <p className={`text-display-sm font-display ${color} mt-1`}>{value}</p>
                            </div>
                        ))
                    }
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area chart — takes 2/3 width */}
                    <div className="lg:col-span-2 border border-border bg-terminal p-6">
                        <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase mb-6">Daily Scans</h2>
                        {loading ? <SkeletonBox h="h-52" /> : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="aGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4" }} />
                                    <Area type="monotone" dataKey="scans" stroke="#D4AF37" strokeWidth={2} fill="url(#aGradient)" dot={false} activeDot={{ r: 4, fill: "#D4AF37", stroke: "#1a1400" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-52 flex flex-col items-center justify-center gap-2">
                                <Activity className="w-8 h-8 text-text-tertiary/30" />
                                <p className="text-body-sm text-text-tertiary">No scan data available for this period</p>
                            </div>
                        )}
                    </div>

                    {/* Device Donut — 1/3 width */}
                    <div className="border border-border bg-terminal p-6">
                        <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase mb-6">Devices</h2>
                        {loading ? <SkeletonBox h="h-52" /> : (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={deviceData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Legend
                                        formatter={(value) => <span style={{ color: "#9CA3AF", fontSize: "11px", fontFamily: "monospace" }}>{value}</span>}
                                        iconSize={8}
                                        iconType="circle"
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, ""]}
                                        contentStyle={{ backgroundColor: "#342900", border: "1px solid #374151", borderRadius: 0, fontSize: 12 }}
                                        itemStyle={{ color: "#D4AF37" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Dish performance table */}
                <div className="border border-border bg-terminal p-6">
                    <h2 className="text-body-lg font-ui text-text-accent tracking-widest uppercase mb-4">Dish Performance</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-surface skeleton" />)}
                        </div>
                    ) : report?.topDishes && report.topDishes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        {["#", "Dish", "Scans", "Health", "3D"].map((h, i) => (
                                            <th key={h} className={`text-body-xs font-ui text-text-tertiary tracking-widest uppercase pb-3 ${i === 0 ? "text-left pr-4 w-8" : i === 1 ? "text-left pr-4" : "text-right pr-4"}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.topDishes.map((dish, i) => (
                                        <tr key={dish.id} className="border-b border-border/30 hover:bg-surface/40 transition-colors">
                                            <td className="py-3 pr-4 text-body-sm font-mono text-text-tertiary">{i + 1}</td>
                                            <td className="py-3 pr-4 text-body-sm font-body text-text-primary">{dish.name}</td>
                                            <td className="py-3 pr-4 text-body-sm font-mono text-plasma text-right">{dish.scanCount}</td>
                                            <td className="py-3 pr-4 text-right">
                                                <span className={`text-body-sm font-mono ${dish.healthScore >= 80 ? "text-success" : dish.healthScore >= 50 ? "text-amber-400" : "text-ember"}`}>{dish.healthScore}</span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${dish.hasModel ? "border-success/50 text-success" : "border-ember/50 text-ember"}`}>
                                                    {dish.hasModel ? "3D" : "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center gap-2">
                            <Activity className="w-8 h-8 text-text-tertiary/30" />
                            <p className="text-body-sm text-text-tertiary">No dish data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}