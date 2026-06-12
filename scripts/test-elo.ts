// Kiểm tra nhanh logic Elo theo ví dụ trong rule_xep_hang_elo_pickleball(1).md
// Chạy: npx tsx scripts/test-elo.ts
import { calculateMatchElo, expectedScore, getM, getK, getH, recalculateAll } from "../src/lib/elo";
import type { Player, Match } from "../src/types/club";

const mk = (id: string, elo: number) => ({
    id,
    elo,
    matchesPlayed: 15,
    tournamentsPlayed: 3,
    wins: 0,
    losses: 0,
    tournamentIds: new Set<string>(),
});

// Ví dụ rule file: Nam 1050 + Minh 1000 (R_A=1025) vs Huy 980 + Long 970 (R_B=975)
// Thắng 11-6 → H=1.15, K=24 → delta ≈ ±11.84
const changes = calculateMatchElo({
    players: [mk("nam", 1050), mk("minh", 1000), mk("huy", 980), mk("long", 970)],
    scoreA: 11,
    scoreB: 6,
});
console.log("Expected A:", expectedScore(1025, 975).toFixed(4), "(rule: ~0.571)");
console.log("Delta Nam:", changes[0].delta, "(rule: ~+11.84)");
console.log("Delta Huy:", changes[2].delta, "(rule: ~-11.84)");
console.log("K/H/M:", changes[0].k, changes[0].h, changes[0].m, "(rule: 24/1.15/1)");

// Case chung kết M=1.50
const final = calculateMatchElo({
    players: [mk("a", 1025), mk("b", 1025), mk("c", 975), mk("d", 975)],
    scoreA: 11,
    scoreB: 6,
    round: "final",
});
console.log("Final M:", final[0].m, "— delta:", final[0].delta, "(≈ 24×1.15×1.5×0.4286 ≈ 17.75)");
console.log("getM semi/third/final:", getM("semi"), getM("third"), getM("final"));
console.log(
    "getK 5tr/15tr(2 giải)/15tr(3 giải)/35tr:",
    getK({ matchesPlayed: 5, tournamentsPlayed: 0 }),
    getK({ matchesPlayed: 15, tournamentsPlayed: 2 }),
    getK({ matchesPlayed: 15, tournamentsPlayed: 3 }),
    getK({ matchesPlayed: 35, tournamentsPlayed: 5 })
);
console.log("getH 2/5/8:", getH(2), getH(5), getH(8));

// ===== Kiểm tra recalculateAll: replay 2 trận từ initial_elo =====
const mkPlayer = (id: string, tier: 1 | 2 | 3 | 4, initialElo: number): Player => ({
    id,
    name: id,
    tier,
    initialElo,
    currentElo: initialElo,
    matchesPlayed: 0,
    tournamentsPlayed: 0,
    wins: 0,
    losses: 0,
    isActive: true,
    createdAt: "2026-01-01",
});

const ps: Player[] = [
    mkPlayer("p1", 1, 1300),
    mkPlayer("p2", 2, 1200),
    mkPlayer("p3", 3, 1100),
    mkPlayer("p4", 4, 1000),
];

const mkMatch = (id: string, playedAt: string, scoreA: number, scoreB: number): Match => ({
    id,
    matchType: "training",
    playedAt,
    teamAPlayer1: "p1",
    teamAPlayer2: "p4", // đội A: 1300+1000 → 1150
    teamBPlayer1: "p2",
    teamBPlayer2: "p3", // đội B: 1200+1100 → 1150
    scoreA,
    scoreB,
    winner: scoreA > scoreB ? "A" : "B",
    eloChanges: [],
    createdAt: playedAt,
});

const ms = [mkMatch("m1", "2026-06-01", 11, 8), mkMatch("m2", "2026-06-02", 7, 11)];
const { finalStates, matchChanges } = recalculateAll(ps, ms);

// Trận 1: 2 đội rating bằng nhau (1150 vs 1150) → E=0.5, K=40 (người mới), H=1.0 (cách biệt 3)
// Delta trận 1 = 40 × 1.0 × 0.5 = ±20
console.log("\nRecalc — trận 1 delta p1:", matchChanges[0].eloChanges[0].delta, "(kỳ vọng +20)");
const p1Final = finalStates.get("p1")!;
console.log("Recalc — p1 sau 2 trận:", p1Final.elo, `(${p1Final.wins}T-${p1Final.losses}B, ${p1Final.matchesPlayed} trận)`);
const sumDelta = matchChanges.flatMap((mc) => mc.eloChanges).reduce((s, c) => s + c.delta, 0);
console.log("Tổng delta toàn hệ thống (zero-sum):", Math.round(sumDelta * 100) / 100, "(kỳ vọng 0)");
