// ============================================================
// Logic tính Elo cho CLB pickleball — pure functions.
// Spec: rule_xep_hang_elo_pickleball(1).md
//
// Elo cá nhân: 1v1 dùng Elo cá nhân, 2v2 dùng trung bình Elo 2 người.
// Elo mới = Elo cũ + K × H × M × (S − E)
// K dùng chung cho tất cả người chơi để bảng đã ổn định không bị rung mạnh.
// Phần H × M × (S − E) vẫn phản ánh độ khó trận, chênh lệch tỷ số và vòng đấu.
// ============================================================

import { getMatchFormat, getMatchPlayerIds, getTeamPlayerIds } from "@/lib/match";
import type { Player, Match, EloChange, MatchFormat, MatchRound, RankStatus } from "@/types/club";

export const TIER_ELO: Record<number, number> = {
    1: 1300,
    2: 1200,
    3: 1100,
    4: 1000,
};

export const INACTIVE_MONTHS = 3;
export const STANDARD_K = 16;
export const DOUBLES_ELO_WEIGHT = 1;
export const SINGLES_ELO_WEIGHT = 0.5;

/** Trạng thái tích lũy của một người dùng khi replay lịch sử trận. */
export interface PlayerEloState {
    id: string;
    elo: number;
    matchesPlayed: number;
    tournamentsPlayed: number;
    wins: number;
    losses: number;
    lastMatchAt?: string;
    /** Các giải đã tham gia — để cộng tournamentsPlayed đúng 1 lần mỗi giải. */
    tournamentIds: Set<string>;
}

export function expectedScore(
    ratingA: number,
    ratingB: number,
    eloWeight = DOUBLES_ELO_WEIGHT
): number {
    return 1 / (1 + Math.pow(10, ((ratingB - ratingA) * eloWeight) / 400));
}

/** Hệ số K cố định: mọi người cộng/trừ cùng hệ số, không ưu tiên người mới. */
export function getK(_state: Pick<PlayerEloState, "matchesPlayed" | "tournamentsPlayed">): number {
    return STANDARD_K;
}

/** Hệ số cách biệt tỷ số. */
export function getH(scoreDiff: number): number {
    const diff = Math.abs(scoreDiff);
    if (diff <= 3) return 1.0;
    if (diff <= 6) return 1.15;
    return 1.25;
}

/** Hệ số vòng đấu (chỉ áp dụng cho trận giải; trận tập M=1). */
export function getM(round?: MatchRound | null): number {
    switch (round) {
        // Thể thức cũ
        case "semi":
            return 1.25;
        case "third":
            return 1.1;
        case "final":
            return 1.5;
        // Thể thức double-elimination
        case "seeding":
            return 1.1;
        case "ur1":
            return 1.1;
        case "ur2":
            return 1.2;
        case "lr1":
            return 1.05;
        case "lr2":
            return 1.1;
        case "lr3":
            return 1.15;
        case "ur3":
            return 1.35;
        case "lr_final":
            return 1.3;
        case "grand_final":
            return 1.5;
        default:
            return 1.0;
    }
}

export interface MatchInput {
    teamA: PlayerEloState[];
    teamB: PlayerEloState[];
    scoreA: number;
    scoreB: number;
    matchFormat?: MatchFormat;
    round?: MatchRound | null;
}

function averageElo(players: PlayerEloState[]): number {
    return players.reduce((sum, player) => sum + player.elo, 0) / players.length;
}

function eloWeightForFormat(format: MatchFormat): number {
    return format === "singles" ? SINGLES_ELO_WEIGHT : DOUBLES_ELO_WEIGHT;
}

/** Tính Elo thay đổi cho người chơi sau một trận. Không mutate input. */
export function calculateMatchElo(input: MatchInput): EloChange[] {
    if (input.teamA.length === 0 || input.teamB.length === 0) {
        throw new Error("Mỗi đội phải có ít nhất 1 người chơi");
    }

    const matchFormat = input.matchFormat || "doubles";
    const eloWeight = eloWeightForFormat(matchFormat);
    const ratingA = averageElo(input.teamA);
    const ratingB = averageElo(input.teamB);
    const expectedA = expectedScore(ratingA, ratingB, eloWeight);
    const expectedB = 1 - expectedA;
    const h = getH(input.scoreA - input.scoreB);
    const m = getM(input.round);
    const sA = input.scoreA > input.scoreB ? 1 : 0;
    const sB = 1 - sA;

    const change = (p: PlayerEloState, s: number, expected: number): EloChange => {
        const k = getK(p);
        const delta = k * h * m * (s - expected);
        return {
            playerId: p.id,
            before: round2(p.elo),
            after: round2(p.elo + delta),
            delta: round2(delta),
            k,
            h,
            m,
            expected: round4(expected),
            eloWeight,
        };
    };

    return [
        ...input.teamA.map((p) => change(p, sA, expectedA)),
        ...input.teamB.map((p) => change(p, sB, expectedB)),
    ];
}

/** Cập nhật state tích lũy của người chơi sau trận (mutate state — dùng trong replay). */
export function applyMatchToStates(
    states: Map<string, PlayerEloState>,
    match: Pick<
        Match,
        | "matchFormat"
        | "teamAPlayer1"
        | "teamAPlayer2"
        | "teamBPlayer1"
        | "teamBPlayer2"
        | "winner"
        | "playedAt"
        | "tournamentId"
    >,
    changes: EloChange[]
): void {
    const teamA = getTeamPlayerIds(match, "A");
    for (const c of changes) {
        const s = states.get(c.playerId);
        if (!s) continue;
        s.elo = c.after;
        s.matchesPlayed += 1;
        if (teamA.includes(c.playerId) === (match.winner === "A")) {
            s.wins += 1;
        } else {
            s.losses += 1;
        }
        s.lastMatchAt = match.playedAt;
        if (match.tournamentId && !s.tournamentIds.has(match.tournamentId)) {
            s.tournamentIds.add(match.tournamentId);
            s.tournamentsPlayed += 1;
        }
    }
}

export interface RecalculateResult {
    /** State cuối cùng của từng người sau khi replay. */
    finalStates: Map<string, PlayerEloState>;
    /** elo_changes mới cho từng trận (theo thứ tự input). */
    matchChanges: { matchId: string; eloChanges: EloChange[] }[];
}

/**
 * Replay toàn bộ lịch sử trận từ initial_elo — công cụ admin cho các lần cần tính lại toàn cục.
 * `matches` phải được sắp theo playedAt tăng dần.
 */
export function recalculateAll(players: Player[], matches: Match[]): RecalculateResult {
    const states = new Map<string, PlayerEloState>(
        players.map((p) => [
            p.id,
            {
                id: p.id,
                elo: p.initialElo,
                matchesPlayed: 0,
                tournamentsPlayed: 0,
                wins: 0,
                losses: 0,
                lastMatchAt: undefined,
                tournamentIds: new Set<string>(),
            },
        ])
    );

    const matchChanges: RecalculateResult["matchChanges"] = [];

    for (const match of matches) {
        const ids = getMatchPlayerIds(match);
        const ps = ids.map((id) => states.get(id));
        if (ps.some((p) => !p)) continue; // người chơi đã bị xóa — bỏ qua trận
        const teamAIds = getTeamPlayerIds(match, "A");
        const teamBIds = getTeamPlayerIds(match, "B");
        const changes = calculateMatchElo({
            teamA: teamAIds.map((id) => states.get(id)!),
            teamB: teamBIds.map((id) => states.get(id)!),
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            matchFormat: getMatchFormat(match),
            round: match.round,
        });
        applyMatchToStates(states, match, changes);
        matchChanges.push({ matchId: match.id, eloChanges: changes });
    }

    return { finalStates: states, matchChanges };
}

/** Trạng thái xếp hạng: mọi người đều chính thức; nghỉ 3 tháng → inactive. */
export function getRankStatus(
    player: Pick<Player, "matchesPlayed" | "lastMatchAt">,
    now: Date = new Date()
): RankStatus {
    if (player.lastMatchAt) {
        const last = new Date(player.lastMatchAt);
        const cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - INACTIVE_MONTHS);
        if (last < cutoff) return "inactive";
    }
    return "official";
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function round4(n: number): number {
    return Math.round(n * 10000) / 10000;
}
