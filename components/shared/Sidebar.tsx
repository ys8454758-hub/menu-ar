"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, UtensilsCrossed, Crop, Tag, BarChart2, Settings, LogOut, Paintbrush, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [restaurant, setRestaurant] = useState<{ name: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data) && data.length > 0) setRestaurant(data[0]); })
      .catch(() => {});
  }, []);

  const navItems: NavItem[] = [
    { name: "Overview", href: "/dashboard", icon: Home, isActive: (p) => p === "/dashboard" },
    { name: "Dishes", href: "/dashboard/dishes", icon: UtensilsCrossed, isActive: (p) => p.startsWith("/dashboard/dishes") },
    { name: "QR Studio", href: "/dashboard/qr-studio", icon: Crop, isActive: (p) => p.startsWith("/dashboard/qr-studio") },
    { name: "Menu Themes", href: "/dashboard/menu-themes", icon: Paintbrush, isActive: (p) => p.startsWith("/dashboard/menu-themes") },
    { name: "Badges", href: "/dashboard/badges", icon: Tag, isActive: (p) => p.startsWith("/dashboard/badges") },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2, isActive: (p) => p.startsWith("/dashboard/analytics") },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, isActive: (p) => p.startsWith("/dashboard/settings") },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed inset-y-0 left-0 bg-terminal/90 backdrop-blur-xl border-r border-plasma/10 flex flex-col z-40 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-[72px]"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-plasma/20 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center px-4 py-5 border-b border-plasma/10 overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-max">
          <div className="w-10 h-10 bg-plasma/15 border border-plasma/40 flex items-center justify-center flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-plasma/10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
            <span className="relative text-lg font-display text-plasma font-bold">L</span>
          </div>
          <div className={cn("transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 invisible")}>
            <span className="text-xl font-display tracking-widest font-bold">
              <span className="text-plasma">LIVIN</span><span className="text-text-accent">3D</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3 overflow-x-hidden">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center h-11 px-3 text-sm font-ui tracking-wide transition-all duration-200 relative group/item",
                active
                  ? "bg-plasma/10 text-plasma border-l-2 border-plasma shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/40 border-l-2 border-transparent"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-plasma blur-sm" />
              )}
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", active ? "text-plasma" : "text-text-tertiary group-hover/item:text-text-secondary")} />
              <span className={cn("ml-4 transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 invisible")}>
                {item.name}
              </span>
              {active && isExpanded && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Restaurant info + Status + Logout */}
      <div className="border-t border-plasma/10 p-3 space-y-3 overflow-hidden">
        {/* Platform Status */}
        <div className={cn("flex items-center gap-3 px-3 py-2 bg-success/5 border border-success/20 transition-all", isExpanded ? "opacity-100" : "opacity-0 invisible")}>
          <Zap className="w-3 h-3 text-success flex-shrink-0" />
          <span className="text-[10px] font-ui text-success tracking-widest uppercase">Platform Active</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </div>

        <div className="flex items-center gap-4 min-w-max px-1">
          <div className="w-8 h-8 bg-plasma/20 border border-plasma/40 flex items-center justify-center flex-shrink-0">
            <span className="text-plasma text-xs font-display font-bold">
              {restaurant?.name?.[0]?.toUpperCase() ?? "R"}
            </span>
          </div>
          <div className={cn("transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0 invisible")}>
            <p className="text-body-xs font-ui text-text-primary truncate max-w-[140px]">
              {restaurant?.name ?? "Your Restaurant"}
            </p>
            <p className="text-[10px] font-mono text-plasma tracking-widest">PRO · UNLIMITED</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex w-full items-center h-9 px-3 text-sm font-ui text-text-tertiary hover:bg-ember/10 hover:text-ember transition-all duration-200 group/logout"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 group-hover/logout:text-ember transition-colors" />
          <span className={cn("ml-4 transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100" : "opacity-0 invisible")}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}