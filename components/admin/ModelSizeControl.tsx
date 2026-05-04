"use client";

import { useState } from "react";

interface ModelSizeControlProps {
  modelId: string;
  dishName: string;
  currentScale: { x: number; y: number; z: number };
  currentDimensions: { widthCm?: number; heightCm?: number; depthCm?: number };
  arSizeLocked: boolean;
  onSave: (data: { scaleX: number; scaleY: number; scaleZ: number; note?: string }) => Promise<void>;
}

export default function ModelSizeControl({
  modelId,
  dishName,
  currentScale,
  currentDimensions,
  arSizeLocked,
  onSave,
}: ModelSizeControlProps) {
  const [scale, setScale] = useState(currentScale);
  const [dimensions, setDimensions] = useState(currentDimensions);
  const [locked, setLocked] = useState(arSizeLocked);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ scaleX: scale.x, scaleY: scale.y, scaleZ: scale.z, note });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border bg-terminal p-6 rounded-none space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-body-lg font-ui text-text-accent tracking-widest uppercase">{dishName}</h3>
        <span className="text-body-xs font-mono text-text-tertiary">ID: {modelId}</span>
      </div>

      {/* Scale Sliders */}
      <div className="space-y-4">
        <h4 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">Scale Multipliers</h4>
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-body-xs font-mono text-text-tertiary uppercase">Scale {axis.toUpperCase()}</label>
              <span className="text-body-sm font-mono text-plasma">{scale[axis].toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={scale[axis]}
              onChange={(e) => setScale({ ...scale, [axis]: parseFloat(e.target.value) })}
              className="w-full h-2 bg-surface border border-border rounded-none appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">Physical Dimensions (cm)</h4>
        <div className="grid grid-cols-3 gap-4">
          {(["widthCm", "heightCm", "depthCm"] as const).map((dim) => (
            <div key={dim} className="space-y-1">
              <label className="text-body-xs font-mono text-text-tertiary uppercase">{dim.replace("Cm", "")}</label>
              <input
                type="number"
                step="0.1"
                value={dimensions[dim] || ""}
                onChange={(e) => setDimensions({ ...dimensions, [dim]: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-none border border-border bg-surface px-3 py-2 text-text-primary font-mono text-sm outline-none focus:border-plasma"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* AR Size Lock */}
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-ui text-text-secondary">Lock AR Size (prevent user resize)</span>
        <button
          onClick={() => setLocked(!locked)}
          className={`w-12 h-6 rounded-none transition-colors ${locked ? "bg-plasma" : "bg-surface border border-border"}`}
        >
          <span className={`block w-5 h-5 bg-void rounded-full transition-transform ${locked ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>

      {/* Admin Note */}
      <div className="space-y-2">
        <label className="text-body-xs font-ui text-text-secondary tracking-wider uppercase">Admin Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for size adjustment..."
          className="w-full rounded-none border border-border bg-surface px-3 py-2 text-text-primary font-body text-sm outline-none focus:border-plasma"
          rows={2}
        />
      </div>

      {/* Actions */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-none bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
