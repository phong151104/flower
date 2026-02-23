"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);

    const wishlisted = isInWishlist(product.id);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price: product.sizes[0]?.price || product.price,
            size: product.sizes[0]?.name || "Mặc định",
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist({
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price: product.price,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-card card-hover"
        >
            <Link href={`/shop/${product.id}`}>
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Wishlist */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center
                                 transition-all duration-300 shadow-sm z-10
                                 ${wishlisted
                                ? "bg-primary-50 text-primary-500"
                                : "bg-white/80 text-gray-400 hover:text-primary-500 hover:bg-white"
                            }`}
                    >
                        <Heart size={16} className={wishlisted ? "fill-current" : ""} />
                    </button>

                    {/* Badge */}
                    {product.badge && (
                        <span
                            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
                            ${product.badge === "Bán chạy" ? "bg-primary-500 text-white" : ""}
                            ${product.badge === "Mới" ? "bg-forest-500 text-white" : ""}
                            ${product.badge === "Premium" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white" : ""}
                            ${product.badge === "Giảm giá" ? "bg-red-500 text-white" : ""}
                        `}
                        >
                            {product.badge}
                        </span>
                    )}

                    {/* Quick Add */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/30 to-transparent 
                                  translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleQuickAdd}
                            className={`w-full py-2 backdrop-blur-sm font-medium rounded-full
                                     transition-all duration-300 text-sm
                                     flex items-center justify-center gap-2
                                     ${added
                                    ? "bg-forest-500 text-white"
                                    : "bg-white/90 text-forest-500 hover:bg-forest-500 hover:text-white"
                                }`}
                        >
                            {added ? (
                                <>
                                    <Check size={14} /> Đã thêm!
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={14} /> Thêm vào giỏ
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Link>

            {/* Info */}
            <div className="p-4">
                <Link href={`/shop/${product.id}`}>
                    <h3 className="font-display text-base font-semibold text-gray-800 group-hover:text-forest-500 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                    {product.shortDescription}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-600 font-medium">
                        {product.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({product.reviewCount})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-primary-500 font-bold text-lg">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
