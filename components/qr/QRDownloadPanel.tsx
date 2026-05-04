"use client";

import { useState } from "react";
import type { QRDesign } from "./types";

export type DownloadFormat = "png" | "svg" | "pdf";

interface QRDownloadPanelProps {
    qrDataUrl: string;
    design: QRDesign;
    dishName: string;
    restaurantName: string;
}

export default function QRDownloadPanel({ qrDataUrl, design, dishName, restaurantName }: QRDownloadPanelProps) {
    const [downloading, setDownloading] = useState<DownloadFormat | null>(null);

    const sanitize = (s: string) => s.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const baseName = `${sanitize(restaurantName)}_${sanitize(dishName)}_qr`;

    const downloadFile = async (format: DownloadFormat, ext: string) => {
        setDownloading(format);
        try {
            const params = new URLSearchParams({
                data: qrDataUrl,
                format,
                size: "1024",
                dotStyle: design.dotStyle,
                cornerSquareStyle: design.cornerSquareStyle,
                cornerDotStyle: design.cornerDotStyle,
                foregroundColor: design.foregroundColor,
                backgroundColor: design.backgroundColor,
                errorCorrectionLevel: design.errorCorrectionLevel,
                restaurantName,
                dishName,
            });
            const res = await fetch(`/api/qr/download?${params.toString()}`);
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${baseName}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`${format} download error:`, err);
        } finally {
            setDownloading(null);
        }
    };

    const formats: { key: DownloadFormat; label: string; icon: string; ext: string }[] = [
        { key: "png", label: "PNG", icon: "🖼", ext: "png" },
        { key: "svg", label: "SVG", icon: "📐", ext: "svg" },
        { key: "pdf", label: "PDF Card", icon: "📄", ext: "pdf" },
    ];

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300 block">Download</label>
            <div className="flex gap-2">
                {formats.map(({ key, label, icon, ext }) => (
                    <button
                        key={key}
                        onClick={() => downloadFile(key, ext)}
                        disabled={downloading !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm text-white"
                    >
                        {downloading === key ? (
                            <div className="w-4 h-4 border-2 border-plasma border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>{icon}</span>
                        )}
                        <span>{label}</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-neutral-600">PNG: 1024px raster. SVG: vector. PDF: printable card.</p>
        </div>
    );
}