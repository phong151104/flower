"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchForm from "@/components/club/MatchForm";
import MatchCard from "@/components/club/MatchCard";
import PlayerSelect from "@/components/club/PlayerSelect";
import DoubleElimBracketView from "@/components/club/DoubleElimBracketView";
import { useClub } from "@/context/ClubContext";
import {
    getGroupStandings,
    getKnockoutBracket,
    getPendingGroupMatchups,
    getDoubleElimBracket,
    type KnockoutMatchup,
} from "@/lib/tournament";
import { getM } from "@/lib/elo";
import type { MatchRound, TournamentTeam, TournamentStatus } from "@/types/club";
import { ArrowLeft, Trophy, Medal, Swords, Settings, Trash2, Plus } from "lucide-react";

interface RecordTarget {
    round: MatchRound;
    teamA: TournamentTeam;
    teamB: TournamentTeam;
}

const STATUS_FLOW: TournamentStatus[] = ["draft", "group", "knockout", "completed"];
const STATUS_LABEL: Record<TournamentStatus, string> = {
    draft: "Nháp",
    group: "Vòng bảng",
    knockout: "Vòng trong",
    completed: "Đã kết thúc",
};

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const {
        tournaments,
        tournamentTeams,
        matches,
        players,
        isLoading,
        addTournamentTeam,
        deleteTournamentTeam,
        updateTournament,
        deleteTournament,
    } = useClub();
    const router = useRouter();
    const [recordTarget, setRecordTarget] = useState<RecordTarget | null>(null);

    // Quản lý
    const [showManage, setShowManage] = useState(false);
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [teamName, setTeamName] = useState("");
    const [group, setGroup] = useState<"A" | "B">("A");
    const [allowDup, setAllowDup] = useState(false);
    const [teamError, setTeamError] = useState("");

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

    const format = tournament.format || "group_knockout";
    const groupA = teams.filter((t) => t.groupName === "A");
    const groupB = teams.filter((t) => t.groupName === "B");
    const canRecord = tournament.status === "group" || tournament.status === "knockout";

    const ko = format === "group_knockout" ? getKnockoutBracket(teams, tMatches) : null;
    const de = format === "double_elim" ? getDoubleElimBracket(teams, tMatches) : null;

    const champion = de ? de.champion : ko?.final.winner;
    const runnerUp = de ? de.runnerUp : ko?.final.loser;
    const thirdPlace = de ? de.third : ko?.third.winner;

    // ---- Quản lý đội ----
    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeamError("");
        if (!p1 || !p2 || p1 === p2) {
            setTeamError("Chọn 2 người chơi khác nhau");
            return;
        }
        if (!allowDup) {
            const used = teams.flatMap((t) => [t.player1Id, t.player2Id]);
            if (used.includes(p1) || used.includes(p2)) {
                setTeamError('Người chơi đã thuộc đội khác. Tích "Cho phép trùng người" nếu muốn.');
                return;
            }
        }
        if (teams.filter((t) => t.groupName === group).length >= 3) {
            setTeamError(`Bảng ${group} đã đủ 3 đội`);
            return;
        }
        await addTournamentTeam({
            tournamentId: id,
            name:
                teamName.trim() ||
                `${playerName(p1).split(" ").pop()} & ${playerName(p2).split(" ").pop()}`,
            player1Id: p1,
            player2Id: p2,
            groupName: group,
        });
        setTeamName("");
        setP1("");
        setP2("");
    };

    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(tournament.status) + 1];

    // ---- Render: 1 cặp đấu (seeding / knock-out / double-elim) ----
    const renderMatchup = (mu: KnockoutMatchup) => {
        const { slotA, slotB, match, winner } = mu;
        const ready = slotA.team && slotB.team && !match;
        return (
            <div className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-navy-900 text-sm">{mu.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono">
                        Elo ×{getM(mu.round).toFixed(2)}
                    </span>
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
                                round: mu.round,
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

    // UR2 trận 1: Seed 1 chọn đối thủ
    const renderUr2M1 = () => {
        if (!de) return null;
        const mu = de.ur2m1;
        if (mu.match || mu.slotB.team) return renderMatchup(mu);
        const s1 = mu.slotA.team;
        const opts = [de.ur1m1.winner, de.ur1m2.winner].filter(Boolean) as TournamentTeam[];
        if (!s1 || opts.length < 2) return renderMatchup(mu);
        return (
            <div className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-navy-900 text-sm">{mu.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono">
                        Elo ×{getM("ur2").toFixed(2)}
                    </span>
                </div>
                <div className="bg-court-50 rounded-xl px-3 py-2 text-sm font-medium text-court-800 mb-2">
                    Seed 1: {s1.name}
                </div>
                <p className="text-xs text-gray-500 mb-2">Seed 1 chọn đối thủ:</p>
                <div className="grid grid-cols-2 gap-2">
                    {opts.map((opp) => (
                        <button
                            key={opp.id}
                            disabled={!(canRecord && tournament.status === "knockout")}
                            onClick={() =>
                                setRecordTarget({ round: "ur2", teamA: s1, teamB: opp })
                            }
                            className="px-3 py-2 bg-navy-50 hover:bg-court-100 rounded-xl text-sm font-medium text-navy-900 transition-colors disabled:opacity-50"
                        >
                            {opp.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

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
                                    <th className="pb-2 font-medium text-center">W-L</th>
                                    <th className="pb-2 font-medium text-center">+/-</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((s, i) => (
                                    <tr key={s.team.id} className="border-t border-navy-100">
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
                <div className="bg-gradient-dark rounded-3xl p-6 sm:p-8 text-white mb-6 animate-fade-in">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-ball rounded-2xl flex items-center justify-center shrink-0">
                                <Trophy size={26} className="text-navy-900" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{tournament.name}</h1>
                                <p className="text-gray-400 text-sm mt-0.5 capitalize">
                                    {new Date(
                                        tournament.tournamentDate + "T00:00:00"
                                    ).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}{" "}
                                    ·{" "}
                                    {format === "double_elim"
                                        ? "Double elimination"
                                        : "Bán kết / Chung kết"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowManage((v) => !v)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                        >
                            <Settings size={16} />
                            Quản lý
                        </button>
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

                {/* Khu quản lý */}
                {showManage && (
                    <div className="bg-white rounded-3xl shadow-card p-5 mb-8 space-y-5">
                        {/* Trạng thái + sửa/xóa giải */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Trạng thái:</span>
                                <span className="font-semibold text-navy-900">
                                    {STATUS_LABEL[tournament.status]}
                                </span>
                                {nextStatus && (
                                    <button
                                        onClick={() => {
                                            if (nextStatus === "group" && teams.length !== 6) {
                                                alert("Cần đủ 6 đội trước khi vào vòng bảng");
                                                return;
                                            }
                                            updateTournament(id, { status: nextStatus });
                                        }}
                                        className="ml-1 px-3 py-1.5 bg-court-600 hover:bg-court-700 text-white rounded-lg text-xs font-medium"
                                    >
                                        → {STATUS_LABEL[nextStatus]}
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm(`Xóa giải "${tournament.name}"? Các trận đã ghi vẫn giữ trong lịch sử.`)) {
                                        deleteTournament(id);
                                        router.push("/tournaments");
                                    }
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={15} /> Xóa giải
                            </button>
                        </div>

                        {/* Sửa tên / ngày */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tên giải</label>
                                <input
                                    defaultValue={tournament.name}
                                    onBlur={(e) =>
                                        e.target.value.trim() &&
                                        e.target.value !== tournament.name &&
                                        updateTournament(id, { name: e.target.value.trim() })
                                    }
                                    className="w-full px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Ngày</label>
                                <input
                                    type="date"
                                    defaultValue={tournament.tournamentDate}
                                    onBlur={(e) =>
                                        e.target.value &&
                                        e.target.value !== tournament.tournamentDate &&
                                        updateTournament(id, { tournamentDate: e.target.value })
                                    }
                                    className="w-full px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                />
                            </div>
                        </div>

                        {/* Đội theo bảng */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {(["A", "B"] as const).map((g) => (
                                <div key={g} className="bg-navy-50 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-court-700 mb-3">
                                        Bảng {g} ({teams.filter((t) => t.groupName === g).length}/3)
                                    </p>
                                    <div className="space-y-2">
                                        {teams
                                            .filter((t) => t.groupName === g)
                                            .map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2"
                                                >
                                                    <div className="text-sm">
                                                        <p className="font-medium text-navy-900">
                                                            {t.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {playerName(t.player1Id)} +{" "}
                                                            {playerName(t.player2Id)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTournamentTeam(t.id)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Thêm đội */}
                        {teams.length < 6 && (
                            <form
                                onSubmit={handleAddTeam}
                                className="border-t border-navy-100 pt-4 space-y-3"
                            >
                                <p className="text-sm font-semibold text-navy-900">Thêm đội</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <PlayerSelect
                                        value={p1}
                                        onChange={setP1}
                                        excludeIds={
                                            allowDup
                                                ? [p2].filter(Boolean)
                                                : [
                                                      p2,
                                                      ...teams.flatMap((t) => [
                                                          t.player1Id,
                                                          t.player2Id,
                                                      ]),
                                                  ].filter(Boolean)
                                        }
                                        placeholder="Người 1"
                                    />
                                    <PlayerSelect
                                        value={p2}
                                        onChange={setP2}
                                        excludeIds={
                                            allowDup
                                                ? [p1].filter(Boolean)
                                                : [
                                                      p1,
                                                      ...teams.flatMap((t) => [
                                                          t.player1Id,
                                                          t.player2Id,
                                                      ]),
                                                  ].filter(Boolean)
                                        }
                                        placeholder="Người 2"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Tên đội (tự sinh nếu trống)"
                                        className="sm:col-span-2 px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                    />
                                    <select
                                        value={group}
                                        onChange={(e) => setGroup(e.target.value as "A" | "B")}
                                        className="px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                    >
                                        <option value="A">Bảng A</option>
                                        <option value="B">Bảng B</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={allowDup}
                                        onChange={(e) => setAllowDup(e.target.checked)}
                                        className="w-4 h-4 accent-court-600"
                                    />
                                    Cho phép trùng người (người đã ở đội khác)
                                </label>
                                {teamError && <p className="text-red-500 text-sm">{teamError}</p>}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-court-600 hover:bg-court-700 text-white rounded-xl text-sm font-medium"
                                >
                                    <Plus size={14} className="inline mr-1" />
                                    Thêm đội
                                </button>
                            </form>
                        )}
                    </div>
                )}

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

                {/* ===== Thể thức cũ: knock-out ===== */}
                {ko && (
                    <section className="mb-10">
                        <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                            Vòng knock-out
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {renderMatchup(ko.semi1)}
                            {renderMatchup(ko.semi2)}
                            {renderMatchup(ko.third)}
                            {renderMatchup(ko.final)}
                        </div>
                    </section>
                )}

                {/* ===== Thể thức mới: double elimination ===== */}
                {de && (
                    <>
                        <section className="mb-10">
                            <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                                Vòng xác định seed
                                <span className="text-sm font-normal text-gray-400 ml-2">
                                    (Nhất gặp Nhất, Nhì gặp Nhì, Ba gặp Ba)
                                </span>
                            </h2>
                            <div className="grid sm:grid-cols-3 gap-4 mb-5">
                                {de.seedingMatchups.map((mu, i) => (
                                    <div key={i}>{renderMatchup(mu)}</div>
                                ))}
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                                    Bảng seed
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {de.seeds.map((s) => (
                                        <div
                                            key={s.seedNo}
                                            className="flex items-center gap-2 bg-navy-50 rounded-xl px-3 py-2 text-sm"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-court-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                {s.seedNo}
                                            </span>
                                            <span className="truncate text-navy-900">
                                                {s.team ? s.team.name : "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="mb-10 mx-[calc(50%-50vw)] px-4 sm:px-8">
                            <div className="max-w-[1600px] mx-auto">
                                <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                                    Sơ đồ nhánh
                                    <span className="text-sm font-normal text-gray-400 ml-2">
                                        (kéo ngang nếu màn hình hẹp)
                                    </span>
                                </h2>
                                <DoubleElimBracketView
                                    bracket={de}
                                    renderMatch={renderMatchup}
                                    ur2m1Node={renderUr2M1()}
                                />
                            </div>
                        </section>
                    </>
                )}

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
