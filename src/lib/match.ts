import type { Match, MatchFormat } from "@/types/club";

type MatchTeams = Pick<
    Match,
    "matchFormat" | "teamAPlayer1" | "teamAPlayer2" | "teamBPlayer1" | "teamBPlayer2"
>;

export function getMatchFormat(match: Partial<Pick<Match, "matchFormat">>): MatchFormat {
    return match.matchFormat || "doubles";
}

export function getTeamPlayerIds(match: MatchTeams, side: "A" | "B"): string[] {
    const ids =
        side === "A"
            ? [match.teamAPlayer1, match.teamAPlayer2]
            : [match.teamBPlayer1, match.teamBPlayer2];
    return ids.filter((id): id is string => Boolean(id));
}

export function getMatchPlayerIds(match: MatchTeams): string[] {
    return [...getTeamPlayerIds(match, "A"), ...getTeamPlayerIds(match, "B")];
}

export function formatTeamNames(
    match: MatchTeams,
    side: "A" | "B",
    name: (playerId: string) => string
): string {
    return getTeamPlayerIds(match, side).map(name).join(" + ");
}
