"use client";

import { useState } from "react";
import { useAdmin, Transaction } from "@/context/AdminContext";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, ChevronDown, Pencil, Check, X } from "lucide-react";

const expenseCategories = [
    "Nhập hoa",
    "Vật tư đóng gói",
    "Tiền thuê mặt bằng",
    "Lương nhân viên",
    "Điện nước",
    "Marketing",
    "Vận chuyển",
    "Khác",
];

const incomeCategories = [
    "Bán hoa",
    "Dịch vụ trang trí",
    "Hoa đám cưới",
    "Đơn hàng online",
    "Khác",
];

export default function AdminFinance() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, totalIncome, totalExpense, profit } =
        useAdmin();

    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
    const [filterMonth, setFilterMonth] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        type: "income" | "expense";
        amount: string;
        description: string;
        category: string;
        date: string;
    } | null>(null);
    const [form, setForm] = useState({
        type: "income" as "income" | "expense",
        amount: "",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
    });

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || !form.description) return;

        addTransaction({
            type: form.type,
            amount: parseInt(form.amount),
            description: form.description,
            category: form.category || (form.type === "income" ? "Bán hoa" : "Khác"),
            date: form.date,
        });

        setForm({
            type: "income",
            amount: "",
            description: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);
    };

    const startEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setEditForm({
            type: tx.type,
            amount: tx.amount.toString(),
            description: tx.description,
            category: tx.category,
            date: tx.date,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const saveEdit = () => {
        if (!editingId || !editForm || !editForm.amount || !editForm.description) return;
        updateTransaction(editingId, {
            type: editForm.type,
            amount: parseInt(editForm.amount),
            description: editForm.description,
            category: editForm.category,
            date: editForm.date,
        });
        setEditingId(null);
        setEditForm(null);
    };

    const filtered = transactions.filter((tx) => {
        const matchType = filterType === "all" || tx.type === filterType;
        const matchMonth = !filterMonth || tx.date.startsWith(filterMonth);
        return matchType && matchMonth;
    });

    const filteredIncome = filtered
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    const filteredExpense = filtered
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

    const inputClass =
        "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors";

    const editInputClass =
        "px-2 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition-colors";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý thu chi</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Theo dõi tài chính cửa hàng
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                    <Plus size={18} />
                    Thêm giao dịch
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Tổng thu</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp size={18} className="text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(filterMonth ? filteredIncome : totalIncome)}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Tổng chi</span>
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <TrendingDown size={18} className="text-red-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-red-400">
                        {formatCurrency(filterMonth ? filteredExpense : totalExpense)}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Lợi nhuận</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Wallet size={18} className="text-blue-400" />
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${(filterMonth ? filteredIncome - filteredExpense : profit) >= 0 ? "text-blue-400" : "text-red-400"}`}>
                        {formatCurrency(filterMonth ? filteredIncome - filteredExpense : profit)}
                    </p>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-4">Thêm giao dịch mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, type: "income", category: "" })}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${form.type === "income"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-800 text-gray-400"
                                    }`}
                            >
                                Thu nhập
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, type: "expense", category: "" })}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${form.type === "expense"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-800 text-gray-400"
                                    }`}
                            >
                                Chi phí
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">
                                    Số tiền (₫) *
                                </label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="500000"
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">
                                    Ngày
                                </label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">
                                Mô tả *
                            </label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                placeholder="VD: Bán 5 bó hoa hồng"
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">
                                Danh mục
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Chọn danh mục</option>
                                {(form.type === "income"
                                    ? incomeCategories
                                    : expenseCategories
                                ).map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
                        className="appearance-none px-4 py-2.5 pr-10 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-pink-500 cursor-pointer"
                    >
                        <option value="all">Tất cả</option>
                        <option value="income">Thu nhập</option>
                        <option value="expense">Chi phí</option>
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                </div>
                <input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-pink-500"
                    placeholder="Lọc theo tháng"
                />
                {filterMonth && (
                    <button
                        onClick={() => setFilterMonth("")}
                        className="px-3 py-2 text-xs text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl"
                    >
                        Bỏ lọc
                    </button>
                )}
            </div>

            {/* Transactions Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="py-3 px-4 font-medium">Ngày</th>
                                <th className="py-3 px-4 font-medium">Mô tả</th>
                                <th className="py-3 px-4 font-medium">Danh mục</th>
                                <th className="py-3 px-4 font-medium">Loại</th>
                                <th className="py-3 px-4 font-medium text-right">Số tiền</th>
                                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((tx) =>
                                editingId === tx.id && editForm ? (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-gray-800/50 bg-gray-800/40"
                                    >
                                        <td className="py-2 px-4">
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, date: e.target.value })
                                                }
                                                className={editInputClass + " w-[130px]"}
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <input
                                                type="text"
                                                value={editForm.description}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, description: e.target.value })
                                                }
                                                className={editInputClass + " w-full min-w-[150px]"}
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <select
                                                value={editForm.category}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, category: e.target.value })
                                                }
                                                className={editInputClass + " w-[140px]"}
                                            >
                                                {(editForm.type === "income"
                                                    ? incomeCategories
                                                    : expenseCategories
                                                ).map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-2 px-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditForm({
                                                        ...editForm,
                                                        type: editForm.type === "income" ? "expense" : "income",
                                                        category: "",
                                                    })
                                                }
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer ${editForm.type === "income"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {editForm.type === "income" ? "Thu" : "Chi"}
                                            </button>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <input
                                                type="number"
                                                value={editForm.amount}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, amount: e.target.value })
                                                }
                                                className={editInputClass + " w-[120px] text-right"}
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={saveEdit}
                                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                    title="Lưu"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Hủy"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-gray-400">
                                            {new Date(tx.date).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            {tx.description}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400">
                                            {tx.category}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${tx.type === "income"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {tx.type === "income" ? "Thu" : "Chi"}
                                            </span>
                                        </td>
                                        <td
                                            className={`py-3 px-4 text-right font-semibold ${tx.type === "income"
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {tx.type === "income" ? "+" : "-"}
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => startEdit(tx)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteTransaction(tx.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        Chưa có giao dịch nào
                    </div>
                )}
            </div>
        </div>
    );
}
