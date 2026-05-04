"use client";

import { useState, useEffect } from "react";
import { Paintbrush, Check, RefreshCw, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    id: "terminal",
    name: "Dark Terminal",
    description: "Cyberpunk monoscape. High contrast neon on black.",
    primary: "#00ff88",
    bg: "#0a0a0a",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)"
  },
  {
    id: "peach",
    name: "Peach Glass",
    description: "Soft warm gradients, frosted translucent cards, and dark accents.",
    primary: "#1C1C1E",
    bg: "#FDFBF7",
    gradient: "radial-gradient(circle at top left, #FFEFE5, #F8E1D3, #F1D4C3)"
  },
  {
    id: "burger",
    name: "Burger Retro",
    description: "Warm dark brown with bold mustard yellow. Perfect for casual dining.",
    primary: "#F5B841",
    bg: "#2F1F17",
    gradient: "linear-gradient(135deg, #2F1F17 0%, #4A3326 100%)"
  },
  {
    id: "fresh",
    name: "Fresh Minimalist",
    description: "Crisp whites and deep forest teal. Clean, healthy, modern.",
    primary: "#2A5D5A",
    bg: "#F4F7F6",
    gradient: "linear-gradient(135deg, #F4F7F6 0%, #D5E8E5 100%)"
  },
  {
    id: "coffee",
    name: "Coffee Artisan",
    description: "Warm mocha background with creamy beige cards and teal accents.",
    primary: "#408E91",
    bg: "#3C2A21",
    gradient: "linear-gradient(135deg, #3C2A21 0%, #6B4226 100%)"
  },
  {
    id: "dark-elegance",
    name: "Dark Elegance",
    description: "Pure black with bright gold/orange accents. Sleek and premium.",
    primary: "#F2A900",
    bg: "#0A0A0A",
    gradient: "linear-gradient(135deg, #0A0A0A 0%, #2A2A2A 100%)"
  },
  {
    id: "crimson",
    name: "Crimson Split",
    description: "Bold diagonal red/white split. Dynamic, striking, Asian fusion.",
    primary: "#E60000",
    bg: "#FFFFFF",
    gradient: "linear-gradient(135deg, #FFFFFF 50%, #D80000 50%)"
  },
  {
    id: "elegant",
    name: "Classic Elegant",
    description: "A refined, minimalist theme perfect for fine dining.",
    primary: "#d4af37",
    bg: "#FAF9F6",
    gradient: "linear-gradient(135deg, #FAF9F6 0%, #EAE6DF 100%)"
  },
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean lines, ample whitespace, and a contemporary blue feel.",
    primary: "#3b82f6",
    bg: "#f8fafc",
    gradient: "linear-gradient(135deg, #f8fafc 0%, #DBEAFE 100%)"
  }
];

export default function MenuThemesPage() {
  const [activeTheme, setActiveTheme] = useState("terminal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTheme, setSavedTheme] = useState("terminal");

  useEffect(() => {
    fetch("/api/restaurants/theme")
      .then(res => res.json())
      .then(data => {
        if (data.themeName) {
          setActiveTheme(data.themeName);
          setSavedTheme(data.themeName);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (themeId: string) => {
    setSaving(true);
    setActiveTheme(themeId);
    try {
      await fetch("/api/restaurants/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeName: themeId })
      });
      setSavedTheme(themeId);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-40 bg-terminal animate-pulse rounded-none" />
      ))}
    </div>
  );

  const savedThemeData = THEMES.find(t => t.id === savedTheme);

  return (
    <div className="max-w-6xl space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-display-lg font-display text-text-accent tracking-widest uppercase">Menu Themes</h1>
          <p className="text-body-sm font-mono text-text-tertiary mt-2">
            Customize the aesthetic of your public-facing digital menu.
          </p>
        </div>
        {savedThemeData && (
          <div className="flex items-center gap-3 px-4 py-3 border border-plasma/30 bg-plasma/5">
            <div className="w-5 h-5 rounded-full border border-plasma/50" style={{ background: savedThemeData.gradient }} />
            <div>
              <p className="text-body-xs font-ui text-text-tertiary uppercase tracking-widest">Active</p>
              <p className="text-body-sm font-ui text-plasma">{savedThemeData.name}</p>
            </div>
            <Check className="w-4 h-4 text-plasma" />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.map((theme, idx) => {
          const isSaved = savedTheme === theme.id;
          const isPreviewing = activeTheme === theme.id && activeTheme !== savedTheme;
          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={cn(
                "group border relative overflow-hidden transition-all duration-300 cursor-pointer",
                isSaved
                  ? "border-plasma shadow-[0_0_30px_rgba(0,255,136,0.15)]"
                  : "border-border bg-terminal hover:border-plasma/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.05)]"
              )}
              onClick={() => setActiveTheme(theme.id)}
            >
              {/* Gradient Preview Banner */}
              <div
                className="h-28 w-full transition-transform duration-500 group-hover:scale-105"
                style={{ background: theme.gradient }}
              />

              {/* Mock Card Overlay on Banner */}
              <div
                className="absolute top-4 left-4 right-4 h-20 backdrop-blur-sm border opacity-80"
                style={{
                  background: theme.id === "peach" || theme.id === "fresh" || theme.id === "elegant" || theme.id === "modern"
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: theme.id === "fresh" ? "1rem" : theme.id === "crimson" ? "1.5rem" : theme.id === "peach" ? "1rem" : "0.25rem"
                }}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="h-2 w-20 rounded mb-1.5" style={{ backgroundColor: theme.primary, opacity: 0.9 }} />
                      <div className="h-1.5 w-14 rounded opacity-40" style={{
                        backgroundColor: theme.id === "peach" || theme.id === "fresh" || theme.id === "elegant" || theme.id === "modern" ? "#555" : "#fff"
                      }} />
                    </div>
                    <div
                      className="text-[8px] font-bold px-2 py-1 leading-none"
                      style={{
                        backgroundColor: theme.primary,
                        color: ["peach","fresh","elegant","modern"].includes(theme.id) ? "#fff" : "#000",
                        borderRadius: theme.id === "fresh" ? "9999px" : theme.id === "crimson" ? "9999px" : "4px"
                      }}
                    >
                      +Add
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-3 right-3 bg-plasma text-void rounded-full p-1"
                  >
                    <Check className="w-3 h-3" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="p-5 bg-terminal">
                <h2 className="text-body-md font-ui text-text-primary tracking-widest uppercase">{theme.name}</h2>
                <p className="text-body-xs font-mono text-text-tertiary mt-1 leading-relaxed">{theme.description}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(theme.id); }}
                    disabled={isSaved || saving}
                    className={cn(
                      "flex-1 py-2 font-ui text-xs tracking-widest uppercase transition-all border",
                      isSaved
                        ? "bg-plasma text-void border-plasma"
                        : "border-border text-text-secondary hover:border-plasma hover:text-plasma disabled:opacity-50"
                    )}
                  >
                    {saving && activeTheme === theme.id
                      ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                      : isSaved ? "Applied" : "Apply Theme"
                    }
                  </button>
                  <a
                    href={`/livin3d/${savedTheme === theme.id ? "" : "?preview=" + theme.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 border border-border text-text-tertiary hover:border-plasma/50 hover:text-plasma transition-colors flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
