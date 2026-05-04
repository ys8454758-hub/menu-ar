"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Menu, X } from "lucide-react";

import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import Pricing from "@/components/marketing/Pricing";

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Stats Section ─── */
function Stats() {
    const stats = [
        { value: 150, suffix: "+", label: "Restaurants" },
        { value: 50000, suffix: "+", label: "AR Scans" },
        { value: 1200, suffix: "+", label: "3D Dishes" },
        { value: 98, suffix: "%", label: "Satisfaction" },
    ];

    return (
        <section className="py-20 px-6 border-y border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-plasma/5 via-transparent to-plasma/5 opacity-30" />
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                        <p className="text-4xl md:text-5xl font-display text-plasma tracking-widest">
                            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-body-sm font-ui text-text-tertiary tracking-widest uppercase mt-3">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ─── FAQ Section ─── */
function FAQ() {
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const faqs = [
        { q: "How does Livin3D work?", a: "Restaurant owners upload 3D models of their dishes. Customers scan a QR code at their table and see the dish in augmented reality before ordering." },
        { q: "Do customers need to download an app?", a: "No! Livin3D works directly in the mobile browser. iOS Safari opens Quick Look AR, and Android Chrome launches Scene Viewer." },
        { q: "What file formats are supported?", a: "We support GLB (GL Transmission Format Binary), the industry standard for web-based 3D. Most 3D tools can export to GLB." },
        { q: "How long does setup take?", a: "Most restaurants are up and running within 30 minutes. Upload dishes, customize QR codes, print them, and place on tables." },
        { q: "Is it available in other languages?", a: "Yes! The AR viewer supports English, Kannada, and Hindi with automatic language detection." },
        { q: "What if a dish is removed from the menu?", a: "Archived dishes redirect QR scans to your restaurant's main AR page. Customers never see a 404." },
    ];

    return (
        <section id="faq" className="py-32 px-6">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase">FAQ</h2>
                </motion.div>
                <div className="space-y-4">
{faqs.map((faq, i) => (
                <motion.div
                    key={i}
                    className="border border-[#1a1714] bg-[#1a1714] group rounded-xl shadow-md hover:shadow-xl hover:shadow-plasma/10"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                            <button
                                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface/30 transition-colors"
                            >
                                <span className="text-body-md font-ui text-text-primary tracking-wider pr-4">{faq.q}</span>
                                <span className={`text-plasma text-xl transition-transform duration-300 shrink-0 ${faqOpen === i ? "rotate-45" : ""}`}>+</span>
                            </button>
                            <motion.div
                                initial={false}
                                animate={{ height: faqOpen === i ? "auto" : 0, opacity: faqOpen === i ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 border-t border-[#1a1714]/50">
                                    <p className="text-body-sm font-body text-text-secondary pt-4 leading-relaxed">{faq.a}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── CTA Section ─── */
function CTA() {
    return (
        <section className="py-32 px-6 border-t border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-plasma/5 to-transparent pointer-events-none" />
            <motion.div
                className="max-w-3xl mx-auto text-center relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase mb-6">Ready to Transform Your Menu?</h2>
                <p className="text-body-lg font-body text-text-secondary mb-10">Join 150+ Bengaluru restaurants already using Livin3D</p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link href="/register" className="px-10 py-4 bg-plasma text-void font-ui text-sm tracking-widest uppercase hover:shadow-plasma-glow transition-all duration-300">
                        Start Free Trial
                    </Link>
                    <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-4 border border-success text-success font-ui text-sm tracking-widest uppercase hover:bg-success/10 transition-all duration-300"
                    >
                        WhatsApp Us
                    </a>
                </div>
            </motion.div>
        </section>
    );
}

/* ─── Navbar ─── */
const NAV_LINKS = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
];

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-void/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20" : "bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-display-sm font-display text-plasma tracking-widest">
                        LIVIN<span className="text-text-accent">3D</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((l) => (
                            <a key={l.href} href={l.href} className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors tracking-wider uppercase">
                                {l.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden md:block text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors tracking-wider uppercase">Login</Link>
                        <Link href="/register" className="px-5 py-2 bg-plasma text-void font-ui text-sm tracking-widest uppercase hover:shadow-plasma-glow transition-all duration-300">
                            Get Started
                        </Link>
                        {/* Hamburger */}
                        <button
                            className="md:hidden p-2 text-text-primary hover:text-plasma transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer */}
            <motion.div
                initial={false}
                animate={{ x: mobileOpen ? 0 : "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-72 z-[99] bg-void/98 backdrop-blur-xl border-l border-border flex flex-col pt-20 pb-8 px-6 md:hidden"
            >
                <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="py-3 px-4 text-body-md font-ui text-text-secondary hover:text-plasma hover:bg-plasma/5 transition-all tracking-wider uppercase border-b border-border/30"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>
                <div className="mt-8 flex flex-col gap-3">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                        className="py-3 px-4 text-center border border-border text-text-secondary font-ui text-sm tracking-widest uppercase hover:border-plasma hover:text-plasma transition-all">
                        Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                        className="py-3 px-4 text-center bg-plasma text-void font-ui text-sm tracking-widest uppercase hover:shadow-plasma-glow transition-all">
                        Get Started
                    </Link>
                </div>
            </motion.div>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[98] bg-black/50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}

/* ─── Footer ─── */
function Footer() {
    return (
        <footer className="border-t border-border py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <span className="text-display-sm font-display text-plasma tracking-widest">
                        LIVIN<span className="text-text-accent">3D</span>
                    </span>
                    <p className="text-body-sm font-body text-text-tertiary mt-2">Augmented Reality menus for Bengaluru restaurants</p>
                </div>
                <div className="flex items-center gap-8">
                    {NAV_LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors tracking-wider uppercase">{l.label}</a>
                    ))}
                    <Link href="/login" className="text-body-sm font-ui text-text-tertiary hover:text-plasma transition-colors tracking-wider uppercase">Login</Link>
                </div>
                <p className="text-body-xs font-mono text-text-tertiary">© 2026 Livin3D. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default function MarketingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <HowItWorks />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </div>
    );
}