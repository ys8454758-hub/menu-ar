"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCodeStyling from "qr-code-styling";
import { Download, RefreshCw, Zap } from "lucide-react";
import type { QRDesignConfig } from "@/lib/qr-generator";

interface DishOption {
    id: string; name: string; slug: string;
    restaurant: { id: string; slug: string };
}

const DOT_STYLES = ["square", "rounded", "dots", "classy", "classy-rounded", "extra-rounded"] as const;
const CORNER_SQUARE_STYLES = ["square", "extra-rounded", "dot"] as const;
const CORNER_DOT_STYLES = ["square", "dot"] as const;
const FRAME_STYLES = ["none", "simple-border", "banner-bottom", "banner-top", "rounded-frame"] as const;
const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;

function OptionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={`px-3 py-1.5 border font-ui text-xs tracking-widest uppercase transition-all duration-200 ${active ? "border-plasma bg-plasma/10 text-plasma shadow-[0_0_8px_rgba(212,175,55,0.2)]" : "border-border text-text-tertiary hover:border-plasma/50 hover:text-text-primary"}`}>
            {label}
        </button>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border border-border bg-terminal p-5 space-y-4">
            <h2 className="text-body-sm font-ui text-text-accent tracking-widest uppercase">{title}</h2>
            {children}
        </div>
    );
}

function QRStudioContent() {
    const searchParams = useSearchParams();
    const preselectedDishId = searchParams.get("dishId");

    const [dishes, setDishes] = useState<DishOption[]>([]);
    const [selectedDishId, setSelectedDishId] = useState(preselectedDishId || "");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<"dish" | "menu">("dish");
    const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
    const [savedQrImage, setSavedQrImage] = useState<string | null>(null);

    const qrRef = useRef<HTMLDivElement>(null);
    const qrInstance = useRef<QRCodeStyling | null>(null);

    const [config, setConfig] = useState<QRDesignConfig>({
        dotStyle: "rounded", cornerSquareStyle: "extra-rounded",
        cornerDotStyle: "dot", foregroundColor: "#000000", backgroundColor: "#FFFFFF",
        errorCorrectionLevel: "H", logoShape: "circle", logoSizePercent: 20,
        logoBorderWidth: 0, frameStyle: "none",
    });

    // Init QR instance
    useEffect(() => {
        qrInstance.current = new QRCodeStyling({
            width: 260, height: 260,
            data: "https://livin3d.com/ar/preview/demo",
            dotsOptions: { type: "rounded", color: "#000000" },
            backgroundOptions: { color: "#FFFFFF" },
            cornersSquareOptions: { type: "extra-rounded" },
            cornersDotOptions: { type: "dot" },
            qrOptions: { errorCorrectionLevel: "H" },
            imageOptions: { crossOrigin: "anonymous", margin: 5 },
        });
        if (qrRef.current) {
            qrRef.current.innerHTML = "";
            qrInstance.current.append(qrRef.current);
        }
    }, []);

    // Update QR live on config/dish change
    useEffect(() => {
        if (!qrInstance.current) return;
        const dish = dishes.find((d) => d.id === selectedDishId);
        let url = "https://livin3d.com/ar/preview/demo";

        if (mode === "menu" && dishes.length > 0) {
            url = `${typeof window !== "undefined" ? window.location.origin : "https://livin3d.com"}/livin3d/${dishes[0].restaurant.slug}`;
        } else if (mode === "dish" && dish) {
            url = `${typeof window !== "undefined" ? window.location.origin : "https://livin3d.com"}/ar/${dish.restaurant.slug}/${dish.slug}`;
        }

        qrInstance.current.update({
            data: url,
            dotsOptions: { type: config.dotStyle, color: config.foregroundColor },
            backgroundOptions: { color: config.backgroundColor },
            cornersSquareOptions: { type: config.cornerSquareStyle },
            cornersDotOptions: { type: config.cornerDotStyle },
            qrOptions: { errorCorrectionLevel: config.errorCorrectionLevel },
        });
    }, [config, selectedDishId, dishes]);

    useEffect(() => { loadDishes(); }, []);

    async function loadDishes() {
        try {
            const res = await fetch("/api/restaurants");
            if (res.ok) {
                const restaurants = await res.json();
                if (restaurants.length > 0) {
                    const dRes = await fetch(`/api/dishes?restaurantId=${restaurants[0].id}`);
                    if (dRes.ok) setDishes(await dRes.json());
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleSave() {
        if (!selectedDishId) return;
        setSaving(true);
        try {
            const dish = dishes.find((d) => d.id === selectedDishId);
            const res = await fetch("/api/qr/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dishId: selectedDishId, restaurantId: dish?.restaurant?.id, ...config }),
            });
            if (res.ok) {
                const data = await res.json();
                setSavedQrImage(data.pngUrl || null);
                setReliabilityScore(data.reliabilityScore);
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    }

    function downloadQR() {
        if (!qrInstance.current) return;
        qrInstance.current.download({ name: "livin3d-qr", extension: "png" });
    }

    function updateConfig<K extends keyof QRDesignConfig>(key: K, value: QRDesignConfig[K]) {
        setConfig((prev) => ({ ...prev, [key]: value }));
    }

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="animate-pulse h-8 w-64 bg-terminal/50" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Link href="/dashboard/dishes" className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors">← Back to Menu</Link>
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            <h1 className="text-display-lg font-display text-text-accent tracking-widest">QR Studio</h1>
                            <p className="text-body-sm font-body text-text-tertiary mt-1">Live preview updates as you design</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-body-xs font-ui text-success tracking-widest uppercase">
                                <Zap className="w-3 h-3" /> Live Preview
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Config panel — 3 cols */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Mode selector */}
                        <SectionCard title="QR Mode">
                            <div className="flex gap-2">
                                <OptionButton label="Individual Dish" active={mode === "dish"} onClick={() => setMode("dish")} />
                                <OptionButton label="Full Restaurant Menu" active={mode === "menu"} onClick={() => setMode("menu")} />
                            </div>
                            <p className="text-body-xs font-ui text-text-tertiary mt-2">
                                {mode === "dish" ? "Generates a QR that opens a specific dish in 3D." : "Generates a QR that opens your full digital menu."}
                            </p>
                        </SectionCard>

                        {/* Dish selector (only for dish mode) */}
                        {mode === "dish" && (
                            <SectionCard title="Select Dish">
                                <select value={selectedDishId} onChange={(e) => setSelectedDishId(e.target.value)}
                                    className="w-full border border-border bg-surface px-4 py-2.5 text-text-primary font-ui outline-none focus:border-plasma appearance-none">
                                    <option value="">Choose a dish...</option>
                                    {dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </SectionCard>
                        )}

                        {/* Dot style */}
                        <SectionCard title="Dot Style">
                            <div className="flex flex-wrap gap-2">
                                {DOT_STYLES.map((style) => (
                                    <OptionButton key={style} label={style} active={config.dotStyle === style} onClick={() => updateConfig("dotStyle", style)} />
                                ))}
                            </div>
                        </SectionCard>

                        {/* Corner styles */}
                        <SectionCard title="Corner Style">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-2">Square</p>
                                    <div className="flex gap-2">
                                        {CORNER_SQUARE_STYLES.map((s) => (
                                            <OptionButton key={s} label={s} active={config.cornerSquareStyle === s} onClick={() => updateConfig("cornerSquareStyle", s)} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-2">Dot</p>
                                    <div className="flex gap-2">
                                        {CORNER_DOT_STYLES.map((s) => (
                                            <OptionButton key={s} label={s} active={config.cornerDotStyle === s} onClick={() => updateConfig("cornerDotStyle", s)} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Colors */}
                        <SectionCard title="Colors">
                            <div className="grid grid-cols-2 gap-4">
                                {([
                                    { label: "Foreground", key: "foregroundColor" },
                                    { label: "Background", key: "backgroundColor" },
                                ] as { label: string; key: "foregroundColor" | "backgroundColor" }[]).map(({ label, key }) => (
                                    <div key={key}>
                                        <p className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-2">{label}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input type="color" value={config[key]} onChange={(e) => updateConfig(key, e.target.value)}
                                                    className="w-10 h-10 border border-border cursor-pointer bg-surface p-0.5" />
                                            </div>
                                            <input type="text" value={config[key]} onChange={(e) => updateConfig(key, e.target.value)}
                                                className="flex-1 border border-border bg-surface px-3 py-2 text-text-primary font-mono text-sm outline-none focus:border-plasma" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* Error correction */}
                        <SectionCard title="Error Correction">
                            <div className="flex gap-2">
                                {ERROR_LEVELS.map((level) => (
                                    <OptionButton key={level} label={level} active={config.errorCorrectionLevel === level} onClick={() => updateConfig("errorCorrectionLevel", level)} />
                                ))}
                            </div>
                            <p className="text-body-xs font-ui text-text-tertiary">H = Best for logos · L = Smallest file size</p>
                        </SectionCard>

                        {/* Frame */}
                        <SectionCard title="Frame Style">
                            <div className="flex flex-wrap gap-2">
                                {FRAME_STYLES.map((style) => (
                                    <OptionButton key={style} label={style.replace(/-/g, " ")} active={config.frameStyle === style} onClick={() => updateConfig("frameStyle", style)} />
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Preview panel — 2 cols, sticky */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="border border-border bg-terminal p-6 space-y-5 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-body-sm font-ui text-text-accent tracking-widest uppercase">Live Preview</h2>
                                <span className="flex items-center gap-1 text-body-xs font-mono text-success">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
                                </span>
                            </div>

                            {/* Canvas preview */}
                            <div className="bg-white flex items-center justify-center p-4 border border-border/20">
                                <div ref={qrRef} />
                            </div>

                            {/* Reliability score */}
                            {reliabilityScore !== null && (
                                <div className={`p-3 border ${reliabilityScore >= 80 ? "border-success/50 bg-success/5" : reliabilityScore >= 50 ? "border-amber-400/50 bg-amber-400/5" : "border-ember/50 bg-ember/5"}`}>
                                    <p className="text-body-sm font-ui tracking-widest uppercase">
                                        Reliability: <span className={reliabilityScore >= 80 ? "text-success" : reliabilityScore >= 50 ? "text-amber-400" : "text-ember"}>{reliabilityScore}%</span>
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <button onClick={downloadQR}
                                className="w-full flex items-center justify-center gap-2 border border-plasma text-plasma px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors">
                                <Download className="w-4 h-4" /> Download PNG
                            </button>

                            <button onClick={handleSave} disabled={(mode === "dish" && !selectedDishId) || saving}
                                className="w-full flex items-center justify-center gap-2 bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50">
                                {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : mode === "menu" ? "Update Menu QR" : "Save to Dish"}
                            </button>

                            {savedQrImage && (
                                <div className="flex gap-2">
                                    <a href={`/api/qr/download?dishId=${selectedDishId}&format=png`} download
                                        className="flex-1 border border-plasma text-plasma px-3 py-2 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors text-center">PNG</a>
                                    <a href={`/api/qr/download?dishId=${selectedDishId}&format=svg`} download
                                        className="flex-1 border border-neon-violet text-neon-violet px-3 py-2 font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/10 transition-colors text-center">SVG</a>
                                </div>
                            )}

                            <p className="text-body-xs font-body text-text-tertiary text-center">
                                Preview updates instantly as you configure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QRStudioPage() {
    return (
        <Suspense fallback={<div className="min-h-screen p-6 flex items-center justify-center"><div className="animate-pulse h-8 w-64 bg-terminal/50" /></div>}>
            <QRStudioContent />
        </Suspense>
    );
}
