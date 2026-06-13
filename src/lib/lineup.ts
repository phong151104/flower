// ============ XẾP ĐỘI & LỊCH ĐẤU TRONG BUỔI TẬP (pure functions) ============
// Từ danh sách người tham gia → ghép đôi cân bằng theo Elo → lịch đấu vòng tròn.
// Tất cả là gợi ý; người dùng có thể đổi cặp thủ công ở UI.

import type { Player } from "@/types/club";

export interface LineupTeam {
    id: string; // "t0", "t1"... (ổn định để lịch đấu tham chiếu)
    players: string[]; // [playerId, playerId]
}

export interface LineupScheduledMatch {
    court: number;
    teamA: string; // team id
    teamB: string; // team id
}

export interface LineupRound {
    round: number;
    matches: LineupScheduledMatch[];
}

export interface Lineup {
    teams: LineupTeam[];
    sittingOut: string[]; // người lẻ chưa có đội (dự bị)
    rounds: LineupRound[];
}

export type LineupMode = "balanced" | "random";

function eloOf(id: string, players: Player[]): number {
    return players.find((p) => p.id === id)?.currentElo ?? 1000;
}

export function teamAvgElo(team: LineupTeam, players: Player[]): number {
    if (team.players.length === 0) return 0;
    const sum = team.players.reduce((s, id) => s + eloOf(id, players), 0);
    return sum / team.players.length;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Ghép đôi.
 * - balanced: sắp theo Elo giảm dần rồi ghép mạnh + yếu (1+cuối, 2+áp cuối...)
 *   → các đội có tổng Elo gần nhau, trận đấu cân kèo.
 * - random: xáo trộn ngẫu nhiên rồi ghép tuần tự.
 * Nếu lẻ người, 1 người làm dự bị (có thể đổi vào ở UI).
 */
export function formTeams(
    participantIds: string[],
    players: Player[],
    mode: LineupMode
): { teams: LineupTeam[]; sittingOut: string[] } {
    let ordered: string[];
    if (mode === "balanced") {
        ordered = [...participantIds].sort((a, b) => eloOf(b, players) - eloOf(a, players));
    } else {
        ordered = shuffle(participantIds);
    }

    const sittingOut: string[] = [];
    if (ordered.length % 2 === 1) {
        // người lẻ: ở balanced lấy người Elo thấp nhất (cuối danh sách) làm dự bị
        sittingOut.push(ordered[ordered.length - 1]);
        ordered = ordered.slice(0, ordered.length - 1);
    }

    const teams: LineupTeam[] = [];
    const half = ordered.length / 2;
    for (let i = 0; i < half; i++) {
        const p1 = ordered[i];
        const p2 = mode === "balanced" ? ordered[ordered.length - 1 - i] : ordered[half + i];
        teams.push({ id: `t${i}`, players: [p1, p2] });
    }
    return { teams, sittingOut };
}

/** Lịch vòng tròn (circle method) — mỗi đội gặp tất cả đội khác đúng 1 lần. */
export function buildRoundRobin(teamIds: string[], courts: number): LineupRound[] {
    if (teamIds.length < 2) return [];
    const arr = [...teamIds];
    const hasBye = arr.length % 2 === 1;
    if (hasBye) arr.push("BYE");
    const n = arr.length;
    const c = Math.max(1, courts);
    const rounds: LineupRound[] = [];

    for (let r = 0; r < n - 1; r++) {
        const matches: LineupScheduledMatch[] = [];
        for (let i = 0; i < n / 2; i++) {
            const a = arr[i];
            const b = arr[n - 1 - i];
            if (a !== "BYE" && b !== "BYE") {
                matches.push({ court: (matches.length % c) + 1, teamA: a, teamB: b });
            }
        }
        if (matches.length > 0) rounds.push({ round: rounds.length + 1, matches });
        // xoay vòng: giữ phần tử đầu, quay các phần tử còn lại
        const fixed = arr[0];
        const rest = arr.slice(1);
        rest.unshift(rest.pop() as string);
        arr.splice(0, arr.length, fixed, ...rest);
    }
    return rounds;
}

export function generateLineup(
    participantIds: string[],
    players: Player[],
    courts: number,
    mode: LineupMode
): Lineup {
    const { teams, sittingOut } = formTeams(participantIds, players, mode);
    const rounds = buildRoundRobin(
        teams.map((t) => t.id),
        courts
    );
    return { teams, sittingOut, rounds };
}

/**
 * Đổi chỗ 2 người trong đội hình (kéo từ đội này sang đội khác / dự bị).
 * Trả về teams + sittingOut mới; lịch đấu giữ nguyên vì tham chiếu theo team id.
 */
export function swapPlayers(
    teams: LineupTeam[],
    sittingOut: string[],
    p1: string,
    p2: string
): { teams: LineupTeam[]; sittingOut: string[] } {
    if (p1 === p2) return { teams, sittingOut };
    const newTeams = teams.map((t) => ({ ...t, players: [...t.players] }));
    const newSitting = [...sittingOut];

    const locate = (pid: string) => {
        for (const t of newTeams) {
            const idx = t.players.indexOf(pid);
            if (idx !== -1) return { kind: "team" as const, team: t, idx };
        }
        const sIdx = newSitting.indexOf(pid);
        if (sIdx !== -1) return { kind: "sit" as const, idx: sIdx };
        return null;
    };

    const l1 = locate(p1);
    const l2 = locate(p2);
    if (!l1 || !l2) return { teams, sittingOut };

    if (l1.kind === "team") l1.team.players[l1.idx] = p2;
    else newSitting[l1.idx] = p2;
    if (l2.kind === "team") l2.team.players[l2.idx] = p1;
    else newSitting[l2.idx] = p1;

    return { teams: newTeams, sittingOut: newSitting };
}
