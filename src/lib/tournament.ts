// ============================================================
// Logic giải đấu: 6 đội chia 2 bảng vòng tròn → bán kết →
// chung kết + tranh 3-4. Standings và bracket derive từ matches.
// ============================================================

import type { Match, MatchRound, TournamentTeam } from "@/types/club";

/** Tìm đội khớp với cặp người chơi (không phân biệt thứ tự). */
export function findTeamByPlayers(
    teams: TournamentTeam[],
    p1: string,
    p2: string
): TournamentTeam | undefined {
    return teams.find(
        (t) =>
            (t.player1Id === p1 && t.player2Id === p2) ||
            (t.player1Id === p2 && t.player2Id === p1)
    );
}

/** Đội A / đội B của một trận (theo tournament_teams). */
export function getMatchTeams(
    match: Match,
    teams: TournamentTeam[]
): { teamA?: TournamentTeam; teamB?: TournamentTeam } {
    return {
        teamA: findTeamByPlayers(teams, match.teamAPlayer1, match.teamAPlayer2),
        teamB: findTeamByPlayers(teams, match.teamBPlayer1, match.teamBPlayer2),
    };
}

export interface TeamStanding {
    team: TournamentTeam;
    played: number;
    wins: number;
    losses: number;
    pointDiff: number;
}

/**
 * Bảng xếp hạng vòng bảng của một bảng (A/B).
 * Sắp xếp: thắng nhiều → đối đầu trực tiếp → hiệu số điểm.
 */
export function getGroupStandings(
    groupTeams: TournamentTeam[],
    tournamentMatches: Match[]
): TeamStanding[] {
    const groupMatches = tournamentMatches.filter((m) => m.round === "group");
    const standings: TeamStanding[] = groupTeams.map((team) => {
        let played = 0;
        let wins = 0;
        let losses = 0;
        let pointDiff = 0;
        for (const m of groupMatches) {
            const { teamA, teamB } = getMatchTeams(m, groupTeams);
            if (teamA?.id === team.id) {
                played += 1;
                pointDiff += m.scoreA - m.scoreB;
                if (m.winner === "A") wins += 1;
                else losses += 1;
            } else if (teamB?.id === team.id) {
                played += 1;
                pointDiff += m.scoreB - m.scoreA;
                if (m.winner === "B") wins += 1;
                else losses += 1;
            }
        }
        return { team, played, wins, losses, pointDiff };
    });

    standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        // Đối đầu trực tiếp
        const h2h = groupMatches.find((m) => {
            const { teamA, teamB } = getMatchTeams(m, groupTeams);
            return (
                (teamA?.id === a.team.id && teamB?.id === b.team.id) ||
                (teamA?.id === b.team.id && teamB?.id === a.team.id)
            );
        });
        if (h2h) {
            const { teamA } = getMatchTeams(h2h, groupTeams);
            const aWon = (teamA?.id === a.team.id) === (h2h.winner === "A");
            if (aWon) return -1;
            return 1;
        }
        return b.pointDiff - a.pointDiff;
    });

    return standings;
}

export interface KnockoutSlot {
    /** Nhãn vị trí, vd "Nhất bảng A". */
    label: string;
    team?: TournamentTeam;
}

export interface KnockoutMatchup {
    round: MatchRound;
    title: string;
    slotA: KnockoutSlot;
    slotB: KnockoutSlot;
    /** Trận đã ghi (nếu có). */
    match?: Match;
    /** Đội thắng (nếu trận đã đấu). */
    winner?: TournamentTeam;
    loser?: TournamentTeam;
}

/**
 * Sơ đồ knock-out: BK1 = Nhất A vs Nhì B, BK2 = Nhất B vs Nhì A,
 * tranh 3-4 giữa 2 đội thua BK, chung kết giữa 2 đội thắng BK.
 */
export function getKnockoutBracket(
    teams: TournamentTeam[],
    tournamentMatches: Match[]
): { semi1: KnockoutMatchup; semi2: KnockoutMatchup; third: KnockoutMatchup; final: KnockoutMatchup } {
    const groupA = teams.filter((t) => t.groupName === "A");
    const groupB = teams.filter((t) => t.groupName === "B");
    const standingsA = getGroupStandings(groupA, tournamentMatches);
    const standingsB = getGroupStandings(groupB, tournamentMatches);

    // Chỉ chốt nhất/nhì khi mỗi bảng đã đánh đủ 3 trận vòng tròn
    const groupMatches = tournamentMatches.filter((m) => m.round === "group");
    const groupAMatches = groupMatches.filter((m) => getMatchTeams(m, groupA).teamA);
    const groupBMatches = groupMatches.filter((m) => getMatchTeams(m, groupB).teamA);
    const groupADone = groupAMatches.length >= 3;
    const groupBDone = groupBMatches.length >= 3;

    const first = (s: TeamStanding[], done: boolean) => (done && s[0] ? s[0].team : undefined);
    const second = (s: TeamStanding[], done: boolean) => (done && s[1] ? s[1].team : undefined);

    const semiMatches = tournamentMatches.filter((m) => m.round === "semi");
    const findMatchWithTeam = (pool: Match[], team?: TournamentTeam) =>
        team
            ? pool.find((m) => {
                  const { teamA, teamB } = getMatchTeams(m, teams);
                  return teamA?.id === team.id || teamB?.id === team.id;
              })
            : undefined;

    const resolve = (matchup: Omit<KnockoutMatchup, "winner" | "loser">): KnockoutMatchup => {
        if (!matchup.match) return matchup;
        const { teamA, teamB } = getMatchTeams(matchup.match, teams);
        const winner = matchup.match.winner === "A" ? teamA : teamB;
        const loser = matchup.match.winner === "A" ? teamB : teamA;
        return { ...matchup, winner, loser };
    };

    const semi1 = resolve({
        round: "semi",
        title: "Bán kết 1",
        slotA: { label: "Nhất bảng A", team: first(standingsA, groupADone) },
        slotB: { label: "Nhì bảng B", team: second(standingsB, groupBDone) },
        match: findMatchWithTeam(semiMatches, first(standingsA, groupADone)),
    });

    const semi2 = resolve({
        round: "semi",
        title: "Bán kết 2",
        slotA: { label: "Nhất bảng B", team: first(standingsB, groupBDone) },
        slotB: { label: "Nhì bảng A", team: second(standingsA, groupADone) },
        match: findMatchWithTeam(semiMatches, first(standingsB, groupBDone)),
    });

    const thirdMatch = tournamentMatches.find((m) => m.round === "third");
    const finalMatch = tournamentMatches.find((m) => m.round === "final");

    const third = resolve({
        round: "third",
        title: "Tranh hạng 3",
        slotA: { label: "Thua BK1", team: semi1.loser },
        slotB: { label: "Thua BK2", team: semi2.loser },
        match: thirdMatch,
    });

    const final = resolve({
        round: "final",
        title: "Chung kết",
        slotA: { label: "Thắng BK1", team: semi1.winner },
        slotB: { label: "Thắng BK2", team: semi2.winner },
        match: finalMatch,
    });

    return { semi1, semi2, third, final };
}

/** Các cặp đấu vòng tròn còn thiếu của một bảng. */
export function getPendingGroupMatchups(
    groupTeams: TournamentTeam[],
    tournamentMatches: Match[]
): [TournamentTeam, TournamentTeam][] {
    const groupMatches = tournamentMatches.filter((m) => m.round === "group");
    const pending: [TournamentTeam, TournamentTeam][] = [];
    for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
            const played = groupMatches.some((m) => {
                const { teamA, teamB } = getMatchTeams(m, groupTeams);
                return (
                    (teamA?.id === groupTeams[i].id && teamB?.id === groupTeams[j].id) ||
                    (teamA?.id === groupTeams[j].id && teamB?.id === groupTeams[i].id)
                );
            });
            if (!played) pending.push([groupTeams[i], groupTeams[j]]);
        }
    }
    return pending;
}

// ============================================================
// Thể thức DOUBLE-ELIMINATION 6 seed (kiểu LCK)
// Vòng bảng → vòng xác định seed (nhất gặp nhất...) → nhánh thắng/thua.
// ============================================================

export interface Seed {
    seedNo: number; // 1..6
    team?: TournamentTeam;
}

function teamInMatch(m: Match, team: TournamentTeam, allTeams: TournamentTeam[]): boolean {
    const { teamA, teamB } = getMatchTeams(m, allTeams);
    return teamA?.id === team.id || teamB?.id === team.id;
}

/** Đối thủ của `team` trong trận (đội còn lại). */
function opponentInMatch(
    m: Match,
    team: TournamentTeam,
    allTeams: TournamentTeam[]
): TournamentTeam | undefined {
    const { teamA, teamB } = getMatchTeams(m, allTeams);
    if (teamA?.id === team.id) return teamB;
    if (teamB?.id === team.id) return teamA;
    return undefined;
}

/** Các cặp đấu vòng xác định seed: hạng 1 A vs hạng 1 B, hạng 2..., hạng 3... */
export function getSeedingMatchups(
    teams: TournamentTeam[],
    tournamentMatches: Match[]
): KnockoutMatchup[] {
    const groupA = teams.filter((t) => t.groupName === "A");
    const groupB = teams.filter((t) => t.groupName === "B");
    const standingsA = getGroupStandings(groupA, tournamentMatches);
    const standingsB = getGroupStandings(groupB, tournamentMatches);

    const groupMatches = tournamentMatches.filter((m) => m.round === "group");
    const aDone = groupMatches.filter((m) => getMatchTeams(m, groupA).teamA).length >= 3;
    const bDone = groupMatches.filter((m) => getMatchTeams(m, groupB).teamA).length >= 3;

    const seedingMatches = tournamentMatches.filter((m) => m.round === "seeding");
    const rankLabel = ["Nhất", "Nhì", "Ba"];

    return [0, 1, 2].map((rank) => {
        const teamA = aDone ? standingsA[rank]?.team : undefined;
        const teamB = bDone ? standingsB[rank]?.team : undefined;
        let match: Match | undefined;
        if (teamA && teamB) {
            match = seedingMatches.find((m) => {
                const mt = getMatchTeams(m, teams);
                return (
                    (mt.teamA?.id === teamA.id && mt.teamB?.id === teamB.id) ||
                    (mt.teamA?.id === teamB.id && mt.teamB?.id === teamA.id)
                );
            });
        }
        const base: KnockoutMatchup = {
            round: "seeding",
            title: `Xác định seed — ${rankLabel[rank]} bảng`,
            slotA: { label: `${rankLabel[rank]} bảng A`, team: teamA },
            slotB: { label: `${rankLabel[rank]} bảng B`, team: teamB },
            match,
        };
        if (!match) return base;
        const mt = getMatchTeams(match, teams);
        const winner = match.winner === "A" ? mt.teamA : mt.teamB;
        const loser = match.winner === "A" ? mt.teamB : mt.teamA;
        return { ...base, winner, loser };
    });
}

/** Seed 1..6 từ kết quả vòng xác định seed (thắng = seed nhỏ hơn). */
export function getSeeds(teams: TournamentTeam[], tournamentMatches: Match[]): Seed[] {
    const seeds: Seed[] = [1, 2, 3, 4, 5, 6].map((n) => ({ seedNo: n }));
    const matchups = getSeedingMatchups(teams, tournamentMatches);
    matchups.forEach((mu, rank) => {
        if (mu.winner) seeds[rank * 2] = { seedNo: rank * 2 + 1, team: mu.winner };
        if (mu.loser) seeds[rank * 2 + 1] = { seedNo: rank * 2 + 2, team: mu.loser };
    });
    return seeds;
}

export interface DoubleElimBracket {
    seeds: Seed[];
    seedingMatchups: KnockoutMatchup[];
    ur1m1: KnockoutMatchup;
    ur1m2: KnockoutMatchup;
    ur2m1: KnockoutMatchup;
    ur2m2: KnockoutMatchup;
    ur3: KnockoutMatchup;
    lr1: KnockoutMatchup;
    lr2: KnockoutMatchup;
    lr3: KnockoutMatchup;
    lrFinal: KnockoutMatchup;
    grandFinal: KnockoutMatchup;
    champion?: TournamentTeam;
    runnerUp?: TournamentTeam;
    third?: TournamentTeam;
}

export function getDoubleElimBracket(
    teams: TournamentTeam[],
    tournamentMatches: Match[]
): DoubleElimBracket {
    const seedingMatchups = getSeedingMatchups(teams, tournamentMatches);
    const seeds = getSeeds(teams, tournamentMatches);
    const seedTeam = (n: number) => seeds[n - 1]?.team;
    const seedOf = (t?: TournamentTeam) =>
        t ? seeds.find((s) => s.team?.id === t.id)?.seedNo ?? 99 : 99;

    const findMatch = (round: MatchRound, a?: TournamentTeam, b?: TournamentTeam) => {
        if (!a || !b) return undefined;
        return tournamentMatches.find((m) => {
            if (m.round !== round) return false;
            const mt = getMatchTeams(m, teams);
            return (
                (mt.teamA?.id === a.id && mt.teamB?.id === b.id) ||
                (mt.teamA?.id === b.id && mt.teamB?.id === a.id)
            );
        });
    };

    const resolve = (mu: KnockoutMatchup): KnockoutMatchup => {
        if (!mu.match) return mu;
        const mt = getMatchTeams(mu.match, teams);
        const winner = mu.match.winner === "A" ? mt.teamA : mt.teamB;
        const loser = mu.match.winner === "A" ? mt.teamB : mt.teamA;
        return { ...mu, winner, loser };
    };

    // ----- Nhánh thắng: play-in -----
    const ur1m1 = resolve({
        round: "ur1",
        title: "Play-in 1 (Seed 3 vs Seed 6)",
        slotA: { label: "Seed 3", team: seedTeam(3) },
        slotB: { label: "Seed 6", team: seedTeam(6) },
        match: findMatch("ur1", seedTeam(3), seedTeam(6)),
    });
    const ur1m2 = resolve({
        round: "ur1",
        title: "Play-in 2 (Seed 4 vs Seed 5)",
        slotA: { label: "Seed 4", team: seedTeam(4) },
        slotB: { label: "Seed 5", team: seedTeam(5) },
        match: findMatch("ur1", seedTeam(4), seedTeam(5)),
    });

    const w1 = ur1m1.winner;
    const w2 = ur1m2.winner;
    const s1 = seedTeam(1);
    const s2 = seedTeam(2);

    // ----- UR2: Seed 1 chọn đối thủ (suy từ trận đã ghi) -----
    const ur2m1Match = s1
        ? tournamentMatches.find((m) => m.round === "ur2" && teamInMatch(m, s1, teams))
        : undefined;
    const seed1Opp = s1 && ur2m1Match ? opponentInMatch(ur2m1Match, s1, teams) : undefined;
    const ur2m1 = resolve({
        round: "ur2",
        title: "Nhánh thắng V2 — Trận 1 (Seed 1 chọn)",
        slotA: { label: "Seed 1", team: s1 },
        slotB: { label: "Seed 1 chọn", team: seed1Opp },
        match: ur2m1Match,
    });

    // Đội thắng play-in còn lại (không phải đối thủ Seed 1 đã chọn)
    let seed2Opp: TournamentTeam | undefined;
    if (seed1Opp && w1 && w2) seed2Opp = seed1Opp.id === w1.id ? w2 : w1;
    const ur2m2Match = s2
        ? tournamentMatches.find((m) => m.round === "ur2" && teamInMatch(m, s2, teams))
        : undefined;
    if (s2 && ur2m2Match) seed2Opp = opponentInMatch(ur2m2Match, s2, teams);
    const ur2m2 = resolve({
        round: "ur2",
        title: "Nhánh thắng V2 — Trận 2",
        slotA: { label: "Seed 2", team: s2 },
        slotB: { label: "Đội còn lại", team: seed2Opp },
        match: ur2m2Match,
    });

    // ----- UR3: chung kết nhánh thắng -----
    const ur3 = resolve({
        round: "ur3",
        title: "Chung kết nhánh thắng",
        slotA: { label: "Thắng V2-T1", team: ur2m1.winner },
        slotB: { label: "Thắng V2-T2", team: ur2m2.winner },
        match: findMatch("ur3", ur2m1.winner, ur2m2.winner),
    });

    // ----- Nhánh thua -----
    const lr1 = resolve({
        round: "lr1",
        title: "Nhánh thua V1",
        slotA: { label: "Thua play-in 1", team: ur1m1.loser },
        slotB: { label: "Thua play-in 2", team: ur1m2.loser },
        match: findMatch("lr1", ur1m1.loser, ur1m2.loser),
    });

    // 2 đội thua UR2: seed tốt hơn (số nhỏ) được nghỉ vào LR3, kém hơn đá LR2
    const ul1 = ur2m1.loser;
    const ul2 = ur2m2.loser;
    let lr2Drop: TournamentTeam | undefined;
    let lr3Drop: TournamentTeam | undefined;
    if (ul1 && ul2) {
        if (seedOf(ul1) <= seedOf(ul2)) {
            lr3Drop = ul1;
            lr2Drop = ul2;
        } else {
            lr3Drop = ul2;
            lr2Drop = ul1;
        }
    }

    const lr2 = resolve({
        round: "lr2",
        title: "Nhánh thua V2",
        slotA: { label: "Thua UR2 (seed kém hơn)", team: lr2Drop },
        slotB: { label: "Thắng nhánh thua V1", team: lr1.winner },
        match: findMatch("lr2", lr2Drop, lr1.winner),
    });

    const lr3 = resolve({
        round: "lr3",
        title: "Nhánh thua V3",
        slotA: { label: "Thua UR2 (seed tốt hơn)", team: lr3Drop },
        slotB: { label: "Thắng nhánh thua V2", team: lr2.winner },
        match: findMatch("lr3", lr3Drop, lr2.winner),
    });

    const lrFinal = resolve({
        round: "lr_final",
        title: "Chung kết nhánh thua",
        slotA: { label: "Thua chung kết nhánh thắng", team: ur3.loser },
        slotB: { label: "Thắng nhánh thua V3", team: lr3.winner },
        match: findMatch("lr_final", ur3.loser, lr3.winner),
    });

    const grandFinal = resolve({
        round: "grand_final",
        title: "Chung kết",
        slotA: { label: "Thắng nhánh thắng", team: ur3.winner },
        slotB: { label: "Thắng nhánh thua", team: lrFinal.winner },
        match: findMatch("grand_final", ur3.winner, lrFinal.winner),
    });

    return {
        seeds,
        seedingMatchups,
        ur1m1,
        ur1m2,
        ur2m1,
        ur2m2,
        ur3,
        lr1,
        lr2,
        lr3,
        lrFinal,
        grandFinal,
        champion: grandFinal.winner,
        runnerUp: grandFinal.loser,
        third: lrFinal.loser,
    };
}
