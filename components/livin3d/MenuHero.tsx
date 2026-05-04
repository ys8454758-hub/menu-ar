"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface MenuHeroProps {
    coverImageUrl: string;
    restaurantName: string;
}

export default function MenuHero({ coverImageUrl, restaurantName }: MenuHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-48 md:h-64 overflow-hidden"
        >
            <Image 
                src={coverImageUrl} 
                alt={`${restaurantName} cover`} 
                fill 
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </motion.div>
    );
}
