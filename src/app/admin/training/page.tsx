"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { TrainingSession } from "@/types/club";
import { Plus, Pencil, Trash2, X, CalendarDays, MapPin, Clock, Users } from "lucide-react";

interface FormState {
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string;
    note: string;
}

const emptyForm: FormState = {
    title: "Buổi tập",
    sessionDate: "",
    startTime: "",
    endTime: "",
    location: "",
    note: "",
};

export default function AdminTrainingPage() {
    const {
        trainingSessions,
        trainingVotes,
        addTrainingSession,
        updateTrainingSession,
        deleteTrainingSession,
        isLoading,
    } = useClub();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [error, setError] = useState("");

    const sorted = [...trainingSessions].sort((a, b) =>
        b.sessionDate.localeCompare(a.sessionDate)
    );

    const yesCount = (sessionId: string) =>
        trainingVotes.filter((v) => v.sessionId === sessionId && v.status === "yes").length;

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (s: TrainingSession) => {
        setForm({
            title: s.title,
            sessionDate: s.sessionDate,
            startTime: s.startTime?.slice(0, 5) || "",
            endTime: s.endTime?.slice(0, 5) || "",
            location: s.location || "",
            note: s.note || "",
        });
        setEditingId(s.id);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.sessionDate) {
            setError("Vui lòng chọn ngày tập");
            return;
        }
        const data = {
            title: form.title.trim() || "Buổi tập",
            sessionDate: form.sessionDate,
            startTime: form.startTime || undefined,
            endTime: form.endTime || undefined,
            location: form.location.trim() || undefined,
            note: form.note.trim() || undefined,
        };
        if (editingId) {
            await updateTrainingSession(editingId, data);
        } else {
            await addTrainingSession(data);
        }
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Lịch tập</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Tạo buổi tập để thành viên vote tham gia
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Tạo buổi tập
                </button>
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : sorted.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <CalendarDays size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có buổi tập nào.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {sorted.map((s) => {
                        const isPast = new Date(s.sessionDate + "T23:59:59") < new Date();
                        return (
                            <div
                                key={s.id}
                                className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4 ${
                                    isPast ? "opacity-60" : ""
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-white">
                                        {s.title}
                                        {isPast && (
                                            <span className="ml-2 text-xs text-gray-500">(đã qua)</span>
                                        )}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={12} />
                                            {new Date(s.sessionDate + "T00:00:00").toLocaleDateString(
                                                "vi-VN"
                                            )}
                                        </span>
                                        {s.startTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {s.startTime.slice(0, 5)}
                                                {s.endTime && `-${s.endTime.slice(0, 5)}`}
                                            </span>
                                        )}
                                        {s.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {s.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-green-400">
                                            <Users size={12} />
                                            {yesCount(s.id)} người đi
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => openEdit(s)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                        title="Sửa"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Xóa buổi tập ngày ${s.sessionDate}?`))
                                                deleteTrainingSession(s.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                        title="Xóa"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
                                {editingId ? "Sửa buổi tập" : "Tạo buổi tập"}
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
                                <label className="block text-sm text-gray-400 mb-1.5">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Ngày tập *</label>
                                <input
                                    type="date"
                                    value={form.sessionDate}
                                    onChange={(e) =>
                                        setForm({ ...form, sessionDate: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        Giờ bắt đầu
                                    </label>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) =>
                                            setForm({ ...form, startTime: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        Giờ kết thúc
                                    </label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) =>
                                            setForm({ ...form, endTime: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Địa điểm</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    placeholder="VD: Sân ABC, Quận 7"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Ghi chú</label>
                                <textarea
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

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
                                    {editingId ? "Lưu" : "Tạo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
