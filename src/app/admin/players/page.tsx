"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import { TIER_ELO } from "@/lib/elo";
import type { Player, Tier } from "@/types/club";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";

const TIER_LABELS: Record<Tier, string> = {
    1: "Tier 1 — Cao nhất (1300)",
    2: "Tier 2 — Khá (1200)",
    3: "Tier 3 — Trung bình (1100)",
    4: "Tier 4 — Mới/Thấp (1000)",
};

interface FormState {
    name: string;
    nickname: string;
    tier: Tier;
}

const emptyForm: FormState = { name: "", nickname: "", tier: 4 };

export default function AdminPlayersPage() {
    const { players, matches, addPlayer, updatePlayer, deletePlayer, isLoading } = useClub();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [error, setError] = useState("");

    const sorted = [...players].sort((a, b) => b.currentElo - a.currentElo);

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (p: Player) => {
        setForm({ name: p.name, nickname: p.nickname || "", tier: p.tier });
        setEditingId(p.id);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("Vui lòng nhập tên");
            return;
        }
        if (editingId) {
            const existing = players.find((p) => p.id === editingId);
            const updates: Partial<Player> = {
                name: form.name.trim(),
                nickname: form.nickname.trim() || undefined,
                tier: form.tier,
            };
            // Đổi tier khi CHƯA đánh trận nào → reset Elo khởi điểm theo tier mới
            if (existing && existing.matchesPlayed === 0 && existing.tier !== form.tier) {
                updates.initialElo = TIER_ELO[form.tier];
                updates.currentElo = TIER_ELO[form.tier];
            }
            await updatePlayer(editingId, updates);
        } else {
            await addPlayer({
                name: form.name.trim(),
                nickname: form.nickname.trim() || undefined,
                tier: form.tier,
                initialElo: TIER_ELO[form.tier],
                currentElo: TIER_ELO[form.tier],
                matchesPlayed: 0,
                tournamentsPlayed: 0,
                wins: 0,
                losses: 0,
                isActive: true,
            });
        }
        setShowForm(false);
    };

    const handleDelete = async (p: Player) => {
        const hasMatches = matches.some(
            (m) =>
                [m.teamAPlayer1, m.teamAPlayer2, m.teamBPlayer1, m.teamBPlayer2].includes(p.id)
        );
        const msg = hasMatches
            ? `${p.name} đã có lịch sử trận đấu. Xóa sẽ làm các trận liên quan bị bỏ qua khi tính lại Elo. Vẫn xóa?`
            : `Xóa thành viên ${p.name}?`;
        if (confirm(msg)) {
            await deletePlayer(p.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Thành viên</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {players.length} thành viên — Elo khởi điểm theo tier
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Thêm thành viên
                </button>
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : sorted.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <Users size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có thành viên nào. Hãy thêm người đầu tiên!</p>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Tên</th>
                                    <th className="px-4 py-3 font-medium">Tier</th>
                                    <th className="px-4 py-3 font-medium text-right">Elo</th>
                                    <th className="px-4 py-3 font-medium text-right">Trận</th>
                                    <th className="px-4 py-3 font-medium text-right">Thắng/Thua</th>
                                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((p) => (
                                    <tr key={p.id} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-white">{p.name}</span>
                                            {p.nickname && (
                                                <span className="text-gray-500 ml-2">({p.nickname})</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-gray-800 rounded-md text-xs">
                                                Tier {p.tier}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-green-400">
                                            {Math.round(p.currentElo)}
                                        </td>
                                        <td className="px-4 py-3 text-right">{p.matchesPlayed}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-green-400">{p.wins}</span>
                                            {" / "}
                                            <span className="text-red-400">{p.losses}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal form */}
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
                                {editingId ? "Sửa thành viên" : "Thêm thành viên"}
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
                                <label className="block text-sm text-gray-400 mb-1.5">Tên *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Nguyễn Văn Nam"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Biệt danh</label>
                                <input
                                    type="text"
                                    value={form.nickname}
                                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                                    placeholder="VD: Nam còi"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Tier (Elo khởi điểm)
                                </label>
                                <select
                                    value={form.tier}
                                    onChange={(e) =>
                                        setForm({ ...form, tier: Number(e.target.value) as Tier })
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                >
                                    {([1, 2, 3, 4] as Tier[]).map((t) => (
                                        <option key={t} value={t}>
                                            {TIER_LABELS[t]}
                                        </option>
                                    ))}
                                </select>
                                {editingId && (
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Đổi tier chỉ reset Elo nếu thành viên chưa đánh trận nào.
                                    </p>
                                )}
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    {editingId ? "Lưu" : "Thêm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
