"use client";

import { useRef, useEffect, useState } from "react";
import type { QRDesign } from "./types";

interface QRPreviewProps {
    data: string;
    design: QRDesign;
    size?: number;
}

export default function QRPreview({ data, design, size = 280 }: QRPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!data) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            if (design.logoUrl) {
                const logoImg = new Image();
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = () => {
                    const logoSize = size * (design.logoSizePercent / 100);
                    const x = (size - logoSize) / 2;
                    const y = (size - logoSize) / 2;
                    ctx.save();
                    if (design.logoShape === "circle") {
                        ctx.beginPath();
                        ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                    } else if (design.logoShape === "rounded-square") {
                        const r = logoSize * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(x + r, y);
                        ctx.lineTo(x + logoSize - r, y);
                        ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + r);
                        ctx.lineTo(x + logoSize, y + logoSize - r);
                        ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - r, y + logoSize);
                        ctx.lineTo(x + r, y + logoSize);
                        ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - r);
                        ctx.lineTo(x, y + r);
                        ctx.quadraticCurveTo(x, y, x + r, y);
                        ctx.closePath();
                        ctx.clip();
                    }
                    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                    ctx.restore();
                    setLoading(false);
                };
                logoImg.onerror = () => setLoading(false);
                logoImg.src = design.logoUrl;
            } else {
                setLoading(false);
            }
        };
        img.onerror = () => { setError("Failed to generate QR code"); setLoading(false); };

        const params = new URLSearchParams({
            data, size: String(size * 2),
            dotStyle: design.dotStyle,
            cornerSquareStyle: design.cornerSquareStyle,
            cornerDotStyle: design.cornerDotStyle,
            foregroundColor: design.foregroundColor,
            backgroundColor: design.backgroundColor,
            errorCorrectionLevel: design.errorCorrectionLevel,
        });
        img.src = `/api/qr/generate?${params.toString()}`;
    }, [data, design, size]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative rounded-xl overflow-hidden" style={{
                background: design.backgroundColor,
                border: design.frameStyle === "full-border" ? `3px solid ${design.foregroundColor}` : "none",
                borderBottom: design.frameStyle === "bottom-bar" ? `3px solid ${design.foregroundColor}` : "none",
                borderTop: design.frameStyle === "top-bar" ? `3px solid ${design.foregroundColor}` : "none",
            }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 z-10">
                        <div className="w-6 h-6 border-2 border-plasma border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}
                <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />
                {design.frameStyle !== "none" && design.frameText && (
                    <div className="text-center py-2 text-xs font-semibold tracking-wider uppercase" style={{ color: design.foregroundColor }}>
                        {design.frameText}
                    </div>
                )}
            </div>
            <p className="text-xs text-neutral-500 max-w-[280px] text-center break-all">{data}</p>
        </div>
    );
}