"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import {
    Plus,
    Trash2,
    Edit3,
    X,
    CheckCircle,
    Calendar,
    User,
    Phone,
    MapPin,
    FileText,
    DollarSign,
    Tag,
    Truck,
    Clock,
    Eye,
} from "lucide-react";

interface ManualOrder {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    description: string;
    amount: number;
    source: string;
    note: string;
    orderDate: string;
    deliveryDate: string;
    status: "pending" | "confirmed" | "delivering" | "completed" | "cancelled";
    createdAt: string;
}

const sourceOptions = [
    { value: "facebook", label: "Facebook", color: "bg-blue-500/20 text-blue-400" },
    { value: "zalo", label: "Zalo", color: "bg-sky-500/20 text-sky-400" },
    { value: "phone", label: "Gọi điện", color: "bg-green-500/20 text-green-400" },
    { value: "walk-in", label: "Tại cửa hàng", color: "bg-purple-500/20 text-purple-400" },
    { value: "website", label: "Website", color: "bg-pink-500/20 text-pink-400" },
    { value: "other", label: "Nguồn khác", color: "bg-gray-500/20 text-gray-400" },
];

const statusOptions = [
    { value: "pending", label: "Chờ xác nhận", color: "bg-amber-500/20 text-amber-400" },
    { value: "confirmed", label: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400" },
    { value: "delivering", label: "Đang giao", color: "bg-purple-500/20 text-purple-400" },
    { value: "completed", label: "Hoàn thành", color: "bg-emerald-500/20 text-emerald-400" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-500/20 text-red-400" },
];

function generateId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function ManualOrdersPage() {
    const { addTransaction, deleteTransaction, transactions } = useAdmin();
    const [orders, setOrders] = useState<ManualOrder[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("bloomella_manual_orders");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingOrder, setViewingOrder] = useState<ManualOrder | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterSource, setFilterSource] = useState("all");

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("facebook");
    const [note, setNote] = useState("");
    const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
    const [deliveryDate, setDeliveryDate] = useState("");
    const [status, setStatus] = useState<ManualOrder["status"]>("pending");

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const saveOrders = (newOrders: ManualOrder[]) => {
        setOrders(newOrders);
        localStorage.setItem("bloomella_manual_orders", JSON.stringify(newOrders));
    };

    const resetForm = () => {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setDescription("");
        setAmount("");
        setSource("facebook");
        setNote("");
        setOrderDate(new Date().toISOString().slice(0, 10));
        setDeliveryDate("");
        setStatus("pending");
        setEditingId(null);
    };

    const openEditForm = (order: ManualOrder) => {
        setCustomerName(order.customerName);
        setCustomerPhone(order.customerPhone);
        setCustomerAddress(order.customerAddress);
        setDescription(order.description);
        setAmount(order.amount.toString());
        setSource(order.source);
        setNote(order.note);
        setOrderDate(order.orderDate);
        setDeliveryDate(order.deliveryDate);
        setStatus(order.status);
        setEditingId(order.id);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!customerName.trim() || !amount.trim()) return;

        const orderAmount = Number(amount);
        if (isNaN(orderAmount) || orderAmount <= 0) return;

        if (editingId) {
            // Update existing order
            const prevOrder = orders.find((o) => o.id === editingId);
            const updatedOrders = orders.map((o) =>
                o.id === editingId
                    ? {
                        ...o,
                        customerName: customerName.trim(),
                        customerPhone: customerPhone.trim(),
                        customerAddress: customerAddress.trim(),
                        description: description.trim(),
                        amount: orderAmount,
                        source,
                        note: note.trim(),
                        orderDate,
                        deliveryDate,
                        status,
                    }
                    : o
            );
            saveOrders(updatedOrders);

            // Handle transaction changes when status changes
            const txPrefix = `[SĐ] #${editingId.slice(0, 8).toUpperCase()}`;
            if (prevOrder) {
                if (status === "completed" && prevOrder.status !== "completed") {
                    // Became completed → add income
                    await addTransaction({
                        type: "income",
                        amount: orderAmount,
                        description: `${txPrefix} — ${customerName.trim()}`,
                        category: "Bán hàng (sổ đơn)",
                        date: new Date().toISOString(),
                    });
                } else if (prevOrder.status === "completed" && status !== "completed") {
                    // Was completed, now changed → remove income
                    const linkedTx = transactions.find(
                        (t) => t.description.startsWith(txPrefix) && t.type === "income"
                    );
                    if (linkedTx) await deleteTransaction(linkedTx.id);
                }
            }
        } else {
            // Create new order
            const newOrder: ManualOrder = {
                id: generateId(),
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(),
                description: description.trim(),
                amount: orderAmount,
                source,
                note: note.trim(),
                orderDate,
                deliveryDate,
                status,
                createdAt: new Date().toISOString(),
            };
            saveOrders([newOrder, ...orders]);

            // Auto-create income transaction if completed
            if (status === "completed") {
                await addTransaction({
                    type: "income",
                    amount: orderAmount,
                    description: `[SĐ] #${newOrder.id.slice(0, 8).toUpperCase()} — ${customerName.trim()}`,
                    category: "Bán hàng (sổ đơn)",
                    date: new Date().toISOString(),
                });
            }
        }

        resetForm();
        setShowForm(false);
    };

    const handleStatusChange = async (orderId: string, newStatus: ManualOrder["status"]) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        const prevStatus = order.status;
        const updatedOrders = orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
        );
        saveOrders(updatedOrders);

        const txPrefix = `[SĐ] #${orderId.slice(0, 8).toUpperCase()}`;

        if (newStatus === "completed" && prevStatus !== "completed") {
            await addTransaction({
                type: "income",
                amount: order.amount,
                description: `${txPrefix} — ${order.customerName}`,
                category: "Bán hàng (sổ đơn)",
                date: new Date().toISOString(),
            });
        } else if (prevStatus === "completed" && newStatus !== "completed") {
            const linkedTx = transactions.find(
                (t) => t.description.startsWith(txPrefix) && t.type === "income"
            );
            if (linkedTx) await deleteTransaction(linkedTx.id);
        }
    };

    const handleDelete = async (id: string) => {
        const order = orders.find((o) => o.id === id);
        if (order?.status === "completed") {
            const txPrefix = `[SĐ] #${id.slice(0, 8).toUpperCase()}`;
            const linkedTx = transactions.find(
                (t) => t.description.startsWith(txPrefix) && t.type === "income"
            );
            if (linkedTx) await deleteTransaction(linkedTx.id);
        }
        saveOrders(orders.filter((o) => o.id !== id));
        setDeleteConfirm(null);
    };

    const filtered = orders.filter((o) => {
        if (filterStatus !== "all" && o.status !== filterStatus) return false;
        if (filterSource !== "all" && o.source !== filterSource) return false;
        return true;
    });

    const getSourceInfo = (src: string) =>
        sourceOptions.find((s) => s.value === src) || sourceOptions[5];
    const getStatusInfo = (st: string) =>
        statusOptions.find((s) => s.value === st) || statusOptions[0];

    const totalCompleted = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sổ đơn hàng</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {orders.length} đơn • Doanh thu: {formatCurrency(totalCompleted)}
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-pink-500/25"
                >
                    <Plus size={18} />
                    Tạo đơn mới
                </button>
            </div>

            {/* Status summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

            {/* Source filter */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterSource("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterSource === "all"
                        ? "bg-pink-500/20 text-pink-400"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                >
                    Tất cả nguồn
                </button>
                {sourceOptions.map((s) => (
                    <button
                        key={s.value}
                        onClick={() =>
                            setFilterSource(filterSource === s.value ? "all" : s.value)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterSource === s.value
                            ? s.color
                            : "bg-gray-800 text-gray-400 hover:text-white"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="py-3 px-4 font-medium">Khách hàng</th>
                                <th className="py-3 px-4 font-medium">Mô tả</th>
                                <th className="py-3 px-4 font-medium">Số tiền</th>
                                <th className="py-3 px-4 font-medium">Nguồn</th>
                                <th className="py-3 px-4 font-medium">Trạng thái</th>
                                <th className="py-3 px-4 font-medium">Ngày đặt</th>
                                <th className="py-3 px-4 font-medium">Ngày giao</th>
                                <th className="py-3 px-4 font-medium text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const sourceInfo = getSourceInfo(order.source);
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium">{order.customerName}</p>
                                            {order.customerPhone && (
                                                <p className="text-xs text-gray-400">
                                                    {order.customerPhone}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 max-w-[200px] truncate">
                                            {order.description || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-pink-400 font-medium">
                                            {formatCurrency(order.amount)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${sourceInfo.color}`}
                                            >
                                                {sourceInfo.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        order.id,
                                                        e.target.value as ManualOrder["status"]
                                                    )
                                                }
                                                className={`appearance-none text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${statusInfo.color}`}
                                            >
                                                {statusOptions.map((s) => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {order.deliveryDate
                                                ? new Date(order.deliveryDate).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Xem"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(order)}
                                                    className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                {deleteConfirm === order.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDelete(order.id)}
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
                                                        onClick={() => setDeleteConfirm(order.id)}
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
                            ? "Chưa có đơn nào. Bấm \"Tạo đơn mới\" để bắt đầu!"
                            : "Không có đơn nào với bộ lọc này"}
                    </div>
                )}
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => {
                            setShowForm(false);
                            resetForm();
                        }}
                    />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-lg">
                                {editingId ? "Sửa đơn hàng" : "Tạo đơn mới"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Customer Name */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <User size={12} /> Tên khách hàng *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <Phone size={12} /> Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="0912345678"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <MapPin size={12} /> Địa chỉ giao
                                </label>
                                <input
                                    type="text"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <FileText size={12} /> Mô tả đơn hàng
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="VD: Bó hồng đỏ 20 bông + thiệp chúc mừng"
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Amount + Source */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                        <DollarSign size={12} /> Số tiền (₫) *
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="500000"
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                        <Tag size={12} /> Nguồn đơn
                                    </label>
                                    <select
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                    >
                                        {sourceOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                        <Calendar size={12} /> Ngày đặt
                                    </label>
                                    <input
                                        type="date"
                                        value={orderDate}
                                        onChange={(e) => setOrderDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                        <Truck size={12} /> Ngày giao
                                    </label>
                                    <input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <Clock size={12} /> Trạng thái
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ManualOrder["status"])}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                                    <FileText size={12} /> Ghi chú
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ghi chú thêm..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!customerName.trim() || !amount.trim()}
                                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {editingId ? "Cập nhật đơn" : "Tạo đơn hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Order Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setViewingOrder(null)}
                    />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg">Chi tiết đơn hàng</h2>
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-800/50 rounded-xl space-y-2">
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <User size={14} className="text-gray-400" />
                                    {viewingOrder.customerName}
                                </p>
                                {viewingOrder.customerPhone && (
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <Phone size={14} /> {viewingOrder.customerPhone}
                                    </p>
                                )}
                                {viewingOrder.customerAddress && (
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <MapPin size={14} /> {viewingOrder.customerAddress}
                                    </p>
                                )}
                            </div>

                            {viewingOrder.description && (
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Mô tả đơn hàng</p>
                                    <p className="text-sm">{viewingOrder.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Số tiền</p>
                                    <p className="text-lg font-bold text-pink-400">
                                        {formatCurrency(viewingOrder.amount)}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Nguồn</p>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getSourceInfo(viewingOrder.source).color
                                            }`}
                                    >
                                        {getSourceInfo(viewingOrder.source).label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ngày đặt</p>
                                    <p className="text-sm">
                                        {new Date(viewingOrder.orderDate).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ngày giao</p>
                                    <p className="text-sm">
                                        {viewingOrder.deliveryDate
                                            ? new Date(viewingOrder.deliveryDate).toLocaleDateString("vi-VN")
                                            : "Chưa xác định"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusInfo(viewingOrder.status).color
                                        }`}
                                >
                                    {getStatusInfo(viewingOrder.status).label}
                                </span>
                            </div>

                            {viewingOrder.note && (
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ghi chú</p>
                                    <p className="text-sm">{viewingOrder.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
