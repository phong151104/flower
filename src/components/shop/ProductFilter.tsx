"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { categories, occasions, colorOptions } from "@/data/products";

interface FilterState {
    category: string;
    priceRange: [number, number];
    occasions: string[];
    colors: string[];
    sortBy: string;
}

interface ProductFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    isOpen: boolean;
    onClose: () => void;
    resultCount: number;
}

export default function ProductFilter({
    filters,
    onFilterChange,
    isOpen,
    onClose,
    resultCount,
}: ProductFilterProps) {
    const updateFilter = (key: keyof FilterState, value: unknown) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const toggleArrayFilter = (key: "occasions" | "colors", value: string) => {
        const current = filters[key] as string[];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        updateFilter(key, updated);
    };

    const clearAll = () => {
        onFilterChange({
            category: "all",
            priceRange: [0, 2000000],
            occasions: [],
            colors: [],
            sortBy: "popular",
        });
    };

    const hasActiveFilters =
        filters.category !== "all" ||
        filters.occasions.length > 0 ||
        filters.colors.length > 0 ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < 2000000;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Filter sidebar */}
            <motion.aside
                initial={false}
                className={`
                    fixed lg:relative top-0 left-0 h-full lg:h-auto z-50 lg:z-0
                    w-80 lg:w-full bg-white lg:bg-transparent
                    transform transition-transform duration-300 lg:transform-none
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    overflow-y-auto lg:overflow-visible
                    p-6 lg:p-0
                `}
            >
                {/* Mobile header */}
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                        <SlidersHorizontal size={20} />
                        Bộ Lọc
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Result count + Clear */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-500">
                        {resultCount} sản phẩm
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h4 className="font-display font-semibold text-gray-800 mb-3">
                        Danh mục
                    </h4>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateFilter("category", cat.id)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                                    ${filters.category === cat.id
                                        ? "bg-primary-50 text-primary-600 font-medium"
                                        : "text-gray-600 hover:bg-cream-100"
                                    }`}
                            >
                                <span>{cat.name}</span>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                    <h4 className="font-display font-semibold text-gray-800 mb-3">
                        Khoảng giá
                    </h4>
                    <input
                        type="range"
                        min={0}
                        max={2000000}
                        step={50000}
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                            updateFilter("priceRange", [
                                filters.priceRange[0],
                                parseInt(e.target.value),
                            ])
                        }
                        className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0₫</span>
                        <span className="font-medium text-primary-500">
                            {new Intl.NumberFormat("vi-VN").format(filters.priceRange[1])}₫
                        </span>
                    </div>
                </div>

                {/* Occasions */}
                <div className="mb-8">
                    <h4 className="font-display font-semibold text-gray-800 mb-3">
                        Dịp tặng
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {occasions.map((occ) => (
                            <button
                                key={occ}
                                onClick={() => toggleArrayFilter("occasions", occ)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                                    ${filters.occasions.includes(occ)
                                        ? "bg-primary-500 text-white"
                                        : "bg-cream-200 text-gray-600 hover:bg-cream-300"
                                    }`}
                            >
                                {occ}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div className="mb-8">
                    <h4 className="font-display font-semibold text-gray-800 mb-3">
                        Màu sắc
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => toggleArrayFilter("colors", color.name)}
                                title={color.name}
                                className={`w-8 h-8 rounded-full border-2 transition-all duration-200
                                    ${filters.colors.includes(color.name)
                                        ? "border-primary-500 scale-110 shadow-pastel"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                style={{ background: color.value }}
                            />
                        ))}
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
