"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-body-sm font-body" aria-label="Breadcrumb">
      <Link 
        href="/dashboard" 
        className="text-text-tertiary hover:text-plasma transition-colors flex items-center"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-text-tertiary/50" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-text-secondary hover:text-plasma transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}