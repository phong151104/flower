"use client";

import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import { getRankedPlayers } from "@/lib/stats";
import { Users, Swords, CalendarDays, Wallet, Trophy, ArrowRight } from "lucide-react";

function formatVND(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

export default function AdminDashboard() {
    const { players, matches, trainingSessions, tournaments, balance, isLoading } = useClub();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const matchesThisMonth = matches.filter((m) => m.playedAt.startsWith(currentMonth)).length;
    const upcomingSessions = trainingSessions.filter(
        (s) => new Date(s.sessionDate + "T23:59:59") >= new Date()
    ).length;
    const activeTournament = tournaments.find(
        (t) => t.status === "group" || t.status === "knockout"
    );
    const top3 = getRankedPlayers(players, matches).slice(0, 3);

    const name = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const cards = [
        {
            label: "Thành viên",
            value: players.length,
            icon: Users,
            href: "/admin/players",
            color: "text-blue-400 bg-blue-500/15",
        },
        {
            label: "Trận tháng này",
            value: matchesThisMonth,
            icon: Swords,
            href: "/admin/matches",
            color: "text-green-400 bg-green-500/15",
        },
        {
            label: "Buổi tập sắp tới",
            value: upcomingSessions,
            icon: CalendarDays,
            href: "/admin/training",
            color: "text-amber-400 bg-amber-500/15",
        },
        {
            label: "Số dư quỹ",
            value: formatVND(balance),
            icon: Wallet,
            href: "/admin/finance",
            color: "text-purple-400 bg-purple-500/15",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Tổng quan câu lạc bộ</p>
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm py-12 text-center">Đang tải...</div>
            ) : (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {cards.map((c) => {
                            const Icon = c.icon;
                            return (
                                <Link
                                    key={c.label}
                                    href={c.href}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <p className="text-xl font-bold text-white">{c.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Giải đang diễn ra */}
                    {activeTournament && (
                        <Link
                            href={`/tournaments/${activeTournament.id}`}
                            className="block bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 hover:bg-amber-500/15 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Trophy size={22} className="text-amber-400" />
                                    <div>
                                        <p className="font-semibold text-white">
                                            {activeTournament.name} đang diễn ra
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {activeTournament.status === "group"
                                                ? "Vòng bảng"
                                                : "Vòng knock-out"}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-amber-400" />
                            </div>
                        </Link>
                    )}

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Top 3 */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-400" />
                                Top 3 Elo
                            </h2>
                            {top3.length === 0 ? (
                                <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                            ) : (
                                <div className="space-y-2">
                                    {top3.map(({ player: p, rank }) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-2.5"
                                        >
                                            <span className="text-sm text-white">
                                                <span className="text-gray-500 font-mono mr-2">
                                                    #{rank}
                                                </span>
                                                {p.name}
                                            </span>
                                            <span className="font-mono font-semibold text-green-400">
                                                {Math.round(p.currentElo)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Trận gần đây */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Swords size={16} className="text-green-400" />
                                Trận gần đây
                            </h2>
                            {matches.length === 0 ? (
                                <p className="text-gray-500 text-sm">Chưa có trận nào</p>
                            ) : (
                                <div className="space-y-2">
                                    {matches.slice(0, 4).map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-2.5 text-xs"
                                        >
                                            <span
                                                className={
                                                    m.winner === "A"
                                                        ? "text-white"
                                                        : "text-gray-500"
                                                }
                                            >
                                                {name(m.teamAPlayer1)}/{name(m.teamAPlayer2)}
                                            </span>
                                            <span className="font-mono font-bold text-gray-300 mx-2">
                                                {m.scoreA}:{m.scoreB}
                                            </span>
                                            <span
                                                className={
                                                    m.winner === "B"
                                                        ? "text-white"
                                                        : "text-gray-500"
                                                }
                                            >
                                                {name(m.teamBPlayer1)}/{name(m.teamBPlayer2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
