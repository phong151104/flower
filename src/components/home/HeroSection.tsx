"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { flowerImages } from "@/lib/images";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen bg-cream-100 overflow-hidden pt-20">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-300/40 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-100/30 rounded-full translate-y-1/3 -translate-x-1/3" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-80px)]">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 py-12 lg:py-0"
                    >
                        {/* Numbering decoration */}
                        <div className="flex items-center gap-6 text-sm text-gray-400 font-body">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-primary-500 font-semibold">01</span>
                                <div className="w-px h-8 bg-primary-300" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span>02</span>
                                <div className="w-px h-8 bg-gray-200" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span>03</span>
                                <div className="w-px h-8 bg-gray-200" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-tight">
                                <span className="font-display font-bold text-gray-900">
                                    Bộ Sưu Tập
                                </span>
                                <br />
                                <span className="font-script text-primary-500 text-6xl sm:text-7xl lg:text-8xl">
                                    Hoa Tươi
                                </span>
                                <br />
                                <span className="font-display font-bold text-gray-900">
                                    Tuyệt Đẹp
                                </span>
                            </h1>
                        </div>

                        <p className="text-gray-500 text-lg max-w-md leading-relaxed font-body">
                            Hoa tươi là nguồn cảm hứng để tạo nên những kỷ niệm đẹp.
                            Bất kể dịp nào, sự tinh tế của hoa sẽ khiến mọi thứ trở nên đặc biệt.
                        </p>

                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <a href="/gallery" className="btn-primary text-base inline-block">
                                    Khám Phá Ngay
                                </a>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <a href="/about" className="btn-outline text-base inline-block">
                                    Xem Thêm
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        <div className="relative">
                            {/* Pink background shape */}
                            <div className="absolute inset-0 bg-gradient-pink rounded-[40px] transform rotate-3 scale-105" />
                            <div className="relative w-[350px] h-[450px] sm:w-[400px] sm:h-[520px] lg:w-[450px] lg:h-[580px] rounded-[40px] overflow-hidden shadow-pastel">
                                <Image
                                    src={flowerImages.hero}
                                    alt="Beautiful flower bouquet"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Floating badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 top-12 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-pastel"
                            >
                                <div className="text-center">
                                    <span className="text-2xl">🌷</span>
                                    <p className="text-xs font-semibold text-gray-700 mt-1">Tươi mới</p>
                                    <p className="text-xs text-primary-500">mỗi ngày</p>
                                </div>
                            </motion.div>

                            {/* Bottom floating badge */}
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -left-6 bottom-16 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-pastel"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-lg">💐</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">700+</p>
                                        <p className="text-xs text-gray-400">Khách hàng hài lòng</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
