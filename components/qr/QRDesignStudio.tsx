"use client";

import type { QRDesign, DotStyle, CornerStyle, LogoShape, FrameStyle, ErrorCorrectionLevel } from "./types";

interface QRDesignStudioProps {
    design: QRDesign;
    onDesignChange: (design: QRDesign) => void;
}

function Pill<T extends string>({ options, current, onChange }: { options: T[]; current: T; onChange: (v: T) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((s) => (
                <button key={s} onClick={() => onChange(s)} className={`px-3 py-1.5 rounded text-xs capitalize transition-colors ${current === s ? "bg-plasma text-black font-semibold" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}>
                    {s.replace(/-/g, " ")}
                </button>
            ))}
        </div>
    );
}

export default function QRDesignStudio({ design, onDesignChange }: QRDesignStudioProps) {
    const update = <K extends keyof QRDesign>(key: K, value: QRDesign[K]) => {
        const next = { ...design, [key]: value };
        if (key === "logoUrl" && value) next.errorCorrectionLevel = "H";
        onDesignChange(next);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Dot Style</label>
                <Pill options={["square", "rounded", "dots", "classy", "classy-rounded"] as DotStyle[]} current={design.dotStyle} onChange={(v) => update("dotStyle", v)} />
            </div>
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Corner Square Style</label>
                <Pill options={["square", "dot", "extra-rounded"] as CornerStyle[]} current={design.cornerSquareStyle} onChange={(v) => update("cornerSquareStyle", v)} />
            </div>
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Corner Dot Style</label>
                <Pill options={["square", "dot", "extra-rounded"] as CornerStyle[]} current={design.cornerDotStyle} onChange={(v) => update("cornerDotStyle", v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Foreground</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={design.foregroundColor} onChange={(e) => update("foregroundColor", e.target.value)} className="w-10 h-8 rounded cursor-pointer border border-neutral-700" />
                        <span className="text-xs text-neutral-500 font-mono">{design.foregroundColor}</span>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Background</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={design.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} className="w-10 h-8 rounded cursor-pointer border border-neutral-700" />
                        <span className="text-xs text-neutral-500 font-mono">{design.backgroundColor}</span>
                    </div>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Logo URL</label>
                <input type="url" value={design.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://example.com/logo.png" className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm text-white border border-neutral-700 focus:border-plasma focus:outline-none" />
            </div>
            {design.logoUrl && (
                <>
                    <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Logo Shape</label>
                        <Pill options={["circle", "square", "rounded-square", "shield"] as LogoShape[]} current={design.logoShape} onChange={(v) => update("logoShape", v)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-neutral-300 mb-2 block">Logo Size: {design.logoSizePercent}%</label>
                        <input type="range" min={10} max={25} value={design.logoSizePercent} onChange={(e) => update("logoSizePercent", parseInt(e.target.value))} className="w-full accent-plasma" />
                    </div>
                </>
            )}
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Frame Style</label>
                <Pill options={["none", "bottom-bar", "top-bar", "full-border"] as FrameStyle[]} current={design.frameStyle} onChange={(v) => update("frameStyle", v)} />
            </div>
            {design.frameStyle !== "none" && (
                <div>
                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Frame Text</label>
                    <input type="text" value={design.frameText} onChange={(e) => update("frameText", e.target.value)} placeholder="Scan to see in 3D" className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm text-white border border-neutral-700 focus:border-plasma focus:outline-none" />
                </div>
            )}
            <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Error Correction</label>
                <Pill options={["L", "M", "Q", "H"] as ErrorCorrectionLevel[]} current={design.errorCorrectionLevel} onChange={(v) => update("errorCorrectionLevel", v)} />
                <p className="text-xs text-neutral-600 mt-1">Higher = more error tolerance but denser QR code</p>
            </div>
        </div>
    );
}