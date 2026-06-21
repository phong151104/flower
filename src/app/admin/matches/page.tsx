"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import { recalculateAll } from "@/lib/elo";
import { findTeamByPlayers } from "@/lib/tournament";
import type { Match, MatchRound, Player } from "@/types/club";
import { Trash2, RefreshCw, Swords, Pencil, X } from "lucide-react";

const ROUND_LABEL: Record<MatchRound, string> = {
    group: "Vòng bảng (×1.00)",
    semi: "Bán kết (×1.25)",
    third: "Tranh 3-4 (×1.10)",
    final: "Chung kết (×1.50)",
    seeding: "Xác định seed (×1.10)",
    ur1: "Nhánh thắng - Play-in (×1.10)",
    ur2: "Nhánh thắng V2 (×1.20)",
    ur3: "CK nhánh thắng (×1.35)",
    lr1: "Nhánh thua V1 (×1.05)",
    lr2: "Nhánh thua V2 (×1.10)",
    lr3: "Nhánh thua V3 (×1.15)",
    lr_final: "CK nhánh thua (×1.30)",
    grand_final: "Chung kết (×1.50)",
};

export default function AdminMatchesPage() {
    const {
        matches,
        players,
        tournaments,
        tournamentTeams,
        deleteMatch,
        updateMatch,
        applyRecalculation,
        isLoading,
    } = useClub();
    const [recalculating, setRecalculating] = useState(false);
    const [recalcDone, setRecalcDone] = useState(false);
    const [editing, setEditing] = useState<Match | null>(null);
    const [editScoreA, setEditScoreA] = useState("");
    const [editScoreB, setEditScoreB] = useState("");
    const [editType, setEditType] = useState<"training" | "tournament">("training");
    const [editTournamentId, setEditTournamentId] = useState("");
    const [editRound, setEditRound] = useState<MatchRound>("group");

    const name = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const runRecalculation = async () => {
        setRecalculating(true);
        setRecalcDone(false);
        try {
            // Replay theo thời gian tăng dần
            const sorted = [...matches].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
            const { finalStates, matchChanges } = recalculateAll(players, sorted);

            const playerUpdates = players.map((p) => {
                const s = finalStates.get(p.id);
                const updates: Partial<Player> = s
                    ? {
                          currentElo: s.elo,
                          matchesPlayed: s.matchesPlayed,
                          tournamentsPlayed: s.tournamentsPlayed,
                          wins: s.wins,
                          losses: s.losses,
                          lastMatchAt: s.lastMatchAt,
                      }
                    : {};
                return { id: p.id, updates };
            });

            await applyRecalculation(playerUpdates, matchChanges);
            setRecalcDone(true);
        } finally {
            setRecalculating(false);
        }
    };

    const handleDelete = async (m: Match) => {
        const desc = `${name(m.teamAPlayer1)}/${name(m.teamAPlayer2)} vs ${name(m.teamBPlayer1)}/${name(m.teamBPlayer2)} (${m.scoreA}-${m.scoreB})`;
        if (confirm(`Xóa trận: ${desc}?\n\nSau khi xóa, hãy bấm "Tính lại toàn bộ Elo" để cập nhật.`)) {
            await deleteMatch(m.id);
            setRecalcDone(false);
        }
    };

    const openEdit = (m: Match) => {
        setEditing(m);
        setEditScoreA(String(m.scoreA));
        setEditScoreB(String(m.scoreB));
        setEditType(m.matchType);
        setEditTournamentId(m.tournamentId || "");
        setEditRound(m.round || "group");
    };

    /** Kiểm tra 2 cặp người chơi của trận có khớp 2 đội trong giải đã chọn không. */
    const checkTeamsInTournament = (m: Match, tournamentId: string) => {
        const teams = tournamentTeams.filter((t) => t.tournamentId === tournamentId);
        const teamA = findTeamByPlayers(teams, m.teamAPlayer1, m.teamAPlayer2);
        const teamB = findTeamByPlayers(teams, m.teamBPlayer1, m.teamBPlayer2);
        return { teamA, teamB, ok: !!teamA && !!teamB };
    };

    const editTeamCheck =
        editing && editType === "tournament" && editTournamentId
            ? checkTeamsInTournament(editing, editTournamentId)
            : null;

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        const sA = parseInt(editScoreA, 10);
        const sB = parseInt(editScoreB, 10);
        if (isNaN(sA) || isNaN(sB) || sA < 0 || sB < 0 || sA === sB) {
            alert("Tỷ số không hợp lệ");
            return;
        }
        if (editType === "tournament" && !editTournamentId) {
            alert("Vui lòng chọn giải đấu");
            return;
        }
        await updateMatch(editing.id, {
            scoreA: sA,
            scoreB: sB,
            winner: sA > sB ? "A" : "B",
            matchType: editType,
            tournamentId: editType === "tournament" ? editTournamentId : undefined,
            round: editType === "tournament" ? editRound : undefined,
        });
        setEditing(null);
        setRecalcDone(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý trận đấu</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Sau khi sửa/xóa trận, bấm &quot;Tính lại toàn bộ Elo&quot; để replay lịch sử
                    </p>
                </div>
                <button
                    onClick={runRecalculation}
                    disabled={recalculating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <RefreshCw size={16} className={recalculating ? "animate-spin" : ""} />
                    {recalculating ? "Đang tính lại..." : "Tính lại toàn bộ Elo"}
                </button>
            </div>

            {recalcDone && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-sm text-green-400">
                    ✓ Đã tính lại Elo toàn bộ từ lịch sử trận. Bảng xếp hạng đã cập nhật.
                </div>
            )}

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : matches.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <Swords size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có trận nào.</p>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Ngày</th>
                                    <th className="px-4 py-3 font-medium">Loại</th>
                                    <th className="px-4 py-3 font-medium">Đội A</th>
                                    <th className="px-4 py-3 font-medium text-center">Tỷ số</th>
                                    <th className="px-4 py-3 font-medium">Đội B</th>
                                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((m) => {
                                    const tour = m.tournamentId
                                        ? tournaments.find((t) => t.id === m.tournamentId)
                                        : undefined;
                                    return (
                                        <tr
                                            key={m.id}
                                            className="border-b border-gray-800/60 hover:bg-gray-800/40"
                                        >
                                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                                {new Date(m.playedAt).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-4 py-3">
                                                {m.matchType === "tournament" ? (
                                                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded text-xs whitespace-nowrap">
                                                        {tour?.name || "Giải"}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                                                        Tập
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${m.winner === "A" ? "text-white font-medium" : "text-gray-500"}`}
                                            >
                                                {name(m.teamAPlayer1)} + {name(m.teamAPlayer2)}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold whitespace-nowrap">
                                                {m.scoreA} : {m.scoreB}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${m.winner === "B" ? "text-white font-medium" : "text-gray-500"}`}
                                            >
                                                {name(m.teamBPlayer1)} + {name(m.teamBPlayer2)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(m)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                                        title="Sửa tỷ số"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
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
                </div>
            )}

            {/* Modal sửa tỷ số */}
            {editing && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setEditing(null)}
                >
                    <div
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">Sửa trận đấu</h2>
                            <button
                                onClick={() => setEditing(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            {name(editing.teamAPlayer1)} + {name(editing.teamAPlayer2)}
                            <span className="mx-2 text-gray-600">vs</span>
                            {name(editing.teamBPlayer1)} + {name(editing.teamBPlayer2)}
                        </p>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    value={editScoreA}
                                    onChange={(e) => setEditScoreA(e.target.value)}
                                    className="w-20 px-3 py-3 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-green-500"
                                />
                                <span className="text-gray-500 font-bold">—</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={editScoreB}
                                    onChange={(e) => setEditScoreB(e.target.value)}
                                    className="w-20 px-3 py-3 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-green-500"
                                />
                            </div>

                            {/* Loại trận */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditType("training")}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        editType === "training"
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Trận tập
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditType("tournament")}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        editType === "tournament"
                                            ? "bg-amber-600 text-white"
                                            : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Trận giải
                                </button>
                            </div>

                            {editType === "tournament" && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">
                                            Giải đấu *
                                        </label>
                                        <select
                                            value={editTournamentId}
                                            onChange={(e) => setEditTournamentId(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                        >
                                            <option value="">Chọn giải</option>
                                            {tournaments.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">
                                            Vòng đấu
                                        </label>
                                        <select
                                            value={editRound}
                                            onChange={(e) =>
                                                setEditRound(e.target.value as MatchRound)
                                            }
                                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                        >
                                            {(
                                                Object.entries(ROUND_LABEL) as [MatchRound, string][]
                                            ).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {editTeamCheck && !editTeamCheck.ok && (
                                        <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                                            ⚠ Cặp người chơi của trận này không khớp với 2 đội nào
                                            trong giải đã chọn — trận sẽ KHÔNG được tính vào bảng
                                            xếp hạng/bracket của giải. Kiểm tra lại danh sách đội.
                                        </p>
                                    )}
                                    {editTeamCheck?.ok && (
                                        <p className="text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                                            ✓ Khớp đội: {editTeamCheck.teamA!.name} vs{" "}
                                            {editTeamCheck.teamB!.name}
                                        </p>
                                    )}
                                </>
                            )}

                            <p className="text-xs text-amber-400/80">
                                ⚠ Sau khi lưu, nhớ bấm &quot;Tính lại toàn bộ Elo&quot; (hệ số vòng
                                M thay đổi theo loại trận).
                            </p>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
                            >
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
