"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchForm from "@/components/club/MatchForm";
import { useClub } from "@/context/ClubContext";
import {
    generateLineup,
    swapPlayers,
    teamAvgElo,
    type Lineup,
    type LineupMode,
} from "@/lib/lineup";
import {
    Sparkles,
    Users,
    RefreshCw,
    Swords,
    Minus,
    Plus,
    Shuffle,
    Scale,
    Check,
} from "lucide-react";

function LineupInner() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session") || "";

    const { players, trainingSessions, trainingVotes } = useClub();

    const activePlayers = useMemo(
        () => [...players].filter((p) => p.isActive).sort((a, b) => b.currentElo - a.currentElo),
        [players]
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [courts, setCourts] = useState(1);
    const [mode, setMode] = useState<LineupMode>("balanced");
    const [lineup, setLineup] = useState<Lineup | null>(null);
    const [swapSel, setSwapSel] = useState("");
    const [matchPlayers, setMatchPlayers] = useState<{
        teamA: [string, string];
        teamB: [string, string];
    } | null>(null);

    // Tự chọn sẵn người đã vote "đi tập" nếu mở từ một buổi tập
    const seededRef = useRef(false);
    useEffect(() => {
        if (seededRef.current || !sessionId) return;
        const yes = trainingVotes
            .filter((v) => v.sessionId === sessionId && v.status === "yes")
            .map((v) => v.playerId);
        if (yes.length > 0) {
            setSelected(new Set(yes));
            seededRef.current = true;
        }
    }, [sessionId, trainingVotes]);

    const session = trainingSessions.find((s) => s.id === sessionId);
    const playerName = (id: string) => players.find((p) => p.id === id)?.name || "?";
    const playerElo = (id: string) => Math.round(players.find((p) => p.id === id)?.currentElo ?? 0);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setLineup(null);
        setSwapSel("");
    };

    const selectYesVoters = () => {
        const yes = trainingVotes
            .filter((v) => v.sessionId === sessionId && v.status === "yes")
            .map((v) => v.playerId);
        setSelected(new Set(yes));
        setLineup(null);
    };

    const generate = (m: LineupMode = mode) => {
        const ids = activePlayers.filter((p) => selected.has(p.id)).map((p) => p.id);
        if (ids.length < 4) return;
        setLineup(generateLineup(ids, players, courts, m));
        setSwapSel("");
    };

    const onPlayerTap = (id: string) => {
        if (!lineup) return;
        if (!swapSel) {
            setSwapSel(id);
            return;
        }
        if (swapSel === id) {
            setSwapSel("");
            return;
        }
        const { teams, sittingOut } = swapPlayers(lineup.teams, lineup.sittingOut, swapSel, id);
        setLineup({ ...lineup, teams, sittingOut });
        setSwapSel("");
    };

    const teamIndex = (teamId: string) => lineup?.teams.findIndex((t) => t.id === teamId) ?? -1;
    const teamLabel = (teamId: string) => `Đội ${teamIndex(teamId) + 1}`;
    const teamPlayers = (teamId: string) => lineup?.teams.find((t) => t.id === teamId)?.players ?? [];

    const selectedCount = selected.size;

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-6 animate-fade-in">
                    <h1 className="section-heading flex items-center gap-2">
                        <Sparkles size={28} className="text-ball-500" />
                        Xếp đội &amp; lịch đấu
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Chọn người tham gia → tự ghép đôi cân bằng theo Elo và lên lịch đấu. Đội hình
                        là gợi ý, bạn có thể đổi cặp tùy ý.
                        {session && (
                            <>
                                {" "}
                                Buổi:{" "}
                                <span className="text-court-600 font-medium">{session.title}</span>
                            </>
                        )}
                    </p>
                </div>

                {/* Chọn người tham gia */}
                <section className="bg-white rounded-2xl shadow-card p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-navy-900 flex items-center gap-2">
                            <Users size={18} className="text-court-600" />
                            Người tham gia
                            <span className="text-sm font-normal text-gray-400">
                                ({selectedCount})
                            </span>
                        </h2>
                        <div className="flex gap-2 text-sm">
                            {sessionId && (
                                <button
                                    onClick={selectYesVoters}
                                    className="text-court-600 hover:text-court-700 font-medium"
                                >
                                    Chọn người đi tập
                                </button>
                            )}
                            {selectedCount > 0 && (
                                <button
                                    onClick={() => {
                                        setSelected(new Set());
                                        setLineup(null);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    Bỏ hết
                                </button>
                            )}
                        </div>
                    </div>
                    {activePlayers.length === 0 ? (
                        <p className="text-gray-400 text-sm">Chưa có thành viên nào.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {activePlayers.map((p) => {
                                const on = selected.has(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => toggle(p.id)}
                                        className={`flex items-center justify-between gap-1 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                            on
                                                ? "bg-court-600 text-white"
                                                : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                        }`}
                                    >
                                        <span className="truncate">{p.name}</span>
                                        <span
                                            className={`text-xs font-mono ${
                                                on ? "text-court-100" : "text-gray-400"
                                            }`}
                                        >
                                            {Math.round(p.currentElo)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Cấu hình + tạo */}
                <section className="bg-white rounded-2xl shadow-card p-5 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Số sân</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCourts((c) => Math.max(1, c - 1))}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-50 text-gray-600 hover:bg-navy-100"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold text-navy-900">
                                    {courts}
                                </span>
                                <button
                                    onClick={() => setCourts((c) => Math.min(6, c + 1))}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-50 text-gray-600 hover:bg-navy-100"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs text-gray-500 mb-1.5">Cách ghép</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setMode("balanced");
                                        if (lineup) generate("balanced");
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        mode === "balanced"
                                            ? "bg-court-600 text-white"
                                            : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                    }`}
                                >
                                    <Scale size={15} />
                                    Cân bằng Elo
                                </button>
                                <button
                                    onClick={() => {
                                        setMode("random");
                                        if (lineup) generate("random");
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        mode === "random"
                                            ? "bg-ball-500 text-navy-900"
                                            : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                    }`}
                                >
                                    <Shuffle size={15} />
                                    Ngẫu nhiên
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => generate()}
                        disabled={selectedCount < 4}
                        className="btn-primary w-full mt-4 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={18} />
                        {lineup ? "Tạo lại đội & lịch" : "Tạo đội & lịch đấu"}
                    </button>
                    {selectedCount < 4 && (
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Cần chọn ít nhất 4 người để ghép đôi.
                        </p>
                    )}
                </section>

                {lineup && (
                    <>
                        {/* Đội hình */}
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-display text-xl font-bold text-navy-900">
                                    Đội hình
                                </h2>
                                <button
                                    onClick={() => generate()}
                                    className="flex items-center gap-1.5 text-sm text-court-600 hover:text-court-700 font-medium"
                                >
                                    <RefreshCw size={15} />
                                    Tạo lại
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">
                                💡 Bấm vào tên 2 người để đổi chỗ cho nhau.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {lineup.teams.map((t, i) => (
                                    <div
                                        key={t.id}
                                        className="bg-white rounded-2xl shadow-card p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-navy-900">
                                                Đội {i + 1}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                TB {Math.round(teamAvgElo(t, players))} Elo
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {t.players.map((pid) => (
                                                <button
                                                    key={pid}
                                                    onClick={() => onPlayerTap(pid)}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                                                        swapSel === pid
                                                            ? "bg-ball-100 ring-2 ring-ball-400 text-navy-900"
                                                            : "bg-navy-50 text-navy-900 hover:bg-navy-100"
                                                    }`}
                                                >
                                                    <span className="truncate">
                                                        {playerName(pid)}
                                                    </span>
                                                    <span className="text-xs font-mono text-gray-400">
                                                        {playerElo(pid)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {lineup.sittingOut.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-400">Dự bị:</span>
                                    {lineup.sittingOut.map((pid) => (
                                        <button
                                            key={pid}
                                            onClick={() => onPlayerTap(pid)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                                swapSel === pid
                                                    ? "bg-ball-100 ring-2 ring-ball-400 text-navy-900"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {playerName(pid)}{" "}
                                            <span className="text-xs text-gray-400">
                                                {playerElo(pid)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Lịch đấu */}
                        <section>
                            <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2 mb-4">
                                <Swords size={20} className="text-court-600" />
                                Lịch đấu
                                <span className="text-sm font-normal text-gray-400">
                                    ({lineup.rounds.reduce((s, r) => s + r.matches.length, 0)} trận)
                                </span>
                            </h2>
                            <div className="space-y-5">
                                {lineup.rounds.map((rd) => (
                                    <div key={rd.round}>
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                            Vòng {rd.round}
                                        </p>
                                        <div className="space-y-2">
                                            {rd.matches.map((m, idx) => {
                                                const aP = teamPlayers(m.teamA);
                                                const bP = teamPlayers(m.teamB);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-white rounded-2xl shadow-card p-3.5 flex items-center gap-3"
                                                    >
                                                        {courts > 1 && (
                                                            <span className="shrink-0 text-[11px] font-semibold bg-court-50 text-court-700 px-2 py-1 rounded-lg">
                                                                Sân {m.court}
                                                            </span>
                                                        )}
                                                        <div className="flex-1 min-w-0 text-sm">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-medium text-navy-900 truncate">
                                                                    {teamLabel(m.teamA)}:{" "}
                                                                    <span className="text-gray-500 font-normal">
                                                                        {playerName(aP[0])} &amp;{" "}
                                                                        {playerName(aP[1])}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-gray-300 my-0.5 text-center">
                                                                vs
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-medium text-navy-900 truncate">
                                                                    {teamLabel(m.teamB)}:{" "}
                                                                    <span className="text-gray-500 font-normal">
                                                                        {playerName(bP[0])} &amp;{" "}
                                                                        {playerName(bP[1])}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                setMatchPlayers({
                                                                    teamA: [aP[0], aP[1]],
                                                                    teamB: [bP[0], bP[1]],
                                                                })
                                                            }
                                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-court-600 hover:bg-court-700 text-white rounded-xl text-xs font-medium transition-colors"
                                                        >
                                                            <Check size={14} />
                                                            Ghi kết quả
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
            <Footer />

            {matchPlayers && (
                <MatchForm
                    fixedPlayers={matchPlayers}
                    onClose={() => setMatchPlayers(null)}
                />
            )}
        </>
    );
}

export default function LineupPage() {
    return (
        <Suspense fallback={null}>
            <LineupInner />
        </Suspense>
    );
}
