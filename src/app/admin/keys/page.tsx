"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Copy, Check, Key, Clock, ShieldAlert } from "lucide-react";

interface AdminKey {
    id: string;
    key: string;
    label: string;
    expires_at: string;
    is_active: boolean;
    created_at: string;
}

const DURATION_OPTIONS = [
    { label: "1 ngày", hours: 24 },
    { label: "3 ngày", hours: 72 },
    { label: "7 ngày", hours: 168 },
    { label: "30 ngày", hours: 720 },
];

function generateKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let key = "BLOOM-";
    for (let i = 0; i < 6; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

export default function AdminKeysPage() {
    const [keys, setKeys] = useState<AdminKey[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [label, setLabel] = useState("");
    const [duration, setDuration] = useState(24);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadKeys = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data } = await supabase
            .from("admin_keys")
            .select("*")
            .order("created_at", { ascending: false });
        setKeys(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadKeys();
    }, [loadKeys]);

    const createKey = async () => {
        if (!supabase || !label.trim()) return;

        const newKey = generateKey();
        const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

        const { error } = await supabase.from("admin_keys").insert({
            key: newKey,
            label: label.trim(),
            expires_at: expiresAt,
            is_active: true,
        });

        if (!error) {
            setLabel("");
            setShowForm(false);
            loadKeys();
        }
    };

    const revokeKey = async (id: string) => {
        if (!supabase) return;
        await supabase.from("admin_keys").update({ is_active: false }).eq("id", id);
        loadKeys();
    };

    const deleteKey = async (id: string) => {
        if (!supabase) return;
        await supabase.from("admin_keys").delete().eq("id", id);
        loadKeys();
    };

    const copyKey = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const getStatus = (key: AdminKey) => {
        if (!key.is_active) return { label: "Đã thu hồi", color: "bg-red-500/20 text-red-400" };
        if (isExpired(key.expires_at)) return { label: "Hết hạn", color: "bg-gray-500/20 text-gray-400" };
        return { label: "Đang hoạt động", color: "bg-emerald-500/20 text-emerald-400" };
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const inputClass =
        "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-pink-500 transition-colors";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Key size={24} className="text-pink-400" />
                        Quản lý Access Keys
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Tạo và quản lý key truy cập admin cho người khác
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                    <Plus size={18} />
                    Tạo key mới
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                    <p className="font-medium mb-1">Lưu ý bảo mật</p>
                    <p className="text-amber-300/70">
                        Chỉ cấp key cho người bạn tin tưởng. Key cho phép truy cập toàn bộ trang admin.
                        Hãy thu hồi key ngay khi không còn cần thiết.
                    </p>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-semibold text-lg mb-4">Tạo Access Key mới</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">
                                Nhãn (tên người dùng) *
                            </label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="VD: Nhân viên A, Kế toán..."
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">
                                Thời hạn
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {DURATION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.hours}
                                        type="button"
                                        onClick={() => setDuration(opt.hours)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${duration === opt.hours
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={createKey}
                                disabled={!label.trim()}
                                className="px-5 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Tạo key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keys Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="py-3 px-4 font-medium">Nhãn</th>
                                <th className="py-3 px-4 font-medium">Key</th>
                                <th className="py-3 px-4 font-medium">Trạng thái</th>
                                <th className="py-3 px-4 font-medium">Hết hạn</th>
                                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((k) => {
                                const status = getStatus(k);
                                return (
                                    <tr
                                        key={k.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium">{k.label}</td>
                                        <td className="py-3 px-4">
                                            <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono tracking-wider">
                                                {k.key}
                                            </code>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {formatDate(k.expires_at)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => copyKey(k.id, k.key)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Copy key"
                                                >
                                                    {copiedId === k.id ? (
                                                        <Check size={14} className="text-emerald-400" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                                {k.is_active && !isExpired(k.expires_at) && (
                                                    <button
                                                        onClick={() => revokeKey(k.id)}
                                                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                        title="Thu hồi"
                                                    >
                                                        <ShieldAlert size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteKey(k.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="py-12 text-center text-gray-500">
                        Đang tải...
                    </div>
                )}
                {!loading && keys.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        Chưa có key nào. Bấm &quot;Tạo key mới&quot; để bắt đầu.
                    </div>
                )}
            </div>
        </div>
    );
}
