"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EloChart from "@/components/club/EloChart";
import MatchCard from "@/components/club/MatchCard";
import { useClub } from "@/context/ClubContext";
import { getRankStatus } from "@/lib/elo";
import {
    getPlayerMatches,
    getHeadToHead,
    getPartnerStats,
    getRankedPlayers,
    getRecentForm,
} from "@/lib/stats";
import type { PlayerMatchView } from "@/lib/stats";
import { ArrowLeft, TrendingUp, Swords, Users, Handshake, CalendarDays } from "lucide-react";

const STATUS_BADGE = {
    official: null,
    provisional: { label: "Tạm tính (<12 trận)", cls: "bg-amber-100 text-amber-700" },
    inactive: { label: "Nghỉ dài (>3 tháng)", cls: "bg-gray-200 text-gray-500" },
} as const;

function matchDateKey(playedAt: string) {
    const d = new Date(playedAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatGroupDate(dateKey: string) {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatEloDelta(delta: number) {
    const rounded = Math.round(delta * 10) / 10;
    return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)} Elo`;
}

function eloDeltaClass(delta: number) {
    if (delta > 0.05) return "bg-court-100 text-court-700";
    if (delta < -0.05) return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-500";
}

function groupPlayerMatchesByDate(matches: PlayerMatchView[]) {
    const map = new Map<string, PlayerMatchView[]>();
    for (const matchView of matches) {
        const key = matchDateKey(matchView.match.playedAt);
        map.set(key, [...(map.get(key) || []), matchView]);
    }
    return Array.from(map.entries()).map(([dateKey, items]) => {
        const wins = items.filter((item) => item.won).length;
        const eloDelta = items.reduce((sum, item) => sum + item.delta, 0);
        return {
            dateKey,
            items,
            wins,
            losses: items.length - wins,
            eloDelta,
        };
    });
}

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { players, matches, isLoading } = useClub();

    const player = players.find((p) => p.id === id);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh] text-center text-gray-400">
                    Đang tải...
                </main>
                <Footer />
            </>
        );
    }

    if (!player) {
        return (
            <>
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh] text-center">
                    <p className="text-gray-500 mb-4">Không tìm thấy người chơi này.</p>
                    <Link href="/rankings" className="btn-outline">
                        Về bảng xếp hạng
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    const ranked = getRankedPlayers(players, matches);
    const rank = ranked.find((r) => r.player.id === id)?.rank;
    const status = getRankStatus(player);
    const badge = STATUS_BADGE[status];
    const winRate =
        player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;
    const playerMatches = getPlayerMatches(id, matches);
    const recentPlayerMatches = playerMatches.slice(0, 20);
    const matchGroups = groupPlayerMatchesByDate(recentPlayerMatches);
    const h2h = getHeadToHead(id, matches);
    const { best: bestPartner, all: partnerStats } = getPartnerStats(id, matches);
    const form = getRecentForm(id, matches);

    const name = (pid: string) => players.find((p) => p.id === pid)?.name || "(đã xóa)";

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <Link
                    href="/rankings"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-court-600 mb-6"
                >
                    <ArrowLeft size={16} />
                    Bảng xếp hạng
                </Link>

                {/* Header */}
                <div className="bg-gradient-dark rounded-3xl p-6 sm:p-8 text-white mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 bg-gradient-court rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold flex items-center flex-wrap gap-2">
                                {player.name}
                                {player.nickname && (
                                    <span className="text-gray-400 text-base font-normal">
                                        ({player.nickname})
                                    </span>
                                )}
                                {badge && (
                                    <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.cls}`}
                                    >
                                        {badge.label}
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Tier {player.tier} · Elo khởi điểm {player.initialElo}
                                {rank && ` · Hạng #${rank}`}
                            </p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-4xl font-bold font-mono text-court-400">
                                {Math.round(player.currentElo)}
                            </p>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Elo hiện tại</p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-2xl font-bold text-navy-900">{player.matchesPlayed}</p>
                        <p className="text-xs text-gray-500 mt-1">Trận đã chơi</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-2xl font-bold text-court-600">{player.wins}</p>
                        <p className="text-xs text-gray-500 mt-1">Thắng</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{player.losses}</p>
                        <p className="text-xs text-gray-500 mt-1">Thua</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-2xl font-bold text-navy-900">
                            {player.matchesPlayed > 0 ? `${winRate}%` : "—"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Tỷ lệ thắng</p>
                    </div>
                </div>

                {/* Phong độ */}
                {form.length > 0 && (
                    <div className="flex items-center gap-2 mb-8">
                        <span className="text-sm text-gray-500">Phong độ gần đây:</span>
                        <div className="flex gap-1">
                            {form.map((r, i) => (
                                <span
                                    key={i}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                                        r === "W"
                                            ? "bg-court-100 text-court-700"
                                            : "bg-red-100 text-red-600"
                                    }`}
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Biểu đồ Elo */}
                <section className="bg-white rounded-3xl shadow-card p-6 mb-8 animate-slide-up">
                    <h2 className="font-bold text-navy-900 flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-court-600" />
                        Elo theo thời gian
                    </h2>
                    <EloChart playerId={id} />
                </section>

                {/* Partner ăn ý + Head to head */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <section className="bg-white rounded-3xl shadow-card p-6">
                        <h2 className="font-bold text-navy-900 flex items-center gap-2 mb-4">
                            <Handshake size={18} className="text-court-600" />
                            Đồng đội
                        </h2>
                        {partnerStats.length === 0 ? (
                            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
                        ) : (
                            <div className="space-y-2">
                                {bestPartner && (
                                    <div className="px-3 py-2 bg-ball-50 border border-ball-200 rounded-xl text-sm mb-3">
                                        🤝 Ăn ý nhất:{" "}
                                        <Link
                                            href={`/players/${bestPartner.partnerId}`}
                                            className="font-semibold hover:text-court-600"
                                        >
                                            {name(bestPartner.partnerId)}
                                        </Link>{" "}
                                        — thắng {Math.round(bestPartner.winRate * 100)}% (
                                        {bestPartner.wins}/{bestPartner.matches} trận)
                                    </div>
                                )}
                                {partnerStats.slice(0, 6).map((s) => (
                                    <div
                                        key={s.partnerId}
                                        className="flex items-center justify-between text-sm py-1.5 border-b border-navy-100 last:border-0"
                                    >
                                        <Link
                                            href={`/players/${s.partnerId}`}
                                            className="text-navy-900 hover:text-court-600"
                                        >
                                            {name(s.partnerId)}
                                        </Link>
                                        <span className="text-gray-500 font-mono text-xs">
                                            {s.wins}W - {s.losses}L (
                                            {Math.round(s.winRate * 100)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-3xl shadow-card p-6">
                        <h2 className="font-bold text-navy-900 flex items-center gap-2 mb-4">
                            <Users size={18} className="text-court-600" />
                            Đối đầu
                        </h2>
                        {h2h.length === 0 ? (
                            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
                        ) : (
                            <div className="space-y-2">
                                {h2h.slice(0, 8).map((h) => (
                                    <div
                                        key={h.opponentId}
                                        className="flex items-center justify-between text-sm py-1.5 border-b border-navy-100 last:border-0"
                                    >
                                        <Link
                                            href={`/players/${h.opponentId}`}
                                            className="text-navy-900 hover:text-court-600"
                                        >
                                            {name(h.opponentId)}
                                        </Link>
                                        <span className="font-mono text-xs">
                                            <span className="text-court-600 font-semibold">
                                                {h.wins}W
                                            </span>
                                            <span className="text-gray-400"> - </span>
                                            <span className="text-red-500 font-semibold">
                                                {h.losses}L
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Lịch sử trận */}
                <section>
                    <h2 className="font-bold text-navy-900 flex items-center gap-2 mb-4">
                        <Swords size={18} className="text-court-600" />
                        Lịch sử trận đấu ({playerMatches.length})
                    </h2>
                    {playerMatches.length === 0 ? (
                        <p className="text-gray-400 text-sm">Chưa đánh trận nào</p>
                    ) : (
                        <div className="space-y-6">
                            {matchGroups.map(({ dateKey, items, wins, losses, eloDelta }) => (
                                <section key={dateKey} className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-200 bg-navy-50/80 px-4 py-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <CalendarDays size={18} className="text-court-600 shrink-0" />
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-navy-900 truncate">
                                                    {formatGroupDate(dateKey)}
                                                </h3>
                                                <p className="text-xs text-gray-400">
                                                    {items.length} trận trong ngày
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                                            <span className="rounded-full bg-court-100 px-2.5 py-1 font-semibold text-court-700">
                                                {wins}W
                                            </span>
                                            <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-600">
                                                {losses}L
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 font-semibold ${eloDeltaClass(eloDelta)}`}
                                                title="Elo thay đổi trong ngày"
                                            >
                                                {formatEloDelta(eloDelta)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map((v) => (
                                            <MatchCard key={v.match.id} match={v.match} hideDate />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
