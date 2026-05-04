"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, QrCode } from "lucide-react";
import { Restaurant } from "@/types";

interface MenuHeaderProps {
    restaurant: Restaurant;
    cartCount: number;
    onCartOpen: () => void;
    onQrOpen: () => void;
}

export default function MenuHeader({ restaurant, cartCount, onCartOpen, onQrOpen }: MenuHeaderProps) {
    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4"
        >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="flex items-center gap-3 min-w-0"
                >
                    {restaurant.logoUrl && (
                        <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg">
                            <Image src={restaurant.logoUrl} alt={restaurant.name} fill className="object-cover" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-display-sm font-display text-text-accent tracking-widest uppercase truncate">
                            {restaurant.name}
                        </h1>
                        {restaurant.address && (
                            <p className="text-body-xs font-mono text-text-tertiary truncate">
                                {restaurant.address}
                            </p>
                        )}
                    </div>
                </motion.div>

                <div className="flex items-center gap-2 shrink-0">
                    {restaurant.menuQrUrl && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onQrOpen}
                            className="p-2 text-text-tertiary hover:text-plasma transition-colors"
                        >
                            <QrCode className="w-5 h-5" />
                        </motion.button>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onCartOpen}
                        className="relative p-2 text-text-accent hover:text-plasma transition-colors"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {cartCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-plasma text-void text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.header>
    );
}
