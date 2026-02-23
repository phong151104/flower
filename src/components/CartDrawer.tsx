"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice, products } from "@/data/products";

export default function CartDrawer() {
    const {
        items,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
    } = useCart();
    const router = useRouter();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={22} className="text-forest-500" />
                                <h2 className="font-display text-xl font-bold text-gray-900">
                                    Giỏ hàng
                                </h2>
                                <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-cream-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-5xl mb-4">🌸</span>
                                    <p className="font-display text-lg font-semibold text-gray-700 mb-1">
                                        Giỏ hàng trống
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Hãy thêm những bó hoa yêu thích nhé!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <motion.div
                                            key={`${item.productId}-${item.size}`}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="flex gap-4 p-3 bg-cream-50 rounded-2xl"
                                        >
                                            {/* Image */}
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                                                    {item.name}
                                                </h3>

                                                {/* Size selector */}
                                                {(() => {
                                                    const product = products.find(p => p.id === item.productId);
                                                    if (product && product.sizes.length > 1) {
                                                        return (
                                                            <div className="relative mt-1">
                                                                <select
                                                                    value={item.size}
                                                                    onChange={(e) => {
                                                                        const newSize = e.target.value;
                                                                        const sizeInfo = product.sizes.find(s => s.name === newSize);
                                                                        if (sizeInfo) {
                                                                            updateSize(item.productId, item.size, newSize, sizeInfo.price);
                                                                        }
                                                                    }}
                                                                    className="w-full text-xs py-1.5 pl-2 pr-7 rounded-lg border border-cream-200 bg-white text-gray-600 focus:border-primary-300 focus:outline-none appearance-none cursor-pointer hover:border-primary-200 transition-colors"
                                                                >
                                                                    {product.sizes.map((s) => (
                                                                        <option key={s.name} value={s.name}>
                                                                            {s.name} - {formatPrice(s.price)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {item.size}
                                                        </p>
                                                    );
                                                })()}

                                                <p className="text-primary-500 font-bold text-sm mt-1">
                                                    {formatPrice(item.price)}
                                                </p>

                                                {/* Quantity + Remove */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.productId,
                                                                    item.size,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-cream-100 transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-semibold">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.productId,
                                                                    item.size,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-cream-100 transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(item.productId, item.size)
                                                        }
                                                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-cream-200 px-6 py-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 font-medium">Tạm tính</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Phí vận chuyển sẽ được tính ở bước thanh toán
                                </p>
                                <button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        router.push("/checkout");
                                    }}
                                    className="w-full py-4 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Thanh toán ({totalItems} sản phẩm)
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
