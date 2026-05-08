"use client";

import Link from "next/link";
import { Plus, Box } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface MenuDishCardProps {
    dish: {
        id: string;
        name: string;
        description: string | null;
        price: number | null;
        slug: string;
        category: string | null;
        model: { id: string } | null;
        badges: { type: string }[];
    };
    restaurantSlug: string;
    onAddToCart: (dish: { id: string; name: string; price: number | null }) => void;
}

export default function MenuDishCard({ dish, restaurantSlug, onAddToCart }: MenuDishCardProps) {
    const isVeg = dish.badges.some(b => b.type === "VEG");
    const isNonVeg = dish.badges.some(b => b.type === "NON_VEG");

    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const rotateX = useTransform(y, [0, 1], [10, -10]);
    const rotateY = useTransform(x, [0, 1], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width);
        y.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    return (
        <motion.div 
            style={{ 
                borderRadius: "var(--radius)",
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group bg-terminal backdrop-blur-md border border-border/50 hover:border-plasma/50 transition-colors duration-300 relative overflow-visible flex flex-col perspective-1000"
        >
            <div className="relative h-full w-full p-5 flex-1 flex flex-col bg-terminal" style={{ borderRadius: "var(--radius)" }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />
                
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {isVeg && (
                                    <div className="w-3 h-3 border border-success flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-success" />
                                    </div>
                                )}
                                {isNonVeg && (
                                    <div className="w-3 h-3 border border-ember flex items-center justify-center">
                                        <div className="w-full h-full rounded-full bg-ember" />
                                    </div>
                                )}
                                <h3 className="text-body-lg font-display text-text-accent tracking-wide truncate">{dish.name}</h3>
                            </div>
                            {dish.description && (
                                <p className="text-body-sm font-body text-text-tertiary line-clamp-2 mb-2">
                                    {dish.description}
                                </p>
                            )}
                        </div>
                        {dish.price && (
                            <span className="text-body-md font-mono text-plasma shrink-0">
                                ₹{dish.price.toFixed(0)}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <div className="flex gap-2">
                            {dish.model && (
                                <Link 
                                    href={`/ar/${restaurantSlug}/${dish.slug}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-plasma/10 border border-plasma/30 text-plasma font-ui text-xs tracking-widest uppercase hover:bg-plasma/20 transition-all"
                                >
                                    <Box className="w-3 h-3" />
                                    View in 3D
                                </Link>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => onAddToCart(dish)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-text-accent text-void font-ui text-xs tracking-widest uppercase hover:bg-plasma hover:shadow-[0_0_15px_rgba(0,255,209,0.3)] transition-all active:scale-95"
                        >
                            <Plus className="w-3 h-3" />
                            Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-plasma/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ borderRadius: "var(--radius)" }} />
        </motion.div>
    );
}