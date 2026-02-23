"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubmitted(true);
            setEmail("");
            setTimeout(() => setIsSubmitted(false), 3000);
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 rounded-[40px] p-8 md:p-16 overflow-hidden"
                >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-300/20 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full translate-y-1/3 -translate-x-1/4" />

                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <span className="text-primary-600 font-medium text-sm tracking-widest uppercase mb-3 block">
                            Đừng bỏ lỡ
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Đăng Ký Nhận{" "}
                            <span className="font-script text-primary-500">Tin Mới</span>
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Nhận thông tin về hoa mới, khuyến mãi đặc biệt và mẹo cắm hoa tuyệt vời
                            trực tiếp vào hộp thư của bạn.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <div className="flex-1 relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn..."
                                    className="w-full px-6 py-4 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white
                           focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100
                           text-gray-700 placeholder-gray-400 transition-all duration-300"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="px-8 py-4 bg-primary-500 text-white font-semibold rounded-full
                         hover:bg-primary-600 transition-all duration-300 shadow-pastel
                         flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Đăng Ký
                            </motion.button>
                        </form>

                        {/* Success message */}
                        {isSubmitted && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-forest-500 font-medium mt-4"
                            >
                                🎉 Đăng ký thành công! Cảm ơn bạn.
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
