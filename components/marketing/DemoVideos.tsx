"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const demos = [
    {
        title: "Photorealistic AR Dish",
        desc: "Watch how customers can see every detail of their meal before ordering.",
        thumbnail: "/images/demo-1.jpg",
        color: "from-plasma/20 to-transparent"
    },
    {
        title: "QR Studio in Action",
        desc: "Customizing QR codes with brand logos and colors in seconds.",
        thumbnail: "/images/demo-2.jpg",
        color: "from-success/20 to-transparent"
    },
    {
        title: "Real-time Analytics",
        desc: "Tracking scan heatmaps and dish performance in the dashboard.",
        thumbnail: "/images/demo-3.jpg",
        color: "from-blue-500/20 to-transparent"
    }
];

export default function DemoVideos() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
        })
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrent((prev) => (prev + newDirection + demos.length) % demos.length);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, current]);

    return (
        <section id="demos" className="py-32 relative overflow-hidden bg-void">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-plasma/5 rounded-full blur-[200px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-24"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase mb-6">Experience Livin3D</h2>
                    <p className="text-body-lg font-body text-text-secondary max-w-2xl mx-auto">See how we transform the dining experience through precision AR and analytics.</p>
                </motion.div>

                <div 
                    className="relative h-[400px] md:h-[600px] flex items-center justify-center group"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                scale: { duration: 0.4 }
                            }}
                            className="absolute inset-0 flex flex-col md:flex-row gap-12 items-center cursor-grab active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                                if (swipe) {
                                    paginate(offset.x > 0 ? -1 : 1);
                                }
                            }}
                        >
                            <div className="w-full md:w-3/5 h-full relative rounded-3xl overflow-hidden border border-[#1a1714] shadow-2xl pointer-events-none">
                                <div className={`absolute inset-0 bg-gradient-to-br ${demos[current].color} z-10`} />
                                <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                                    <div className="relative z-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-plasma rounded-full flex items-center justify-center shadow-plasma-glow animate-pulse">
                                            <Play className="w-8 h-8 text-void fill-void" />
                                        </div>
                                        <p className="text-plasma font-ui text-xs tracking-widest uppercase mt-6 opacity-60">Demo Video Placeholder</p>
                                    </div>
                                </div>
                                {/* In a real app, this would be a <video> or <iframe> */}
                            </div>

                            <div className="w-full md:w-2/5 flex flex-col justify-center pointer-events-auto">
                                <motion.h3 
                                    className="text-display-sm font-display text-text-primary tracking-widest uppercase mb-6"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {demos[current].title}
                                </motion.h3>
                                <motion.p 
                                    className="text-body-lg font-body text-text-secondary leading-relaxed mb-8"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {demos[current].desc}
                                </motion.p>
                                <motion.button
                                    className="inline-flex w-fit px-8 py-4 bg-plasma text-void font-ui text-xs tracking-widest uppercase hover:shadow-plasma-glow transition-all"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Watch Full Demo
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-4 bg-void/50 backdrop-blur-md border border-[#1a1714] rounded-full text-plasma hover:bg-plasma hover:text-void transition-all opacity-0 group-hover:opacity-100 -translate-x-1/2 lg:-translate-x-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-4 bg-void/50 backdrop-blur-md border border-[#1a1714] rounded-full text-plasma hover:bg-plasma hover:text-void transition-all opacity-0 group-hover:opacity-100 translate-x-1/2 lg:translate-x-0"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-3">
                        {demos.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setDirection(i > current ? 1 : -1);
                                    setCurrent(i);
                                }}
                                className={`w-12 h-1 transition-all duration-500 ${i === current ? "bg-plasma" : "bg-[#1a1714]"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
