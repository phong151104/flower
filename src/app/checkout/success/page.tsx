"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Home, Package, Clock } from "lucide-react";

interface OrderItem {
    name: string;
    image: string;
    price: number;
    size: string;
    quantity: number;
}

interface LastOrder {
    paymentMethod: string;
    totalPrice: number;
    customerName: string;
    items?: OrderItem[];
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

export default function CheckoutSuccessPage() {
    const [order, setOrder] = useState<LastOrder | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem("lastOrder");
        if (data) {
            setOrder(JSON.parse(data));
            sessionStorage.removeItem("lastOrder");
        }
    }, []);

    const paymentLabel = (method: string) => {
        switch (method) {
            case "cod": return "Thanh toán khi nhận hàng (COD)";
            case "bank": return "Chuyển khoản ngân hàng";
            default: return method;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50/30 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Success header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle size={44} className="text-white" strokeWidth={2.5} />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl mb-4"
                    >
                        🎉🌸✨
                    </motion.div>

                    <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {order?.customerName
                            ? `Cảm ơn ${order.customerName} đã đặt hàng!`
                            : "Cảm ơn bạn đã đặt hàng!"}
                    </p>
                </motion.div>

                {/* Order status */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 mb-4"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Trạng thái đơn hàng</h3>
                            <p className="text-xs text-gray-400">Đơn hàng đang chờ xử lý</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-cream-100">
                            <span className="text-gray-500">Trạng thái</span>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
                                {order?.paymentMethod === "bank"
                                    ? "Chờ xác nhận thanh toán"
                                    : "Đơn mới — Chờ xử lý"}
                            </span>
                        </div>
                        {order?.paymentMethod && (
                            <div className="flex justify-between py-2 border-b border-cream-100">
                                <span className="text-gray-500">Thanh toán</span>
                                <span className="font-medium text-gray-800">
                                    {paymentLabel(order.paymentMethod)}
                                </span>
                            </div>
                        )}
                        {order?.totalPrice && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Tổng cộng</span>
                                <span className="font-bold text-primary-500 text-lg">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>
                        )}
                    </div>

                    {order?.paymentMethod === "bank" && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-sm text-blue-700 font-medium mb-1">📌 Lưu ý:</p>
                            <p className="text-sm text-blue-600">
                                Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.
                                Bạn có thể theo dõi trạng thái trong trang tài khoản.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Product list */}
                {order?.items && order.items.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                                <Package size={20} className="text-forest-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">
                                Sản phẩm đã đặt ({order.items.length})
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {order.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 bg-cream-50/50 rounded-xl"
                                >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 text-sm truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {item.size} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-primary-500 text-sm">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    <Link
                        href="/account"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-forest-500 text-white font-semibold rounded-2xl hover:bg-forest-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Package size={20} />
                        Theo dõi đơn hàng
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href="/shop"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cream-100 text-gray-700 font-semibold rounded-2xl hover:bg-cream-200 transition-all"
                        >
                            <ShoppingBag size={18} />
                            Mua thêm
                        </Link>
                        <Link
                            href="/"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cream-100 text-gray-700 font-semibold rounded-2xl hover:bg-cream-200 transition-all"
                        >
                            <Home size={18} />
                            Trang chủ
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
