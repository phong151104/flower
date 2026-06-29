"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import { getRankedPlayers, getRecentForm } from "@/lib/stats";
import type { RankStatus } from "@/types/club";
import { Medal } from "lucide-react";

const STATUS_LABEL: Record<RankStatus, { label: string; cls: string } | null> = {
    official: null,
    inactive: { label: "Nghỉ dài", cls: "bg-gray-200 text-gray-500" },
};

const RANK_COLORS = ["text-ball-500", "text-gray-400", "text-amber-600"];
const TIER_SIZE = 4;
const TIER_STYLES = [
    {
        band: "bg-court-50 text-court-800 border-court-100",
        rowBg: "bg-court-50/35 hover:bg-court-50",
        row: "border-l-court-500",
        dot: "bg-court-500",
    },
    {
        band: "bg-ball-50 text-ball-700 border-ball-100",
        rowBg: "bg-ball-50/35 hover:bg-ball-50",
        row: "border-l-ball-500",
        dot: "bg-ball-500",
    },
    {
        band: "bg-navy-50 text-navy-700 border-navy-100",
        rowBg: "bg-navy-50/80 hover:bg-navy-100/80",
        row: "border-l-navy-400",
        dot: "bg-navy-400",
    },
    {
        band: "bg-red-50 text-red-700 border-red-100",
        rowBg: "bg-red-50/30 hover:bg-red-50",
        row: "border-l-red-400",
        dot: "bg-red-400",
    },
];

function rankTier(rank: number) {
    return Math.floor((rank - 1) / TIER_SIZE) + 1;
}

function tierStyle(tier: number) {
    return TIER_STYLES[(tier - 1) % TIER_STYLES.length];
}

function tierRange(tier: number, totalRows: number) {
    const start = (tier - 1) * TIER_SIZE + 1;
    const end = Math.min(tier * TIER_SIZE, totalRows);
    return `Hạng ${start}-${end}`;
}

function formatEloDelta(delta: number) {
    const rounded = Math.round(delta);
    return rounded > 0 ? `+${rounded}` : String(rounded);
}

function deltaClass(delta: number) {
    if (delta > 0.5) return "text-court-600";
    if (delta < -0.5) return "text-red-500";
    return "text-gray-400";
}

export default function RankingTable({ limit }: { limit?: number }) {
    const { players, matches, isLoading } = useClub();

    if (isLoading) {
        return <div className="py-12 text-center text-gray-400 text-sm">Đang tải bảng xếp hạng...</div>;
    }

    const ranked = getRankedPlayers(players, matches);
    const rows = limit ? ranked.slice(0, limit) : ranked;
    const showTierBands = !limit;

    if (rows.length === 0) {
        return (
            <div className="py-12 text-center text-gray-400">
                Chưa có thành viên nào. Admin hãy thêm thành viên trong trang quản lý.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-navy-200 text-gray-500 text-left">
                            <th className="px-4 py-3 font-medium w-14">#</th>
                            <th className="px-4 py-3 font-medium">Người chơi</th>
                            <th className="px-4 py-3 font-medium text-right">Elo</th>
                            <th className="px-4 py-3 font-medium text-right">Tăng/giảm</th>
                            <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Trận</th>
                            <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">W/L</th>
                            <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Tỷ lệ thắng</th>
                            <th className="px-4 py-3 font-medium hidden lg:table-cell">Phong độ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ player: p, rank, status }) => {
                            const winRate =
                                p.matchesPlayed > 0
                                    ? Math.round((p.wins / p.matchesPlayed) * 100)
                                    : 0;
                            const form = getRecentForm(p.id, matches);
                            const badge = STATUS_LABEL[status];
                            const eloDelta = p.currentElo - p.initialElo;
                            const tier = rankTier(rank);
                            const style = tierStyle(tier);
                            const showTierHeader = showTierBands && (rank - 1) % TIER_SIZE === 0;
                            return (
                                <Fragment key={p.id}>
                                    {showTierHeader && (
                                        <tr className={`border-y ${style.band}`}>
                                            <td colSpan={8} className="px-4 py-2">
                                                <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${style.dot}`}
                                                    />
                                                    <span>Tier {tier}</span>
                                                    <span className="text-gray-400 font-normal normal-case">
                                                        {tierRange(tier, rows.length)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    <tr
                                        className={`border-b border-navy-100 last:border-0 transition-colors ${
                                            showTierBands
                                                ? `border-l-4 ${style.row} ${style.rowBg}`
                                                : "hover:bg-court-50"
                                        }`}
                                    >
                                    <td className="px-4 py-3">
                                        {rank <= 3 ? (
                                            <Medal size={18} className={RANK_COLORS[rank - 1]} />
                                        ) : (
                                            <span className="text-gray-400 font-mono">{rank}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/players/${p.id}`}
                                            className="font-medium text-navy-900 hover:text-court-600 transition-colors"
                                        >
                                            {p.name}
                                        </Link>
                                        {p.nickname && (
                                            <span className="text-gray-400 ml-1.5 text-xs">
                                                ({p.nickname})
                                            </span>
                                        )}
                                        {badge && (
                                            <span
                                                className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.cls}`}
                                            >
                                                {badge.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-court-700">
                                        {Math.round(p.currentElo)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-mono font-semibold ${deltaClass(eloDelta)}`}
                                        title={`Elo khởi điểm: ${Math.round(p.initialElo)}`}
                                    >
                                        {formatEloDelta(eloDelta)}
                                    </td>
                                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                                        {p.matchesPlayed}
                                    </td>
                                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                                        <span className="text-court-600">{p.wins}</span>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-red-500">{p.losses}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right hidden md:table-cell">
                                        {p.matchesPlayed > 0 ? `${winRate}%` : "—"}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex gap-1">
                                            {form.length === 0 ? (
                                                <span className="text-gray-300">—</span>
                                            ) : (
                                                form.map((r, i) => (
                                                    <span
                                                        key={i}
                                                        className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                                            r === "W"
                                                                ? "bg-court-100 text-court-700"
                                                                : "bg-red-100 text-red-600"
                                                        }`}
                                                    >
                                                        {r}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
