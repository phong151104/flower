"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { Plus, Search, Trash2, Pencil, ChevronDown } from "lucide-react";

export default function AdminProducts() {
    const { products, deleteProduct } = useAdmin();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const categoryLabels: Record<string, string> = {
        bouquet: "Bó hoa",
        basket: "Giỏ hoa",
        box: "Hộp hoa",
        wedding: "Hoa cưới",
        dried: "Hoa khô",
    };

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            categoryFilter === "all" || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const handleDelete = (id: string) => {
        deleteProduct(id);
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {products.length} sản phẩm
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                    <Plus size={18} />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                    />
                </div>
                <div className="relative">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="appearance-none px-4 py-2.5 pr-10 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="py-3 px-4 font-medium">Sản phẩm</th>
                                <th className="py-3 px-4 font-medium">Danh mục</th>
                                <th className="py-3 px-4 font-medium">Giá</th>
                                <th className="py-3 px-4 font-medium">Trạng thái</th>
                                <th className="py-3 px-4 font-medium text-right">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                                {product.images[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate max-w-[200px]">
                                                    {product.name}
                                                </p>
                                                {product.badge && (
                                                    <span className="text-xs text-pink-400">
                                                        {product.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-400">
                                        {categoryLabels[product.category] || product.category}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-pink-400 font-medium">
                                            {formatCurrency(product.price)}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="text-gray-500 line-through text-xs ml-2">
                                                {formatCurrency(product.originalPrice)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.inStock
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {product.inStock ? "Còn hàng" : "Hết hàng"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil size={16} />
                                            </Link>
                                            {deleteConfirm === product.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(product.id)
                                                        }
                                                        className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(null)
                                                        }
                                                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirm(product.id)
                                                    }
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        Không tìm thấy sản phẩm nào
                    </div>
                )}
            </div>
        </div>
    );
}
