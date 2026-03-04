"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Phạm Đức Anh",
        role: "Khách hàng thân thiết",
        content:
            "Hoa rất đẹp và tươi lâu! Tôi luôn chọn Bloomella mỗi dịp sinh nhật và kỷ niệm. Dịch vụ giao hàng nhanh chóng và đóng gói cẩn thận.",
        rating: 5,
        avatar: "A",
    },
    {
        id: 2,
        name: "Cao Thái Sơn",
        role: "Khách hàng thường xuyên",
        content:
            "Đã đặt hoa ở Bloomella nhiều lần để tặng đối tác và gia đình. Mỗi lần đều rất hài lòng! Hoa tươi, thiết kế tinh tế và đúng yêu cầu.",
        rating: 5,
        avatar: "S",
    },
    {
        id: 3,
        name: "Hoàng Thanh Hoa",
        role: "Khách hàng mới",
        content:
            "Lần đầu đặt hoa online và rất ấn tượng! Bó hoa đẹp hơn hình, giá cả hợp lý. Chắc chắn sẽ quay lại.",
        rating: 5,
        avatar: "H",
    },
];

export default function Testimonials() {
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
                        Phản hồi
                    </span>
                    <h2 className="section-heading">
                        Khách Hàng{" "}
                        <span className="font-script text-primary-500">Nói Gì</span>
                    </h2>
                </motion.div>

                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="relative bg-white rounded-3xl p-8 shadow-card card-hover"
                        >
                            {/* Quote icon */}
                            <div className="absolute top-6 right-6 text-primary-100">
                                <Quote size={40} />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className="fill-amber-400 text-amber-400"
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 leading-relaxed mb-6 relative z-10">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white font-bold text-lg">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-display font-semibold text-gray-800">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
