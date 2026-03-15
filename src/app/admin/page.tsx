"use client";

import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import {
    Package,
    ShoppingCart,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

export default function AdminDashboard() {
    const { products, transactions, orders, manualOrders, totalExpense } = useAdmin();

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN").format(n) + "₫";

    const formatShort = (n: number) => {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr";
        if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
        return n.toString();
    };

    // ===== KPI calculations =====
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const ordersThisMonth = manualOrders.filter((o) => o.orderDate?.startsWith(thisMonth) || o.createdAt?.startsWith(thisMonth));
    const ordersLastMonth = manualOrders.filter((o) => o.orderDate?.startsWith(lastMonth) || o.createdAt?.startsWith(lastMonth));

    const completedOrders = manualOrders.filter((o) => o.status === "completed");
    const completionRate = manualOrders.length > 0 ? Math.round((completedOrders.length / manualOrders.length) * 100) : 0;

    const realIncome = manualOrders
        .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod")
        .reduce((s, o) => s + o.amount, 0)
        + manualOrders
            .filter((o) => o.paymentStatus === "deposit")
            .reduce((s, o) => s + o.depositAmount, 0);

    const revenueThisMonth = manualOrders
        .filter((o) => (o.paymentStatus === "paid" || o.paymentStatus === "cod") && (o.orderDate?.startsWith(thisMonth) || o.createdAt?.startsWith(thisMonth)))
        .reduce((s, o) => s + o.amount, 0)
        + manualOrders
            .filter((o) => o.paymentStatus === "deposit" && (o.orderDate?.startsWith(thisMonth) || o.createdAt?.startsWith(thisMonth)))
            .reduce((s, o) => s + o.depositAmount, 0);

    // ===== Revenue by month (last 6 months) =====
    const revenueByMonth = useMemo(() => {
        const months: { month: string; label: string; income: number; expense: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const label = `T${d.getMonth() + 1}`;

            const income = manualOrders
                .filter((o) => (o.paymentStatus === "paid" || o.paymentStatus === "cod") && (o.orderDate?.startsWith(key) || o.createdAt?.startsWith(key)))
                .reduce((s, o) => s + o.amount, 0)
                + manualOrders
                    .filter((o) => o.paymentStatus === "deposit" && (o.orderDate?.startsWith(key) || o.createdAt?.startsWith(key)))
                    .reduce((s, o) => s + o.depositAmount, 0);

            const expense = transactions
                .filter((t) => t.type === "expense" && t.date.startsWith(key))
                .reduce((s, t) => s + t.amount, 0);

            months.push({ month: key, label, income, expense });
        }
        return months;
    }, [transactions, manualOrders]);

    // ===== Order status distribution =====
    const orderStatusData = useMemo(() => {
        const statusMap: Record<string, { name: string; count: number; color: string }> = {
            pending: { name: "Chờ xác nhận", count: 0, color: "#f59e0b" },
            confirmed: { name: "Đã xác nhận", count: 0, color: "#3b82f6" },
            delivering: { name: "Đang giao", count: 0, color: "#8b5cf6" },
            completed: { name: "Hoàn thành", count: 0, color: "#10b981" },
            cancelled: { name: "Đã hủy", count: 0, color: "#ef4444" },
        };
        manualOrders.forEach((o) => {
            if (statusMap[o.status]) statusMap[o.status].count++;
        });
        // Also count web orders
        orders.forEach((o) => {
            if (o.status === "completed" && statusMap.completed) statusMap.completed.count++;
            else if (o.status === "delivering" && statusMap.delivering) statusMap.delivering.count++;
            else if (o.status === "cancelled" && statusMap.cancelled) statusMap.cancelled.count++;
            else if (statusMap.pending) statusMap.pending.count++;
        });
        return Object.values(statusMap).filter((s) => s.count > 0);
    }, [manualOrders, orders]);

    // ===== Order source distribution =====
    const orderSourceData = useMemo(() => {
        const sourceMap: Record<string, number> = {};
        manualOrders.forEach((o) => {
            const src = o.source || "Khác";
            sourceMap[src] = (sourceMap[src] || 0) + 1;
        });
        return Object.entries(sourceMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [manualOrders]);

    const sourceColors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

    // ===== Expense by category =====
    const expenseByCategoryData = useMemo(() => {
        const catMap: Record<string, number> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const cat = t.category || "Khác";
                catMap[cat] = (catMap[cat] || 0) + t.amount;
            });
        return Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const expenseColors = ["#f43f5e", "#8b5cf6", "#0ea5e9", "#f97316", "#22c55e", "#e879f9", "#facc15", "#14b8a6"];

    // ===== Payment status =====
    const paymentStatusData = useMemo(() => {
        const map: Record<string, { name: string; count: number; color: string }> = {
            paid: { name: "Đã thanh toán", count: 0, color: "#10b981" },
            cod: { name: "COD", count: 0, color: "#3b82f6" },
            deposit: { name: "Đặt cọc", count: 0, color: "#f59e0b" },
            unpaid: { name: "Chưa thanh toán", count: 0, color: "#ef4444" },
        };
        manualOrders.forEach((o) => {
            if (map[o.paymentStatus]) map[o.paymentStatus].count++;
        });
        return Object.values(map).filter((s) => s.count > 0);
    }, [manualOrders]);

    // ===== Recent orders =====
    const recentOrders = [...manualOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    const statusLabels: Record<string, { label: string; color: string; icon: typeof Clock }> = {
        pending: { label: "Chờ xác nhận", color: "text-amber-400 bg-amber-500/15", icon: Clock },
        confirmed: { label: "Đã xác nhận", color: "text-blue-400 bg-blue-500/15", icon: CheckCircle2 },
        delivering: { label: "Đang giao", color: "text-purple-400 bg-purple-500/15", icon: Package },
        completed: { label: "Hoàn thành", color: "text-emerald-400 bg-emerald-500/15", icon: CheckCircle2 },
        cancelled: { label: "Đã hủy", color: "text-red-400 bg-red-500/15", icon: AlertCircle },
    };

    // Custom tooltip for area chart
    const RevenueTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload) return null;
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm" style={{ color: p.color }}>
                        {p.name}: <span className="font-semibold">{formatCurrency(p.value)}</span>
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-400 mt-1">Tổng quan & phân tích cửa hàng</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Đơn tháng này</span>
                        <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
                            <ShoppingCart size={20} className="text-pink-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{ordersThisMonth.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Tháng trước: {ordersLastMonth.length}
                        {ordersLastMonth.length > 0 && (
                            <span className={ordersThisMonth.length >= ordersLastMonth.length ? "text-emerald-400 ml-1" : "text-red-400 ml-1"}>
                                ({ordersThisMonth.length >= ordersLastMonth.length ? "+" : ""}
                                {Math.round(((ordersThisMonth.length - ordersLastMonth.length) / ordersLastMonth.length) * 100)}%)
                            </span>
                        )}
                    </p>
                </div>

                {/* Completion Rate */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Tỉ lệ hoàn thành</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{completionRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {completedOrders.length}/{manualOrders.length} đơn
                    </p>
                </div>

                {/* Revenue This Month */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Doanh thu tháng</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                            <TrendingUp size={20} className="text-blue-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{formatShort(revenueThisMonth)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Tổng: {formatCurrency(realIncome)}
                    </p>
                </div>

                {/* Products */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Sản phẩm</span>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                            <Package size={20} className="text-purple-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{products.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Đang hiển thị trên shop</p>
                </div>
            </div>

            {/* Revenue Chart - Full Width */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-1">Doanh thu & Chi phí</h2>
                <p className="text-gray-500 text-sm mb-6">6 tháng gần nhất</p>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => formatShort(v)} />
                            <Tooltip content={<RevenueTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="Doanh thu"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#incomeGrad)"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="Chi phí"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#expenseGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2-column: Order Status + Payment Status */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Order Status Pie */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-1">Trạng thái đơn hàng</h2>
                    <p className="text-gray-500 text-sm mb-4">Phân bổ theo trạng thái</p>
                    {orderStatusData.length === 0 ? (
                        <p className="text-gray-500 text-sm py-12 text-center">Chưa có đơn hàng</p>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-[180px] h-[180px] flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {orderStatusData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", fontSize: "13px" }}
                                            itemStyle={{ color: "#d1d5db" }}
                                            formatter={(value, name) => [`${value} đơn`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {orderStatusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-sm text-gray-300">{s.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-200">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Status Pie */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-1">Thanh toán</h2>
                    <p className="text-gray-500 text-sm mb-4">Tình trạng thanh toán đơn hàng</p>
                    {paymentStatusData.length === 0 ? (
                        <p className="text-gray-500 text-sm py-12 text-center">Chưa có dữ liệu</p>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-[180px] h-[180px] flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {paymentStatusData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", fontSize: "13px" }}
                                            itemStyle={{ color: "#d1d5db" }}
                                            formatter={(value, name) => [`${value} đơn`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {paymentStatusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-sm text-gray-300">{s.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-200">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2-column: Order Source + Expense Category */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Order Source Bar Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-1">Nguồn đơn hàng</h2>
                    <p className="text-gray-500 text-sm mb-4">Đơn hàng theo kênh bán</p>
                    {orderSourceData.length === 0 ? (
                        <p className="text-gray-500 text-sm py-12 text-center">Chưa có dữ liệu</p>
                    ) : (
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orderSourceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                                    <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", fontSize: "13px" }}
                                        itemStyle={{ color: "#d1d5db" }}
                                        formatter={(value) => [`${value} đơn`, "Số lượng"]}
                                    />
                                    <Bar dataKey="value" name="Đơn hàng" radius={[6, 6, 0, 0]}>
                                        {orderSourceData.map((_, i) => (
                                            <Cell key={i} fill={sourceColors[i % sourceColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Expense Category Pie */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-1">Chi phí theo danh mục</h2>
                    <p className="text-gray-500 text-sm mb-4">Phân bổ chi tiêu</p>
                    {expenseByCategoryData.length === 0 ? (
                        <p className="text-gray-500 text-sm py-12 text-center">Chưa có chi phí</p>
                    ) : (
                        <div>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseByCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, value, cx, cy, midAngle = 0, outerRadius: oR = 100, index = 0 }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = oR + 28;
                                                const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                                                const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill={expenseColors[index % expenseColors.length]}
                                                        textAnchor={x > (cx as number) ? "start" : "end"}
                                                        dominantBaseline="central"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                    >
                                                        {name}: {formatShort(value)}
                                                    </text>
                                                );
                                            }}
                                            labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                                        >
                                            {expenseByCategoryData.map((_, i) => (
                                                <Cell key={i} fill={expenseColors[i % expenseColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", fontSize: "13px" }}
                                            itemStyle={{ color: "#d1d5db" }}
                                            formatter={(value) => [formatCurrency(Number(value)), "Chi phí"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Đơn hàng gần đây</h2>
                {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">Chưa có đơn hàng</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-left">
                                    <th className="py-2.5 px-3 font-medium">Khách hàng</th>
                                    <th className="py-2.5 px-3 font-medium">Nguồn</th>
                                    <th className="py-2.5 px-3 font-medium">Giá trị</th>
                                    <th className="py-2.5 px-3 font-medium">Thanh toán</th>
                                    <th className="py-2.5 px-3 font-medium">Trạng thái</th>
                                    <th className="py-2.5 px-3 font-medium">Ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => {
                                    const st = statusLabels[order.status];
                                    return (
                                        <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="py-3 px-3">
                                                <p className="font-medium text-gray-200">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order.customerPhone}</p>
                                            </td>
                                            <td className="py-3 px-3 text-gray-400">{order.source || "—"}</td>
                                            <td className="py-3 px-3 font-semibold text-white">{formatCurrency(order.amount)}</td>
                                            <td className="py-3 px-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentStatus === "paid" ? "bg-emerald-500/15 text-emerald-400"
                                                        : order.paymentStatus === "cod" ? "bg-blue-500/15 text-blue-400"
                                                            : order.paymentStatus === "deposit" ? "bg-amber-500/15 text-amber-400"
                                                                : "bg-red-500/15 text-red-400"
                                                    }`}>
                                                    {order.paymentStatus === "paid" ? "Đã TT" : order.paymentStatus === "cod" ? "COD" : order.paymentStatus === "deposit" ? "Cọc" : "Chưa TT"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                {st && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-gray-400 text-xs">
                                                {new Date(order.orderDate || order.createdAt).toLocaleDateString("vi-VN")}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
