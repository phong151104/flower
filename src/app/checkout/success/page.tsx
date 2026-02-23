"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Home, FileText } from "lucide-react";

interface LastOrder {
    paymentMethod: string;
    totalPrice: number;
    customerName: string;
}

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
            case "cod": return "Thanh toán khi nhận hàng";
            case "bank": return "Chuyển khoản ngân hàng";
            default: return method;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50/30 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-lg w-full text-center"
            >
                {/* Success animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                </motion.div>

                {/* Confetti emojis */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl mb-6"
                >
                    🎉🌸✨
                </motion.div>

                <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
                    Đặt hàng thành công!
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                    {order?.customerName
                        ? `Cảm ơn ${order.customerName} đã đặt hàng!`
                        : "Cảm ơn bạn đã đặt hàng!"}
                </p>

                {/* Order info card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 mb-8 text-left"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <FileText size={20} className="text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Thông tin đơn hàng</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-cream-100">
                            <span className="text-gray-500">Trạng thái</span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                Chờ xử lý
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
                                    {new Intl.NumberFormat("vi-VN").format(order.totalPrice)}₫
                                </span>
                            </div>
                        )}
                    </div>

                    {order?.paymentMethod === "bank" && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-sm text-blue-700 font-medium mb-1">📌 Lưu ý:</p>
                            <p className="text-sm text-blue-600">
                                Vui lòng chuyển khoản theo thông tin đã cung cấp. Đơn hàng sẽ
                                được xác nhận sau khi nhận được thanh toán.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/shop"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-forest-500 text-white font-semibold rounded-2xl hover:bg-forest-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        <ShoppingBag size={20} />
                        Tiếp tục mua sắm
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-cream-100 text-gray-700 font-semibold rounded-2xl hover:bg-cream-200 transition-all"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
