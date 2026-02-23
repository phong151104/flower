"use client";

import { useAdmin } from "@/context/AdminContext";
import {
    Package,
    Wallet,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

export default function AdminDashboard() {
    const { products, transactions, orders, totalIncome, totalExpense, profit } = useAdmin();

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const stats = [
        {
            label: "Tổng doanh thu",
            value: formatCurrency(totalIncome),
            icon: TrendingUp,
            color: "from-emerald-500 to-emerald-600",
            textColor: "text-emerald-400",
        },
        {
            label: "Tổng chi phí",
            value: formatCurrency(totalExpense),
            icon: ArrowDownRight,
            color: "from-red-500 to-red-600",
            textColor: "text-red-400",
        },
        {
            label: "Lợi nhuận",
            value: formatCurrency(profit),
            icon: ArrowUpRight,
            color: "from-blue-500 to-blue-600",
            textColor: "text-blue-400",
        },
        {
            label: "Sản phẩm",
            value: products.length.toString(),
            icon: Package,
            color: "from-purple-500 to-purple-600",
            textColor: "text-purple-400",
        },
        {
            label: "Đơn hàng",
            value: orders.length.toString(),
            icon: ShoppingCart,
            color: "from-amber-500 to-amber-600",
            textColor: "text-amber-400",
        },
        {
            label: "Giao dịch",
            value: transactions.length.toString(),
            icon: Wallet,
            color: "from-pink-500 to-pink-600",
            textColor: "text-pink-400",
        },
    ];

    const recentOrders = orders.slice(0, 5);
    const recentTransactions = transactions.slice(0, 5);

    const statusLabels: Record<string, { label: string; color: string }> = {
        new: { label: "Mới", color: "bg-blue-500/20 text-blue-400" },
        processing: { label: "Đang xử lý", color: "bg-yellow-500/20 text-yellow-400" },
        delivering: { label: "Đang giao", color: "bg-purple-500/20 text-purple-400" },
        completed: { label: "Hoàn thành", color: "bg-emerald-500/20 text-emerald-400" },
        cancelled: { label: "Đã hủy", color: "bg-red-500/20 text-red-400" },
    };

    return (
        <div className="space-y-8">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-400 mt-1">Tổng quan hoạt động cửa hàng</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                                >
                                    <Icon size={20} className="text-white" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${stat.textColor}`}>
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-4">Đơn hàng gần đây</h2>
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm py-8 text-center">
                            Chưa có đơn hàng nào
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {order.customerName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {order.items.length} sản phẩm • {formatCurrency(order.totalPrice)}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabels[order.status]?.color
                                            }`}
                                    >
                                        {statusLabels[order.status]?.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-4">Giao dịch gần đây</h2>
                    {recentTransactions.length === 0 ? (
                        <p className="text-gray-500 text-sm py-8 text-center">
                            Chưa có giao dịch nào
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {tx.description}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {tx.category} • {new Date(tx.date).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm font-semibold ${tx.type === "income"
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {tx.type === "income" ? "+" : "-"}
                                        {formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Sản phẩm nổi bật</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                                {product.images[0] && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-pink-400">
                                    {formatCurrency(product.price)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
