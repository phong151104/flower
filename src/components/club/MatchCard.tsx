"use client";

import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import { getMatchFormat, getTeamPlayerIds } from "@/lib/match";
import type { Match, MatchRound } from "@/types/club";
import { Trophy, Dumbbell } from "lucide-react";

const ROUND_LABEL: Record<MatchRound, string> = {
    group: "Vòng bảng",
    semi: "Bán kết",
    third: "Tranh 3-4",
    final: "Chung kết",
    seeding: "Xác định seed",
    ur1: "Play-in",
    ur2: "Nhánh thắng V2",
    ur3: "CK nhánh thắng",
    lr1: "Nhánh thua V1",
    lr2: "Nhánh thua V2",
    lr3: "Nhánh thua V3",
    lr_final: "CK nhánh thua",
    grand_final: "Chung kết",
};

export default function MatchCard({ match, hideDate = false }: { match: Match; hideDate?: boolean }) {
    const { players, tournaments } = useClub();

    const name = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";
    const delta = (id: string) => match.eloChanges.find((c) => c.playerId === id)?.delta;
    const matchFormat = getMatchFormat(match);
    const teamAIds = getTeamPlayerIds(match, "A");
    const teamBIds = getTeamPlayerIds(match, "B");

    const tournament = match.tournamentId
        ? tournaments.find((t) => t.id === match.tournamentId)
        : undefined;

    const date = new Date(match.playedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const renderPlayer = (id: string) => {
        const d = delta(id);
        return (
            <span key={id} className="inline-flex items-center gap-1">
                <Link
                    href={`/players/${id}`}
                    className="hover:text-court-600 transition-colors"
                >
                    {name(id)}
                </Link>
                {d !== undefined && (
                    <span
                        className={`text-[10px] font-mono font-semibold ${
                            d >= 0 ? "text-court-600" : "text-red-500"
                        }`}
                    >
                        ({d >= 0 ? "+" : ""}
                        {d.toFixed(1)})
                    </span>
                )}
            </span>
        );
    };

    const teamAWon = match.winner === "A";

    return (
        <div className="bg-white rounded-2xl shadow-card p-4 card-hover">
            <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                    {match.matchType === "tournament" ? (
                        <>
                            <Trophy size={13} className="text-ball-500" />
                            {tournament?.name || "Giải đấu"}
                            {match.round && ` · ${ROUND_LABEL[match.round]}`}
                            <span className="ml-1 rounded bg-ball-50 px-1.5 py-0.5 text-[10px] font-semibold text-ball-700">
                                2v2
                            </span>
                        </>
                    ) : (
                        <>
                            <Dumbbell size={13} />
                            Trận tập
                            <span className="ml-1 rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                                {matchFormat === "singles" ? "1v1" : "2v2"}
                            </span>
                        </>
                    )}
                </span>
                {!hideDate && <span>{date}</span>}
            </div>

            <div className="flex items-center gap-3">
                {/* Đội A */}
                <div
                    className={`flex-1 text-sm ${
                        teamAWon ? "font-semibold text-navy-900" : "text-gray-500"
                    }`}
                >
                    <div className="flex flex-col gap-0.5">
                        {teamAIds.map(renderPlayer)}
                    </div>
                </div>

                {/* Tỷ số */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 rounded-xl font-mono font-bold">
                    <span className={teamAWon ? "text-court-600" : "text-gray-400"}>
                        {match.scoreA}
                    </span>
                    <span className="text-gray-300">:</span>
                    <span className={!teamAWon ? "text-court-600" : "text-gray-400"}>
                        {match.scoreB}
                    </span>
                </div>

                {/* Đội B */}
                <div
                    className={`flex-1 text-sm text-right ${
                        !teamAWon ? "font-semibold text-navy-900" : "text-gray-500"
                    }`}
                >
                    <div className="flex flex-col gap-0.5 items-end">
                        {teamBIds.map(renderPlayer)}
                    </div>
                </div>
            </div>
        </div>
    );
}
