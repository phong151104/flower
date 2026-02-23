"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    ShoppingBag,
    Star,
    Minus,
    Plus,
    ChevronLeft,
    Truck,
    Shield,
    RotateCcw,
    MessageCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAdmin } from "@/context/AdminContext";

export default function ProductDetailPage() {
    const params = useParams();
    const { products } = useAdmin();
    const product = products.find((p) => p.id === params.id);
    const [selectedSize, setSelectedSize] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = product ? isInWishlist(product.id) : false;

    if (!product) {
        return (
            <main className="min-h-screen bg-cream-50">
                <Navbar />
                <div className="pt-32 text-center">
                    <p className="text-6xl mb-4">🌸</p>
                    <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">
                        Không tìm thấy sản phẩm
                    </h1>
                    <Link href="/shop" className="btn-primary mt-4 inline-flex">
                        Quay lại cửa hàng
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const currentPrice = product.sizes[selectedSize]?.price || product.price;

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(
            {
                productId: product.id,
                name: product.name,
                image: product.images[0],
                price: currentPrice,
                size: product.sizes[selectedSize]?.name || "Mặc định",
            },
            quantity
        );
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <main className="min-h-screen bg-cream-50">
            <Navbar />

            <section className="pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-sm text-gray-400 mb-8"
                    >
                        <Link href="/shop" className="hover:text-forest-500 transition-colors flex items-center gap-1">
                            <ChevronLeft size={14} /> Cửa hàng
                        </Link>
                        <span>/</span>
                        <span className="text-gray-600">{product.name}</span>
                    </motion.div>

                    {/* Product main */}
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-pastel bg-white">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {product.badge && (
                                    <span
                                        className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold
                                        ${product.badge === "Bán chạy" ? "bg-primary-500 text-white" : ""}
                                        ${product.badge === "Mới" ? "bg-forest-500 text-white" : ""}
                                        ${product.badge === "Premium" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white" : ""}
                                        ${product.badge === "Giảm giá" ? "bg-red-500 text-white" : ""}
                                    `}
                                    >
                                        {product.badge}
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={
                                                i < Math.floor(product.rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {product.rating}
                                </span>
                                <span className="text-sm text-gray-400">
                                    ({product.reviewCount} đánh giá)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-3xl font-bold text-primary-500">
                                    {formatPrice(currentPrice)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-lg text-gray-400 line-through mb-1">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Size selection */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Kích thước</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size, index) => (
                                        <button
                                            key={size.name}
                                            onClick={() => setSelectedSize(index)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200
                                                ${selectedSize === index
                                                    ? "border-primary-500 bg-primary-50 text-primary-600"
                                                    : "border-gray-200 text-gray-600 hover:border-primary-200"
                                                }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-800 mb-3">Số lượng</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-xl bg-cream-200 text-gray-600 flex items-center justify-center hover:bg-cream-300 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-14 text-center font-semibold text-lg">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-xl bg-cream-200 text-gray-600 flex items-center justify-center hover:bg-cream-300 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-4 mb-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300
                                        ${addedToCart ? "bg-forest-500" : "bg-primary-500 hover:bg-primary-600 shadow-pastel"}`}
                                >
                                    <ShoppingBag size={20} />
                                    {addedToCart ? "✓ Đã thêm!" : "Thêm vào giỏ"}
                                </motion.button>

                                <button
                                    onClick={() => toggleWishlist({
                                        productId: product.id,
                                        name: product.name,
                                        image: product.images[0],
                                        price: product.price,
                                    })}
                                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                        ${isWishlisted
                                            ? "border-primary-500 bg-primary-50 text-primary-500"
                                            : "border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-400"
                                        }`}
                                >
                                    <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 p-5 bg-cream-100 rounded-2xl">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Truck size={18} className="text-forest-500" />
                                    <span>Giao hàng 2h nội thành</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Shield size={18} className="text-forest-500" />
                                    <span>Cam kết hoa tươi 100%</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <RotateCcw size={18} className="text-forest-500" />
                                    <span>Đổi miễn phí nếu héo</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <MessageCircle size={18} className="text-forest-500" />
                                    <span>Hỗ trợ 24/7</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                {product.occasion.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-cream-200 text-gray-500 rounded-full text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {product.flowerTypes.map((type) => (
                                    <span
                                        key={type}
                                        className="px-3 py-1 bg-primary-50 text-primary-500 rounded-full text-xs"
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-20">
                            <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
                                Sản phẩm <span className="font-script text-primary-500">tương tự</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((p, index) => (
                                    <ProductCard key={p.id} product={p} index={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
