"use client";

import { useState, useMemo, useRef } from "react";
import { useAdmin, ManualOrder } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
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
    CreditCard,
    ChevronLeft,
    ChevronRight,
    List,
    CalendarDays,
    ImagePlus,
    Loader2,
} from "lucide-react";

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

const paymentOptions = [
    { value: "unpaid", label: "Chưa thanh toán", color: "bg-red-500/20 text-red-400" },
    { value: "deposit", label: "Đã cọc", color: "bg-amber-500/20 text-amber-400" },
    { value: "cod", label: "Thanh toán khi nhận", color: "bg-blue-500/20 text-blue-400" },
    { value: "paid", label: "Đã thanh toán", color: "bg-emerald-500/20 text-emerald-400" },
];

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function ManualOrdersPage() {
    const {
        manualOrders: orders,
        addManualOrder,
        updateManualOrder,
        deleteManualOrder,
        addTransaction,
        deleteTransaction,
        transactions,
    } = useAdmin();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingOrder, setViewingOrder] = useState<ManualOrder | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterSource, setFilterSource] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    // Calendar state
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    const [paymentStatus, setPaymentStatus] = useState<ManualOrder["paymentStatus"]>("unpaid");
    const [depositAmount, setDepositAmount] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const getTxPrefix = (id: string) => `[SĐ] #${id.slice(0, 8).toUpperCase()}`;

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
        setPaymentStatus("unpaid");
        setDepositAmount("");
        setImages([]);
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
        setPaymentStatus(order.paymentStatus);
        setDepositAmount(order.depositAmount > 0 ? order.depositAmount.toString() : "");
        setImages(order.images || []);
        setEditingId(order.id);
        setShowForm(true);
    };

    const removeLinkedTx = async (id: string) => {
        const txPrefix = getTxPrefix(id);
        const linked = transactions.filter(
            (t) => t.description.startsWith(txPrefix) && t.type === "income"
        );
        for (const tx of linked) {
            await deleteTransaction(tx.id);
        }
    };

    const createPaymentTx = async (
        id: string, ps: ManualOrder["paymentStatus"],
        orderAmount: number, deposit: number, custName: string
    ) => {
        const txPrefix = getTxPrefix(id);
        if (ps === "paid") {
            await addTransaction({ type: "income", amount: orderAmount, description: `${txPrefix} — ${custName} (toàn bộ)`, category: "Bán hàng (sổ đơn)", date: new Date().toISOString() });
        } else if (ps === "deposit" && deposit > 0) {
            await addTransaction({ type: "income", amount: deposit, description: `${txPrefix} — ${custName} (cọc)`, category: "Bán hàng (sổ đơn)", date: new Date().toISOString() });
        }
    };

    const handleSubmit = async () => {
        if (!customerName.trim() || !amount.trim()) return;
        const orderAmount = Number(amount);
        if (isNaN(orderAmount) || orderAmount <= 0) return;
        const deposit = Number(depositAmount) || 0;

        if (editingId) {
            const prevOrder = orders.find((o) => o.id === editingId);
            await updateManualOrder(editingId, {
                customerName: customerName.trim(), customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(), description: description.trim(),
                amount: orderAmount, source, note: note.trim(), orderDate, deliveryDate,
                status, paymentStatus, depositAmount: paymentStatus === "deposit" ? deposit : 0,
                images,
            });
            // Recreate linked transactions if amount, deposit, or payment status changed
            if (prevOrder && (
                prevOrder.paymentStatus !== paymentStatus ||
                prevOrder.amount !== orderAmount ||
                prevOrder.depositAmount !== (paymentStatus === "deposit" ? deposit : 0)
            )) {
                await removeLinkedTx(editingId);
                await createPaymentTx(editingId, paymentStatus, orderAmount, deposit, customerName.trim());
            }
        } else {
            await addManualOrder({
                customerName: customerName.trim(), customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(), description: description.trim(),
                amount: orderAmount, source, note: note.trim(), orderDate, deliveryDate,
                status, paymentStatus, depositAmount: paymentStatus === "deposit" ? deposit : 0,
                images,
            });
            if (paymentStatus === "paid" || (paymentStatus === "deposit" && deposit > 0)) {
                const newest = orders[0];
                const id = newest?.id || "new";
                await createPaymentTx(id, paymentStatus, orderAmount, deposit, customerName.trim());
            }
        }
        resetForm();
        setShowForm(false);
    };

    const handleStatusChange = async (orderId: string, newStatus: ManualOrder["status"]) => {
        await updateManualOrder(orderId, { status: newStatus });
    };

    const handlePaymentChange = async (orderId: string, newPayment: ManualOrder["paymentStatus"]) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;
        const prevPayment = order.paymentStatus;
        let deposit = order.depositAmount;
        if (newPayment === "deposit" && deposit === 0) {
            const input = prompt("Nhập số tiền cọc (₫):");
            if (input === null) return;
            deposit = Number(input) || 0;
            if (deposit <= 0) return;
        }
        await updateManualOrder(orderId, { paymentStatus: newPayment, depositAmount: newPayment === "deposit" ? deposit : 0 });
        if (prevPayment !== newPayment) {
            await removeLinkedTx(orderId);
            await createPaymentTx(orderId, newPayment, order.amount, deposit, order.customerName);
        }
    };

    const handleDelete = async (id: string) => {
        await removeLinkedTx(id);
        await deleteManualOrder(id);
        setDeleteConfirm(null);
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || !supabase) return;
        setUploading(true);
        const newUrls: string[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;
            const ext = file.name.split(".").pop();
            const fileName = `orders/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error } = await supabase.storage.from("order-images").upload(fileName, file);
            if (!error) {
                const { data: urlData } = supabase.storage.from("order-images").getPublicUrl(fileName);
                if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
            }
        }
        setImages((prev) => [...prev, ...newUrls]);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((u) => u !== url));
    };

    const filtered = orders.filter((o) => {
        if (filterStatus !== "all" && o.status !== filterStatus) return false;
        if (filterSource !== "all" && o.source !== filterSource) return false;
        return true;
    });

    const getSourceInfo = (src: string) => sourceOptions.find((s) => s.value === src) || sourceOptions[5];
    const getStatusInfo = (st: string) => statusOptions.find((s) => s.value === st) || statusOptions[0];
    const getPaymentInfo = (pt: string) => paymentOptions.find((p) => p.value === pt) || paymentOptions[0];

    const totalPaid = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.amount, 0);
    const totalDeposits = orders.filter((o) => o.paymentStatus === "deposit").reduce((s, o) => s + o.depositAmount, 0);

    // ========== CALENDAR LOGIC ==========
    const deliveryMap = useMemo(() => {
        const map: Record<string, ManualOrder[]> = {};
        for (const o of orders) {
            if (o.deliveryDate) {
                const key = o.deliveryDate; // YYYY-MM-DD
                if (!map[key]) map[key] = [];
                map[key].push(o);
            }
        }
        return map;
    }, [orders]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(calYear, calMonth, 1);
        const lastDay = new Date(calYear, calMonth + 1, 0);
        const startWeekday = firstDay.getDay(); // 0=Sun
        const totalDays = lastDay.getDate();

        const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        const prevMonthLastDay = new Date(calYear, calMonth, 0).getDate();
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = prevMonthLastDay - i;
            const m = calMonth === 0 ? 11 : calMonth - 1;
            const y = calMonth === 0 ? calYear - 1 : calYear;
            days.push({ day: d, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
        }

        // Current month
        for (let d = 1; d <= totalDays; d++) {
            days.push({ day: d, dateStr: `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: true });
        }

        // Next month padding (fill to 42 or at least complete the week)
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let d = 1; d <= remaining; d++) {
                const m = calMonth === 11 ? 0 : calMonth + 1;
                const y = calMonth === 11 ? calYear + 1 : calYear;
                days.push({ day: d, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
            }
        }

        return days;
    }, [calMonth, calYear]);

    const todayStr = new Date().toISOString().slice(0, 10);

    const selectedDateOrders = selectedDate ? (deliveryMap[selectedDate] || []) : [];

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
        else setCalMonth(calMonth - 1);
        setSelectedDate(null);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
        else setCalMonth(calMonth + 1);
        setSelectedDate(null);
    };
    const goToday = () => {
        const now = new Date();
        setCalMonth(now.getMonth());
        setCalYear(now.getFullYear());
        setSelectedDate(todayStr);
    };

    // ========== RENDER ==========
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Sổ đơn hàng</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {orders.length} đơn • Thu: {formatCurrency(totalPaid + totalDeposits)}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="bg-gray-800 rounded-xl flex p-1">
                        <button onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
                            <List size={14} /> Danh sách
                        </button>
                        <button onClick={() => setViewMode("calendar")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${viewMode === "calendar" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
                            <CalendarDays size={14} /> Lịch giao
                        </button>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-pink-500/25">
                        <Plus size={18} /> Tạo đơn mới
                    </button>
                </div>
            </div>

            {viewMode === "list" ? (
                <>
                    {/* Status summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {statusOptions.map((s) => {
                            const count = orders.filter((o) => o.status === s.value).length;
                            return (
                                <button key={s.value}
                                    onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
                                    className={`p-3 rounded-xl border text-left transition-colors ${filterStatus === s.value ? "border-pink-500 bg-gray-900" : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}>
                                    <p className="text-lg font-bold">{count}</p>
                                    <p className="text-xs text-gray-400">{s.label}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Source filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setFilterSource("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterSource === "all" ? "bg-pink-500/20 text-pink-400" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                            Tất cả nguồn
                        </button>
                        {sourceOptions.map((s) => (
                            <button key={s.value}
                                onClick={() => setFilterSource(filterSource === s.value ? "all" : s.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterSource === s.value ? s.color : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Orders Table */}
                    {renderOrderTable(filtered)}
                </>
            ) : (
                /* ========== CALENDAR VIEW ========== */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-5">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-semibold">{MONTH_NAMES[calMonth]} {calYear}</h2>
                                <button onClick={goToday} className="text-xs text-pink-400 hover:text-pink-300 mt-0.5">Hôm nay</button>
                            </div>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {WEEKDAYS.map((d) => (
                                <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => {
                                const dayOrders = deliveryMap[day.dateStr] || [];
                                const count = dayOrders.length;
                                const isToday = day.dateStr === todayStr;
                                const isSelected = day.dateStr === selectedDate;
                                const hasDelivery = count > 0;

                                return (
                                    <button key={i}
                                        onClick={() => setSelectedDate(day.dateStr === selectedDate ? null : day.dateStr)}
                                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm
                                            ${!day.isCurrentMonth ? "text-gray-700" : "text-gray-300"}
                                            ${isToday && !isSelected ? "ring-1 ring-pink-500/50" : ""}
                                            ${isSelected ? "bg-pink-500/20 ring-2 ring-pink-500 text-white" : "hover:bg-gray-800"}
                                        `}>
                                        <span className={`font-medium ${isToday ? "text-pink-400" : ""}`}>{day.day}</span>
                                        {hasDelivery && (
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {count <= 3 ? (
                                                    Array.from({ length: count }).map((_, j) => (
                                                        <span key={j} className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-pink-400 font-bold">{count}</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected date orders */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        {selectedDate ? (
                            <>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Truck size={16} className="text-pink-400" />
                                    Giao ngày {new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                                </h3>
                                {selectedDateOrders.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-8 text-center">Không có đơn giao ngày này</p>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-auto">
                                        {selectedDateOrders.map((order) => {
                                            const statusInfo = getStatusInfo(order.status);
                                            const payInfo = getPaymentInfo(order.paymentStatus);
                                            return (
                                                <div key={order.id}
                                                    className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer"
                                                    onClick={() => setViewingOrder(order)}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className="font-medium text-sm">{order.customerName}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    {order.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{order.description}</p>}
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-pink-400 font-semibold text-sm">{formatCurrency(order.amount)}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${payInfo.color}`}>
                                                            {payInfo.label}
                                                        </span>
                                                    </div>
                                                    {order.paymentStatus === "deposit" && (
                                                        <p className="text-xs text-amber-400 mt-1">Cọc: {formatCurrency(order.depositAmount)} • Còn: {formatCurrency(order.amount - order.depositAmount)}</p>
                                                    )}
                                                    {order.customerPhone && <p className="text-xs text-gray-500 mt-1">📞 {order.customerPhone}</p>}
                                                    {order.customerAddress && <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {order.customerAddress}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Chọn ngày trên lịch để xem đơn giao</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => { setShowForm(false); resetForm(); }} />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-lg">{editingId ? "Sửa đơn hàng" : "Tạo đơn mới"}</h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><User size={12} /> Tên khách hàng *</label>
                                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nguyễn Văn A"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><Phone size={12} /> Số điện thoại</label>
                                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0912345678"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Địa chỉ giao</label>
                                <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><FileText size={12} /> Mô tả đơn hàng</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Bó hồng đỏ 20 bông + thiệp chúc mừng" rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><DollarSign size={12} /> Tổng tiền (₫) *</label>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000"
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><Tag size={12} /> Nguồn đơn</label>
                                    <select value={source} onChange={(e) => setSource(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors">
                                        {sourceOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Ngày đặt</label>
                                    <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><Truck size={12} /> Ngày giao</label>
                                    <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><Clock size={12} /> Trạng thái</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value as ManualOrder["status"])}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors">
                                        {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><CreditCard size={12} /> Thanh toán</label>
                                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as ManualOrder["paymentStatus"])}
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors">
                                        {paymentOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                </div>
                            </div>
                            {paymentStatus === "deposit" && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <label className="text-xs text-amber-400 mb-1.5 flex items-center gap-1.5"><DollarSign size={12} /> Số tiền cọc (₫)</label>
                                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="200000"
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-amber-500/30 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                                    {amount && depositAmount && (
                                        <p className="text-xs text-gray-400 mt-2">Còn lại: <span className="text-amber-400 font-medium">{formatCurrency(Number(amount) - Number(depositAmount))}</span></p>
                                    )}
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><FileText size={12} /> Ghi chú</label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm..." rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors resize-none" />
                            </div>
                            {/* Image upload */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5"><ImagePlus size={12} /> Ảnh đính kèm</label>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files)} />
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                    {images.map((url, i) => (
                                        <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-700">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(url)}
                                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                        className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-700 hover:border-pink-500 text-gray-500 hover:text-pink-400 flex flex-col items-center justify-center transition-colors disabled:opacity-50">
                                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <><ImagePlus size={20} /><span className="text-[10px] mt-1">Thêm ảnh</span></>}
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleSubmit} disabled={!customerName.trim() || !amount.trim()}
                                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                    <div className="absolute inset-0 bg-black/60" onClick={() => setViewingOrder(null)} />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg">Chi tiết đơn hàng</h2>
                            <button onClick={() => setViewingOrder(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-800/50 rounded-xl space-y-2">
                                <p className="text-sm font-medium flex items-center gap-2"><User size={14} className="text-gray-400" /> {viewingOrder.customerName}</p>
                                {viewingOrder.customerPhone && <p className="text-xs text-gray-400 flex items-center gap-2"><Phone size={14} /> {viewingOrder.customerPhone}</p>}
                                {viewingOrder.customerAddress && <p className="text-xs text-gray-400 flex items-center gap-2"><MapPin size={14} /> {viewingOrder.customerAddress}</p>}
                            </div>
                            {viewingOrder.description && (
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Mô tả đơn hàng</p>
                                    <p className="text-sm">{viewingOrder.description}</p>
                                </div>
                            )}
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Tổng tiền</p>
                                <p className="text-lg font-bold text-pink-400">{formatCurrency(viewingOrder.amount)}</p>
                                {viewingOrder.paymentStatus === "deposit" && (
                                    <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                                        <p className="text-sm text-amber-400">Đã cọc: {formatCurrency(viewingOrder.depositAmount)}</p>
                                        <p className="text-sm text-gray-400">Còn lại: <span className="text-white font-medium">{formatCurrency(viewingOrder.amount - viewingOrder.depositAmount)}</span></p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Nguồn</p>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getSourceInfo(viewingOrder.source).color}`}>{getSourceInfo(viewingOrder.source).label}</span>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Thanh toán</p>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentInfo(viewingOrder.paymentStatus).color}`}>{getPaymentInfo(viewingOrder.paymentStatus).label}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ngày đặt</p>
                                    <p className="text-sm">{new Date(viewingOrder.orderDate).toLocaleDateString("vi-VN")}</p>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ngày giao</p>
                                    <p className="text-sm">{viewingOrder.deliveryDate ? new Date(viewingOrder.deliveryDate).toLocaleDateString("vi-VN") : "Chưa xác định"}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-800/50 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusInfo(viewingOrder.status).color}`}>{getStatusInfo(viewingOrder.status).label}</span>
                            </div>
                            {viewingOrder.note && (
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Ghi chú</p>
                                    <p className="text-sm">{viewingOrder.note}</p>
                                </div>
                            )}
                            {viewingOrder.images && viewingOrder.images.length > 0 && (
                                <div className="p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-2">Ảnh đính kèm</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingOrder.images.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="w-24 h-24 rounded-xl overflow-hidden border border-gray-700 hover:border-pink-500 transition-colors block">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ===== Table render helper =====
    function renderOrderTable(list: ManualOrder[]) {
        return (
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
                                <th className="py-3 px-4 font-medium">Thanh toán</th>
                                <th className="py-3 px-4 font-medium">Ngày đặt</th>
                                <th className="py-3 px-4 font-medium">Ngày giao</th>
                                <th className="py-3 px-4 font-medium text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((order) => {
                                const sourceInfo = getSourceInfo(order.source);
                                const statusInfo = getStatusInfo(order.status);
                                const remaining = order.paymentStatus === "deposit" ? order.amount - order.depositAmount : 0;
                                return (
                                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <p className="font-medium">{order.customerName}</p>
                                            {order.customerPhone && <p className="text-xs text-gray-400">{order.customerPhone}</p>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 max-w-[200px] truncate">{order.description || "—"}</td>
                                        <td className="py-3 px-4">
                                            <p className="text-pink-400 font-medium">{formatCurrency(order.amount)}</p>
                                            {order.paymentStatus === "deposit" && (
                                                <div className="mt-0.5">
                                                    <p className="text-xs text-amber-400">Cọc: {formatCurrency(order.depositAmount)}</p>
                                                    <p className="text-xs text-gray-500">Còn: {formatCurrency(remaining)}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sourceInfo.color}`}>{sourceInfo.label}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as ManualOrder["status"])}
                                                className={`appearance-none text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${statusInfo.color}`}>
                                                {statusOptions.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select value={order.paymentStatus}
                                                onChange={(e) => handlePaymentChange(order.id, e.target.value as ManualOrder["paymentStatus"])}
                                                className={`appearance-none text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${getPaymentInfo(order.paymentStatus).color}`}>
                                                {paymentOptions.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">{new Date(order.orderDate).toLocaleDateString("vi-VN")}</td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("vi-VN") : "—"}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setViewingOrder(order)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Xem"><Eye size={16} /></button>
                                                <button onClick={() => openEditForm(order)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Sửa"><Edit3 size={16} /></button>
                                                {deleteConfirm === order.id ? (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleDelete(order.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg">Xóa</button>
                                                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-gray-700 rounded-lg">Hủy</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDeleteConfirm(order.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {list.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        {orders.length === 0 ? "Chưa có đơn nào. Bấm \"Tạo đơn mới\" để bắt đầu!" : "Không có đơn nào với bộ lọc này"}
                    </div>
                )}
            </div>
        );
    }
}
