"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    size: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.productId === item.productId && i.size === item.size
            );
            if (existing) {
                return prev.map((i) =>
                    i.productId === item.productId && i.size === item.size
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...item, quantity }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((productId: string, size: string) => {
        setItems((prev) =>
            prev.filter((i) => !(i.productId === productId && i.size === size))
        );
    }, []);

    const updateQuantity = useCallback(
        (productId: string, size: string, quantity: number) => {
            if (quantity <= 0) {
                removeFromCart(productId, size);
                return;
            }
            setItems((prev) =>
                prev.map((i) =>
                    i.productId === productId && i.size === size
                        ? { ...i, quantity }
                        : i
                )
            );
        },
        [removeFromCart]
    );

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
