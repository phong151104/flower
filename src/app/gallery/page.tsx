"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Heart, ZoomIn, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
    { id: "all", label: "Tất cả" },
    { id: "bouquet", label: "Bó hoa" },
    { id: "wedding", label: "Hoa cưới" },
    { id: "event", label: "Sự kiện" },
    { id: "basket", label: "Giỏ & hộp hoa" },
    { id: "custom", label: "Thiết kế riêng" },
];

const galleryItems = [
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=800&fit=crop&q=80",
        title: "Bó hồng đỏ cổ điển",
        category: "bouquet",
        span: "row-span-2",
        likes: 234,
    },
    {
        id: 2,
        src: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=400&fit=crop&q=80",
        title: "Hoa cưới pastel",
        category: "wedding",
        span: "",
        likes: 189,
    },
    {
        id: 3,
        src: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=400&fit=crop&q=80",
        title: "Cúc họa mi tinh khôi",
        category: "bouquet",
        span: "",
        likes: 156,
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&h=800&fit=crop&q=80",
        title: "Bó hoa cô dâu trắng",
        category: "wedding",
        span: "row-span-2",
        likes: 312,
    },
    {
        id: 5,
        src: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=400&fit=crop&q=80",
        title: "Hoa sự kiện doanh nghiệp",
        category: "event",
        span: "",
        likes: 98,
    },
    {
        id: 6,
        src: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=600&h=400&fit=crop&q=80",
        title: "Giỏ hoa sinh nhật rực rỡ",
        category: "basket",
        span: "",
        likes: 167,
    },
    {
        id: 7,
        src: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=800&fit=crop&q=80",
        title: "Tulip Hà Lan nhập khẩu",
        category: "bouquet",
        span: "row-span-2",
        likes: 245,
    },
    {
        id: 8,
        src: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&h=400&fit=crop&q=80",
        title: "Trang trí tiệc cưới ngoài trời",
        category: "wedding",
        span: "",
        likes: 278,
    },
    {
        id: 9,
        src: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=400&fit=crop&q=80",
        title: "Hộp hoa hồng luxury",
        category: "basket",
        span: "",
        likes: 201,
    },
    {
        id: 10,
        src: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&h=400&fit=crop&q=80",
        title: "Hoa khai trương",
        category: "event",
        span: "",
        likes: 133,
    },
    {
        id: 11,
        src: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&h=800&fit=crop&q=80",
        title: "Bó hoa thiết kế AI",
        category: "custom",
        span: "row-span-2",
        likes: 389,
    },
    {
        id: 12,
        src: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=600&h=400&fit=crop&q=80",
        title: "Hoa hướng dương tươi sáng",
        category: "bouquet",
        span: "",
        likes: 176,
    },
    {
        id: 13,
        src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop&q=80",
        title: "Bàn hoa tiệc gala",
        category: "event",
        span: "",
        likes: 145,
    },
    {
        id: 14,
        src: "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=600&h=400&fit=crop&q=80",
        title: "Thiết kế bó hoa pastel theo yêu cầu",
        category: "custom",
        span: "",
        likes: 267,
    },
    {
        id: 15,
        src: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&h=400&fit=crop&q=80",
        title: "Giỏ hoa mùa xuân",
        category: "basket",
        span: "",
        likes: 154,
    },
    {
        id: 16,
        src: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&h=800&fit=crop&q=80",
        title: "Hoa lavender Pháp",
        category: "custom",
        span: "row-span-2",
        likes: 298,
    },
];

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedImage, setSelectedImage] = useState<(typeof galleryItems)[0] | null>(null);

    const filtered =
        activeCategory === "all"
            ? galleryItems
            : galleryItems.filter((item) => item.category === activeCategory);

    return (
        <main className="min-h-screen bg-cream-50">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-28 pb-14 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-peach-50" />
                <div className="absolute top-16 right-20 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-peach-200/20 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-6">
                            📸 Bộ sưu tập
                        </span>
                        <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                            Những tác phẩm{" "}
                            <span className="font-script text-primary-500">đẹp nhất</span>{" "}
                            của chúng tôi
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Mỗi bó hoa là một tác phẩm nghệ thuật — khám phá bộ sưu tập
                            từ những đơn hàng thực tế của khách hàng Bloomella
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="sticky top-16 z-30 bg-cream-50/90 backdrop-blur-md py-4 border-b border-cream-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <Filter size={16} className="text-gray-400 flex-shrink-0 mr-1" />
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                                    ${activeCategory === cat.id
                                        ? "bg-forest-500 text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-cream-200 border border-gray-100"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        layout
                        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filtered.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: i * 0.03 }}
                                    className="break-inside-avoid group relative rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white"
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <div
                                        className={`relative ${item.span === "row-span-2" ? "aspect-[3/4]" : "aspect-[4/3]"
                                            }`}
                                    >
                                        <Image
                                            src={item.src}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Hover content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <h3 className="text-white font-semibold text-sm line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-white/70 text-xs capitalize">
                                                    {categories.find((c) => c.id === item.category)?.label}
                                                </span>
                                                <div className="flex items-center gap-1 text-white/80">
                                                    <Heart size={12} className="fill-current" />
                                                    <span className="text-xs">{item.likes}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Zoom icon */}
                                        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ZoomIn size={14} className="text-gray-700" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <span className="text-5xl mb-4 block">🌿</span>
                            <p className="font-display text-lg font-semibold text-gray-600">
                                Chưa có ảnh trong danh mục này
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Hãy quay lại sau nhé!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Banner */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden bg-gradient-to-r from-forest-500 to-forest-700 rounded-3xl p-10 text-center text-white"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative">
                            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-3">
                                Muốn có bó hoa xuất hiện trong bộ sưu tập?
                            </h2>
                            <p className="text-forest-100 mb-6 max-w-xl mx-auto">
                                Đặt hoa tại Bloomella và chia sẻ khoảnh khắc của bạn. Những tác phẩm đẹp nhất
                                sẽ được chọn vào bộ sưu tập!
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href="/shop"
                                    className="px-8 py-3.5 bg-white text-forest-600 rounded-full font-semibold hover:bg-cream-50 transition-colors duration-300 shadow-lg"
                                >
                                    Đặt hoa ngay
                                </a>
                                <a
                                    href="/shop"
                                    className="px-8 py-3.5 border-2 border-white/40 text-white rounded-full font-semibold hover:bg-white/10 transition-colors duration-300"
                                >
                                    Tự thiết kế với AI ✨
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="relative aspect-[4/3]">
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                />
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-gray-800">
                                        {selectedImage.title}
                                    </h3>
                                    <span className="text-gray-400 text-sm">
                                        {categories.find((c) => c.id === selectedImage.category)?.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-primary-500">
                                    <Heart size={16} className="fill-current" />
                                    <span className="text-sm font-medium">
                                        {selectedImage.likes}
                                    </span>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}
