import type { Metadata } from "next";
import { Orbitron, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "MenuAR | Future of Restaurant Menus",
  description: "Experience your food in Augmented Reality before you order. Holographic 3D dishes on your table.",
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
        orbitron.variable,
        ibmPlexMono.variable,
        spaceGrotesk.variable
      )}
    >
      <body className="antialiased bg-void text-text-primary font-body grid-texture selection:bg-plasma/30">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] scanline z-50 overflow-hidden" />
        {children}
      </body>
    </html>
  );
}
