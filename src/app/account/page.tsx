"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    LogOut,
    ChevronRight,
    ShoppingBag,
    CreditCard,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useAdmin, Order } from "@/context/AdminContext";
import { formatPrice } from "@/data/products";

const statusConfig: Record<Order["status"], { label: string; color: string; bg: string; icon: typeof Clock }> = {
    new: { label: "Mới", color: "text-blue-600", bg: "bg-blue-50", icon: ShoppingBag },
    pending_payment: { label: "Chờ thanh toán", color: "text-amber-600", bg: "bg-amber-50", icon: CreditCard },
    processing: { label: "Đang xử lý", color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
    paid: { label: "Thanh toán thành công", color: "text-teal-600", bg: "bg-teal-50", icon: CreditCard },
    delivering: { label: "Đang giao", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
    completed: { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
    cancelled: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

export default function AccountPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, signOut, setIsAuthModalOpen } = useAuth();
    const { getOrdersByUserId, reloadData } = useAdmin();

    // Redirect to home if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true);
            router.push("/");
        }
    }, [authLoading, user, router, setIsAuthModalOpen]);

    useEffect(() => {
        reloadData();
    }, [reloadData]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    const myOrders = getOrdersByUserId(user.id);

    return (
        <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-pink-50/30">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg shadow-black/5 p-8 mb-8"
                >
                    <div className="flex items-center gap-5">
                        {user.avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={user.avatarUrl}
                                alt=""
                                className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                                {user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="font-display text-2xl font-bold text-gray-900">
                                {user.fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <Mail size={14} />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            {user.provider && user.provider !== "email" && (
                                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-cream-100 text-gray-500 capitalize">
                                    Đăng nhập qua {user.provider}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={signOut}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut size={16} />
                            Đăng xuất
                        </button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-100 text-center">
                        <p className="text-2xl font-bold text-forest-500">{myOrders.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Tổng đơn hàng</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-100 text-center">
                        <p className="text-2xl font-bold text-primary-500">
                            {myOrders.filter(o => o.status === "completed").length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Hoàn thành</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-100 text-center">
                        <p className="text-2xl font-bold text-amber-500">
                            {myOrders.filter(o => !["completed", "cancelled"].includes(o.status)).length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Đang xử lý</p>
                    </div>
                </motion.div>

                {/* Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={22} className="text-forest-500" />
                        Đơn hàng của tôi
                    </h2>

                    {myOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-cream-100 p-12 text-center">
                            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="font-semibold text-gray-700 mb-2">
                                Chưa có đơn hàng nào
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Hãy khám phá cửa hàng và đặt hoa nhé!
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white font-semibold rounded-xl hover:bg-forest-600 transition-colors"
                            >
                                <ShoppingBag size={18} />
                                Mua sắm ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myOrders.map((order) => {
                                const status = statusConfig[order.status];
                                const StatusIcon = status.icon;
                                return (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.id}`}
                                        className="block bg-white rounded-2xl shadow-sm border border-cream-100 p-5 hover:shadow-md hover:border-primary-200 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs text-gray-400">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {order.items.length} sản phẩm
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <p className="font-bold text-primary-500">
                                                {formatPrice(order.totalPrice)}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
