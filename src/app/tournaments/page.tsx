"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClub } from "@/context/ClubContext";
import type { TournamentStatus } from "@/types/club";
import { Trophy, ChevronRight } from "lucide-react";

const STATUS_LABEL: Record<TournamentStatus, { label: string; cls: string }> = {
    draft: { label: "Sắp diễn ra", cls: "bg-gray-100 text-gray-500" },
    group: { label: "Vòng bảng", cls: "bg-blue-100 text-blue-700" },
    knockout: { label: "Knock-out", cls: "bg-amber-100 text-amber-700" },
    completed: { label: "Đã kết thúc", cls: "bg-court-100 text-court-700" },
};

export default function TournamentsPage() {
    const { tournaments, tournamentTeams, isLoading } = useClub();

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-8 animate-fade-in">
                    <h1 className="section-heading">Giải đấu</h1>
                    <p className="text-gray-500 mt-2">
                        6 đội · 2 bảng vòng tròn · bán kết · chung kết &amp; tranh hạng 3
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-gray-400">Đang tải...</div>
                ) : tournaments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <Trophy size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Chưa có giải đấu nào.</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-slide-up">
                        {tournaments.map((t) => {
                            const teams = tournamentTeams.filter((x) => x.tournamentId === t.id);
                            const status = STATUS_LABEL[t.status];
                            return (
                                <Link
                                    key={t.id}
                                    href={`/tournaments/${t.id}`}
                                    className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between gap-4 card-hover block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-ball rounded-2xl flex items-center justify-center shrink-0">
                                            <Trophy size={22} className="text-navy-900" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-navy-900 flex items-center gap-2 flex-wrap">
                                                {t.name}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.cls}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {new Date(
                                                    t.tournamentDate + "T00:00:00"
                                                ).toLocaleDateString("vi-VN", {
                                                    weekday: "long",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}{" "}
                                                · {teams.length} đội
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
