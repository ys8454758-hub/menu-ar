import { useState, useEffect, useCallback } from 'react';
import { Restaurant, Dish, CartItem } from '@/types';

export function useMenu(restaurantSlug: string) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    const fetchMenu = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/livin3d/${restaurantSlug}`);
            if (!res.ok) throw new Error('Failed to fetch menu');
            const data = await res.json();
            setRestaurant(data);
            
            // Recover cart from local storage
            const storedCart = localStorage.getItem(`cart_${restaurantSlug}`);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [restaurantSlug]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const addToCart = (dish: Dish) => {
        setCart(prev => {
            const existing = prev.find(item => item.dish.id === dish.id);
            let next;
            if (existing) {
                next = prev.map(item => 
                    item.dish.id === dish.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                next = [...prev, { dish, quantity: 1 }];
            }
            localStorage.setItem(`cart_${restaurantSlug}`, JSON.stringify(next));
            return next;
        });
    };

    const removeFromCart = (dishId: string) => {
        setCart(prev => {
            const next = prev.map(item => 
                item.dish.id === dishId 
                    ? { ...item, quantity: Math.max(0, item.quantity - 1) } 
                    : item
            ).filter(item => item.quantity > 0);
            localStorage.setItem(`cart_${restaurantSlug}`, JSON.stringify(next));
            return next;
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem(`cart_${restaurantSlug}`);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.dish.price || 0) * item.quantity, 0);

    return {
        restaurant,
        loading,
        error,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
        refresh: fetchMenu
    };
}
