"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { Announcement } from "@/types/club";
import { Plus, Pencil, Trash2, X, Megaphone, Pin } from "lucide-react";

interface FormState {
    title: string;
    content: string;
    isPinned: boolean;
}

const emptyForm: FormState = { title: "", content: "", isPinned: false };

export default function AdminAnnouncementsPage() {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, isLoading } =
        useClub();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [error, setError] = useState("");

    const sorted = [...announcements].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
    });

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (a: Announcement) => {
        setForm({ title: a.title, content: a.content, isPinned: a.isPinned });
        setEditingId(a.id);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            setError("Vui lòng nhập tiêu đề và nội dung");
            return;
        }
        const data = {
            title: form.title.trim(),
            content: form.content.trim(),
            isPinned: form.isPinned,
        };
        if (editingId) {
            await updateAnnouncement(editingId, data);
        } else {
            await addAnnouncement(data);
        }
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Thông báo</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Thông báo ghim sẽ hiện đầu trang chủ
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Đăng thông báo
                </button>
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : sorted.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <Megaphone size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có thông báo nào.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {sorted.map((a) => (
                        <div
                            key={a.id}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start justify-between gap-4"
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-white flex items-center gap-2">
                                    {a.isPinned && <Pin size={14} className="text-amber-400 shrink-0" />}
                                    {a.title}
                                </p>
                                <p className="text-sm text-gray-400 mt-1 whitespace-pre-line line-clamp-3">
                                    {a.content}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                    {new Date(a.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() =>
                                        updateAnnouncement(a.id, { isPinned: !a.isPinned })
                                    }
                                    className={`p-2 rounded-lg hover:bg-gray-700 ${
                                        a.isPinned ? "text-amber-400" : "text-gray-500"
                                    }`}
                                    title={a.isPinned ? "Bỏ ghim" : "Ghim"}
                                >
                                    <Pin size={15} />
                                </button>
                                <button
                                    onClick={() => openEdit(a)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                    title="Sửa"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Xóa thông báo "${a.title}"?`))
                                            deleteAnnouncement(a.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                    title="Xóa"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">
                                {editingId ? "Sửa thông báo" : "Đăng thông báo"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="VD: Giải tháng 7 sắp khởi tranh"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Nội dung *</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isPinned}
                                    onChange={(e) =>
                                        setForm({ ...form, isPinned: e.target.checked })
                                    }
                                    className="w-4 h-4 accent-green-600"
                                />
                                Ghim lên đầu trang chủ
                            </label>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
                                >
                                    {editingId ? "Lưu" : "Đăng"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
