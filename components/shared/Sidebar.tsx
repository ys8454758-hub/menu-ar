"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, UtensilsCrossed, Crop, Tag, BarChart2, Settings, LogOut, Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [restaurant, setRestaurant] = useState<{ name: string; subscription?: { plan: string } | null } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data) && data.length > 0) setRestaurant(data[0]); })
      .catch(() => {});
  }, []);

  const planLabel = restaurant?.subscription?.plan ?? "STARTER";

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
        "fixed inset-y-0 left-0 bg-terminal/95 backdrop-blur-sm border-r border-border flex flex-col z-40 transition-all duration-300 ease-in-out group",
        isExpanded ? "w-64" : "w-[72px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center px-4 py-5 border-b border-border overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-4 min-w-max">
          <div className="w-10 h-10 bg-plasma/20 border border-plasma/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-display text-plasma">L</span>
          </div>
          <span className={cn(
            "text-xl font-display text-plasma tracking-widest transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 invisible"
          )}>
            Livin<span className="text-text-accent">3D</span>
          </span>
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
                "flex items-center h-11 px-3 text-sm font-ui tracking-wide transition-all duration-200 group/item relative rounded-none",
                active
                  ? "bg-plasma/10 text-plasma border-l-2 border-plasma"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/60 border-l-2 border-transparent"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", active ? "text-plasma" : "text-text-tertiary group-hover/item:text-text-secondary")} />
              <span className={cn(
                "ml-4 transition-all duration-300 whitespace-nowrap",
                isExpanded ? "opacity-100" : "opacity-0 invisible"
              )}>
                {item.name}
              </span>
              {active && isExpanded && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-plasma animate-pulse transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Restaurant info + Logout */}
      <div className="border-t border-border p-3 space-y-3 overflow-hidden">
        <div className="flex items-center gap-4 min-w-max">
          <div className="w-10 h-10 bg-plasma/20 border border-plasma/30 flex items-center justify-center flex-shrink-0">
            <span className="text-plasma text-sm font-display font-bold">
              {restaurant?.name?.[0]?.toUpperCase() ?? "R"}
            </span>
          </div>
          <div className={cn(
            "transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 invisible"
          )}>
            <p className="text-body-sm font-ui text-text-primary truncate max-w-[140px]">
              {restaurant?.name ?? "Your Restaurant"}
            </p>
            <p className="text-body-xs font-mono text-plasma">{planLabel} PLAN</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex w-full items-center h-10 px-3 text-sm font-ui text-text-tertiary hover:bg-ember/10 hover:text-ember transition-all duration-200 group/logout rounded-none"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 group-hover/logout:text-ember transition-colors" />
          <span className={cn(
            "ml-4 transition-all duration-300 whitespace-nowrap",
            isExpanded ? "opacity-100" : "opacity-0 invisible"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}