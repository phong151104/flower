"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { flowerImages } from "@/lib/images";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface Product {
    id: number;
    name: string;
    price: number;
    priceDisplay: string;
    originalPrice?: string;
    image: string;
    badge?: string;
}

const products: Product[] = [
    {
        id: 1,
        name: "Hoa Hồng Pastel",
        price: 350000,
        priceDisplay: "350.000₫",
        originalPrice: "420.000₫",
        image: flowerImages.product1,
        badge: "Bán chạy",
    },
    {
        id: 2,
        name: "Bó Hướng Dương",
        price: 280000,
        priceDisplay: "280.000₫",
        image: flowerImages.product2,
    },
    {
        id: 3,
        name: "Lavender Dream",
        price: 450000,
        priceDisplay: "450.000₫",
        image: flowerImages.product3,
        badge: "Mới",
    },
    {
        id: 4,
        name: "Red Romance",
        price: 520000,
        priceDisplay: "520.000₫",
        originalPrice: "600.000₫",
        image: flowerImages.product4,
    },
    {
        id: 5,
        name: "Daisy Sunshine",
        price: 250000,
        priceDisplay: "250.000₫",
        image: flowerImages.product5,
    },
    {
        id: 6,
        name: "White Elegance",
        price: 680000,
        priceDisplay: "680.000₫",
        image: flowerImages.product6,
        badge: "Premium",
    },
];

export default function BestSellers() {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: String(product.id),
            name: product.name,
            image: product.image,
            price: product.price,
            size: "Mặc định",
        });
    };

    const handleToggleWishlist = (product: Product) => {
        toggleWishlist({
            productId: String(product.id),
            name: product.name,
            image: product.image,
            price: product.price,
        });
    };

    return (
        <section className="py-20 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="text-primary-500 font-medium text-sm tracking-widest uppercase mb-3 block">
                        Đặc biệt
                    </span>
                    <h2 className="section-heading">
                        Sản Phẩm{" "}
                        <span className="font-script text-primary-500">Bán Chạy</span>
                    </h2>
                    <p className="section-subheading mx-auto mt-4">
                        Những bó hoa được yêu thích nhất, lựa chọn hoàn hảo cho mọi dịp
                    </p>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden shadow-card card-hover"
                        >
                            {/* Image */}
                            <div className="relative h-72 overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Wishlist button */}
                                <button
                                    onClick={() => handleToggleWishlist(product)}
                                    className={`absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center
                                 transition-all duration-300 shadow-sm ${isInWishlist(String(product.id)) ? "text-primary-500" : "text-gray-400 hover:text-primary-500 hover:bg-white"}`}
                                >
                                    <Heart size={18} fill={isInWishlist(String(product.id)) ? "currentColor" : "none"} />
                                </button>
                                {/* Badge */}
                                {product.badge && (
                                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold
                    ${product.badge === "Bán chạy" ? "bg-primary-500 text-white" : ""}
                    ${product.badge === "Mới" ? "bg-forest-500 text-white" : ""}
                    ${product.badge === "Premium" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white" : ""}
                  `}>
                                        {product.badge}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h3 className="font-display text-lg font-semibold text-gray-800 group-hover:text-forest-500 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-primary-500 font-bold text-lg">
                                        {product.priceDisplay}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-gray-400 line-through text-sm">
                                            {product.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full mt-4 py-2.5 bg-cream-200 text-forest-500 font-medium rounded-full
                           hover:bg-forest-500 hover:text-white transition-all duration-300"
                                >
                                    Thêm vào giỏ
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link href="/shop" className="btn-outline">Xem Tất Cả Sản Phẩm</Link>
                </motion.div>
            </div>
        </section>
    );
}

