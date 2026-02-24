"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Wallet,
    ShoppingCart,
    Menu,
    X,
    Store,
    LogOut,
    Key,
} from "lucide-react";
import AdminAuthGate from "@/components/admin/AdminAuthGate";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Sản phẩm", icon: Package },
    { href: "/admin/finance", label: "Thu chi", icon: Wallet },
    { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
];

const superAdminNavItems = [
    { href: "/admin/keys", label: "Access Keys", icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    const allNavItems = isSuperAdmin
        ? [...navItems, ...superAdminNavItems]
        : navItems;

    return (
        <AdminAuthGate onAuthStatusChange={(isSuper) => setIsSuperAdmin(isSuper)}>
            <div className="min-h-screen bg-gray-950 text-gray-100 flex">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        }`}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                <Store size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-lg">
                                Bloom<span className="text-pink-400">ella</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {allNavItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                        ? "bg-pink-500/15 text-pink-400 shadow-sm"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom */}
                    <div className="p-4 border-t border-gray-800">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            Về trang chủ
                        </Link>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden lg:block">
                            <h1 className="text-sm text-gray-400">Xin chào,</h1>
                            <p className="font-semibold">
                                {isSuperAdmin ? "Super Admin 👑" : "Chủ tiệm hoa 🌸"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Store size={14} />
                                Về trang chính
                            </Link>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isSuperAdmin
                                ? "bg-gradient-to-br from-amber-500 to-orange-500"
                                : "bg-gradient-to-br from-pink-500 to-purple-500"
                                }`}>
                                {isSuperAdmin ? "👑" : "A"}
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-6 lg:p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminAuthGate>
    );
}
