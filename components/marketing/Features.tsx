"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
    { icon: "🎯", title: "3D AR Menu", desc: "Customers see photorealistic 3D models of dishes right on their table through their phone camera." },
    { icon: "📱", title: "QR Code Scanning", desc: "One scan is all it takes. No app download needed — works directly in the mobile browser." },
    { icon: "🏷️", title: "Health Badges", desc: "Vegan, Gluten-Free, Spicy — auto-generated dietary badges help customers choose wisely." },
    { icon: "📊", title: "Scan Analytics", desc: "Know which dishes get the most views, when, and from what devices. Real-time dashboard." },
    { icon: "🎨", title: "QR Design Studio", desc: "Customize QR codes with your brand colors, logos, and styles. Download as PNG, SVG, or PDF." },
    { icon: "🌍", title: "Multi-Language", desc: "Serve international guests with automatic menu translation in English, Hindi, and Kannada." },
];

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="perspective-1000"
        >
            <div 
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="p-8 h-full bg-[#1a1714] border border-[#1a1714] group hover:border-plasma/40 shadow-xl hover:shadow-2xl hover:shadow-plasma/20 rounded-2xl transition-all duration-500 relative"
            >
                {/* Floating highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-plasma/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div 
                    style={{ transform: "translateZ(50px)" }}
                    className="text-4xl mb-6 inline-block filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(0,255,209,0.3)]"
                >
                    {f.icon}
                </div>
                
                <h3 
                    style={{ transform: "translateZ(25px)" }}
                    className="text-display-xs font-display text-text-primary tracking-widest uppercase mb-4 group-hover:text-plasma transition-colors"
                >
                    {f.title}
                </h3>
                
                <p 
                    style={{ transform: "translateZ(10px)" }}
                    className="text-body-sm font-body text-text-secondary leading-relaxed"
                >
                    {f.desc}
                </p>
                
                {/* Decorative 3D elements */}
                <div className="absolute bottom-4 right-4 text-plasma/10 text-4xl font-display italic select-none">
                    {i + 1}
                </div>
            </div>
        </motion.div>
    );
}

export default function Features() {
    return (
        <section id="features" className="py-32 relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-plasma/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-white/5 blur-[120px] rounded-full animate-pulse-delayed" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div 
                    className="text-center mb-24" 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase mb-6">Unrivaled Power</h2>
                    <p className="text-body-lg font-body text-text-secondary max-w-2xl mx-auto">From precision 3D uploads to neural scan analytics — we&apos;ve built the ultimate platform for the future of Bengaluru&apos;s food scene.</p>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <FeatureCard key={f.title} f={f} i={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}