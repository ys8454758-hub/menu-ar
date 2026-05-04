"use client";
import Link from "next/link";
import { useState } from "react";

interface DishCardProps {
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

export default function DishCard({ id, name, description, price, isArchived, hasModel, hasQR, healthScore, scanCount, onArchive, onRestore }: DishCardProps) {
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
        <div className={`border bg-terminal p-6 rounded-none transition-all duration-300 hover:border-plasma/50 ${isArchived ? "border-border opacity-60" : "border-border"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-body-lg font-body text-text-primary truncate">{name}</h3>
                        {isArchived && <span className="px-2 py-0.5 border border-ember/50 text-ember font-ui text-xs tracking-widest uppercase">Archived</span>}
                    </div>
                    {description && <p className="text-body-sm font-body text-text-secondary mb-3 line-clamp-2">{description}</p>}
                    <div className="flex items-center gap-4 flex-wrap">
                        {price != null && <span className="text-body-md font-mono text-plasma">₹{price.toFixed(2)}</span>}
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${hasModel ? "border-success/50 text-success" : "border-ember/50 text-ember"}`}>{hasModel ? "3D" : "NO 3D"}</span>
                            <span className={`px-2 py-0.5 border font-ui text-xs tracking-wider ${hasQR ? "border-plasma/50 text-plasma" : "border-ember/50 text-ember"}`}>{hasQR ? "QR" : "NO QR"}</span>
                        </div>
                        <span className="text-body-xs font-mono text-text-tertiary">{scanCount} scans</span>
                    </div>
                </div>
                <div className={`flex-shrink-0 w-16 h-16 border rounded-none flex flex-col items-center justify-center ${getHealthBg(healthScore)}`}>
                    <span className={`text-display-sm font-display ${getHealthColor(healthScore)}`}>{healthScore}</span>
                    <span className="text-body-xs font-ui text-text-tertiary tracking-wider">HEALTH</span>
                </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <Link href={`/dashboard/dishes/${id}/edit`} className="rounded-none border border-plasma text-plasma px-3 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors">Edit</Link>
                <div className="flex items-center gap-2">
                    {isArchived ? (
                        <button onClick={() => handleAction("restore")} disabled={loading} className="rounded-none border border-success text-success px-3 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-success/10 transition-colors disabled:opacity-50">{loading ? "..." : "Restore"}</button>
                    ) : (
                        <button onClick={() => handleAction("archive")} disabled={loading} className="rounded-none border border-ember text-ember px-3 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-ember/10 transition-colors disabled:opacity-50">{loading ? "..." : "Archive"}</button>
                    )}
                    <Link href={`/dashboard/qr-studio?dishId=${id}`} className="rounded-none border border-neon-violet text-neon-violet px-3 py-1.5 font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/10 transition-colors">QR Studio</Link>
                </div>
            </div>
        </div>
    );
}