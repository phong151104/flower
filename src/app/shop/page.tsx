"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, List, Sparkles, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/shop/ProductCard";
import ProductFilter from "@/components/shop/ProductFilter";
import BouquetBuilder from "@/components/shop/BouquetBuilder";
import { useAdmin } from "@/context/AdminContext";

type TabType = "catalog" | "custom";

export default function ShopPage() {
    const { products } = useAdmin();
    const [activeTab, setActiveTab] = useState<TabType>("catalog");
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: "all",
        priceRange: [0, 2000000] as [number, number],
        occasions: [] as string[],
        colors: [] as string[],
        sortBy: "popular",
    });

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Category
        if (filters.category !== "all") {
            result = result.filter((p) => p.category === filters.category);
        }

        // Price range
        result = result.filter(
            (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
        );

        // Occasions
        if (filters.occasions.length > 0) {
            result = result.filter((p) =>
                p.occasion.some((o) => filters.occasions.includes(o))
            );
        }

        // Colors
        if (filters.colors.length > 0) {
            result = result.filter((p) =>
                p.colors.some((c) => filters.colors.includes(c))
            );
        }

        // Sort
        switch (filters.sortBy) {
            case "price_asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => (a.badge === "Mới" ? -1 : b.badge === "Mới" ? 1 : 0));
                break;
            case "popular":
            default:
                result.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
        }

        return result;
    }, [filters, products]);

    return (
        <main className="min-h-screen bg-cream-50">
            <Navbar />

            {/* Hero Banner */}
            <section className="pt-28 pb-12 bg-gradient-pastel">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="section-heading mb-4"
                    >
                        Cửa Hàng <span className="font-script text-primary-500">Hoa</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="section-subheading mx-auto"
                    >
                        Khám phá bộ sưu tập hoa tươi đa dạng hoặc tự thiết kế bó hoa của riêng bạn
                    </motion.p>

                    {/* Tab Switch */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex bg-white rounded-full p-1.5 shadow-soft mt-8"
                    >
                        <button
                            onClick={() => setActiveTab("catalog")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                                ${activeTab === "catalog"
                                    ? "bg-forest-500 text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <ShoppingBag size={16} />
                            Mẫu Có Sẵn
                        </button>
                        <button
                            onClick={() => setActiveTab("custom")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                                ${activeTab === "custom"
                                    ? "bg-primary-500 text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Sparkles size={16} />
                            Tự Thiết Kế
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "catalog" ? (
                            <motion.div
                                key="catalog"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Toolbar */}
                                <div className="flex items-center justify-between mb-8">
                                    <button
                                        onClick={() => setFilterOpen(true)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-gray-600"
                                    >
                                        <SlidersHorizontal size={16} />
                                        Bộ lọc
                                    </button>

                                    <div className="flex items-center gap-3 ml-auto">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) =>
                                                setFilters((f) => ({ ...f, sortBy: e.target.value }))
                                            }
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        >
                                            <option value="popular">Phổ biến nhất</option>
                                            <option value="newest">Mới nhất</option>
                                            <option value="price_asc">Giá tăng dần</option>
                                            <option value="price_desc">Giá giảm dần</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Grid with Sidebar */}
                                <div className="flex gap-8">
                                    {/* Sidebar filter - desktop */}
                                    <div className="hidden lg:block w-64 flex-shrink-0">
                                        <ProductFilter
                                            filters={filters}
                                            onFilterChange={setFilters}
                                            isOpen={filterOpen}
                                            onClose={() => setFilterOpen(false)}
                                            resultCount={filteredProducts.length}
                                        />
                                    </div>

                                    {/* Mobile filter */}
                                    <div className="lg:hidden">
                                        <ProductFilter
                                            filters={filters}
                                            onFilterChange={setFilters}
                                            isOpen={filterOpen}
                                            onClose={() => setFilterOpen(false)}
                                            resultCount={filteredProducts.length}
                                        />
                                    </div>

                                    {/* Products grid */}
                                    <div className="flex-1">
                                        {filteredProducts.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {filteredProducts.map((product, index) => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20">
                                                <p className="text-4xl mb-4">🌸</p>
                                                <p className="text-gray-500 font-medium">
                                                    Không tìm thấy sản phẩm phù hợp
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Hãy thử thay đổi bộ lọc
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="custom"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BouquetBuilder />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <Footer />
        </main>
    );
}
