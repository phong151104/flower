"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { Product } from "@/data/products";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

const categoryOptions = [
    { value: "bouquet", label: "Bó hoa" },
    { value: "basket", label: "Giỏ hoa" },
    { value: "box", label: "Hộp hoa" },
    { value: "wedding", label: "Hoa cưới" },
    { value: "dried", label: "Hoa khô" },
];

const occasionOptions = ["Sinh nhật", "Kỷ niệm", "Đám cưới", "Khai trương", "Tặng bạn", "Ngày lễ", "Chia buồn"];
const badgeOptions = ["", "Bán chạy", "Mới", "Premium", "Giảm giá"];

export default function AdminProductEdit() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { getProduct, updateProduct } = useAdmin();

    const [form, setForm] = useState({
        name: "",
        price: "",
        originalPrice: "",
        description: "",
        shortDescription: "",
        imageUrl: "",
        category: "bouquet",
        occasion: [] as string[],
        badge: "",
        inStock: true,
    });

    const [sizes, setSizes] = useState([{ name: "", price: "" }]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const product = getProduct(productId);
        if (product) {
            setForm({
                name: product.name,
                price: String(product.price),
                originalPrice: product.originalPrice ? String(product.originalPrice) : "",
                description: product.description,
                shortDescription: product.shortDescription,
                imageUrl: product.images[0] || "",
                category: product.category,
                occasion: product.occasion,
                badge: product.badge || "",
                inStock: product.inStock,
            });
            setSizes(
                product.sizes.length > 0
                    ? product.sizes.map((s) => ({ name: s.name, price: String(s.price) }))
                    : [{ name: "", price: "" }]
            );
            setLoaded(true);
        }
    }, [productId, getProduct]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) return;

        const updates: Partial<Product> = {
            name: form.name,
            price: parseInt(form.price),
            originalPrice: form.originalPrice ? parseInt(form.originalPrice) : undefined,
            description: form.description,
            shortDescription: form.shortDescription,
            images: form.imageUrl
                ? [form.imageUrl]
                : ["https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop&q=80"],
            category: form.category,
            occasion: form.occasion,
            badge: (form.badge as Product["badge"]) || undefined,
            inStock: form.inStock,
            sizes: sizes
                .filter((s) => s.name && s.price)
                .map((s) => ({ name: s.name, price: parseInt(s.price) })),
        };

        updateProduct(productId, updates);
        router.push("/admin/products");
    };

    const toggleOccasion = (occ: string) => {
        setForm((prev) => ({
            ...prev,
            occasion: prev.occasion.includes(occ)
                ? prev.occasion.filter((o) => o !== occ)
                : [...prev.occasion, occ],
        }));
    };

    const addSize = () => setSizes((prev) => [...prev, { name: "", price: "" }]);
    const removeSize = (i: number) => setSizes((prev) => prev.filter((_, idx) => idx !== i));

    if (!loaded) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">Đang tải...</p>
            </div>
        );
    }

    const inputClass =
        "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Sửa sản phẩm</h1>
                    <p className="text-gray-400 text-sm mt-1">{form.name}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold text-lg">Thông tin cơ bản</h2>

                    <div>
                        <label className={labelClass}>Tên sản phẩm *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Giá (₫) *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Giá gốc (₫)</label>
                            <input
                                type="number"
                                value={form.originalPrice}
                                onChange={(e) =>
                                    setForm({ ...form, originalPrice: e.target.value })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Mô tả ngắn</label>
                        <input
                            type="text"
                            value={form.shortDescription}
                            onChange={(e) =>
                                setForm({ ...form, shortDescription: e.target.value })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Mô tả chi tiết</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className={inputClass + " resize-none"}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>URL ảnh sản phẩm</label>
                        <input
                            type="url"
                            value={form.imageUrl}
                            onChange={(e) =>
                                setForm({ ...form, imageUrl: e.target.value })
                            }
                            className={inputClass}
                        />
                        {form.imageUrl && (
                            <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Category & Badge */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold text-lg">Phân loại</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Danh mục</label>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm({ ...form, category: e.target.value })
                                }
                                className={inputClass}
                            >
                                {categoryOptions.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Badge</label>
                            <select
                                value={form.badge}
                                onChange={(e) =>
                                    setForm({ ...form, badge: e.target.value })
                                }
                                className={inputClass}
                            >
                                {badgeOptions.map((b) => (
                                    <option key={b} value={b}>
                                        {b || "Không có"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Dịp</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {occasionOptions.map((occ) => (
                                <button
                                    key={occ}
                                    type="button"
                                    onClick={() => toggleOccasion(occ)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.occasion.includes(occ)
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-800 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {occ}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.inStock}
                                onChange={(e) =>
                                    setForm({ ...form, inStock: e.target.checked })
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <span className="text-sm text-gray-300">Còn hàng</span>
                    </div>
                </div>

                {/* Sizes */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Kích thước & Giá</h2>
                        <button
                            type="button"
                            onClick={addSize}
                            className="p-1.5 text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {sizes.map((size, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={size.name}
                                onChange={(e) => {
                                    const newSizes = [...sizes];
                                    newSizes[i].name = e.target.value;
                                    setSizes(newSizes);
                                }}
                                placeholder="Tên size"
                                className={inputClass + " flex-1"}
                            />
                            <input
                                type="number"
                                value={size.price}
                                onChange={(e) => {
                                    const newSizes = [...sizes];
                                    newSizes[i].price = e.target.value;
                                    setSizes(newSizes);
                                }}
                                placeholder="Giá"
                                className={inputClass + " flex-1"}
                            />
                            {sizes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSize(i)}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/products"
                        className="px-5 py-2.5 text-gray-400 hover:text-white rounded-xl font-medium text-sm transition-colors"
                    >
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                        <Save size={18} />
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    );
}
