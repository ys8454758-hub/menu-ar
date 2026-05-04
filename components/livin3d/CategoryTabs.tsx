"use client";

import { motion } from "framer-motion";

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-[80px] z-30 bg-background/80 backdrop-blur-md px-6 py-4 border-b border-border/30 -mx-6 mb-6 overflow-x-auto hide-scrollbar"
        >
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`
                            px-6 py-2 rounded-full font-ui text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all
                            ${activeCategory === category 
                                ? "bg-plasma text-void shadow-[0_0_15px_rgba(255,140,0,0.4)]" 
                                : "bg-terminal text-text-tertiary hover:text-text-secondary border border-border/50"}
                        `}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
