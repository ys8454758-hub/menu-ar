"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";

import MenuHeader from "@/components/livin3d/MenuHeader";
import MenuHero from "@/components/livin3d/MenuHero";
import CategoryTabs from "@/components/livin3d/CategoryTabs";
import QRShareModal from "@/components/livin3d/QRShareModal";
import CartDrawer from "@/components/livin3d/CartDrawer";
import MenuDishCard from "@/components/shared/MenuDishCard";
import LoadingScreen from "@/components/shared/LoadingScreen";

import { useMenu } from "@/hooks/useMenu";
import { cn } from "@/lib/utils";

export default function RestaurantMenuPage() {
    const params = useParams();
    const { 
        restaurant, 
        loading, 
        cart, 
        addToCart, 
        removeFromCart, 
        cartCount, 
        cartTotal 
    } = useMenu(params.restaurantSlug as string);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);

    const updateQuantity = (dishId: string, delta: number) => {
        if (delta > 0) {
            const item = cart.find(i => i.dish.id === dishId);
            if (item) addToCart(item.dish);
        } else {
            removeFromCart(dishId);
        }
    };

    const categories = useMemo(() => {
        if (!restaurant?.dishes) return ["All"];
        const cats = new Set(restaurant.dishes.map(d => d.category || "General"));
        return ["All", ...Array.from(cats)];
    }, [restaurant]);

    const filteredDishes = useMemo(() => {
        if (!restaurant?.dishes) return [];
        return restaurant.dishes.filter(dish => {
            const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || (dish.category || "General") === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [restaurant, searchQuery, activeCategory]);

    if (loading) return <LoadingScreen />;
    if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-void text-text-secondary">Restaurant not found</div>;

    const themeClass = restaurant.menuTheme?.themeName ? `theme-${restaurant.menuTheme.themeName}` : "";

    return (
        <div 
            className={cn("min-h-screen pb-32 bg-background relative", themeClass)}
            style={restaurant.bannerUrl ? {
                backgroundImage: `url(${restaurant.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundBlendMode: 'overlay'
            } : undefined}
        >
            <MenuHeader 
                restaurant={restaurant} 
                cartCount={cartCount} 
                onCartOpen={() => setIsCartOpen(true)}
                onQrOpen={() => setIsQrOpen(true)}
            />

            {restaurant.coverImageUrl && (
                <MenuHero coverImageUrl={restaurant.coverImageUrl} restaurantName={restaurant.name} />
            )}

            <main className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
                {/* Search & Filter */}
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input 
                            type="text" 
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-terminal/40 border border-border px-10 py-3 rounded-lg text-body-sm font-ui text-text-primary focus:border-plasma outline-none transition-all placeholder:text-text-tertiary"
                        />
                    </div>
                    
                    <CategoryTabs 
                        categories={categories} 
                        activeCategory={activeCategory} 
                        onCategoryChange={setActiveCategory} 
                    />
                </div>

                {/* Dish Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredDishes.map((dish, idx) => (
                            <motion.div
                                key={dish.id}
                                layout
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                            >
                                <MenuDishCard 
                                    dish={dish} 
                                    restaurantSlug={restaurant.slug}
                                    onAddToCart={addToCart}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredDishes.length === 0 && (
                    <div className="text-center py-20 text-text-tertiary font-body">
                        No dishes found in this category.
                    </div>
                )}
            </main>

            {/* Sticky Order Bar */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-6 right-6 z-40 max-w-4xl mx-auto"
                    >
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="w-full bg-plasma text-void p-4 flex items-center justify-between rounded-xl shadow-2xl hover:brightness-110 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-void/20 px-3 py-1 rounded-md font-mono text-sm">{cartCount} items</div>
                                <span className="font-ui text-xs tracking-widest uppercase font-bold">Review Order</span>
                            </div>
                            <div className="flex items-center gap-2 font-display text-lg">
                                ₹{cartTotal.toFixed(0)}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <QRShareModal 
                isOpen={isQrOpen} 
                onClose={() => setIsQrOpen(false)} 
                qrUrl={restaurant.menuQrUrl || null} 
            />

            <CartDrawer 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                cartTotal={cartTotal}
                restaurant={restaurant}
                onUpdateQuantity={updateQuantity}
            />
        </div>
    );
}
