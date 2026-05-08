"use client";

import { useState, useEffect } from "react";
import { History } from "lucide-react";

interface ModelSizeControlProps {
  modelId: string;
  dishName: string;
  currentScale: { x: number; y: number; z: number };
  currentDimensions: { widthCm?: number; heightCm?: number; depthCm?: number };
  arSizeLocked: boolean;
  onSave: (data: { scaleX: number; scaleY: number; scaleZ: number; note?: string }) => Promise<void>;
}

interface AuditLog {
  id: string;
  changedBy: string;
  oldScaleX: number;
  oldScaleY: number;
  oldScaleZ: number;
  newScaleX: number;
  newScaleY: number;
  newScaleZ: number;
  note: string | null;
  changedAt: string;
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [modelId]);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`/api/admin/model-size?modelId=${modelId}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ scaleX: scale.x, scaleY: scale.y, scaleZ: scale.z, note });
      fetchAuditLogs();
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="flex items-center gap-2 text-body-xs font-ui text-text-secondary hover:text-plasma"
          >
            <History className="w-4 h-4" />
            Audit Log ({auditLogs.length})
          </button>
          <span className="text-body-xs font-mono text-text-tertiary">ID: {modelId}</span>
        </div>
      </div>

      {/* Audit Log Panel */}
      {showAudit && (
        <div className="border border-border bg-surface p-4 space-y-3 max-h-48 overflow-y-auto">
          <h4 className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">Change History</h4>
          {auditLogs.length === 0 ? (
            <p className="text-body-sm text-text-tertiary">No changes recorded yet</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="text-body-xs border-b border-border pb-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{log.changedBy}</span>
                  <span className="text-text-tertiary">
                    {new Date(log.changedAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-text-primary font-mono">
                  {log.oldScaleX.toFixed(2)}, {log.oldScaleY.toFixed(2)}, {log.oldScaleZ.toFixed(2)} → 
                  {log.newScaleX.toFixed(2)}, {log.newScaleY.toFixed(2)}, {log.newScaleZ.toFixed(2)}
                </div>
                {log.note && <p className="text-text-tertiary mt-1">Note: {log.note}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reference Plate Illustration */}
      <div className="flex justify-center py-4 border border-border bg-surface">
        <svg width="200" height="120" viewBox="0 0 200 120">
          <rect x="20" y="20" width="160" height="80" fill="none" stroke="#333" strokeWidth="2" rx="4" />
          <text x="100" y="15" textAnchor="middle" fill="#666" fontSize="10">Reference: Standard Dinner Plate (10&quot;)</text>
          <text x="100" y="65" textAnchor="middle" fill="#00FFD1" fontSize="8" fontFamily="monospace">
            {currentDimensions.widthCm?.toFixed(1) || "?"}cm × {currentDimensions.heightCm?.toFixed(1) || "?"}cm
          </text>
          <line x1="30" y1="40" x2="30" y2="80" stroke="#444" strokeDasharray="4" />
          <line x1="170" y1="40" x2="170" y2="80" stroke="#444" strokeDasharray="4" />
        </svg>
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
