"use client";

import { useState } from "react";
import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import PlayerSelect from "@/components/club/PlayerSelect";
import type { Tournament, TournamentStatus } from "@/types/club";
import { Plus, Trash2, X, Trophy, Users, ExternalLink } from "lucide-react";

const STATUS_LABEL: Record<TournamentStatus, { label: string; cls: string }> = {
    draft: { label: "Nháp", cls: "bg-gray-700 text-gray-300" },
    group: { label: "Vòng bảng", cls: "bg-blue-500/20 text-blue-400" },
    knockout: { label: "Knock-out", cls: "bg-amber-500/20 text-amber-400" },
    completed: { label: "Đã kết thúc", cls: "bg-green-500/20 text-green-400" },
};

const STATUS_FLOW: TournamentStatus[] = ["draft", "group", "knockout", "completed"];

export default function AdminTournamentsPage() {
    const {
        tournaments,
        tournamentTeams,
        players,
        addTournament,
        updateTournament,
        deleteTournament,
        addTournamentTeam,
        deleteTournamentTeam,
        isLoading,
    } = useClub();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [error, setError] = useState("");
    const [managingId, setManagingId] = useState<string | null>(null);

    // Form thêm đội
    const [teamName, setTeamName] = useState("");
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [group, setGroup] = useState<"A" | "B">("A");
    const [teamError, setTeamError] = useState("");

    const managing = tournaments.find((t) => t.id === managingId);
    const managingTeams = tournamentTeams.filter((t) => t.tournamentId === managingId);

    const playerName = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !date) {
            setError("Vui lòng nhập tên giải và ngày");
            return;
        }
        const id = await addTournament({
            name: name.trim(),
            tournamentDate: date,
            status: "draft",
        });
        setShowForm(false);
        setName("");
        setDate("");
        setManagingId(id);
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeamError("");
        if (!managingId) return;
        if (!p1 || !p2 || p1 === p2) {
            setTeamError("Chọn 2 người chơi khác nhau");
            return;
        }
        const usedPlayerIds = managingTeams.flatMap((t) => [t.player1Id, t.player2Id]);
        if (usedPlayerIds.includes(p1) || usedPlayerIds.includes(p2)) {
            setTeamError("Người chơi đã thuộc đội khác trong giải này");
            return;
        }
        const groupCount = managingTeams.filter((t) => t.groupName === group).length;
        if (groupCount >= 3) {
            setTeamError(`Bảng ${group} đã đủ 3 đội`);
            return;
        }
        await addTournamentTeam({
            tournamentId: managingId,
            name:
                teamName.trim() ||
                `${playerName(p1).split(" ").pop()} & ${playerName(p2).split(" ").pop()}`,
            player1Id: p1,
            player2Id: p2,
            groupName: group,
        });
        setTeamName("");
        setP1("");
        setP2("");
    };

    const nextStatus = (t: Tournament): TournamentStatus | null => {
        const idx = STATUS_FLOW.indexOf(t.status);
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Giải đấu</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Format: 6 đội, 2 bảng vòng tròn → bán kết → chung kết + tranh 3-4
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Tạo giải
                </button>
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : tournaments.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <Trophy size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Chưa có giải đấu nào.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {tournaments.map((t) => {
                        const teams = tournamentTeams.filter((x) => x.tournamentId === t.id);
                        const status = STATUS_LABEL[t.status];
                        const next = nextStatus(t);
                        return (
                            <div
                                key={t.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="font-medium text-white flex items-center gap-2">
                                            {t.name}
                                            <span
                                                className={`px-2 py-0.5 rounded text-[11px] ${status.cls}`}
                                            >
                                                {status.label}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(t.tournamentDate + "T00:00:00").toLocaleDateString(
                                                "vi-VN"
                                            )}{" "}
                                            · {teams.length}/6 đội
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => setManagingId(t.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium"
                                        >
                                            <Users size={13} />
                                            Quản lý đội
                                        </button>
                                        <Link
                                            href={`/tournaments/${t.id}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium"
                                        >
                                            <ExternalLink size={13} />
                                            Xem giải
                                        </Link>
                                        {next && (
                                            <button
                                                onClick={() => {
                                                    if (next === "group" && teams.length !== 6) {
                                                        alert("Cần đủ 6 đội trước khi bắt đầu vòng bảng");
                                                        return;
                                                    }
                                                    updateTournament(t.id, { status: next });
                                                }}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium"
                                            >
                                                → {STATUS_LABEL[next].label}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Xóa giải "${t.name}"? Các trận đã ghi vẫn giữ trong lịch sử.`
                                                    )
                                                )
                                                    deleteTournament(t.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal tạo giải */}
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
                            <h2 className="text-lg font-bold">Tạo giải đấu</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Tên giải *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="VD: Giải tháng 7/2026"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Ngày thi đấu *</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
                            >
                                Tạo giải
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal quản lý đội */}
            {managing && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setManagingId(null)}
                >
                    <div
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">
                                Đội thi đấu — {managing.name} ({managingTeams.length}/6)
                            </h2>
                            <button
                                onClick={() => setManagingId(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Danh sách đội theo bảng */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {(["A", "B"] as const).map((g) => (
                                <div key={g} className="bg-gray-800/60 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-400 mb-3">
                                        Bảng {g} (
                                        {managingTeams.filter((t) => t.groupName === g).length}/3)
                                    </p>
                                    <div className="space-y-2">
                                        {managingTeams
                                            .filter((t) => t.groupName === g)
                                            .map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                                                >
                                                    <div className="text-sm">
                                                        <p className="font-medium text-white">{t.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {playerName(t.player1Id)} +{" "}
                                                            {playerName(t.player2Id)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTournamentTeam(t.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-400"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Form thêm đội */}
                        {managingTeams.length < 6 && (
                            <form
                                onSubmit={handleAddTeam}
                                className="border-t border-gray-800 pt-4 space-y-3"
                            >
                                <p className="text-sm font-semibold text-gray-300">Thêm đội</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="admin-player-select">
                                        <PlayerSelect
                                            value={p1}
                                            onChange={setP1}
                                            excludeIds={[
                                                p2,
                                                ...managingTeams.flatMap((t) => [
                                                    t.player1Id,
                                                    t.player2Id,
                                                ]),
                                            ].filter(Boolean)}
                                            placeholder="Người 1"
                                            className="!bg-gray-800 !border-gray-700 !text-white"
                                        />
                                    </div>
                                    <div className="admin-player-select">
                                        <PlayerSelect
                                            value={p2}
                                            onChange={setP2}
                                            excludeIds={[
                                                p1,
                                                ...managingTeams.flatMap((t) => [
                                                    t.player1Id,
                                                    t.player2Id,
                                                ]),
                                            ].filter(Boolean)}
                                            placeholder="Người 2"
                                            className="!bg-gray-800 !border-gray-700 !text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Tên đội (tự sinh nếu trống)"
                                        className="sm:col-span-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    />
                                    <select
                                        value={group}
                                        onChange={(e) => setGroup(e.target.value as "A" | "B")}
                                        className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-500"
                                    >
                                        <option value="A">Bảng A</option>
                                        <option value="B">Bảng B</option>
                                    </select>
                                </div>
                                {teamError && <p className="text-red-400 text-sm">{teamError}</p>}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium"
                                >
                                    <Plus size={14} className="inline mr-1" />
                                    Thêm đội
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
