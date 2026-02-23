"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminProvider } from "@/context/AdminContext";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import AuthModal from "@/components/AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminProvider>
                <CartProvider>
                    <WishlistProvider>
                        {children}
                        <CartDrawer />
                        <WishlistDrawer />
                        <AuthModal />
                    </WishlistProvider>
                </CartProvider>
            </AdminProvider>
        </AuthProvider>
    );
}
