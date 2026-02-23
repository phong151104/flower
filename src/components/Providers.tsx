"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminProvider } from "@/context/AdminContext";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <CartProvider>
                <WishlistProvider>
                    {children}
                    <CartDrawer />
                    <WishlistDrawer />
                </WishlistProvider>
            </CartProvider>
        </AdminProvider>
    );
}

