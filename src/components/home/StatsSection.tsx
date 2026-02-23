"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Package, Flower2, Smile, Clock } from "lucide-react";

interface StatItem {
    icon: React.ReactNode;
    value: number;
    suffix: string;
    label: string;
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const duration = 2000;
                    const steps = 60;
                    const increment = value / steps;
                    let current = 0;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= value) {
                            setCount(value);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(current));
                        }
                    }, duration / steps);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div ref={ref} className="font-display text-4xl md:text-5xl font-bold text-gray-900">
            {count.toLocaleString()}
            <span className="text-primary-500">{suffix}</span>
        </div>
    );
}

export default function StatsSection() {
    const stats: StatItem[] = [
        {
            icon: <Package className="w-6 h-6" />,
            value: 3000,
            suffix: "+",
            label: "Đơn Hàng Thành Công",
        },
        {
            icon: <Flower2 className="w-6 h-6" />,
            value: 5000,
            suffix: "+",
            label: "Bó Hoa Đã Bán",
        },
        {
            icon: <Smile className="w-6 h-6" />,
            value: 700,
            suffix: "+",
            label: "Khách Hàng Hài Lòng",
        },
        {
            icon: <Clock className="w-6 h-6" />,
            value: 15,
            suffix: "+",
            label: "Năm Kinh Nghiệm",
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="relative text-center group"
                        >
                            {/* Divider between items */}
                            {index > 0 && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-cream-400 hidden md:block" />
                            )}

                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center
                              group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 group-hover:shadow-pastel">
                                    {stat.icon}
                                </div>
                            </div>

                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />

                            <p className="text-gray-500 text-sm mt-2 font-medium">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
