"use client";

import { useState } from "react";
import { useAdmin, Order } from "@/context/AdminContext";
import { ChevronDown, Trash2, Eye, X } from "lucide-react";

const statusOptions: { value: Order["status"]; label: string; color: string }[] = [
    { value: "new", label: "Mới", color: "bg-blue-500/20 text-blue-400" },
    { value: "processing", label: "Đang xử lý", color: "bg-yellow-500/20 text-yellow-400" },
    { value: "delivering", label: "Đang giao", color: "bg-purple-500/20 text-purple-400" },
    { value: "completed", label: "Hoàn thành", color: "bg-emerald-500/20 text-emerald-400" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-500/20 text-red-400" },
];

export default function AdminOrders() {
    const { orders, updateOrderStatus, deleteOrder } = useAdmin();
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const filtered = orders.filter(
        (o) => filterStatus === "all" || o.status === filterStatus
    );

    const getStatusInfo = (status: string) =>
        statusOptions.find((s) => s.value === status) || statusOptions[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                <p className="text-gray-400 text-sm mt-1">
                    {orders.length} đơn hàng
                </p>
            </div>

            {/* Status summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusOptions.map((s) => {
                    const count = orders.filter((o) => o.status === s.value).length;
                    return (
                        <button
                            key={s.value}
                            onClick={() =>
                                setFilterStatus(filterStatus === s.value ? "all" : s.value)
                            }
                            className={`p-3 rounded-xl border text-left transition-colors ${filterStatus === s.value
                                    ? "border-pink-500 bg-gray-900"
                                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                                }`}
                        >
                            <p className="text-lg font-bold">{count}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="py-3 px-4 font-medium">Mã đơn</th>
                                <th className="py-3 px-4 font-medium">Khách hàng</th>
                                <th className="py-3 px-4 font-medium">Sản phẩm</th>
                                <th className="py-3 px-4 font-medium">Tổng tiền</th>
                                <th className="py-3 px-4 font-medium">Trạng thái</th>
                                <th className="py-3 px-4 font-medium">Ngày tạo</th>
                                <th className="py-3 px-4 font-medium text-right">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium">
                                                {order.customerName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {order.customerPhone}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400">
                                            {order.items.length} sản phẩm
                                        </td>
                                        <td className="py-3 px-4 text-pink-400 font-medium">
                                            {formatCurrency(order.totalPrice)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) =>
                                                        updateOrderStatus(
                                                            order.id,
                                                            e.target.value as Order["status"]
                                                        )
                                                    }
                                                    className={`appearance-none text-xs px-3 py-1.5 pr-7 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${statusInfo.color}`}
                                                >
                                                    {statusOptions.map((s) => (
                                                        <option key={s.value} value={s.value}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown
                                                    size={12}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString(
                                                "vi-VN"
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {deleteConfirm === order.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                deleteOrder(order.id);
                                                                setDeleteConfirm(null);
                                                            }}
                                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
                                                        >
                                                            Xóa
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 text-xs bg-gray-700 rounded-lg"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(order.id)
                                                        }
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        {orders.length === 0
                            ? "Chưa có đơn hàng nào. Đơn hàng sẽ xuất hiện khi khách hàng thanh toán."
                            : "Không có đơn hàng nào với trạng thái này"}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSelectedOrder(null)}
                    />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg">
                                Đơn #{selectedOrder.id.slice(0, 8).toUpperCase()}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-800/50 rounded-xl space-y-1">
                                <p className="text-sm font-medium">
                                    {selectedOrder.customerName}
                                </p>
                                <p className="text-xs text-gray-400">
                                    📞 {selectedOrder.customerPhone}
                                </p>
                                <p className="text-xs text-gray-400">
                                    📍 {selectedOrder.customerAddress}
                                </p>
                                {selectedOrder.customerNote && (
                                    <p className="text-xs text-gray-400">
                                        📝 {selectedOrder.customerNote}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">Sản phẩm</p>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="w-10 h-10 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {item.size} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm text-pink-400">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                                <span className="text-sm text-gray-400">Tổng cộng</span>
                                <span className="text-lg font-bold text-pink-400">
                                    {formatCurrency(selectedOrder.totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
