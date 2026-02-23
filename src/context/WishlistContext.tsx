"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WishlistItem {
    productId: string;
    name: string;
    image: string;
    price: number;
}

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (item: WishlistItem) => void;
    isInWishlist: (productId: string) => boolean;
    totalItems: number;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    const addToWishlist = useCallback((item: WishlistItem) => {
        setItems((prev) => {
            if (prev.find((i) => i.productId === item.productId)) return prev;
            return [...prev, item];
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    }, []);

    const toggleWishlist = useCallback(
        (item: WishlistItem) => {
            setItems((prev) => {
                const exists = prev.find((i) => i.productId === item.productId);
                if (exists) {
                    return prev.filter((i) => i.productId !== item.productId);
                }
                return [...prev, item];
            });
        },
        []
    );

    const isInWishlist = useCallback(
        (productId: string) => items.some((i) => i.productId === productId),
        [items]
    );

    const totalItems = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                totalItems,
                isWishlistOpen,
                setIsWishlistOpen,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
