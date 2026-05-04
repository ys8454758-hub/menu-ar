"use client";

import { useEffect, useState } from "react";

export interface QRScanStats {
    totalScans: number;
    uniqueScans: number;
    scansToday: number;
    topDevice: string;
    lastScannedAt: string | null;
}

interface QRAnalyticsCardProps {
    dishId: string;
    dishName: string;
}

export default function QRAnalyticsCard({ dishId, dishName }: QRAnalyticsCardProps) {
    const [stats, setStats] = useState<QRScanStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics/scan?dishId=${dishId}`)
            .then((res) => res.json())
            .then((data) => setStats(data.stats ?? data))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, [dishId]);

    const statCards = stats
        ? [
            { label: "Total Scans", value: stats.totalScans, color: "text-plasma" },
            { label: "Unique Scans", value: stats.uniqueScans, color: "text-cyan-400" },
            { label: "Today", value: stats.scansToday, color: "text-amber-400" },
            { label: "Top Device", value: stats.topDevice || "N/A", color: "text-purple-400" },
        ]
        : [];

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">QR Analytics</h3>
                <span className="text-xs text-neutral-500 truncate max-w-[160px]">{dishName}</span>
            </div>
            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 rounded-lg bg-neutral-800 animate-pulse" />
                    ))}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-2 gap-3">
                    {statCards.map((card) => (
                        <div key={card.label} className="rounded-lg bg-neutral-800/50 p-3">
                            <p className="text-xs text-neutral-500 mb-1">{card.label}</p>
                            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-neutral-500 text-sm">No scan data yet</p>
                    <p className="text-neutral-600 text-xs mt-1">Data will appear after the QR code is scanned</p>
                </div>
            )}
            {stats?.lastScannedAt && (
                <p className="text-xs text-neutral-600">
                    Last scanned: {new Date(stats.lastScannedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
            )}
        </div>
    );
}