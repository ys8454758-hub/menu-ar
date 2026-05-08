"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRTheme {
  id: string;
  themeName: string;
  dotStyle: string;
  foregroundColor: string;
  backgroundColor: string;
  frameStyle: string;
  frameText?: string;
  logoShape: string;
  logoSizePercent: number;
  errorCorrectionLevel: string;
}

interface QRThemeSelectorProps {
  restaurantId: string;
  currentConfig: Record<string, unknown>;
  onSelectTheme: (theme: QRTheme) => void;
  className?: string;
}

export default function QRThemeSelector({ restaurantId, currentConfig, onSelectTheme, className }: QRThemeSelectorProps) {
  const [themes, setThemes] = useState<QRTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    fetchThemes();
  }, [restaurantId]);

  const fetchThemes = async () => {
    try {
      const res = await fetch(`/api/restaurants/theme?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (err) {
      console.error("Failed to fetch themes:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentAsTheme = async () => {
    if (!newThemeName.trim()) return;

    try {
      const res = await fetch("/api/restaurants/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          themeName: newThemeName,
          ...currentConfig,
        }),
      });

      if (res.ok) {
        const theme = await res.json();
        setThemes([...themes, theme]);
        setNewThemeName("");
        setShowSaveForm(false);
      }
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  const deleteTheme = async (themeId: string) => {
    try {
      const res = await fetch(`/api/restaurants/theme?id=${themeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setThemes(themes.filter((t) => t.id !== themeId));
      }
    } catch (err) {
      console.error("Failed to delete theme:", err);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">
          Saved Themes
        </h3>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="flex items-center gap-1 text-body-xs font-ui text-plasma hover:text-plasma/80"
        >
          <Plus className="w-3 h-3" />
          Save Current
        </button>
      </div>

      {showSaveForm && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder="Theme name..."
            className="flex-1 px-3 py-2 border border-border bg-surface text-text-primary text-body-sm"
          />
          <button
            onClick={saveCurrentAsTheme}
            className="px-4 py-2 bg-plasma text-void text-body-sm font-ui"
          >
            Save
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-body-sm text-text-tertiary">Loading...</div>
      ) : themes.length === 0 ? (
        <p className="text-body-sm text-text-tertiary">No saved themes yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="flex items-center gap-3 p-3 border border-border bg-surface hover:border-plasma/30 transition-colors cursor-pointer group"
              onClick={() => onSelectTheme(theme)}
            >
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <div
                  className="w-full h-full rounded"
                  style={{ backgroundColor: theme.foregroundColor }}
                />
              </div>
              <span className="flex-1 text-body-sm font-body text-text-primary">
                {theme.themeName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTheme(theme.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-ember hover:bg-ember/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}