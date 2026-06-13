"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, Zap } from "lucide-react";

const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/rankings", label: "Bảng xếp hạng" },
    { href: "/matches", label: "Trận đấu" },
    { href: "/training", label: "Lịch tập" },
    { href: "/tournaments", label: "Giải đấu" },
    { href: "/quy", label: "Quỹ" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-navy-200 shadow-card">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-court rounded-xl flex items-center justify-center shadow-court">
                            <Zap size={20} className="text-ball-300" />
                        </div>
                        <span className="font-display font-bold text-xl text-navy-900">
                            Pickle<span className="text-court-600">Club</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    isActive(link.href)
                                        ? "bg-court-100 text-court-700"
                                        : "text-gray-600 hover:text-court-700 hover:bg-court-50"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin"
                            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-navy-900 hover:bg-navy-100 transition-colors"
                        >
                            <Trophy size={16} />
                            Quản lý
                        </Link>

                        {/* Mobile toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-court-700"
                            aria-label="Mở menu"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <nav className="md:hidden border-t border-navy-200 bg-white px-4 py-3 space-y-1 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                isActive(link.href)
                                    ? "bg-court-100 text-court-700"
                                    : "text-gray-600 hover:bg-court-50"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-navy-100"
                    >
                        Quản lý CLB
                    </Link>
                </nav>
            )}
        </header>
    );
}
