"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Utensils, QrCode, BarChart3, Settings, Plus, Users, CreditCard, Headphones } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const commands: CommandItem[] = [
    { id: "add-dish", label: "Add New Dish", icon: Plus, action: () => router.push("/dashboard/dishes/new"), category: "Dishes" },
    { id: "dishes", label: "All Dishes", icon: Utensils, action: () => router.push("/dashboard/dishes"), category: "Dishes" },
    { id: "qr-studio", label: "QR Studio", icon: QrCode, action: () => router.push("/dashboard/qr-studio"), category: "QR Codes" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => router.push("/dashboard/analytics"), category: "Analytics" },
    { id: "settings", label: "Settings", icon: Settings, action: () => router.push("/dashboard/settings"), category: "Settings" },
    { id: "badges", label: "Badge Editor", icon: Utensils, action: () => router.push("/dashboard/badges"), category: "Settings" },
    { id: "admin-restaurants", label: "Manage Restaurants", icon: Users, action: () => router.push("/admin/restaurants"), category: "Admin" },
    { id: "admin-billing", label: "Billing Management", icon: CreditCard, action: () => router.push("/admin/billing"), category: "Admin" },
    { id: "admin-support", label: "Support Tickets", icon: Headphones, action: () => router.push("/admin/support"), category: "Admin" },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-plasma text-void px-4 py-2 rounded-lg font-ui text-sm flex items-center gap-2 shadow-lg hover:shadow-plasma/30 transition-all"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
        <kbd className="ml-2 px-2 py-0.5 bg-void/20 rounded text-xs">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl bg-terminal border border-border rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-body-md font-body text-text-primary placeholder:text-text-tertiary"
                autoFocus
              />
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-text-tertiary hover:text-text-primary" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p className="px-3 py-2 text-body-xs font-ui text-text-tertiary uppercase tracking-wider">{category}</p>
                  {items.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface rounded-md transition-colors text-left"
                    >
                      <cmd.icon className="w-4 h-4 text-text-tertiary" />
                      <span className="text-body-sm font-body text-text-primary">{cmd.label}</span>
                    </button>
                  ))}
                </div>
              ))}
              {filteredCommands.length === 0 && (
                <p className="text-body-sm font-body text-text-tertiary text-center py-8">No commands found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}