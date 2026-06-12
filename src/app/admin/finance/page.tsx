"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import PlayerSelect from "@/components/club/PlayerSelect";
import type { TransactionCategory } from "@/types/club";
import { Plus, Trash2, X, Wallet, TrendingUp, TrendingDown, Check } from "lucide-react";

const CATEGORY_LABEL: Record<TransactionCategory, string> = {
    tien_san: "Tiền sân",
    bong: "Bóng / dụng cụ",
    quy_thang: "Quỹ tháng",
    khac: "Khác",
};

function formatVND(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

export default function AdminFinancePage() {
    const { transactions, players, addTransaction, deleteTransaction, totalIncome, totalExpense, balance, isLoading } =
        useClub();

    const [showForm, setShowForm] = useState(false);
    const [type, setType] = useState<"income" | "expense">("income");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TransactionCategory>("quy_thang");
    const [playerId, setPlayerId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [error, setError] = useState("");

    // Grid đóng quỹ tháng hiện tại
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyPaid = (pid: string) =>
        transactions.some(
            (t) =>
                t.type === "income" &&
                t.category === "quy_thang" &&
                t.playerId === pid &&
                t.date.startsWith(currentMonth)
        );

    const markPaid = async (pid: string) => {
        const p = players.find((x) => x.id === pid);
        if (!p) return;
        const amountStr = prompt(`Số tiền quỹ tháng của ${p.name}:`, "100000");
        if (!amountStr) return;
        const amt = parseInt(amountStr.replace(/\D/g, ""), 10);
        if (isNaN(amt) || amt <= 0) return;
        await addTransaction({
            type: "income",
            amount: amt,
            description: `Quỹ tháng ${currentMonth.slice(5)}/${currentMonth.slice(0, 4)} — ${p.name}`,
            category: "quy_thang",
            playerId: pid,
            date: new Date().toISOString().slice(0, 10),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(amount.replace(/\D/g, ""), 10);
        if (isNaN(amt) || amt <= 0) {
            setError("Số tiền không hợp lệ");
            return;
        }
        if (!description.trim()) {
            setError("Vui lòng nhập mô tả");
            return;
        }
        await addTransaction({
            type,
            amount: amt,
            description: description.trim(),
            category,
            playerId: playerId || undefined,
            date,
        });
        setShowForm(false);
        setAmount("");
        setDescription("");
        setPlayerId("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Quỹ CLB</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Thu chi: tiền sân, bóng, đóng quỹ tháng
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Ghi thu chi
                </button>
            </div>

            {/* Tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                        <TrendingUp size={16} />
                        Tổng thu
                    </div>
                    <p className="text-2xl font-bold text-white">{formatVND(totalIncome)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                        <TrendingDown size={16} />
                        Tổng chi
                    </div>
                    <p className="text-2xl font-bold text-white">{formatVND(totalExpense)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                        <Wallet size={16} />
                        Số dư quỹ
                    </div>
                    <p
                        className={`text-2xl font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                        {formatVND(balance)}
                    </p>
                </div>
            </div>

            {/* Grid đóng quỹ tháng */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="font-semibold text-white mb-4">
                    Đóng quỹ tháng {currentMonth.slice(5)}/{currentMonth.slice(0, 4)}
                </h2>
                {players.length === 0 ? (
                    <p className="text-gray-500 text-sm">Chưa có thành viên</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[...players]
                            .sort((a, b) => a.name.localeCompare(b.name, "vi"))
                            .map((p) => {
                                const paid = monthlyPaid(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => !paid && markPaid(p.id)}
                                        disabled={paid}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                            paid
                                                ? "bg-green-500/15 text-green-400 cursor-default"
                                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        }`}
                                    >
                                        <span className="truncate">{p.name}</span>
                                        {paid ? (
                                            <Check size={15} className="shrink-0" />
                                        ) : (
                                            <span className="text-xs text-gray-500 shrink-0">
                                                Chưa đóng
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Lịch sử thu chi */}
            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : transactions.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <Wallet size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có giao dịch nào.</p>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Ngày</th>
                                    <th className="px-4 py-3 font-medium">Mô tả</th>
                                    <th className="px-4 py-3 font-medium">Danh mục</th>
                                    <th className="px-4 py-3 font-medium text-right">Số tiền</th>
                                    <th className="px-4 py-3 font-medium text-right">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="border-b border-gray-800/60 hover:bg-gray-800/40"
                                    >
                                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                            {new Date(t.date + "T00:00:00").toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-white">{t.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                                                {CATEGORY_LABEL[t.category]}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                                                t.type === "income" ? "text-green-400" : "text-red-400"
                                            }`}
                                        >
                                            {t.type === "income" ? "+" : "−"}
                                            {formatVND(t.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Xóa giao dịch "${t.description}"?`))
                                                        deleteTransaction(t.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal ghi thu chi */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">Ghi thu chi</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType("income")}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        type === "income"
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Thu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("expense")}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        type === "expense"
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Chi
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Số tiền (₫) *</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="VD: 200000"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Mô tả *</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="VD: Thuê sân thứ 7"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Danh mục</label>
                                    <select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value as TransactionCategory)
                                        }
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    >
                                        {(
                                            Object.entries(CATEGORY_LABEL) as [
                                                TransactionCategory,
                                                string,
                                            ][]
                                        ).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Ngày</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            {category === "quy_thang" && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        Thành viên đóng quỹ
                                    </label>
                                    <PlayerSelect
                                        value={playerId}
                                        onChange={setPlayerId}
                                        placeholder="Chọn thành viên"
                                        className="!bg-gray-800 !border-gray-700 !text-white"
                                    />
                                </div>
                            )}

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
                            >
                                Lưu giao dịch
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
