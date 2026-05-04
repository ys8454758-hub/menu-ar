"use client";
import Link from "next/link";
import { useState } from "react";
import { Edit2, Archive, RotateCcw, QrCode, Scan } from "lucide-react";

interface DishGridCardProps {
    id: string; name: string; description?: string; price: number | null;
    slug: string; isArchived: boolean; hasModel: boolean; hasQR: boolean;
    healthScore: number; scanCount: number;
    onArchive?: (id: string) => void; onRestore?: (id: string) => void;
}

function getHealthColor(score: number) {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-amber-400";
    return "text-ember";
}

function getHealthBg(score: number) {
    if (score >= 80) return "bg-success/10 border-success/30";
    if (score >= 50) return "bg-amber-400/10 border-amber-400/30";
    return "bg-ember/10 border-ember/30";
}

export default function DishGridCard({ id, name, description, price, isArchived, hasModel, hasQR, healthScore, scanCount, onArchive, onRestore }: DishGridCardProps) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: "archive" | "restore") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dishes/${id}`, {
                method: action === "archive" ? "DELETE" : "PATCH",
                headers: action === "restore" ? { "Content-Type": "application/json" } : undefined,
                body: action === "restore" ? JSON.stringify({ isArchived: false }) : undefined,
            });
            if (res.ok) { if (action === "archive") onArchive?.(id); else onRestore?.(id); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className={`border bg-terminal flex flex-col transition-all duration-300 hover:border-plasma/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] group ${isArchived ? "border-border opacity-60" : "border-border"}`}>
            {/* Thumbnail placeholder */}
            <div className="relative h-40 bg-surface border-b border-border overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-plasma/5 via-transparent to-neon-violet/5" />
                {hasModel ? (
                    <div className="flex flex-col items-center gap-2 z-10">
                        <div className="w-12 h-12 border border-plasma/40 flex items-center justify-center bg-plasma/5 group-hover:border-plasma/70 transition-colors">
                            <span className="text-plasma text-2xl">◈</span>
                        </div>
                        <span className="text-body-xs font-ui text-plasma tracking-widest uppercase">3D Model</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 z-10 opacity-30">
                        <div className="w-12 h-12 border border-border flex items-center justify-center">
                            <span className="text-text-tertiary text-2xl">◇</span>
                        </div>
                        <span className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">No 3D</span>
                    </div>
                )}
                {/* Health score badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 border text-xs font-display ${getHealthBg(healthScore)} ${getHealthColor(healthScore)}`}>
                    {healthScore}
                </div>
                {isArchived && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 border border-ember/50 bg-ember/10 text-ember font-ui text-xs tracking-widest uppercase">Archived</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex-1">
                    <h3 className="text-body-md font-ui text-text-primary truncate">{name}</h3>
                    {description && <p className="text-body-xs font-body text-text-tertiary mt-1 line-clamp-2">{description}</p>}
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between">
                    {price != null ? (
                        <span className="text-body-sm font-mono text-plasma">₹{price.toFixed(2)}</span>
                    ) : <span />}
                    <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-1 text-body-xs font-ui ${hasQR ? "text-plasma" : "text-text-tertiary"}`}>
                            <QrCode className="w-3 h-3" />
                        </span>
                        <span className="flex items-center gap-1 text-body-xs font-mono text-text-tertiary">
                            <Scan className="w-3 h-3" />{scanCount}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Link href={`/dashboard/dishes/${id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-plasma text-plasma px-2 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors">
                        <Edit2 className="w-3 h-3" /> Edit
                    </Link>
                    {isArchived ? (
                        <button onClick={() => handleAction("restore")} disabled={loading}
                            className="flex items-center gap-1.5 border border-success text-success px-2 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-success/10 transition-colors disabled:opacity-50">
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    ) : (
                        <button onClick={() => handleAction("archive")} disabled={loading}
                            className="flex items-center gap-1.5 border border-ember text-ember px-2 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-ember/10 transition-colors disabled:opacity-50">
                            <Archive className="w-3 h-3" />
                        </button>
                    )}
                    <Link href={`/dashboard/qr-studio?dishId=${id}`}
                        className="flex items-center gap-1.5 border border-neon-violet text-neon-violet px-2 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/10 transition-colors">
                        <QrCode className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
