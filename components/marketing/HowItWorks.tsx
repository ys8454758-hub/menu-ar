"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

const steps = [
    { step: "01", title: "Upload Your Menu", desc: "Add dishes with photos, ingredients, nutrition info, and 3D models via the dashboard.", icon: "📤" },
    { step: "02", title: "Generate QR Codes", desc: "Use the QR Design Studio to create branded QR codes for each dish or table.", icon: "🎨" },
    { step: "03", title: "Guests Scan and Explore", desc: "Diners scan the QR code with their phone browser. No app needed. Dishes appear in AR on their table.", icon: "📱" },
    { step: "04", title: "Track and Optimize", desc: "See which dishes get the most attention, peak scan times, and device breakdowns in real-time.", icon: "📊" },
];

function QRCube() {
    return (
        <div className="relative w-32 h-32 perspective-1000 preserve-3d">
            {[
                { rotate: "rotateY(0deg) translateZ(64px)", color: "bg-surface-high" },
                { rotate: "rotateY(90deg) translateZ(64px)", color: " " },
                { rotate: "rotateY(180deg) translateZ(64px)", color: "bg-surface-high" },
                { rotate: "rotateY(-90deg) translateZ(64px)", color: " " },
                { rotate: "rotateX(90deg) translateZ(64px)", color: "bg-surface-high" },
                { rotate: "rotateX(-90deg) translateZ(64px)", color: " " },
            ].map((face, i) => (
                <motion.div
                    key={i}
                    className={`absolute inset-0 border border-plasma/30 ${face.color} flex items-center justify-center overflow-hidden`}
                    style={{ transform: face.rotate }}
                    initial={{ opacity: 0, scale: 0, x: (i - 2.5) * 100, y: (i % 2 === 0 ? 100 : -100) }}
                    whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring", stiffness: 50 }}
                >
                    <div className="w-full h-full p-2 opacity-40">
                        <div className="grid grid-cols-4 gap-1 h-full w-full">
                            {Array.from({ length: 16 }).map((_, j) => (
                                <div key={j} className={`border border-plasma/10 ${Math.random() > 0.5 ? "bg-plasma/20" : ""}`} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
            <motion.div 
                className="absolute inset-0"
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section id="how-it-works" className="py-32 relative overflow-hidden" ref={containerRef}>

            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div 
                    className="text-center mb-24" 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase mb-6">Execution Pipeline</h2>
                    <p className="text-body-lg font-body text-text-secondary max-w-2xl mx-auto">Four precision steps to transform your physical space into a digital showroom.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative">
                    {steps.map((s, i) => (
                        <div key={s.step} className="relative">
                            <motion.div 
                                className="bg-[#1a1714] border border-[#1a1714] p-8 h-full relative group hover:border-plasma/40 shadow-xl hover:shadow-2xl hover:shadow-plasma/20 rounded-2xl transition-all duration-500 z-10"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                            >
                                <div className="h-48 flex items-center justify-center mb-8 border border-[#1a1714]/50 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-plasma/5 to-transparent" />
                                    
                                    {i === 1 ? (
                                        <QRCube />
                                    ) : (
                                        <motion.div 
                                            className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                                        >
                                            {s.icon}
                                        </motion.div>
                                    )}
                                </div>

                                <h3 className="text-display-xs font-display text-text-primary tracking-widest uppercase mb-4">{s.title}</h3>
                                <p className="text-body-sm font-body text-text-secondary leading-relaxed">{s.desc}</p>
                                
                                <div className="mt-8 h-1 w-0 bg-plasma group-hover:w-full transition-all duration-700" />
                            </motion.div>

                            {/* Transition Arrow (Desktop) */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:flex absolute top-1/2 -right-8 -translate-y-1/2 z-20 pointer-events-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.15 }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-plasma w-8 h-8 drop-shadow-plasma-glow">
                                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </motion.div>
                                </div>
                            )}

                            {/* Transition Arrow (Mobile) */}
                            {i < steps.length - 1 && (
                                <div className="lg:hidden flex justify-center py-6">
                                    <motion.div
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-plasma w-6 h-6">
                                            <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}