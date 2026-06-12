// ============================================================
// Thống kê từ lịch sử trận: head-to-head, partner, xếp hạng.
// ============================================================

import type { Player, Match } from "@/types/club";
import { getRankStatus } from "@/lib/elo";

export interface HeadToHead {
    opponentId: string;
    wins: number;
    losses: number;
}

export interface PartnerStat {
    partnerId: string;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
}

export interface PlayerMatchView {
    match: Match;
    isTeamA: boolean;
    won: boolean;
    partnerId: string;
    opponentIds: [string, string];
    delta: number;
    eloAfter: number;
}

/** Lọc và diễn giải các trận của một người chơi (matches mới nhất trước). */
export function getPlayerMatches(playerId: string, matches: Match[]): PlayerMatchView[] {
    const result: PlayerMatchView[] = [];
    for (const m of matches) {
        const teamA = [m.teamAPlayer1, m.teamAPlayer2];
        const teamB = [m.teamBPlayer1, m.teamBPlayer2];
        const isTeamA = teamA.includes(playerId);
        if (!isTeamA && !teamB.includes(playerId)) continue;
        const myTeam = isTeamA ? teamA : teamB;
        const otherTeam = isTeamA ? teamB : teamA;
        const change = m.eloChanges.find((c) => c.playerId === playerId);
        result.push({
            match: m,
            isTeamA,
            won: (m.winner === "A") === isTeamA,
            partnerId: myTeam.find((id) => id !== playerId) || "",
            opponentIds: [otherTeam[0], otherTeam[1]],
            delta: change?.delta ?? 0,
            eloAfter: change?.after ?? 0,
        });
    }
    return result;
}

/** Thành tích đối đầu của một người với từng đối thủ. */
export function getHeadToHead(playerId: string, matches: Match[]): HeadToHead[] {
    const map = new Map<string, HeadToHead>();
    for (const v of getPlayerMatches(playerId, matches)) {
        for (const oppId of v.opponentIds) {
            const h2h = map.get(oppId) || { opponentId: oppId, wins: 0, losses: 0 };
            if (v.won) h2h.wins += 1;
            else h2h.losses += 1;
            map.set(oppId, h2h);
        }
    }
    return Array.from(map.values()).sort((a, b) => b.wins + b.losses - (a.wins + a.losses));
}

/** Thống kê theo partner — partner "ăn ý" nhất cần tối thiểu minMatches trận. */
export function getPartnerStats(
    playerId: string,
    matches: Match[],
    minMatches = 3
): { all: PartnerStat[]; best: PartnerStat | null } {
    const map = new Map<string, PartnerStat>();
    for (const v of getPlayerMatches(playerId, matches)) {
        if (!v.partnerId) continue;
        const stat = map.get(v.partnerId) || {
            partnerId: v.partnerId,
            matches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
        };
        stat.matches += 1;
        if (v.won) stat.wins += 1;
        else stat.losses += 1;
        map.set(v.partnerId, stat);
    }
    const all = Array.from(map.values()).map((s) => ({
        ...s,
        winRate: s.matches > 0 ? s.wins / s.matches : 0,
    }));
    all.sort((a, b) => b.matches - a.matches);
    const eligible = all.filter((s) => s.matches >= minMatches);
    const best = eligible.length
        ? eligible.reduce((acc, s) => (s.winRate > acc.winRate ? s : acc))
        : null;
    return { all, best };
}

/** Hiệu số điểm (tổng điểm ghi − tổng điểm thua). */
export function getPointDiff(playerId: string, matches: Match[]): number {
    let diff = 0;
    for (const v of getPlayerMatches(playerId, matches)) {
        const my = v.isTeamA ? v.match.scoreA : v.match.scoreB;
        const opp = v.isTeamA ? v.match.scoreB : v.match.scoreA;
        diff += my - opp;
    }
    return diff;
}

/** Phong độ 5 trận gần nhất, mới nhất trước. Ví dụ: ["W","W","L","W","L"]. */
export function getRecentForm(playerId: string, matches: Match[], count = 5): ("W" | "L")[] {
    return getPlayerMatches(playerId, matches)
        .slice(0, count)
        .map((v) => (v.won ? "W" : "L"));
}

/**
 * So sánh xếp hạng theo rule: Elo → đối đầu trực tiếp → tỷ lệ thắng
 * → hiệu số điểm → số trận đã chơi.
 */
export function compareRanking(a: Player, b: Player, matches: Match[]): number {
    if (b.currentElo !== a.currentElo) return b.currentElo - a.currentElo;

    const h2h = getHeadToHead(a.id, matches).find((h) => h.opponentId === b.id);
    if (h2h && h2h.wins !== h2h.losses) return h2h.losses - h2h.wins;

    const winRateA = a.matchesPlayed > 0 ? a.wins / a.matchesPlayed : 0;
    const winRateB = b.matchesPlayed > 0 ? b.wins / b.matchesPlayed : 0;
    if (winRateB !== winRateA) return winRateB - winRateA;

    const diffA = getPointDiff(a.id, matches);
    const diffB = getPointDiff(b.id, matches);
    if (diffB !== diffA) return diffB - diffA;

    return b.matchesPlayed - a.matchesPlayed;
}

/** BXH đã sắp xếp; người inactive/provisional vẫn có mặt kèm trạng thái. */
export function getRankedPlayers(players: Player[], matches: Match[]) {
    const sorted = [...players].sort((a, b) => compareRanking(a, b, matches));
    return sorted.map((p, i) => ({
        player: p,
        rank: i + 1,
        status: getRankStatus(p),
    }));
}
