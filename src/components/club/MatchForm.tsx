"use client";

import { useState, useMemo } from "react";
import { useClub } from "@/context/ClubContext";
import { calculateMatchElo, type PlayerEloState } from "@/lib/elo";
import { findTeamByPlayers } from "@/lib/tournament";
import type { EloChange, MatchRound } from "@/types/club";
import PlayerSelect from "@/components/club/PlayerSelect";
import { X, Swords, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

const ROUND_LABEL: Record<MatchRound, string> = {
    group: "Vòng bảng (Elo ×1.00)",
    semi: "Bán kết (Elo ×1.25)",
    third: "Tranh 3-4 (Elo ×1.10)",
    final: "Chung kết (Elo ×1.50)",
};

interface MatchFormProps {
    onClose: () => void;
    /** Trận giải: truyền tournamentId + round để khóa cứng (từ trang giải). */
    tournamentId?: string;
    round?: MatchRound;
    /** Khóa sẵn đội hình (dùng cho trận giải đã biết 2 đội). */
    fixedPlayers?: {
        teamA: [string, string];
        teamB: [string, string];
    };
}

export default function MatchForm({
    onClose,
    tournamentId: fixedTournamentId,
    round: fixedRound,
    fixedPlayers,
}: MatchFormProps) {
    const { players, tournaments, tournamentTeams, recordMatch } = useClub();
    const [a1, setA1] = useState(fixedPlayers?.teamA[0] || "");
    const [a2, setA2] = useState(fixedPlayers?.teamA[1] || "");
    const [b1, setB1] = useState(fixedPlayers?.teamB[0] || "");
    const [b2, setB2] = useState(fixedPlayers?.teamB[1] || "");
    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");
    const [recordedBy, setRecordedBy] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<EloChange[] | null>(null);

    // Khi mở từ trang giải thì loại trận bị khóa; mở từ /matches thì cho chọn
    const isFixed = !!fixedTournamentId;
    const [selType, setSelType] = useState<"training" | "tournament">(
        isFixed ? "tournament" : "training"
    );
    const [selTournamentId, setSelTournamentId] = useState("");
    const [selRound, setSelRound] = useState<MatchRound>("group");

    const tournamentId =
        fixedTournamentId || (selType === "tournament" ? selTournamentId : undefined);
    const round = fixedRound || (selType === "tournament" ? selRound : undefined);

    // Các giải có thể chọn (chưa kết thúc), mới nhất trước
    const selectableTournaments = tournaments.filter((t) => t.status !== "completed");

    const selectedIds = [a1, a2, b1, b2].filter(Boolean);
    const allSelected = a1 && a2 && b1 && b2;
    const sA = parseInt(scoreA, 10);
    const sB = parseInt(scoreB, 10);
    const scoresValid = !isNaN(sA) && !isNaN(sB) && sA >= 0 && sB >= 0 && sA !== sB;

    // Kiểm tra 2 cặp có khớp 2 đội trong giải đã chọn không (chỉ khi tự chọn giải)
    const teamCheck = useMemo(() => {
        if (isFixed || selType !== "tournament" || !selTournamentId || !allSelected) return null;
        const teams = tournamentTeams.filter((t) => t.tournamentId === selTournamentId);
        const teamA = findTeamByPlayers(teams, a1, a2);
        const teamB = findTeamByPlayers(teams, b1, b2);
        return { teamA, teamB, ok: !!teamA && !!teamB };
    }, [isFixed, selType, selTournamentId, allSelected, a1, a2, b1, b2, tournamentTeams]);

    // Preview Elo (từ state local — kết quả chính thức tính lại với data fresh khi submit)
    const preview = useMemo<EloChange[] | null>(() => {
        if (!allSelected || !scoresValid) return null;
        const ids = [a1, a2, b1, b2];
        const states: PlayerEloState[] = [];
        for (const id of ids) {
            const p = players.find((x) => x.id === id);
            if (!p) return null;
            states.push({
                id: p.id,
                elo: p.currentElo,
                matchesPlayed: p.matchesPlayed,
                tournamentsPlayed: p.tournamentsPlayed,
                wins: p.wins,
                losses: p.losses,
                tournamentIds: new Set(),
            });
        }
        return calculateMatchElo({
            players: states as [PlayerEloState, PlayerEloState, PlayerEloState, PlayerEloState],
            scoreA: sA,
            scoreB: sB,
            round,
        });
    }, [a1, a2, b1, b2, sA, sB, allSelected, scoresValid, players, round]);

    const playerName = (id: string) => {
        const p = players.find((x) => x.id === id);
        return p ? p.name : "?";
    };

    const handleSubmit = async () => {
        setError("");
        if (!allSelected) {
            setError("Vui lòng chọn đủ 4 người chơi");
            return;
        }
        if (new Set(selectedIds).size !== 4) {
            setError("4 người chơi phải khác nhau");
            return;
        }
        if (!scoresValid) {
            setError("Tỷ số không hợp lệ (không được hòa)");
            return;
        }
        if (!isFixed && selType === "tournament") {
            if (!selTournamentId) {
                setError("Vui lòng chọn giải đấu");
                return;
            }
            if (teamCheck && !teamCheck.ok) {
                setError(
                    "4 người chơi không khớp với 2 đội nào trong giải này — kiểm tra lại đội hình"
                );
                return;
            }
        }
        setSubmitting(true);
        try {
            const changes = await recordMatch({
                teamAPlayer1: a1,
                teamAPlayer2: a2,
                teamBPlayer1: b1,
                teamBPlayer2: b2,
                scoreA: sA,
                scoreB: sB,
                matchType: tournamentId ? "tournament" : "training",
                tournamentId,
                round,
                recordedBy: recordedBy.trim() || undefined,
            });
            setResult(changes);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-6 w-full max-w-lg my-8 shadow-soft"
                onClick={(e) => e.stopPropagation()}
            >
                {result ? (
                    /* ===== Kết quả sau khi ghi ===== */
                    <div className="text-center">
                        <CheckCircle2 size={48} className="text-court-500 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-navy-900 mb-1">Đã ghi trận đấu!</h2>
                        <p className="text-gray-500 text-sm mb-6">Elo đã được cập nhật</p>
                        <div className="space-y-2 text-left mb-6">
                            {result.map((c) => (
                                <div
                                    key={c.playerId}
                                    className="flex items-center justify-between px-4 py-2.5 bg-navy-50 rounded-xl"
                                >
                                    <span className="font-medium text-navy-900">
                                        {playerName(c.playerId)}
                                    </span>
                                    <span className="flex items-center gap-2 font-mono text-sm">
                                        <span className="text-gray-400">{Math.round(c.before)}</span>
                                        <span>→</span>
                                        <span className="font-semibold text-navy-900">
                                            {Math.round(c.after)}
                                        </span>
                                        <span
                                            className={`flex items-center gap-0.5 font-semibold ${
                                                c.delta >= 0 ? "text-court-600" : "text-red-500"
                                            }`}
                                        >
                                            {c.delta >= 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}
                                            {c.delta >= 0 ? "+" : ""}
                                            {c.delta.toFixed(1)}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose} className="btn-primary w-full">
                            Đóng
                        </button>
                    </div>
                ) : (
                    /* ===== Form ghi trận ===== */
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                                <Swords size={20} className="text-court-600" />
                                {tournamentId ? "Ghi trận giải đấu" : "Ghi trận đấu"}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-navy-900">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Loại trận (chỉ khi mở từ /matches) */}
                            {!isFixed && (
                                <>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelType("training")}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                selType === "training"
                                                    ? "bg-court-600 text-white"
                                                    : "bg-navy-100 text-gray-500 hover:bg-navy-200"
                                            }`}
                                        >
                                            Trận tập
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelType("tournament")}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                selType === "tournament"
                                                    ? "bg-ball-500 text-navy-900"
                                                    : "bg-navy-100 text-gray-500 hover:bg-navy-200"
                                            }`}
                                        >
                                            🏆 Trận giải
                                        </button>
                                    </div>

                                    {selType === "tournament" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <select
                                                value={selTournamentId}
                                                onChange={(e) => {
                                                    setSelTournamentId(e.target.value);
                                                    setError("");
                                                }}
                                                className="w-full px-3 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                            >
                                                <option value="">Chọn giải đấu</option>
                                                {selectableTournaments.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={selRound}
                                                onChange={(e) =>
                                                    setSelRound(e.target.value as MatchRound)
                                                }
                                                className="w-full px-3 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                            >
                                                {(
                                                    Object.entries(ROUND_LABEL) as [
                                                        MatchRound,
                                                        string,
                                                    ][]
                                                ).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Đội A */}
                            <div className="bg-court-50 rounded-2xl p-4">
                                <p className="text-xs font-semibold text-court-700 uppercase mb-2">
                                    Đội A
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <PlayerSelect
                                        value={a1}
                                        onChange={setA1}
                                        excludeIds={selectedIds.filter((id) => id !== a1)}
                                        placeholder="Người 1"
                                    />
                                    <PlayerSelect
                                        value={a2}
                                        onChange={setA2}
                                        excludeIds={selectedIds.filter((id) => id !== a2)}
                                        placeholder="Người 2"
                                    />
                                </div>
                            </div>

                            {/* Tỷ số */}
                            <div className="flex items-center justify-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    value={scoreA}
                                    onChange={(e) => setScoreA(e.target.value)}
                                    placeholder="0"
                                    className="w-20 px-3 py-3 text-center text-xl font-bold bg-white border-2 border-court-200 rounded-xl focus:outline-none focus:border-court-500"
                                />
                                <span className="text-gray-400 font-bold text-lg">—</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={scoreB}
                                    onChange={(e) => setScoreB(e.target.value)}
                                    placeholder="0"
                                    className="w-20 px-3 py-3 text-center text-xl font-bold bg-white border-2 border-navy-200 rounded-xl focus:outline-none focus:border-navy-500"
                                />
                            </div>

                            {/* Đội B */}
                            <div className="bg-navy-100 rounded-2xl p-4">
                                <p className="text-xs font-semibold text-navy-700 uppercase mb-2">
                                    Đội B
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <PlayerSelect
                                        value={b1}
                                        onChange={setB1}
                                        excludeIds={selectedIds.filter((id) => id !== b1)}
                                        placeholder="Người 1"
                                    />
                                    <PlayerSelect
                                        value={b2}
                                        onChange={setB2}
                                        excludeIds={selectedIds.filter((id) => id !== b2)}
                                        placeholder="Người 2"
                                    />
                                </div>
                            </div>

                            {/* Người ghi */}
                            <input
                                type="text"
                                value={recordedBy}
                                onChange={(e) => setRecordedBy(e.target.value)}
                                placeholder="Tên người ghi (không bắt buộc)"
                                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                            />

                            {/* Preview Elo */}
                            {preview && (
                                <div className="border border-dashed border-court-300 rounded-2xl p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                        Elo dự kiến thay đổi
                                    </p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                        {preview.map((c) => (
                                            <div
                                                key={c.playerId}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-navy-900 truncate mr-2">
                                                    {playerName(c.playerId)}
                                                </span>
                                                <span
                                                    className={`font-mono font-semibold whitespace-nowrap ${
                                                        c.delta >= 0
                                                            ? "text-court-600"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {c.delta >= 0 ? "+" : ""}
                                                    {c.delta.toFixed(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {teamCheck && (
                                <p
                                    className={`text-xs px-3 py-2 rounded-lg ${
                                        teamCheck.ok
                                            ? "text-court-700 bg-court-50"
                                            : "text-red-600 bg-red-50"
                                    }`}
                                >
                                    {teamCheck.ok
                                        ? `✓ Khớp đội: ${teamCheck.teamA!.name} vs ${teamCheck.teamB!.name}`
                                        : "⚠ 4 người chơi không khớp với 2 đội nào trong giải này"}
                                </p>
                            )}

                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Đang ghi..." : "Xác nhận kết quả"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
