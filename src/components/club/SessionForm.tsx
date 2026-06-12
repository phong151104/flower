"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import { X, CalendarPlus } from "lucide-react";

export default function SessionForm({ onClose }: { onClose: () => void }) {
    const { addTrainingSession } = useClub();
    const [title, setTitle] = useState("Buổi tập");
    const [sessionDate, setSessionDate] = useState("");
    const [startTime, setStartTime] = useState("19:00");
    const [endTime, setEndTime] = useState("21:00");
    const [location, setLocation] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionDate) {
            setError("Vui lòng chọn ngày tập");
            return;
        }
        setSubmitting(true);
        try {
            await addTrainingSession({
                title: title.trim() || "Buổi tập",
                sessionDate,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                location: location.trim() || undefined,
                note: note.trim() || undefined,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-6 w-full max-w-md my-8 shadow-soft"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                        <CalendarPlus size={20} className="text-court-600" />
                        Tạo buổi tập
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-navy-900">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Tiêu đề</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Ngày tập *</label>
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => {
                                setSessionDate(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1.5">Giờ bắt đầu</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1.5">Giờ kết thúc</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Địa điểm</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="VD: Sân Lê Trọng Tấn"
                            className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Ghi chú</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="VD: Mang thêm bóng mới"
                            className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {submitting ? "Đang tạo..." : "Tạo buổi tập"}
                    </button>
                </form>
            </div>
        </div>
    );
}
