import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/shared/ErrorBoundaryClient";

const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
});

const plusJakartaBody = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-body",
});

const plusJakartaUI = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-ui",
});

const cormorant = Cormorant_Garamond({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-serif",
    style: ["normal", "italic"],
});

export const viewport: Viewport = {
    themeColor: "#00FFD1",
};

export const metadata: Metadata = {
    title: "Livin3D | Future of Restaurant Menus",
    description: "Experience your food in Augmented Reality before you order. Premium 3D dishes on your table.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBar: "black-translucent",
        title: "Livin3D",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark selection:bg-plasma selection:text-void",
        bricolage.variable,
        plusJakartaBody.variable,
        plusJakartaUI.variable,
        cormorant.variable
      )}
    >
      <body className="antialiased text-text-primary font-body relative min-h-screen bg-void">
        {/* Absolute Background Layer - Wavy Glossy Gradient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -50 }}>
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-ivory via-void to-ivory-light" />

          {/* Wavy blob 1 - top left */}
          <div className="absolute top-[-30%] left-[-20%] w-[1200px] h-[1200px] animate-wavy-slow" style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,252,240,0.6) 40%, transparent 70%)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />

          {/* Wavy blob 2 - bottom right */}
          <div className="absolute bottom-[-30%] right-[-20%] w-[1000px] h-[1000px] animate-wavy-slow-delayed" style={{ background: "radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.85) 0%, rgba(255,255,250,0.5) 40%, transparent 70%)", borderRadius: "50% 50% 40% 60% / 50% 50% 60% 50%" }} />

          {/* Wavy blob 3 - center top */}
          <div className="absolute top-[10%] right-[20%] w-[600px] h-[600px] animate-wavy-medium" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.7) 0%, transparent 60%)", borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%" }} />

          {/* Glossy overlay - light reflection sweep */}
          <div className="absolute inset-0 animate-glossy-sweep" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)" }} />

          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(7,6,18,0.3) 100%)" }} />
        </div>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}