"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, QrCode, Box, Activity, Download, Zap } from "lucide-react";

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
            <div className="bg-terminal/95 backdrop-blur-sm border border-plasma/20 px-4 py-2.5 shadow-lg">
                <p className="text-body-xs font-mono text-text-tertiary mb-1">{label}</p>
                <p className="text-body-sm font-mono text-plasma font-bold">{payload[0].value} scans</p>
            </div>
        );
    }
    return null;
};

function SkeletonBox({ h = "h-48" }: { h?: string }) {
    return <div className={`${h} bg-surface/30 animate-pulse rounded`} />;
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

    // "Scan Velocity" — bar chart of last 7 days only
    const velocityData = chartData.slice(-7);

    const trend = report?.scanTrend ?? 0;
    const trendColor = trend >= 0 ? "text-success" : "text-ember";

    const deviceData = [
        { name: "Mobile", value: 72, color: "#D4AF37" },
        { name: "Desktop", value: 20, color: "#10B981" },
        { name: "Tablet", value: 8, color: "#6B7280" },
    ];

    const stats = [
        { label: "Total Scans", value: report?.totalScans ?? 0, color: "text-plasma", icon: Activity },
        { label: "Scan Trend", value: `${trend >= 0 ? "+" : ""}${trend}%`, color: trendColor, icon: trend >= 0 ? TrendingUp : TrendingDown },
        { label: "Active QR", value: report?.activeQRCodes ?? 0, color: "text-neon-violet", icon: QrCode },
        { label: "3D Coverage", value: `${report?.modelCoverage ?? 0}%`, color: "text-plasma", icon: Box },
        { label: "Avg Health", value: report?.avgHealthScore ?? 0, color: (report?.avgHealthScore ?? 0) >= 80 ? "text-success" : (report?.avgHealthScore ?? 0) >= 50 ? "text-amber-400" : "text-ember", icon: Zap },
        { label: "Total Dishes", value: report?.totalDishes ?? 0, color: "text-text-primary", icon: Box },
    ];

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <Link href="/dashboard" className="text-xs font-ui text-text-tertiary hover:text-plasma transition-colors tracking-widest uppercase">← Overview</Link>
                        <h1 className="text-display-lg font-display text-text-accent tracking-widest mt-2">Analytics</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            {(["7d", "30d", "90d"] as const).map((p) => (
                                <button key={p} onClick={() => setPeriod(p)}
                                    className={`px-4 py-2 border font-ui text-xs tracking-widest uppercase transition-all duration-200 ${period === p ? "border-plasma bg-plasma/10 text-plasma shadow-[0_0_12px_rgba(212,175,55,0.1)]" : "border-plasma/20 text-text-tertiary hover:border-plasma/40 hover:text-text-primary"}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-plasma/20 text-text-tertiary font-ui text-xs tracking-widest uppercase hover:border-plasma hover:text-plasma transition-all duration-200">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-plasma/10 bg-terminal/60 p-4 space-y-2 animate-pulse">
                                <div className="h-2.5 w-20 bg-surface/60 rounded" />
                                <div className="h-7 w-12 bg-surface/60 rounded" />
                            </div>
                        ))
                        : stats.map(({ label, value, color, icon: Icon }) => (
                            <div key={label} className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-4 group hover:border-plasma/30 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-[10px] font-ui text-text-tertiary tracking-widest uppercase">{label}</p>
                                    <Icon className="w-3 h-3 text-text-tertiary/30 group-hover:text-plasma/50 transition-colors" />
                                </div>
                                <p className={`text-display-sm font-display ${color} tracking-wider`}>{value}</p>
                            </div>
                        ))
                    }
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Area chart — 2/3 width */}
                    <div className="lg:col-span-2 relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                        <h2 className="text-body-xs font-ui text-text-accent tracking-widest uppercase mb-6">Daily Scans — {period}</h2>
                        {loading ? <SkeletonBox h="h-52" /> : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="aGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 4" stroke="#374151" strokeOpacity={0.4} vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.5 }} />
                                    <Area type="monotone" dataKey="scans" stroke="#D4AF37" strokeWidth={2} fill="url(#aGradient)" dot={false} activeDot={{ r: 4, fill: "#D4AF37", stroke: "#1a1400", strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-52 flex flex-col items-center justify-center gap-2">
                                <Activity className="w-8 h-8 text-text-tertiary/20" />
                                <p className="text-body-sm text-text-tertiary">No scan data available for this period</p>
                            </div>
                        )}
                    </div>

                    {/* Device Donut — 1/3 width */}
                    <div className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                        <h2 className="text-body-xs font-ui text-text-accent tracking-widest uppercase mb-6">Device Split</h2>
                        {loading ? <SkeletonBox h="h-52" /> : (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={deviceData} cx="50%" cy="45%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Legend formatter={(value) => <span style={{ color: "#6B7280", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{value}</span>} iconSize={6} iconType="circle" />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, ""]}
                                        contentStyle={{ backgroundColor: "#1a1400", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 0, fontSize: 11, fontFamily: "monospace" }}
                                        itemStyle={{ color: "#D4AF37" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Scan Velocity (Last 7 days bar chart) */}
                <div className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />
                    <h2 className="text-body-xs font-ui text-text-accent tracking-widest uppercase mb-6">Scan Velocity — Last 7 Days</h2>
                    {loading ? <SkeletonBox h="h-36" /> : velocityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={130}>
                            <BarChart data={velocityData} margin={{ top: 0, right: 5, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 4" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                                <Bar dataKey="scans" fill="#10B981" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-36 flex items-center justify-center">
                            <p className="text-body-sm text-text-tertiary">No recent scan data</p>
                        </div>
                    )}
                </div>

                {/* Dish performance table */}
                <div className="relative border border-plasma/10 bg-terminal/60 backdrop-blur-sm p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                    <h2 className="text-body-xs font-ui text-text-accent tracking-widest uppercase mb-5">Dish Performance</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-surface/30 animate-pulse rounded" />)}
                        </div>
                    ) : report?.topDishes && report.topDishes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-plasma/10">
                                        {["#", "Dish", "Scans", "Health", "3D"].map((h, i) => (
                                            <th key={h} className={`text-[10px] font-ui text-text-tertiary tracking-widest uppercase pb-3 ${i === 0 ? "text-left pr-4 w-8" : i === 1 ? "text-left pr-4" : "text-right pr-4"}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.topDishes.map((dish, i) => (
                                        <tr key={dish.id} className="border-b border-plasma/5 hover:bg-plasma/5 transition-colors">
                                            <td className="py-3 pr-4 text-xs font-mono text-text-tertiary/50">{i + 1}</td>
                                            <td className="py-3 pr-4 text-body-sm font-body text-text-primary">{dish.name}</td>
                                            <td className="py-3 pr-4 text-body-sm font-mono text-plasma text-right font-bold">{dish.scanCount}</td>
                                            <td className="py-3 pr-4 text-right">
                                                <span className={`text-body-xs font-mono ${dish.healthScore >= 80 ? "text-success" : dish.healthScore >= 50 ? "text-amber-400" : "text-ember"}`}>{dish.healthScore}</span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className={`px-2 py-0.5 border font-ui text-[10px] tracking-widest ${dish.hasModel ? "border-success/30 text-success bg-success/5" : "border-ember/20 text-ember/60"}`}>
                                                    {dish.hasModel ? "3D ✓" : "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center gap-2">
                            <Activity className="w-8 h-8 text-text-tertiary/20" />
                            <p className="text-body-sm text-text-tertiary">No dish data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
