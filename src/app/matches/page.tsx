"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchCard from "@/components/club/MatchCard";
import MatchForm from "@/components/club/MatchForm";
import PlayerSelect from "@/components/club/PlayerSelect";
import { useClub } from "@/context/ClubContext";
import { getMatchPlayerIds } from "@/lib/match";
import type { Match } from "@/types/club";
import { CalendarDays, Plus, Swords } from "lucide-react";

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

function groupMatchesByDate(matches: Match[]) {
    const map = new Map<string, Match[]>();
    for (const match of matches) {
        const key = matchDateKey(match.playedAt);
        map.set(key, [...(map.get(key) || []), match]);
    }
    return Array.from(map.entries()).map(([dateKey, items]) => ({ dateKey, items }));
}

export default function MatchesPage() {
    const { matches, isLoading } = useClub();
    const [showForm, setShowForm] = useState(false);
    const [filterPlayer, setFilterPlayer] = useState("");
    const [filterType, setFilterType] = useState<"all" | "training" | "tournament">("all");

    const filtered = useMemo(() => matches.filter((m) => {
        if (filterType !== "all" && m.matchType !== filterType) return false;
        if (filterPlayer && !getMatchPlayerIds(m).includes(filterPlayer))
            return false;
        return true;
    }), [matches, filterPlayer, filterType]);

    const grouped = useMemo(() => groupMatchesByDate(filtered), [filtered]);

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="section-heading">Trận đấu</h1>
                        <p className="text-gray-500 mt-2">
                            {matches.length} trận đã ghi — Elo cập nhật ngay sau mỗi trận
                        </p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
                        <Plus size={18} />
                        Ghi trận mới
                    </button>
                </div>

                {/* Bộ lọc */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex gap-2">
                        {(
                            [
                                ["all", "Tất cả"],
                                ["training", "Trận tập"],
                                ["tournament", "Trận giải"],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setFilterType(value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    filterType === value
                                        ? "bg-court-600 text-white"
                                        : "bg-white text-gray-600 hover:bg-court-50"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="sm:w-64">
                        <PlayerSelect
                            value={filterPlayer}
                            onChange={setFilterPlayer}
                            placeholder="Lọc theo người chơi"
                        />
                    </div>
                </div>

                {/* Danh sách trận */}
                {isLoading ? (
                    <div className="py-12 text-center text-gray-400">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <Swords size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                            {matches.length === 0
                                ? "Chưa có trận nào. Hãy ghi trận đầu tiên!"
                                : "Không có trận nào khớp bộ lọc."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-7 animate-slide-up">
                        {grouped.map(({ dateKey, items }) => {
                            const trainingCount = items.filter((m) => m.matchType === "training").length;
                            const tournamentCount = items.length - trainingCount;
                            return (
                                <section key={dateKey} className="space-y-3">
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-200 bg-navy-50/80 px-4 py-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <CalendarDays size={18} className="text-court-600 shrink-0" />
                                            <div className="min-w-0">
                                                <h2 className="font-semibold text-navy-900 truncate">
                                                    {formatGroupDate(dateKey)}
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                    {items.length} trận trong buổi
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                                            {trainingCount > 0 && (
                                                <span className="rounded-full bg-white px-2.5 py-1">
                                                    {trainingCount} tập
                                                </span>
                                            )}
                                            {tournamentCount > 0 && (
                                                <span className="rounded-full bg-ball-50 px-2.5 py-1 text-ball-700">
                                                    {tournamentCount} giải
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map((m) => (
                                            <MatchCard key={m.id} match={m} hideDate />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />

            {showForm && <MatchForm onClose={() => setShowForm(false)} />}
        </>
    );
}
