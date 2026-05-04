"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem, Restaurant } from "@/types";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    cartTotal: number;
    restaurant: Restaurant;
    onUpdateQuantity: (dishId: string, delta: number) => void;
}

export default function CartDrawer({ 
    isOpen, 
    onClose, 
    cart, 
    cartTotal, 
    restaurant,
    onUpdateQuantity 
}: CartDrawerProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-terminal z-[101] border-l border-border flex flex-col shadow-2xl"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
                            <h2 className="text-display-sm font-display text-text-accent tracking-widest uppercase">Your Order</h2>
                            <button onClick={onClose} className="p-2 text-text-tertiary hover:text-plasma transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-tertiary gap-4">
                                    <ShoppingBag className="w-12 h-12 opacity-20" />
                                    <p className="font-body">Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.dish.id} className="flex items-center justify-between gap-4 py-4 border-b border-border/30 last:border-0">
                                        <div className="flex-1">
                                            <h4 className="text-body-md font-body text-text-primary">{item.dish.name}</h4>
                                            <p className="text-body-xs font-mono text-plasma font-bold">₹{((item.dish.price || 0) * item.quantity).toFixed(0)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-void/50 border border-border p-1 rounded-md">
                                            <button 
                                                onClick={() => onUpdateQuantity(item.dish.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-plasma transition-colors font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => onUpdateQuantity(item.dish.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-plasma transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-surface border-t border-border space-y-4">
                            <div className="flex justify-between items-center text-text-secondary font-ui text-xs tracking-widest uppercase">
                                <span>Total Amount</span>
                                <span className="text-lg text-plasma font-display">₹{cartTotal.toFixed(0)}</span>
                            </div>
                            <button 
                                disabled={cart.length === 0}
                                onClick={() => router.push(`/livin3d/${restaurant.slug}/checkout`)}
                                className="w-full bg-text-accent text-void py-4 font-ui text-sm tracking-widest uppercase font-bold hover:bg-plasma transition-all disabled:opacity-30 disabled:pointer-events-none rounded-lg"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
