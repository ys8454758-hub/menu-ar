"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, CheckCircle2, AlertCircle, ShoppingBag, 
    User, Hash, RefreshCw, Check, X
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SERVED" | "COMPLETED" | "CANCELLED";

interface OrderItem {
    id: string;
    dish: { name: string };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customerName: string;
    tableNumber: string | null;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const previousOrdersRef = useRef<Order[]>([]);

    const playNotificationSound = () => {
        try {
            const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ctx = new AudioCtxClass();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const rRes = await fetch("/api/restaurants");
                if (rRes.ok) {
                    const restaurants = await rRes.json();
                    if (restaurants.length > 0) {
                        const rId = restaurants[0].id;
                        setRestaurantId(rId);
                        fetchOrders(rId);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitialData();

        // Polling for new orders (Simulating real-time)
        const interval = setInterval(() => {
            if (restaurantId) fetchOrders(restaurantId);
        }, 10000);

        return () => clearInterval(interval);
    }, [restaurantId]);

    const fetchOrders = async (rId: string) => {
        try {
            const res = await fetch(`/api/orders?restaurantId=${rId}`);
            if (res.ok) {
                const newOrders: Order[] = await res.json();
                
                // Check for new pending orders
                if (previousOrdersRef.current.length > 0) {
                    const oldPendingIds = new Set(previousOrdersRef.current.filter(o => o.status === "PENDING").map(o => o.id));
                    const newPendingOrders = newOrders.filter(o => o.status === "PENDING" && !oldPendingIds.has(o.id));
                    if (newPendingOrders.length > 0) {
                        playNotificationSound();
                    }
                }
                
                previousOrdersRef.current = newOrders;
                setOrders(newOrders);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
        PENDING: { label: "New Order", color: "text-plasma bg-plasma/10 border-plasma/30", icon: Clock },
        CONFIRMED: { label: "Confirmed", color: "text-neon-violet bg-neon-violet/10 border-neon-violet/30", icon: Check },
        PREPARING: { label: "In Kitchen", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", icon: RefreshCw },
        SERVED: { label: "Served", color: "text-success bg-success/10 border-success/30", icon: ShoppingBag },
        COMPLETED: { label: "Paid", color: "text-text-tertiary bg-surface border-border", icon: CheckCircle2 },
        CANCELLED: { label: "Cancelled", color: "text-ember bg-ember/10 border-ember/30", icon: AlertCircle },
    };

    if (loading) return <div className="p-8 text-text-tertiary font-mono animate-pulse">Loading Live Orders...</div>;

    const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING");
    const pastOrders = orders.filter(o => !["PENDING", "CONFIRMED", "PREPARING"].includes(o.status));

    return (
        <div className="min-h-screen p-6 space-y-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-lg font-display text-text-accent tracking-widest uppercase">Kitchen Display</h1>
                    <p className="text-body-sm font-mono text-text-tertiary mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-plasma animate-pulse" />
                        Live Order Monitoring System
                    </p>
                </div>
                <button 
                    onClick={() => restaurantId && fetchOrders(restaurantId)}
                    className="p-2 border border-border text-text-tertiary hover:text-plasma transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Orders Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">Active Tickets ({pendingOrders.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {pendingOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="border border-border bg-terminal overflow-hidden flex flex-col"
                                >
                                    <div className={cn("px-4 py-2 border-b flex justify-between items-center", statusConfig[order.status].color)}>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const Icon = statusConfig[order.status].icon;
                                                return <Icon className={cn("w-3.5 h-3.5", order.status === "PREPARING" && "animate-spin")} />;
                                            })()}
                                            <span className="text-[10px] font-ui font-bold tracking-widest uppercase">{statusConfig[order.status].label}</span>
                                        </div>
                                        <span className="text-[10px] font-mono opacity-70">#{order.id.slice(-4).toUpperCase()}</span>
                                    </div>

                                    <div className="p-4 flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 text-text-primary font-display tracking-wide">
                                                    <User className="w-3 h-3 text-text-tertiary" />
                                                    {order.customerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-plasma font-mono text-xs mt-1">
                                                    <Hash className="w-3 h-3" />
                                                    Table {order.tableNumber || "N/A"}
                                                </div>
                                            </div>
                                            <span className="text-xs text-text-tertiary">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <div className="space-y-2 border-y border-border/30 py-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-body-sm">
                                                    <span className="text-text-secondary"><span className="text-plasma font-mono mr-2">{item.quantity}x</span> {item.dish.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            {order.status === "PENDING" && (
                                                <button 
                                                    onClick={() => updateStatus(order.id, "CONFIRMED")}
                                                    className="flex-1 bg-plasma text-void py-2 font-ui text-[10px] tracking-widest uppercase font-bold hover:bg-plasma/90 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {order.status === "CONFIRMED" && (
                                                <button 
                                                    onClick={() => updateStatus(order.id, "PREPARING")}
                                                    className="flex-1 bg-neon-violet text-void py-2 font-ui text-[10px] tracking-widest uppercase font-bold hover:bg-neon-violet/90 transition-colors"
                                                >
                                                    Start Cooking
                                                </button>
                                            )}
                                            {order.status === "PREPARING" && (
                                                <button 
                                                    onClick={() => updateStatus(order.id, "SERVED")}
                                                    className="flex-1 bg-success text-void py-2 font-ui text-[10px] tracking-widest uppercase font-bold hover:bg-success/90 transition-colors"
                                                >
                                                    Mark Served
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => updateStatus(order.id, "CANCELLED")}
                                                className="px-3 border border-border text-text-tertiary hover:text-ember hover:border-ember/50 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {pendingOrders.length === 0 && (
                        <div className="border border-dashed border-border py-20 flex flex-col items-center justify-center text-text-tertiary gap-3">
                            <ShoppingBag className="w-8 h-8 opacity-20" />
                            <p className="font-body text-sm italic">All caught up! No active orders.</p>
                        </div>
                    )}
                </div>

                {/* History Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase">Recent History</h2>
                    <div className="space-y-3">
                        {pastOrders.slice(0, 8).map((order) => (
                            <div key={order.id} className="p-4 border border-border bg-terminal/40 flex items-center justify-between group">
                                <div className="min-w-0">
                                    <p className="text-body-sm font-body text-text-primary truncate">{order.customerName}</p>
                                    <p className="text-[10px] font-mono text-text-tertiary uppercase">₹{order.totalAmount.toFixed(0)} · {statusConfig[order.status].label}</p>
                                </div>
                                {order.status === "SERVED" && (
                                    <button 
                                        onClick={() => updateStatus(order.id, "COMPLETED")}
                                        className="w-8 h-8 flex items-center justify-center border border-border text-text-tertiary hover:border-success hover:text-success transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
