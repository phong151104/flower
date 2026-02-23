"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { flowerImages } from "@/lib/images";

export default function FindPerfect() {
    return (
        <section className="py-20 bg-cream-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <span className="text-primary-500 font-medium text-sm tracking-widest uppercase">
                            Tìm loại hoa yêu thích
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Tìm Bó Hoa{" "}
                            <span className="font-script text-primary-500">Hoàn Hảo</span>
                            <br />
                            Cho Bạn
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                            Hoa là món quà tuyệt vời nhất, gửi gắm tình cảm chân thành nhất.
                            Bó hoa tulip hồng, hoa hồng trắng hay hoa cúc vàng - mỗi loài hoa
                            mang một thông điệp riêng biệt.
                        </p>
                        <p className="text-gray-400 leading-relaxed max-w-lg">
                            Chúng tôi tuyển chọn từng cành hoa tươi nhất mỗi ngày,
                            kết hợp với nghệ thuật cắm hoa tinh tế để tạo nên những tác phẩm
                            khiến người nhận phải xúc động.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-pink mt-4"
                        >
                            Khám Phá Thêm
                        </motion.button>
                    </motion.div>

                    {/* Right Images */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {/* Top images */}
                            <div className="relative h-64 rounded-3xl overflow-hidden shadow-soft">
                                <Image
                                    src={flowerImages.product5}
                                    alt="Daisy bouquet"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="relative h-64 rounded-3xl overflow-hidden shadow-soft mt-8">
                                <Image
                                    src={flowerImages.product6}
                                    alt="White elegance"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            {/* Bottom large image */}
                            <div className="relative h-48 col-span-2 rounded-3xl overflow-hidden shadow-soft">
                                <Image
                                    src={flowerImages.product1}
                                    alt="Pink roses arrangement"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Floating decoration */}
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 w-20 h-20 bg-primary-200/50 rounded-full blur-xl"
                        />
                        <motion.div
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-4 -left-4 w-16 h-16 bg-peach-200/50 rounded-full blur-xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
