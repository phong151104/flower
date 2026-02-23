"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Tab = "login" | "register";

export default function AuthModal() {
    const {
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithGoogle,
        signInWithFacebook,
        signInWithEmail,
        signUpWithEmail,
    } = useAuth();

    const [tab, setTab] = useState<Tab>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setError("");
        setShowPassword(false);
        setSignUpSuccess(false);
    };

    const handleClose = () => {
        setIsAuthModalOpen(false);
        resetForm();
    };

    const switchTab = (t: Tab) => {
        setTab(t);
        resetForm();
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }

        setIsSubmitting(true);
        const result = await signInWithEmail(email.trim(), password);
        if (result.error) {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) {
            setError("Vui lòng nhập họ tên");
            return;
        }
        if (!email.trim()) {
            setError("Vui lòng nhập email");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsSubmitting(true);
        const result = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (result.error) {
            setError(result.error);
        } else {
            setSignUpSuccess(true);
        }
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-100 via-cream-100 to-peach-100 px-8 pt-8 pb-6">
                                <div className="text-center">
                                    <h2 className="font-display text-2xl font-bold text-gray-900">
                                        {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {tab === "login"
                                            ? "Đăng nhập để theo dõi đơn hàng của bạn"
                                            : "Đăng ký để nhận ưu đãi đặc biệt 🌸"}
                                    </p>
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-6">
                                {/* Sign up success message */}
                                {signUpSuccess ? (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-forest-50 rounded-full flex items-center justify-center">
                                            <Mail size={28} className="text-forest-500" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                            Đăng ký thành công! 🎉
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Vui lòng kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.
                                        </p>
                                        <button
                                            onClick={() => { switchTab("login"); setSignUpSuccess(false); }}
                                            className="px-6 py-3 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-xl transition-colors"
                                        >
                                            Đăng nhập ngay
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Social login buttons */}
                                        <div className="space-y-3 mb-6">
                                            <button
                                                onClick={signInWithGoogle}
                                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 48 48">
                                                    <path fill="#fbc02d" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                                                    <path fill="#e53935" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                                                    <path fill="#4caf50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                                                    <path fill="#1565c0" d="M43.611 20.083L43.595 20H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                                                </svg>
                                                Tiếp tục với Google
                                            </button>

                                            <button
                                                onClick={signInWithFacebook}
                                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl transition-all font-medium"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                Tiếp tục với Facebook
                                            </button>
                                        </div>

                                        {/* Divider */}
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-4 bg-white text-gray-400 uppercase tracking-wider">
                                                    hoặc
                                                </span>
                                            </div>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
                                                <AlertCircle size={16} className="flex-shrink-0" />
                                                {error}
                                            </div>
                                        )}

                                        {/* Tab form */}
                                        <form
                                            onSubmit={tab === "login" ? handleEmailLogin : handleEmailRegister}
                                            className="space-y-4"
                                        >
                                            {tab === "register" && (
                                                <div className="relative">
                                                    <User
                                                        size={18}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        placeholder="Họ và tên"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-cream-200 bg-cream-50/50 focus:border-forest-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            )}

                                            <div className="relative">
                                                <Mail
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Email"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-cream-200 bg-cream-50/50 focus:border-forest-400 focus:outline-none transition-all"
                                                />
                                            </div>

                                            <div className="relative">
                                                <Lock
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Mật khẩu"
                                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-cream-200 bg-cream-50/50 focus:border-forest-400 focus:outline-none transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>

                                            {tab === "register" && (
                                                <div className="relative">
                                                    <Lock
                                                        size={18}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Xác nhận mật khẩu"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-cream-200 bg-cream-50/50 focus:border-forest-400 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3.5 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : tab === "login" ? (
                                                    "Đăng nhập"
                                                ) : (
                                                    "Đăng ký"
                                                )}
                                            </button>
                                        </form>

                                        {/* Switch tab */}
                                        <p className="text-center text-sm text-gray-500 mt-6">
                                            {tab === "login" ? (
                                                <>
                                                    Chưa có tài khoản?{" "}
                                                    <button
                                                        onClick={() => switchTab("register")}
                                                        className="text-primary-500 hover:text-primary-600 font-semibold"
                                                    >
                                                        Đăng ký ngay
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    Đã có tài khoản?{" "}
                                                    <button
                                                        onClick={() => switchTab("login")}
                                                        className="text-primary-500 hover:text-primary-600 font-semibold"
                                                    >
                                                        Đăng nhập
                                                    </button>
                                                </>
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
