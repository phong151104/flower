// ============================================================
// Logic tính Elo cho CLB pickleball — pure functions.
// Spec: rule_xep_hang_elo_pickleball(1).md
//
// Elo cá nhân, đánh đôi: rating đội = trung bình Elo 2 người.
// Elo mới = Elo cũ + K × H × M × (S − E)
// Rule gốc viết "cả đội cộng/trừ như nhau" nhưng K phụ thuộc
// từng người (số trận/số giải đã chơi), nên phần H × M × (S − E)
// là chung cho cả đội, nhân với K riêng của từng người.
// ============================================================

import type { Player, Match, EloChange, MatchRound, RankStatus } from "@/types/club";

export const TIER_ELO: Record<number, number> = {
    1: 1300,
    2: 1200,
    3: 1100,
    4: 1000,
};

export const MIN_OFFICIAL_MATCHES = 12;
export const INACTIVE_MONTHS = 3;

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

export function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/** Hệ số K: người mới 10 trận đầu 40 → 3 giải đầu 32 → ổn định 24 → từ 30 trận 16. */
export function getK(state: Pick<PlayerEloState, "matchesPlayed" | "tournamentsPlayed">): number {
    if (state.matchesPlayed < 10) return 40;
    if (state.tournamentsPlayed < 3) return 32;
    if (state.matchesPlayed < 30) return 24;
    return 16;
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
        case "semi":
            return 1.25;
        case "third":
            return 1.1;
        case "final":
            return 1.5;
        default:
            return 1.0;
    }
}

export interface MatchInput {
    /** [A1, A2, B1, B2] — đúng thứ tự. */
    players: [PlayerEloState, PlayerEloState, PlayerEloState, PlayerEloState];
    scoreA: number;
    scoreB: number;
    round?: MatchRound | null;
}

/** Tính Elo thay đổi cho 4 người sau một trận. Không mutate input. */
export function calculateMatchElo(input: MatchInput): EloChange[] {
    const [a1, a2, b1, b2] = input.players;
    const ratingA = (a1.elo + a2.elo) / 2;
    const ratingB = (b1.elo + b2.elo) / 2;
    const expectedA = expectedScore(ratingA, ratingB);
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
        };
    };

    return [
        change(a1, sA, expectedA),
        change(a2, sA, expectedA),
        change(b1, sB, expectedB),
        change(b2, sB, expectedB),
    ];
}

/** Cập nhật state tích lũy của 4 người sau trận (mutate state — dùng trong replay). */
export function applyMatchToStates(
    states: Map<string, PlayerEloState>,
    match: Pick<Match, "teamAPlayer1" | "teamAPlayer2" | "teamBPlayer1" | "teamBPlayer2" | "winner" | "playedAt" | "tournamentId">,
    changes: EloChange[]
): void {
    const teamA = [match.teamAPlayer1, match.teamAPlayer2];
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
 * Replay toàn bộ lịch sử trận từ initial_elo — dùng khi admin sửa/xóa trận.
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
        const ids = [match.teamAPlayer1, match.teamAPlayer2, match.teamBPlayer1, match.teamBPlayer2];
        const ps = ids.map((id) => states.get(id));
        if (ps.some((p) => !p)) continue; // người chơi đã bị xóa — bỏ qua trận
        const changes = calculateMatchElo({
            players: ps as [PlayerEloState, PlayerEloState, PlayerEloState, PlayerEloState],
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            round: match.round,
        });
        applyMatchToStates(states, match, changes);
        matchChanges.push({ matchId: match.id, eloChanges: changes });
    }

    return { finalStates: states, matchChanges };
}

/** Trạng thái xếp hạng: chưa đủ 12 trận → tạm tính; nghỉ 3 tháng → inactive. */
export function getRankStatus(
    player: Pick<Player, "matchesPlayed" | "lastMatchAt">,
    now: Date = new Date()
): RankStatus {
    if (player.matchesPlayed < MIN_OFFICIAL_MATCHES) return "provisional";
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
