"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isSuperAdmin } from "@/config/admin";
import { ShieldCheck, KeyRound, LogIn, AlertTriangle } from "lucide-react";

interface AdminAuthGateProps {
    children: React.ReactNode;
    onAuthStatusChange?: (isSuper: boolean) => void;
}

export default function AdminAuthGate({ children, onAuthStatusChange }: AdminAuthGateProps) {
    const { user, signInWithGoogle } = useAuth();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [keyInput, setKeyInput] = useState("");
    const [error, setError] = useState("");
    const [isSuper, setIsSuper] = useState(false);
    const [mode, setMode] = useState<"login" | "key">("login");

    const checkAuth = useCallback(async () => {
        setChecking(true);

        // 1. Super Admin by email
        if (user && isSuperAdmin(user.email)) {
            setAuthorized(true);
            setIsSuper(true);
            onAuthStatusChange?.(true);
            setChecking(false);
            return;
        }

        // 2. Check sessionStorage for saved key
        const savedKey = sessionStorage.getItem("admin_access_key");
        if (savedKey && supabase) {
            const { data } = await supabase
                .from("admin_keys")
                .select("*")
                .eq("key", savedKey)
                .eq("is_active", true)
                .gte("expires_at", new Date().toISOString())
                .single();

            if (data) {
                setAuthorized(true);
                setIsSuper(false);
                onAuthStatusChange?.(false);
                setChecking(false);
                return;
            } else {
                sessionStorage.removeItem("admin_access_key");
            }
        }

        // If user is logged in but not super admin, show key input by default
        if (user) {
            setMode("key");
        }

        setAuthorized(false);
        setIsSuper(false);
        onAuthStatusChange?.(false);
        setChecking(false);
    }, [user, onAuthStatusChange]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!keyInput.trim()) {
            setError("Vui lòng nhập Access Key");
            return;
        }

        if (!supabase) {
            setError("Không thể kết nối database");
            return;
        }

        const { data } = await supabase
            .from("admin_keys")
            .select("*")
            .eq("key", keyInput.trim().toUpperCase())
            .eq("is_active", true)
            .gte("expires_at", new Date().toISOString())
            .single();

        if (data) {
            sessionStorage.setItem("admin_access_key", data.key);
            setAuthorized(true);
            setIsSuper(false);
            onAuthStatusChange?.(false);
        } else {
            setError("Key không hợp lệ hoặc đã hết hạn");
        }
    };

    // Loading state
    if (checking) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    // Authorized
    if (authorized) {
        return <>{children}</>;
    }

    // Not authorized — show login / key input
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} className="text-pink-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Bloom<span className="text-pink-400">ella</span> Admin
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {mode === "login"
                                ? "Đăng nhập tài khoản chủ shop để tiếp tục"
                                : "Nhập Access Key để truy cập admin"}
                        </p>
                    </div>

                    {/* Tab buttons */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => { setMode("login"); setError(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === "login"
                                ? "bg-pink-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => { setMode("key"); setError(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === "key"
                                ? "bg-pink-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                        >
                            Access Key
                        </button>
                    </div>

                    {mode === "login" ? (
                        /* Login with Google / Facebook */
                        <div className="space-y-3">
                            {user ? (
                                /* Already logged in but not super admin */
                                <div className="text-center space-y-3">
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                        <p className="text-sm text-amber-300">
                                            Bạn đang đăng nhập với <strong>{user.email}</strong>
                                        </p>
                                        <p className="text-xs text-amber-400/60 mt-1">
                                            Tài khoản này không có quyền Super Admin.
                                            Hãy chuyển sang tab Access Key hoặc đăng nhập bằng tài khoản khác.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={signInWithGoogle}
                                        className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-medium text-sm transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Đăng nhập bằng Google
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Access Key input */
                        <form onSubmit={handleKeySubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <KeyRound
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                                    />
                                    <input
                                        type="text"
                                        value={keyInput}
                                        onChange={(e) => {
                                            setKeyInput(e.target.value.toUpperCase());
                                            setError("");
                                        }}
                                        placeholder="VD: BLOOM-A3X9K2"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white uppercase tracking-widest font-mono focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-600 placeholder:tracking-normal placeholder:font-sans"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                                    <AlertTriangle size={14} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium text-sm transition-colors"
                            >
                                <LogIn size={18} />
                                Truy cập Admin
                            </button>
                        </form>
                    )}

                    {/* Info */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 text-center">
                            {mode === "login"
                                ? "Đăng nhập bằng tài khoản chủ shop để có quyền Super Admin."
                                : "Liên hệ chủ shop để được cấp Access Key. Key có thời hạn và có thể bị thu hồi."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
