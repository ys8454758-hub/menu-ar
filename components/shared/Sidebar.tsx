"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, Home, Crop, BarChart2, Settings, Activity, Menu as MenuIcon, SatelliteDish } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      isActive: (path) => path === "/dashboard",
    },
    {
      name: "Dishes",
      href: "/dashboard/dishes",
      icon: SatelliteDish,
      isActive: (path) => path.startsWith("/dashboard/dishes"),
    },
    {
      name: "QR Studio",
      href: "/dashboard/qr-studio",
      icon: Crop,
      isActive: (path) => path.startsWith("/dashboard/qr-studio"),
    },
    {
      name: "Badges",
      href: "/dashboard/badges",
      icon: MenuIcon,
      isActive: (path) => path.startsWith("/dashboard/badges"),
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
      isActive: (path) => path.startsWith("/dashboard/analytics"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      isActive: (path) => path.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-terminal/90 backdrop-blur-sm border-r border-border">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center px-4 py-6 border-b border-border">
          <span className="text-xl font-display text-plasma tracking-widest">
            MenuAR
          </span>
        </div>
        <nav className="mt-6 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-items-center px-3 py-2 text-sm font-ui text-text-secondary hover:bg-terminal/70 hover:text-text-primary transition-colors",
                item.isActive(pathname)
                  ? "bg-terminal/70 text-text-primary border-l-2 border-plasma"
                  : "border-l-2 border-transparent"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0 text-text-secondary" />
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="flex-shrink-0 border-t border-border px-4 py-4">
          {/* Restaurant info would go here */}
          <div className="text-xs text-text-secondary">
            Restaurant Name
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <div className="h-3 w-3 bg-plasma rounded" />
            <span className="text-text-secondary">STARTER PLAN</span>
          </div>
        </div>
      </div>
    </aside>
  );
}