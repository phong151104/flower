"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export default function WishlistDrawer() {
    const {
        items,
        removeFromWishlist,
        totalItems,
        isWishlistOpen,
        setIsWishlistOpen,
    } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item: typeof items[0]) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            size: "Mặc định",
        });
        removeFromWishlist(item.productId);
    };

    return (
        <AnimatePresence>
            {isWishlistOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsWishlistOpen(false)}
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
                                <Heart size={22} className="text-primary-500 fill-primary-500" />
                                <h2 className="font-display text-xl font-bold text-gray-900">
                                    Yêu thích
                                </h2>
                                <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsWishlistOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-cream-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-5xl mb-4">💝</span>
                                    <p className="font-display text-lg font-semibold text-gray-700 mb-1">
                                        Chưa có sản phẩm yêu thích
                                    </p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Hãy thêm những bó hoa bạn thích nhé!
                                    </p>
                                    <Link
                                        href="/shop"
                                        onClick={() => setIsWishlistOpen(false)}
                                        className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors"
                                    >
                                        Khám phá cửa hàng
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.productId}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="flex gap-4 p-3 bg-cream-50 rounded-2xl"
                                        >
                                            {/* Image */}
                                            <Link
                                                href={`/shop/${item.productId}`}
                                                onClick={() => setIsWishlistOpen(false)}
                                                className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                                            >
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover hover:scale-110 transition-transform duration-300"
                                                />
                                            </Link>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/shop/${item.productId}`}
                                                    onClick={() => setIsWishlistOpen(false)}
                                                >
                                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 hover:text-primary-500 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-primary-500 font-bold text-sm mt-1">
                                                    {formatPrice(item.price)}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleMoveToCart(item)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 text-white text-xs font-medium rounded-full hover:bg-forest-600 transition-colors"
                                                    >
                                                        <ShoppingBag size={12} />
                                                        Thêm vào giỏ
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromWishlist(item.productId)}
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
