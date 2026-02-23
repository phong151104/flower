"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FloatingOrderButton() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Don't show on account, checkout, or admin pages
    const hiddenPaths = ["/account", "/checkout", "/admin"];
    const shouldHide =
        !user || hiddenPaths.some((p) => pathname.startsWith(p));

    if (shouldHide) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-6 right-6 z-40"
            >
                <Link
                    href="/account"
                    className="flex items-center gap-2.5 px-5 py-3 bg-forest-500 text-white font-semibold rounded-full shadow-xl shadow-forest-500/30 hover:bg-forest-600 hover:shadow-2xl transition-all group"
                >
                    <Package size={18} className="group-hover:animate-bounce" />
                    <span className="text-sm">Đơn hàng của tôi</span>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
