"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchCard from "@/components/club/MatchCard";
import MatchForm from "@/components/club/MatchForm";
import PlayerSelect from "@/components/club/PlayerSelect";
import { useClub } from "@/context/ClubContext";
import { Plus, Swords } from "lucide-react";

export default function MatchesPage() {
    const { matches, isLoading } = useClub();
    const [showForm, setShowForm] = useState(false);
    const [filterPlayer, setFilterPlayer] = useState("");
    const [filterType, setFilterType] = useState<"all" | "training" | "tournament">("all");

    const filtered = matches.filter((m) => {
        if (filterType !== "all" && m.matchType !== filterType) return false;
        if (
            filterPlayer &&
            ![m.teamAPlayer1, m.teamAPlayer2, m.teamBPlayer1, m.teamBPlayer2].includes(filterPlayer)
        )
            return false;
        return true;
    });

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
                    <div className="space-y-3 animate-slide-up">
                        {filtered.map((m) => (
                            <MatchCard key={m.id} match={m} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />

            {showForm && <MatchForm onClose={() => setShowForm(false)} />}
        </>
    );
}
