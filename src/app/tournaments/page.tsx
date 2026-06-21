"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClub } from "@/context/ClubContext";
import type { TournamentStatus, TournamentFormat } from "@/types/club";
import { Trophy, ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";

const STATUS_LABEL: Record<TournamentStatus, { label: string; cls: string }> = {
    draft: { label: "Sắp diễn ra", cls: "bg-gray-100 text-gray-500" },
    group: { label: "Vòng bảng", cls: "bg-blue-100 text-blue-700" },
    knockout: { label: "Vòng trong", cls: "bg-amber-100 text-amber-700" },
    completed: { label: "Đã kết thúc", cls: "bg-court-100 text-court-700" },
};

export default function TournamentsPage() {
    const { tournaments, tournamentTeams, addTournament, updateTournament, deleteTournament, isLoading } =
        useClub();
    const router = useRouter();

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [format, setFormat] = useState<TournamentFormat>("double_elim");
    const [error, setError] = useState("");

    const openCreate = () => {
        setEditId(null);
        setName("");
        setDate(new Date().toISOString().slice(0, 10));
        setFormat("double_elim");
        setError("");
        setShowForm(true);
    };

    const openEdit = (id: string) => {
        const t = tournaments.find((x) => x.id === id);
        if (!t) return;
        setEditId(id);
        setName(t.name);
        setDate(t.tournamentDate);
        setFormat(t.format || "group_knockout");
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !date) {
            setError("Nhập tên giải và ngày");
            return;
        }
        if (editId) {
            await updateTournament(editId, { name: name.trim(), tournamentDate: date, format });
            setShowForm(false);
        } else {
            const id = await addTournament({
                name: name.trim(),
                tournamentDate: date,
                status: "draft",
                format,
            });
            setShowForm(false);
            router.push(`/tournaments/${id}`);
        }
    };

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="flex items-start justify-between gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="section-heading">Giải đấu</h1>
                        <p className="text-gray-500 mt-2">
                            6 đội · 2 bảng vòng tròn · vòng trong knock-out / double elimination
                        </p>
                    </div>
                    <button onClick={openCreate} className="btn-primary gap-2 shrink-0">
                        <Plus size={18} />
                        Tạo giải
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-gray-400">Đang tải...</div>
                ) : tournaments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <Trophy size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Chưa có giải đấu nào.</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-slide-up">
                        {tournaments.map((t) => {
                            const teams = tournamentTeams.filter((x) => x.tournamentId === t.id);
                            const status = STATUS_LABEL[t.status];
                            return (
                                <div
                                    key={t.id}
                                    className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between gap-3 card-hover"
                                >
                                    <Link
                                        href={`/tournaments/${t.id}`}
                                        className="flex items-center gap-4 min-w-0 flex-1"
                                    >
                                        <div className="w-12 h-12 bg-gradient-ball rounded-2xl flex items-center justify-center shrink-0">
                                            <Trophy size={22} className="text-navy-900" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-navy-900 flex items-center gap-2 flex-wrap">
                                                {t.name}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.cls}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {new Date(
                                                    t.tournamentDate + "T00:00:00"
                                                ).toLocaleDateString("vi-VN", {
                                                    weekday: "long",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}{" "}
                                                · {teams.length} đội ·{" "}
                                                {(t.format || "group_knockout") === "double_elim"
                                                    ? "Double elim"
                                                    : "Bán kết/CK"}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => openEdit(t.id)}
                                            className="p-2 text-gray-300 hover:text-court-600 hover:bg-court-50 rounded-lg"
                                            aria-label="Sửa"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Xóa giải "${t.name}"? Các trận đã ghi vẫn giữ trong lịch sử.`
                                                    )
                                                )
                                                    deleteTournament(t.id);
                                            }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            aria-label="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <Link
                                            href={`/tournaments/${t.id}`}
                                            className="p-1 text-gray-300"
                                        >
                                            <ChevronRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />

            {showForm && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-soft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                                <Trophy size={20} className="text-ball-500" />
                                {editId ? "Sửa giải" : "Tạo giải"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-navy-900"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Tên giải *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="VD: Giải tháng 7/2026"
                                    className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Ngày thi đấu *</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">Thể thức</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormat("double_elim")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                            format === "double_elim"
                                                ? "bg-court-600 text-white"
                                                : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                        }`}
                                    >
                                        Double elimination
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormat("group_knockout")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                            format === "group_knockout"
                                                ? "bg-court-600 text-white"
                                                : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                        }`}
                                    >
                                        Bán kết / CK
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}
                            <button type="submit" className="btn-primary w-full">
                                {editId ? "Lưu" : "Tạo giải"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
