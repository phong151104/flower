"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    CreditCard,
    MapPin,
    Phone,
    User,
    FileText,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useAdmin, Order } from "@/context/AdminContext";
import { formatPrice } from "@/data/products";

const statusSteps: { key: Order["status"]; label: string; icon: typeof Clock }[] = [
    { key: "new", label: "Đơn mới", icon: ShoppingBag },
    { key: "processing", label: "Đang xử lý", icon: Clock },
    { key: "paid", label: "Thanh toán thành công", icon: CreditCard },
    { key: "delivering", label: "Đang giao", icon: Truck },
    { key: "completed", label: "Hoàn thành", icon: CheckCircle2 },
];

const statusIndex: Record<string, number> = {
    new: 0,
    pending_payment: 0,
    processing: 1,
    paid: 2,
    delivering: 3,
    completed: 4,
    cancelled: -1,
};

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const { user, isLoading: authLoading, setIsAuthModalOpen } = useAuth();
    const { orders, reloadData } = useAdmin();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true);
            router.push("/");
        }
    }, [authLoading, user, router, setIsAuthModalOpen]);

    useEffect(() => {
        reloadData();
    }, [reloadData]);

    useEffect(() => {
        const found = orders.find((o) => o.id === orderId);
        if (found) setOrder(found);
    }, [orders, orderId]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-cream-50 to-white">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="font-display text-xl font-bold text-gray-700 mb-2">
                        Không tìm thấy đơn hàng
                    </h2>
                    <Link
                        href="/account"
                        className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                        ← Quay lại tài khoản
                    </Link>
                </div>
            </main>
        );
    }

    const currentStepIdx = statusIndex[order.status] ?? -1;
    const isCancelled = order.status === "cancelled";

    return (
        <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-pink-50/30">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
                {/* Back button */}
                <Link
                    href="/account"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-forest-500 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Quay lại tài khoản
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg shadow-black/5 p-8 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-display text-xl font-bold text-gray-900">
                                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">
                                Đặt lúc:{" "}
                                {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600">
                                <XCircle size={14} />
                                Đã hủy
                            </span>
                        )}
                    </div>

                    {/* Timeline */}
                    {!isCancelled && (
                        <div className="flex items-center justify-between relative">
                            {/* Connection line */}
                            <div className="absolute top-5 left-8 right-8 h-0.5 bg-cream-200" />
                            <div
                                className="absolute top-5 left-8 h-0.5 bg-forest-500 transition-all duration-700"
                                style={{
                                    width: `${Math.max(0, (currentStepIdx / (statusSteps.length - 1)) * (100 - 10))}%`,
                                }}
                            />

                            {statusSteps.map((step, idx) => {
                                const StepIcon = step.icon;
                                const isActive = currentStepIdx >= idx;
                                const isCurrent = currentStepIdx === idx;
                                return (
                                    <div key={step.key} className="relative flex flex-col items-center z-10">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive
                                                ? "bg-forest-500 text-white shadow-lg shadow-forest-500/30"
                                                : "bg-cream-100 text-gray-400"
                                                } ${isCurrent ? "ring-4 ring-forest-100" : ""}`}
                                        >
                                            <StepIcon size={18} />
                                        </div>
                                        <span
                                            className={`text-xs mt-2 font-medium ${isActive ? "text-forest-600" : "text-gray-400"
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Order Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
                >
                    <div className="bg-white rounded-2xl shadow-sm border border-cream-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <User size={16} className="text-forest-500" />
                            Thông tin nhận hàng
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="font-medium text-gray-800">{order.customerName}</p>
                            <p className="flex items-center gap-2">
                                <Phone size={13} className="text-gray-400" />
                                {order.customerPhone}
                            </p>
                            <p className="flex items-start gap-2">
                                <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                {order.customerAddress}
                            </p>
                            {order.customerNote && (
                                <p className="flex items-start gap-2">
                                    <FileText size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="italic">{order.customerNote}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-cream-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard size={16} className="text-forest-500" />
                            Thanh toán
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>
                                Phương thức:{" "}
                                <span className="font-medium text-gray-800">
                                    {order.paymentMethod === "bank" ? "Chuyển khoản" : "COD"}
                                </span>
                            </p>
                            <p>
                                Tổng tiền:{" "}
                                <span className="font-bold text-primary-500 text-lg">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-cream-100 p-5"
                >
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={16} className="text-forest-500" />
                        Sản phẩm ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 bg-cream-50/50 rounded-xl"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {item.size} × {item.quantity}
                                    </p>
                                </div>
                                <p className="font-semibold text-primary-500">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
