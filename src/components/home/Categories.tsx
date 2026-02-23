"use client";

import { motion } from "framer-motion";
import { Flower2, Heart, Sun, Gem, Baby } from "lucide-react";
import { flowerImages } from "@/lib/images";

interface Category {
    name: string;
    icon: React.ReactNode;
    count: number;
    color: string;
    bgColor: string;
}

const categories: Category[] = [
    {
        name: "Bó Hoa",
        icon: <Flower2 size={24} />,
        count: 45,
        color: "text-pink-500",
        bgColor: "bg-pink-50 hover:bg-pink-100",
    },
    {
        name: "Kỷ Niệm",
        icon: <Heart size={24} />,
        count: 32,
        color: "text-red-400",
        bgColor: "bg-red-50 hover:bg-red-100",
    },
    {
        name: "Mùa Hè",
        icon: <Sun size={24} />,
        count: 28,
        color: "text-amber-500",
        bgColor: "bg-amber-50 hover:bg-amber-100",
    },
    {
        name: "Đám Cưới",
        icon: <Gem size={24} />,
        count: 56,
        color: "text-purple-400",
        bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
        name: "Ngày Của Mẹ",
        icon: <Baby size={24} />,
        count: 19,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50 hover:bg-emerald-100",
    },
];

const categoryImages = [
    flowerImages.product1,
    flowerImages.product3,
    flowerImages.product2,
    flowerImages.product4,
];

export default function Categories() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Category List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary-500 font-medium text-sm tracking-widest uppercase mb-3 block">
                            Khám phá
                        </span>
                        <h2 className="section-heading mb-8">
                            Danh Mục{" "}
                            <span className="font-script text-primary-500">Phổ Biến</span>
                        </h2>

                        <div className="space-y-4">
                            {categories.map((cat, index) => (
                                <motion.button
                                    key={cat.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ x: 8 }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl ${cat.bgColor} transition-all duration-300 group`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center ${cat.color} 
                                group-hover:scale-110 transition-transform`}
                                    >
                                        {cat.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-semibold text-gray-800">
                                            {cat.name}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-400 bg-white/80 px-3 py-1 rounded-full">
                                        {cat.count} sản phẩm
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right - Featured Images */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-4">
                            <div className="h-48 rounded-3xl overflow-hidden bg-primary-100">
                                <img
                                    src={categoryImages[0]}
                                    alt="Pink roses"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="h-64 rounded-3xl overflow-hidden bg-cream-200">
                                <img
                                    src={categoryImages[1]}
                                    alt="Lavender bouquet"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 pt-8">
                            <div className="h-64 rounded-3xl overflow-hidden bg-peach-100">
                                <img
                                    src={categoryImages[2]}
                                    alt="Sunflower bouquet"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="h-48 rounded-3xl overflow-hidden bg-primary-50">
                                <img
                                    src={categoryImages[3]}
                                    alt="Red roses"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
