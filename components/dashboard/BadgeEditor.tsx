"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeConfig {
  vegColor: string;
  nonVegColor: string;
  jainColor: string;
  veganColor: string;
  vegLabel: string;
  nonVegLabel: string;
  jainLabel: string;
  veganLabel: string;
  fontFamily: string;
  fontSize: string;
  badgeStyle: "PILL" | "SQUARE" | "ROUNDED_SQUARE" | "OUTLINED" | "SOLID";
  badgePosition: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT";
  showIcon: boolean;
}

const DEFAULT_CONFIG: BadgeConfig = {
  vegColor: "#39FF14",
  nonVegColor: "#FF6B35",
  jainColor: "#FFD700",
  veganColor: "#00FFD1",
  vegLabel: "Veg",
  nonVegLabel: "Non-Veg",
  jainLabel: "Jain",
  veganLabel: "Vegan",
  fontFamily: "IBM Plex Mono",
  fontSize: "medium",
  badgeStyle: "SQUARE",
  badgePosition: "TOP_LEFT",
  showIcon: true,
};

interface BadgeEditorProps {
  restaurantId: string;
  initialConfig?: Partial<BadgeConfig>;
  onSave: (config: BadgeConfig) => void;
  className?: string;
}

export default function BadgeEditor({ restaurantId: _restaurantId, initialConfig, onSave, className }: BadgeEditorProps) {
  void _restaurantId; // kept for future use
  
  const [config, setConfig] = useState<BadgeConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [saving, setSaving] = useState(false);

  const updateConfig = (key: keyof BadgeConfig, value: string | number | boolean) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const getBorderRadius = (style: string) => {
    switch (style) {
      case "PILL": return "9999px";
      case "ROUNDED_SQUARE": return "8px";
      case "OUTLINED": return "0";
      case "SOLID": return "0";
      default: return "2px";
    }
  };

  const BadgePreview = ({ type, color, label }: { type: string; color: string; label: string }) => (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 border font-ui text-xs tracking-widest uppercase"
      style={{
        borderColor: `${color}50`,
        color: color,
        backgroundColor: config.badgeStyle === "SOLID" ? color : `${color}10`,
        borderRadius: getBorderRadius(config.badgeStyle),
        fontFamily: config.fontFamily,
        fontSize: config.fontSize === "small" ? "10px" : config.fontSize === "large" ? "14px" : "12px",
      }}
    >
      {type === "VEG" && config.showIcon && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {type === "NON_VEG" && config.showIcon && (
        <span
          className="w-2 h-2"
          style={{
            backgroundColor: color,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
      )}
      {label}
    </span>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Veg Color
          </label>
          <input
            type="color"
            value={config.vegColor}
            onChange={(e) => updateConfig("vegColor", e.target.value)}
            className="w-full h-10 border border-border bg-surface cursor-pointer"
          />
          <input
            type="text"
            value={config.vegLabel}
            onChange={(e) => updateConfig("vegLabel", e.target.value)}
            className="w-full px-3 py-2 border border-border bg-surface text-text-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Non-Veg Color
          </label>
          <input
            type="color"
            value={config.nonVegColor}
            onChange={(e) => updateConfig("nonVegColor", e.target.value)}
            className="w-full h-10 border border-border bg-surface cursor-pointer"
          />
          <input
            type="text"
            value={config.nonVegLabel}
            onChange={(e) => updateConfig("nonVegLabel", e.target.value)}
            className="w-full px-3 py-2 border border-border bg-surface text-text-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Jain Color
          </label>
          <input
            type="color"
            value={config.jainColor}
            onChange={(e) => updateConfig("jainColor", e.target.value)}
            className="w-full h-10 border border-border bg-surface cursor-pointer"
          />
          <input
            type="text"
            value={config.jainLabel}
            onChange={(e) => updateConfig("jainLabel", e.target.value)}
            className="w-full px-3 py-2 border border-border bg-surface text-text-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Vegan Color
          </label>
          <input
            type="color"
            value={config.veganColor}
            onChange={(e) => updateConfig("veganColor", e.target.value)}
            className="w-full h-10 border border-border bg-surface cursor-pointer"
          />
          <input
            type="text"
            value={config.veganLabel}
            onChange={(e) => updateConfig("veganLabel", e.target.value)}
            className="w-full px-3 py-2 border border-border bg-surface text-text-primary"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showIcon}
              onChange={(e) => updateConfig("showIcon", e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-body-sm font-body text-text-primary">Show Icon</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Badge Style
          </label>
          <div className="flex gap-2">
            {["SQUARE", "ROUNDED_SQUARE", "PILL", "OUTLINED", "SOLID"].map((style) => (
              <button
                key={style}
                onClick={() => updateConfig("badgeStyle", style)}
                className={cn(
                  "px-3 py-2 border text-body-xs font-ui uppercase",
                  config.badgeStyle === style
                    ? "border-plasma text-plasma bg-plasma/10"
                    : "border-border text-text-secondary hover:border-plasma/50"
                )}
              >
                {style.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
            Font Family
          </label>
          <select
            value={config.fontFamily}
            onChange={(e) => updateConfig("fontFamily", e.target.value)}
            className="w-full px-3 py-2 border border-border bg-surface text-text-primary"
          >
            <option value="IBM Plex Mono">IBM Plex Mono</option>
            <option value="Orbitron">Orbitron</option>
            <option value="Space Grotesk">Space Grotesk</option>
            <option value="System UI">System UI</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-body-xs font-ui text-text-secondary uppercase tracking-wider">
          Preview
        </label>
        <div className="flex gap-3 p-4 border border-border bg-terminal">
          <BadgePreview type="VEG" color={config.vegColor} label={config.vegLabel} />
          <BadgePreview type="NON_VEG" color={config.nonVegColor} label={config.nonVegLabel} />
          <BadgePreview type="JAIN" color={config.jainColor} label={config.jainLabel} />
          <BadgePreview type="VEGAN" color={config.veganColor} label={config.veganLabel} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-plasma text-void px-4 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-4 py-3 border border-border text-text-secondary font-ui text-sm hover:border-ember hover:text-ember"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}