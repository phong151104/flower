"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import type { Match, Player } from "@/types/club";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

interface MonthlyRow {
    player: Player;
    delta: number;
    matches: number;
    wins: number;
    losses: number;
}

function monthKey(playedAt: string) {
    const d = new Date(playedAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function monthLabel(month: string) {
    return `Tháng ${Number(month.slice(5))}/${month.slice(0, 4)}`;
}

function formatDelta(delta: number) {
    const rounded = Math.round(delta * 10) / 10;
    return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}`;
}

function deltaClass(delta: number) {
    if (delta > 0.05) return "text-court-700";
    if (delta < -0.05) return "text-red-600";
    return "text-gray-500";
}

function monthlyRows(players: Player[], matches: Match[], month: string): MonthlyRow[] {
    const activePlayers = players.filter((p) => p.isActive);
    const byId = new Map(
        activePlayers.map((player) => [
            player.id,
            {
                player,
                delta: 0,
                matches: 0,
                wins: 0,
                losses: 0,
            },
        ])
    );

    for (const match of matches) {
        if (monthKey(match.playedAt) !== month) continue;

        for (const change of match.eloChanges) {
            const row = byId.get(change.playerId);
            if (row) row.delta += change.delta;
        }

        const teamA = [match.teamAPlayer1, match.teamAPlayer2];
        const teamB = [match.teamBPlayer1, match.teamBPlayer2];
        for (const playerId of [...teamA, ...teamB]) {
            const row = byId.get(playerId);
            if (!row) continue;
            const won = teamA.includes(playerId)
                ? match.winner === "A"
                : match.winner === "B";
            row.matches += 1;
            if (won) row.wins += 1;
            else row.losses += 1;
        }
    }

    return Array.from(byId.values()).sort((a, b) => {
        if (Math.abs(b.delta - a.delta) > 0.05) return b.delta - a.delta;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.matches !== a.matches) return b.matches - a.matches;
        return b.player.currentElo - a.player.currentElo;
    });
}

export default function MonthlyRankingTable() {
    const { players, matches, isLoading } = useClub();
    const availableMonths = useMemo(() => {
        return Array.from(new Set(matches.map((match) => monthKey(match.playedAt)))).sort((a, b) =>
            b.localeCompare(a)
        );
    }, [matches]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const month = availableMonths.includes(selectedMonth)
        ? selectedMonth
        : availableMonths[0] || "";
    const rows = useMemo(
        () => (month ? monthlyRows(players, matches, month) : []),
        [players, matches, month]
    );
    const topRows = rows.slice(0, 6);
    const penaltyRows = rows.slice(6, 12);

    if (isLoading) {
        return <div className="py-12 text-center text-gray-400 text-sm">Đang tải bảng tháng...</div>;
    }

    if (availableMonths.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400 text-sm">
                Chưa có trận nào để xếp hạng theo tháng.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-court-600" />
                    <span className="text-sm font-medium text-navy-900">Bảng theo tháng</span>
                </div>
                <select
                    value={month}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 bg-navy-50 border border-navy-200 rounded-xl text-sm font-medium focus:outline-none focus:border-court-500"
                >
                    {availableMonths.map((m) => (
                        <option key={m} value={m}>
                            {monthLabel(m)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-court-50 border border-court-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-court-800 flex items-center gap-2">
                        <TrendingUp size={17} />
                        Nhóm thưởng
                    </span>
                    <span className="text-xs text-court-700">Hạng 1-6</span>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <TrendingDown size={17} />
                        Nhóm phạt
                    </span>
                    <span className="text-xs text-red-600">Hạng 7-12</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="border-b border-navy-200 text-gray-500 text-left">
                                <th className="px-4 py-3 font-medium w-14">#</th>
                                <th className="px-4 py-3 font-medium">Người chơi</th>
                                <th className="px-4 py-3 font-medium text-right">Elo tháng</th>
                                <th className="px-4 py-3 font-medium text-right">Trận</th>
                                <th className="px-4 py-3 font-medium text-right">W/L</th>
                                <th className="px-4 py-3 font-medium text-right">Elo hiện tại</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, 12).map((row, index) => {
                                const rank = index + 1;
                                const rewarded = rank <= 6;
                                return (
                                    <tr
                                        key={row.player.id}
                                        className={`border-b border-navy-100 last:border-0 border-l-4 transition-colors ${
                                            rewarded
                                                ? "border-l-court-500 bg-court-50/35 hover:bg-court-50"
                                                : "border-l-red-400 bg-red-50/30 hover:bg-red-50"
                                        }`}
                                    >
                                        <td className="px-4 py-3 font-mono text-gray-400">{rank}</td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/players/${row.player.id}`}
                                                className="font-medium text-navy-900 hover:text-court-600 transition-colors"
                                            >
                                                {row.player.name}
                                            </Link>
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-mono font-semibold ${deltaClass(row.delta)}`}
                                        >
                                            {formatDelta(row.delta)}
                                        </td>
                                        <td className="px-4 py-3 text-right">{row.matches}</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            <span className="text-court-600">{row.wins}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-red-500">{row.losses}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold text-court-700">
                                            {Math.round(row.player.currentElo)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {topRows.length > 0 && penaltyRows.length > 0 && (
                <p className="text-xs text-gray-400">
                    Xếp theo tổng Elo tăng/giảm trong {monthLabel(month)}. Hạng 1-6 là nhóm thưởng,
                    hạng 7-12 là nhóm phạt.
                </p>
            )}
        </div>
    );
}
