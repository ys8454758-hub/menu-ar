"use client";

import { useState } from "react";
import { Plus, Tag, GripVertical, CheckCircle, Save, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: "standard" | "custom";
}

const DEFAULT_BADGES: Badge[] = [
  { id: "1", name: "Vegan", emoji: "🌱", color: "#00FFD1", type: "standard" },
  { id: "2", name: "Vegetarian", emoji: "🥦", color: "#39FF14", type: "standard" },
  { id: "3", name: "Gluten-Free", emoji: "🌾", color: "#D4AF37", type: "standard" },
  { id: "4", name: "Spicy", emoji: "🌶️", color: "#EF4444", type: "standard" },
  { id: "5", name: "Halal", emoji: "☪️", color: "#10B981", type: "standard" },
  { id: "6", name: "Jain", emoji: "🧄", color: "#FFB020", type: "standard" },
];

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [newBadge, setNewBadge] = useState({ name: "", emoji: "✨", color: "#D4AF37" });
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function handleAddBadge(e: React.FormEvent) {
    e.preventDefault();
    if (!newBadge.name.trim()) return;
    setBadges([...badges, { ...newBadge, id: Date.now().toString(), type: "custom" }]);
    setNewBadge({ name: "", emoji: "✨", color: "#D4AF37" });
  }

  function handleRemoveBadge(id: string) {
    setBadges(badges.filter(b => b.id !== id));
  }

  async function handleSaveTheme() {
    setSaving(true);
    // Mock save
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setToast({ type: "success", msg: "Global badge theme saved!" });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 border shadow-lg backdrop-blur-sm border-success/50 bg-success/10 text-success transition-all">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-body-sm font-ui tracking-wider">{toast.msg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lg font-display text-text-accent tracking-widest uppercase">Dietary Badges</h1>
            <p className="text-body-sm font-mono text-text-tertiary mt-1">Manage global badges assigned to your dishes.</p>
          </div>
          <button onClick={handleSaveTheme} disabled={saving}
            className="flex items-center gap-2 bg-plasma text-void px-6 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-all disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Theme"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="border border-border bg-terminal">
              <div className="border-b border-border/50 bg-surface/50 p-4">
                <h2 className="text-body-sm font-ui text-text-secondary tracking-widest uppercase">Active Badges</h2>
              </div>
              <div className="p-4 space-y-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="group flex items-center justify-between p-3 border border-border/50 bg-surface hover:border-plasma/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab text-text-tertiary hover:text-plasma transition-colors"><GripVertical className="w-4 h-4" /></div>
                      <span className="text-lg w-6 text-center">{badge.emoji}</span>
                      <span className="font-body text-text-primary">{badge.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-border" style={{ backgroundColor: badge.color }} />
                        <span className="text-body-xs font-mono text-text-tertiary">{badge.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-ui border border-border px-1.5 uppercase tracking-wider text-text-tertiary">
                          {badge.type}
                        </span>
                        {badge.type === "custom" && (
                          <button onClick={() => handleRemoveBadge(badge.id)} className="text-body-xs text-ember hover:underline font-ui ml-2">Del</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Creator */}
            <div className="border border-border bg-terminal p-6">
              <h2 className="text-body-sm font-ui text-text-accent tracking-widest uppercase mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-plasma" /> Create Custom Badge
              </h2>
              <form onSubmit={handleAddBadge} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">Emoji</label>
                  <input type="text" value={newBadge.emoji} onChange={e => setNewBadge({ ...newBadge, emoji: e.target.value })}
                    className="w-full bg-surface border border-border px-3 py-2 text-center text-xl focus:border-plasma outline-none" required />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">Name</label>
                  <input type="text" value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                    className="w-full bg-surface border border-border px-3 py-2 text-text-primary focus:border-plasma outline-none" placeholder="e.g. Nut-Free" required />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">Color</label>
                  <div className="flex bg-surface border border-border">
                    <input type="color" value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })}
                      className="w-10 h-10 border-0 cursor-pointer bg-transparent p-0.5" />
                    <input type="text" value={newBadge.color} readOnly className="w-full bg-transparent px-2 text-xs font-mono text-text-tertiary outline-none" />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="w-full border border-plasma text-plasma py-2.5 font-ui text-xs tracking-widest uppercase hover:bg-plasma/10 transition-colors">
                    Add Badge
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AR Preview Sidebar */}
          <div className="lg:col-span-2 border border-border bg-terminal space-y-6">
            <div className="border-b border-border/50 bg-surface/50 p-4">
              <h2 className="text-body-sm font-ui text-text-secondary tracking-widest uppercase">Dish Preview</h2>
            </div>
            <div className="p-6">
              <p className="text-body-xs font-body text-text-tertiary mb-4">
                This is how badges manifest on the AR display cards for your customers.
              </p>
              
              <div className="border border-border/50 bg-surface p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display tracking-widest text-text-primary text-lg">Butter Chicken</h3>
                    <p className="font-mono text-plasma text-sm">₹450.00</p>
                  </div>
                  <Tag className="w-4 h-4 text-text-tertiary opacity-50" />
                </div>
                <p className="text-xs font-body text-text-tertiary leading-relaxed">
                  Classic creamy tomato curry with tender chicken pieces, finished with dried fenugreek.
                </p>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                  {badges.slice(0, 3).map(b => (
                    <span key={b.id} className="px-2 py-1 border font-ui text-[10px] tracking-wider uppercase flex items-center gap-1.5"
                      style={{ borderColor: `${b.color}50`, color: b.color, backgroundColor: `${b.color}10` }}>
                      <span className="text-sm">{b.emoji}</span> {b.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 border border-border/30 bg-surface/30">
                <h3 className="text-body-xs font-ui text-text-secondary tracking-widest uppercase mb-2">Assignment Rules</h3>
                <p className="text-body-xs font-body text-text-tertiary mb-3">
                  Badges are assigned individually to dishes within the Dish Editor. You can select an active badge via the tag input field.
                </p>
                <Link href="/dashboard/dishes" className="text-body-xs text-plasma hover:underline flex items-center gap-1">
                  Assign to dishes now <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}