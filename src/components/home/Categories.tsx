"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flower2, Heart, Cake, PartyPopper, Gift } from "lucide-react";
import { flowerImages } from "@/lib/images";

interface Category {
    name: string;
    icon: React.ReactNode;
    desc: string;
    href: string;
    color: string;
    bgColor: string;
}

const categories: Category[] = [
    {
        name: "Hoa Tươi",
        icon: <Flower2 size={24} />,
        desc: "Bó hoa tươi tự nhiên, sắc màu rực rỡ",
        href: "/shop?category=fresh",
        color: "text-pink-500",
        bgColor: "bg-pink-50 hover:bg-pink-100",
    },
    {
        name: "Hoa Lụa",
        icon: <Heart size={24} />,
        desc: "Hoa lụa bền đẹp, giữ mãi theo thời gian",
        href: "/shop?category=silk",
        color: "text-red-400",
        bgColor: "bg-red-50 hover:bg-red-100",
    },
    {
        name: "Hoa Sinh Nhật",
        icon: <Cake size={24} />,
        desc: "Tặng người thân yêu dịp sinh nhật",
        href: "/shop?occasion=birthday",
        color: "text-amber-500",
        bgColor: "bg-amber-50 hover:bg-amber-100",
    },
    {
        name: "Hoa Khai Trương",
        icon: <PartyPopper size={24} />,
        desc: "Chúc mừng khai trương, thăng chức",
        href: "/shop?occasion=congratulations",
        color: "text-purple-400",
        bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
        name: "Hoa Ngày Lễ",
        icon: <Gift size={24} />,
        desc: "Valentine, 8/3, 20/10 và các dịp lễ",
        href: "/shop?occasion=holiday",
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
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ x: 8 }}
                                >
                                    <Link href={cat.href}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl ${cat.bgColor} transition-all duration-300 group`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center ${cat.color} 
                                group-hover:scale-110 transition-transform`}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="font-semibold text-gray-800 block">
                                                {cat.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {cat.desc}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
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
