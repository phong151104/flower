"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Heart, Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { totalItems: cartTotal, setIsCartOpen } = useCart();
    const { totalItems: wishlistTotal, setIsWishlistOpen } = useWishlist();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Trang chủ", href: "/" },
        { name: "Giới thiệu", href: "/about" },
        { name: "Cửa hàng", href: "/shop" },
        { name: "Bộ sưu tập", href: "/gallery" },
        { name: "Liên hệ", href: "/contact" },
    ];

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
                    <div className="hidden md:flex items-center gap-4">
                        <button className="p-2 text-gray-600 hover:text-forest-500 transition-colors duration-300 hover:bg-cream-200 rounded-full">
                            <Search size={20} />
                        </button>
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
                    className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
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
                        <div className="flex items-center gap-4 pt-4 border-t border-cream-300">
                            <button className="p-2 text-gray-600 hover:text-forest-500 transition-colors">
                                <Search size={20} />
                            </button>
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
