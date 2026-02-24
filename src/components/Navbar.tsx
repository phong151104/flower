"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Heart, Menu, X, User, LogOut, Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/config/admin";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { totalItems: cartTotal, setIsCartOpen } = useCart();
    const { totalItems: wishlistTotal, setIsWishlistOpen } = useWishlist();
    const { user, setIsAuthModalOpen, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close user menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { name: "Trang chủ", href: "/" },
        { name: "Giới thiệu", href: "/about" },
        { name: "Cửa hàng", href: "/shop" },
        { name: "Bộ sưu tập", href: "/gallery" },
        { name: "Liên hệ", href: "/contact" },
    ];

    const getInitials = (name: string) => {
        return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "bg-white/90 backdrop-blur-md shadow-soft py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1 group">
                        <span className="font-display text-2xl font-bold text-forest-500 group-hover:text-forest-600 transition-colors">
                            Bloom
                        </span>
                        <span className="font-script text-2xl text-primary-500 group-hover:text-primary-600 transition-colors">
                            ella
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="relative text-sm font-medium text-gray-700 hover:text-forest-500 transition-colors duration-300
                           after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] 
                           after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-full"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Action Icons */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* User button */}
                        <div className="relative" ref={userMenuRef}>
                            {user ? (
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-cream-200 transition-colors duration-300"
                                >
                                    {user.avatarUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={user.avatarUrl}
                                            alt=""
                                            className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                            {getInitials(user.fullName)}
                                        </div>
                                    )}
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="p-2 text-gray-600 hover:text-forest-500 transition-colors duration-300 hover:bg-cream-200 rounded-full"
                                >
                                    <User size={20} />
                                </button>
                            )}

                            {/* Dropdown menu */}
                            {isUserMenuOpen && user && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden animate-fade-in">
                                    <div className="px-4 py-3 border-b border-cream-100">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/account"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 transition-colors"
                                        >
                                            <User size={16} />
                                            Tài khoản
                                        </Link>
                                        <Link
                                            href="/account"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 transition-colors"
                                        >
                                            <Package size={16} />
                                            Đơn hàng của tôi
                                        </Link>
                                        {isSuperAdmin(user.email) && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-pink-500 hover:bg-pink-50 transition-colors font-medium"
                                            >
                                                <span>👑</span>
                                                Quản lý Admin
                                            </Link>
                                        )}
                                    </div>
                                    <div className="border-t border-cream-100 py-1">
                                        <button
                                            onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsWishlistOpen(true)}
                            className="p-2 text-gray-600 hover:text-primary-500 transition-colors duration-300 hover:bg-cream-200 rounded-full relative"
                        >
                            <Heart size={20} className={wishlistTotal > 0 ? "fill-primary-500 text-primary-500" : ""} />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {wishlistTotal}
                            </span>
                        </button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="p-2 text-gray-600 hover:text-forest-500 transition-colors duration-300 hover:bg-cream-200 rounded-full relative"
                        >
                            <ShoppingBag size={20} />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartTotal}
                            </span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-700 hover:text-forest-500 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-pastel p-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-gray-700 hover:text-forest-500 font-medium transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Mobile user section */}
                        {user ? (
                            <div className="pt-4 border-t border-cream-300 space-y-3">
                                <div className="flex items-center gap-3">
                                    {user.avatarUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-primary-200" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                            {getInitials(user.fullName)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{user.fullName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/account"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex-1 text-center py-2 text-sm font-medium text-forest-600 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors"
                                    >
                                        Tài khoản
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                                        className="py-2 px-3 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-cream-300">
                                <button
                                    onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full py-3 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <User size={18} />
                                    Đăng nhập / Đăng ký
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                onClick={() => { setIsWishlistOpen(true); setIsMobileMenuOpen(false); }}
                                className="p-2 text-gray-600 hover:text-primary-500 transition-colors relative"
                            >
                                <Heart size={20} className={wishlistTotal > 0 ? "fill-primary-500 text-primary-500" : ""} />
                                {wishlistTotal > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {wishlistTotal}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                                className="p-2 text-gray-600 hover:text-forest-500 transition-colors relative"
                            >
                                <ShoppingBag size={20} />
                                {cartTotal > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartTotal}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
