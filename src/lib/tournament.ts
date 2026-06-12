// ============================================================
// Logic giải đấu: 6 đội chia 2 bảng vòng tròn → bán kết →
// chung kết + tranh 3-4. Standings và bracket derive từ matches.
// ============================================================

import type { Match, TournamentTeam } from "@/types/club";

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
    round: "semi" | "third" | "final";
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
