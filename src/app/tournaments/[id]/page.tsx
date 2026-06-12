"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchForm from "@/components/club/MatchForm";
import MatchCard from "@/components/club/MatchCard";
import { useClub } from "@/context/ClubContext";
import {
    getGroupStandings,
    getKnockoutBracket,
    getPendingGroupMatchups,
    type KnockoutMatchup,
} from "@/lib/tournament";
import type { MatchRound, TournamentTeam } from "@/types/club";
import { ArrowLeft, Trophy, Medal, Swords } from "lucide-react";

interface RecordTarget {
    round: MatchRound;
    teamA: TournamentTeam;
    teamB: TournamentTeam;
}

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { tournaments, tournamentTeams, matches, players, isLoading } = useClub();
    const [recordTarget, setRecordTarget] = useState<RecordTarget | null>(null);

    const tournament = tournaments.find((t) => t.id === id);
    const teams = tournamentTeams.filter((t) => t.tournamentId === id);
    const tMatches = matches.filter((m) => m.tournamentId === id);

    const playerName = (pid: string) => players.find((p) => p.id === pid)?.name || "(đã xóa)";

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

    if (!tournament) {
        return (
            <>
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh] text-center">
                    <p className="text-gray-500 mb-4">Không tìm thấy giải đấu.</p>
                    <Link href="/tournaments" className="btn-outline">
                        Danh sách giải
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    const groupA = teams.filter((t) => t.groupName === "A");
    const groupB = teams.filter((t) => t.groupName === "B");
    const bracket = getKnockoutBracket(teams, tMatches);
    const canRecord = tournament.status === "group" || tournament.status === "knockout";

    const champion = bracket.final.winner;
    const runnerUp = bracket.final.loser;
    const thirdPlace = bracket.third.winner;

    const renderGroup = (groupName: "A" | "B", groupTeams: TournamentTeam[]) => {
        const standings = getGroupStandings(groupTeams, tMatches);
        const pending = getPendingGroupMatchups(groupTeams, tMatches);
        return (
            <div className="bg-white rounded-3xl shadow-card p-5">
                <h3 className="font-bold text-navy-900 mb-3">Bảng {groupName}</h3>
                {groupTeams.length === 0 ? (
                    <p className="text-gray-400 text-sm">Chưa có đội</p>
                ) : (
                    <>
                        <table className="w-full text-sm mb-3">
                            <thead>
                                <tr className="text-gray-400 text-left text-xs">
                                    <th className="pb-2 font-medium">Đội</th>
                                    <th className="pb-2 font-medium text-center">Trận</th>
                                    <th className="pb-2 font-medium text-center">T-B</th>
                                    <th className="pb-2 font-medium text-center">+/-</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((s, i) => (
                                    <tr
                                        key={s.team.id}
                                        className={`border-t border-navy-100 ${
                                            i < 2 && s.played > 0 ? "bg-court-50/60" : ""
                                        }`}
                                    >
                                        <td className="py-2">
                                            <p className="font-medium text-navy-900">
                                                {i + 1}. {s.team.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {playerName(s.team.player1Id)} +{" "}
                                                {playerName(s.team.player2Id)}
                                            </p>
                                        </td>
                                        <td className="py-2 text-center">{s.played}</td>
                                        <td className="py-2 text-center font-mono">
                                            <span className="text-court-600">{s.wins}</span>-
                                            <span className="text-red-500">{s.losses}</span>
                                        </td>
                                        <td className="py-2 text-center font-mono">
                                            {s.pointDiff > 0 ? "+" : ""}
                                            {s.pointDiff}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {canRecord && tournament.status === "group" && pending.length > 0 && (
                            <div className="border-t border-dashed border-navy-200 pt-3 space-y-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold">
                                    Trận chưa đấu
                                </p>
                                {pending.map(([ta, tb]) => (
                                    <button
                                        key={`${ta.id}-${tb.id}`}
                                        onClick={() =>
                                            setRecordTarget({ round: "group", teamA: ta, teamB: tb })
                                        }
                                        className="w-full flex items-center justify-between px-3 py-2 bg-navy-50 hover:bg-court-50 rounded-xl text-sm transition-colors"
                                    >
                                        <span>
                                            {ta.name} <span className="text-gray-400">vs</span>{" "}
                                            {tb.name}
                                        </span>
                                        <span className="text-court-600 text-xs font-medium">
                                            Ghi kết quả →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderKnockoutCard = (matchup: KnockoutMatchup) => {
        const { slotA, slotB, match, winner } = matchup;
        const ready = slotA.team && slotB.team && !match;
        const mLabel = { semi: "×1.25", third: "×1.10", final: "×1.50" }[matchup.round];
        return (
            <div className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-navy-900 text-sm">{matchup.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono">Elo {mLabel}</span>
                </div>
                <div className="space-y-1.5">
                    {[slotA, slotB].map((slot, i) => {
                        const isWinner = winner && slot.team?.id === winner.id;
                        return (
                            <div
                                key={i}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                                    isWinner
                                        ? "bg-court-100 font-semibold text-court-800"
                                        : "bg-navy-50 text-gray-600"
                                }`}
                            >
                                <span>
                                    {slot.team ? (
                                        <>
                                            {slot.team.name}
                                            <span className="text-[10px] text-gray-400 ml-1.5 font-normal">
                                                {playerName(slot.team.player1Id)} +{" "}
                                                {playerName(slot.team.player2Id)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic">{slot.label}</span>
                                    )}
                                </span>
                                {isWinner && <Trophy size={13} className="text-ball-500 shrink-0" />}
                            </div>
                        );
                    })}
                </div>
                {match && (
                    <p className="text-center font-mono font-bold text-navy-900 mt-2">
                        {match.scoreA} : {match.scoreB}
                    </p>
                )}
                {ready && canRecord && tournament.status === "knockout" && (
                    <button
                        onClick={() =>
                            setRecordTarget({
                                round: matchup.round,
                                teamA: slotA.team!,
                                teamB: slotB.team!,
                            })
                        }
                        className="w-full mt-3 py-2 bg-court-600 hover:bg-court-700 text-white rounded-xl text-xs font-medium transition-colors"
                    >
                        Ghi kết quả
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <Link
                    href="/tournaments"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-court-600 mb-6"
                >
                    <ArrowLeft size={16} />
                    Giải đấu
                </Link>

                {/* Header */}
                <div className="bg-gradient-dark rounded-3xl p-6 sm:p-8 text-white mb-8 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-ball rounded-2xl flex items-center justify-center shrink-0">
                            <Trophy size={26} className="text-navy-900" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{tournament.name}</h1>
                            <p className="text-gray-400 text-sm mt-0.5 capitalize">
                                {new Date(tournament.tournamentDate + "T00:00:00").toLocaleDateString(
                                    "vi-VN",
                                    { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Podium khi kết thúc */}
                    {tournament.status === "completed" && champion && (
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-white/10 rounded-2xl p-3 text-center order-1">
                                <Medal size={20} className="mx-auto text-gray-300 mb-1" />
                                <p className="text-xs text-gray-400">Hạng nhì</p>
                                <p className="font-semibold text-sm mt-0.5">{runnerUp?.name}</p>
                            </div>
                            <div className="bg-ball-400/20 border border-ball-400/40 rounded-2xl p-3 text-center order-2 -mt-2">
                                <Trophy size={24} className="mx-auto text-ball-300 mb-1" />
                                <p className="text-xs text-ball-200">Vô địch</p>
                                <p className="font-bold mt-0.5">{champion.name}</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3 text-center order-3">
                                <Medal size={20} className="mx-auto text-amber-500 mb-1" />
                                <p className="text-xs text-gray-400">Hạng ba</p>
                                <p className="font-semibold text-sm mt-0.5">{thirdPlace?.name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vòng bảng */}
                <section className="mb-10">
                    <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                        Vòng bảng
                        <span className="text-sm font-normal text-gray-400 ml-2">
                            (vòng tròn, Elo ×1.00)
                        </span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-5 animate-slide-up">
                        {renderGroup("A", groupA)}
                        {renderGroup("B", groupB)}
                    </div>
                </section>

                {/* Knock-out */}
                <section className="mb-10">
                    <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                        Vòng knock-out
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {renderKnockoutCard(bracket.semi1)}
                        {renderKnockoutCard(bracket.semi2)}
                        {renderKnockoutCard(bracket.third)}
                        {renderKnockoutCard(bracket.final)}
                    </div>
                </section>

                {/* Các trận đã đấu */}
                {tMatches.length > 0 && (
                    <section>
                        <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2 mb-4">
                            <Swords size={20} className="text-court-600" />
                            Các trận đã đấu ({tMatches.length})
                        </h2>
                        <div className="space-y-3">
                            {tMatches.map((m) => (
                                <MatchCard key={m.id} match={m} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <Footer />

            {recordTarget && (
                <MatchForm
                    onClose={() => setRecordTarget(null)}
                    tournamentId={id}
                    round={recordTarget.round}
                    fixedPlayers={{
                        teamA: [recordTarget.teamA.player1Id, recordTarget.teamA.player2Id],
                        teamB: [recordTarget.teamB.player1Id, recordTarget.teamB.player2Id],
                    }}
                />
            )}
        </>
    );
}
