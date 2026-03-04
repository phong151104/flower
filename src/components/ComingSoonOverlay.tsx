"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ComingSoonOverlay() {
    // Only show on client side to avoid hydration mismatch if using local storage to dismiss later
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when overlay is active
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-cream-50 flex flex-col items-center justify-center p-4">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-white text-center"
            >
                {/* Logo or Icon */}
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-500/30 transform -rotate-6">
                    <span className="font-script text-4xl">B</span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Website Đang Hoàn Thiện
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Cảm ơn bạn đã ghé thăm Bloomella! Chúng tôi đang nâng cấp website để mang đến trải nghiệm tốt nhất. Trong thời gian này, bạn vẫn có thể đặt hoa qua các kênh dưới đây:
                </p>

                {/* Social Links Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <a
                        href="https://www.facebook.com/bloomella102"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Facebook size={24} />
                        </div>
                        <span className="font-medium text-sm">Facebook</span>
                    </a>

                    <a
                        href="https://www.instagram.com/bloomella.florist/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Instagram size={24} />
                        </div>
                        <span className="font-medium text-sm">Instagram</span>
                    </a>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                            <Phone size={16} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Hotline / Zalo</p>
                            <a href="https://zalo.me/0888229955" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">0888229955</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Địa chỉ</p>
                            <span className="leading-snug block">44 ngõ 176 Lê Trọng Tấn<br />Khương Mai, Thanh Xuân, Hà Nội</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
