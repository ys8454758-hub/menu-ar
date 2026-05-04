"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Loader2, CreditCard, User, Hash } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { restaurant, loading, cart, cartTotal, clearCart } = useMenu(params.restaurantSlug as string);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({ customerName: "", tableNumber: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant || cart.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId: restaurant.id,
                    customerName: formData.customerName,
                    tableNumber: formData.tableNumber,
                    items: cart.map(i => ({ dishId: i.dish.id, quantity: i.quantity }))
                })
            });

            if (res.ok) {
                setIsSuccess(true);
                clearCart();
                setTimeout(() => router.push(`/livin3d/${params.restaurantSlug}`), 3000);
            }
        } catch (err) {
            console.error("Order failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (!restaurant) return <div className="min-h-screen flex items-center justify-center text-text-tertiary uppercase tracking-widest">Restaurant not found</div>;

    const themeClass = restaurant.menuTheme?.themeName ? `theme-${restaurant.menuTheme.themeName}` : "";

    if (isSuccess) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center bg-background px-6", themeClass)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-24 h-24 text-success" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-display-md font-display text-text-accent tracking-widest uppercase">Order Placed!</h1>
                        <p className="text-body-md font-body text-text-tertiary">
                            Hey <span className="text-plasma font-bold">{formData.customerName}</span>, your order has been sent to the kitchen.
                            Please stay at <span className="text-plasma font-bold">Table {formData.tableNumber}</span>.
                        </p>
                    </div>
                    <p className="text-body-xs font-mono text-plasma/60 animate-pulse uppercase tracking-[0.2em]">Redirecting to menu...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-background pb-20", themeClass)}>
            <header className="px-6 py-8 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 text-text-tertiary hover:text-plasma transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-display-sm font-display text-text-accent tracking-widest uppercase">Checkout</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-10 space-y-12">
                {/* Order Summary */}
                <div className="space-y-6">
                    <h2 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase font-bold">Order Summary</h2>
                    <div className="border border-border bg-terminal/40 p-8 rounded-xl space-y-6 shadow-sm">
                        {cart.map((item) => (
                            <div key={item.dish.id} className="flex justify-between items-center text-body-sm">
                                <div className="text-text-primary">
                                    <span className="font-mono text-plasma font-bold mr-3">{item.quantity}x</span>
                                    {item.dish.name}
                                </div>
                                <span className="text-text-secondary font-mono">₹{((item.dish.price || 0) * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                        <div className="pt-6 border-t border-border/50 flex justify-between items-center">
                            <span className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase font-bold">Total Payable</span>
                            <span className="text-display-sm font-display text-plasma">₹{cartTotal.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase font-bold">Delivery Details</h2>
                        
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-plasma transition-colors" />
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Your Name"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                    className="w-full bg-terminal/40 border border-border px-12 py-4 rounded-lg text-body-sm font-ui text-text-primary focus:border-plasma outline-none transition-all placeholder:text-text-tertiary"
                                />
                            </div>
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-plasma transition-colors" />
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Table Number"
                                    value={formData.tableNumber}
                                    onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                                    className="w-full bg-terminal/40 border border-border px-12 py-4 rounded-lg text-body-sm font-ui text-text-primary focus:border-plasma outline-none transition-all placeholder:text-text-tertiary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-5 bg-plasma/5 border border-plasma/20 text-plasma text-[10px] font-ui tracking-[0.2em] uppercase rounded-xl font-bold">
                            <CreditCard className="w-5 h-5 shrink-0" />
                            Pay at Counter / QR after dining
                        </div>
                        
                        <button 
                            disabled={isSubmitting || cart.length === 0}
                            type="submit"
                            className="w-full bg-text-accent text-void py-5 rounded-xl font-ui text-sm tracking-widest uppercase font-bold hover:bg-plasma hover:shadow-plasma-glow transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Confirm Order"
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
