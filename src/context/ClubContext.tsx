"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type {
    Player,
    Match,
    EloChange,
    MatchFormat,
    MatchRound,
    TrainingSession,
    TrainingVote,
    SessionCost,
    SessionPayment,
    FundDrive,
    FundDriveMember,
    Tournament,
    TournamentTeam,
    Transaction,
    Announcement,
} from "@/types/club";
import { calculateMatchElo, type PlayerEloState } from "@/lib/elo";
import { getMatchFormat, getMatchPlayerIds, getTeamPlayerIds } from "@/lib/match";

// ============ CONTEXT TYPE ============

interface ClubContextType {
    // Players
    players: Player[];
    addPlayer: (player: Omit<Player, "id" | "createdAt">) => Promise<void>;
    updatePlayer: (id: string, updates: Partial<Omit<Player, "id" | "createdAt">>) => Promise<void>;
    deletePlayer: (id: string) => Promise<void>;
    getPlayer: (id: string) => Player | undefined;

    // Matches
    matches: Match[];
    /**
     * Ghi một trận hoàn chỉnh: fetch Elo mới nhất từ DB, tính Elo,
     * insert trận + cập nhật người chơi. Trả về EloChange[] để hiển thị.
     */
    recordMatch: (input: {
        matchFormat?: MatchFormat;
        teamAPlayer1: string;
        teamAPlayer2?: string;
        teamBPlayer1: string;
        teamBPlayer2?: string;
        scoreA: number;
        scoreB: number;
        matchType: "training" | "tournament";
        tournamentId?: string;
        round?: MatchRound;
        recordedBy?: string;
        playedAt?: string;
    }) => Promise<EloChange[]>;
    addMatch: (match: Omit<Match, "id" | "createdAt">) => Promise<void>;
    updateMatch: (id: string, updates: Partial<Omit<Match, "id" | "createdAt">>) => Promise<void>;
    /** Delete a match and roll back only that match's stored Elo/stat impact. */
    deleteMatch: (id: string) => Promise<void>;
    /** Ghi đè elo_changes nhiều trận + state players sau khi recalculate. */
    applyRecalculation: (
        playerUpdates: { id: string; updates: Partial<Player> }[],
        matchUpdates: { matchId: string; eloChanges: EloChange[] }[]
    ) => Promise<void>;

    // Training
    trainingSessions: TrainingSession[];
    addTrainingSession: (s: Omit<TrainingSession, "id" | "createdAt">) => Promise<void>;
    updateTrainingSession: (id: string, updates: Partial<Omit<TrainingSession, "id" | "createdAt">>) => Promise<void>;
    deleteTrainingSession: (id: string) => Promise<void>;
    trainingVotes: TrainingVote[];
    voteTraining: (sessionId: string, playerId: string, status: "yes" | "no") => Promise<void>;

    // Chi phí buổi tập + chia tiền
    sessionCosts: SessionCost[];
    addSessionCost: (cost: Omit<SessionCost, "id" | "createdAt">) => Promise<void>;
    updateSessionCost: (
        id: string,
        updates: Partial<Omit<SessionCost, "id" | "sessionId" | "createdAt">>
    ) => Promise<void>;
    deleteSessionCost: (id: string) => Promise<void>;
    sessionPayments: SessionPayment[];
    /** Đánh dấu một người đã/chưa đóng tiền cho một buổi (upsert). */
    setSessionPayment: (sessionId: string, playerId: string, paid: boolean) => Promise<void>;

    // Đợt thu quỹ (quỹ tháng / quỹ giải / tùy chỉnh)
    fundDrives: FundDrive[];
    fundDriveMembers: FundDriveMember[];
    addFundDrive: (
        drive: Omit<FundDrive, "id" | "createdAt">,
        memberIds: string[]
    ) => Promise<void>;
    updateFundDrive: (
        id: string,
        updates: Partial<Omit<FundDrive, "id" | "createdAt">>
    ) => Promise<void>;
    deleteFundDrive: (id: string) => Promise<void>;
    addFundDriveMember: (driveId: string, playerId: string) => Promise<void>;
    removeFundDriveMember: (driveId: string, playerId: string) => Promise<void>;
    setFundDriveMemberPaid: (driveId: string, playerId: string, paid: boolean) => Promise<void>;
    setFundDriveMemberAmount: (
        driveId: string,
        playerId: string,
        amount: number | null
    ) => Promise<void>;

    // Tournaments
    tournaments: Tournament[];
    addTournament: (t: Omit<Tournament, "id" | "createdAt">) => Promise<string>;
    updateTournament: (id: string, updates: Partial<Omit<Tournament, "id" | "createdAt">>) => Promise<void>;
    deleteTournament: (id: string) => Promise<void>;
    tournamentTeams: TournamentTeam[];
    addTournamentTeam: (team: Omit<TournamentTeam, "id" | "createdAt">) => Promise<void>;
    updateTournamentTeam: (id: string, updates: Partial<Omit<TournamentTeam, "id" | "createdAt">>) => Promise<void>;
    deleteTournamentTeam: (id: string) => Promise<void>;

    // Transactions (quỹ CLB)
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
    updateTransaction: (
        id: string,
        updates: Partial<Omit<Transaction, "id" | "createdAt">>
    ) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    totalIncome: number;
    totalExpense: number;
    balance: number;

    // Announcements
    announcements: Announcement[];
    addAnnouncement: (a: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
    updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, "id" | "createdAt">>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;

    // Loading & reload
    isLoading: boolean;
    reloadData: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
const round2 = (n: number) => Math.round(n * 100) / 100;

function playerWasOnWinningTeam(match: Match, playerId: string): boolean {
    const onTeamA = getTeamPlayerIds(match, "A").includes(playerId);
    return onTeamA === (match.winner === "A");
}

function latestMatchAtForPlayer(matches: Match[], playerId: string): string | undefined {
    return matches
        .filter((m) => getMatchPlayerIds(m).includes(playerId))
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0]?.playedAt;
}

// ============ DB CONVERTERS (snake_case ↔ camelCase) ============

function dbToPlayer(row: Record<string, unknown>): Player {
    return {
        id: row.id as string,
        name: row.name as string,
        nickname: (row.nickname as string) || undefined,
        avatarUrl: (row.avatar_url as string) || undefined,
        tier: (row.tier as Player["tier"]) || 4,
        initialElo: Number(row.initial_elo) || 1000,
        currentElo: Number(row.current_elo) || 1000,
        matchesPlayed: (row.matches_played as number) || 0,
        tournamentsPlayed: (row.tournaments_played as number) || 0,
        wins: (row.wins as number) || 0,
        losses: (row.losses as number) || 0,
        lastMatchAt: (row.last_match_at as string) || undefined,
        isActive: row.is_active !== false,
        gender: (row.gender as Player["gender"]) || undefined,
        createdAt: row.created_at as string,
    };
}

function playerToDb(p: Partial<Player>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (p.id !== undefined) row.id = p.id;
    if (p.name !== undefined) row.name = p.name;
    if (p.nickname !== undefined) row.nickname = p.nickname || null;
    if (p.avatarUrl !== undefined) row.avatar_url = p.avatarUrl || null;
    if (p.tier !== undefined) row.tier = p.tier;
    if (p.initialElo !== undefined) row.initial_elo = p.initialElo;
    if (p.currentElo !== undefined) row.current_elo = p.currentElo;
    if (p.matchesPlayed !== undefined) row.matches_played = p.matchesPlayed;
    if (p.tournamentsPlayed !== undefined) row.tournaments_played = p.tournamentsPlayed;
    if (p.wins !== undefined) row.wins = p.wins;
    if (p.losses !== undefined) row.losses = p.losses;
    if (p.lastMatchAt !== undefined) row.last_match_at = p.lastMatchAt || null;
    if (p.isActive !== undefined) row.is_active = p.isActive;
    if (p.gender !== undefined) row.gender = p.gender || null;
    return row;
}

function dbToMatch(row: Record<string, unknown>): Match {
    return {
        id: row.id as string,
        matchFormat: (row.match_format as Match["matchFormat"]) || "doubles",
        matchType: row.match_type as Match["matchType"],
        tournamentId: (row.tournament_id as string) || undefined,
        round: (row.round as Match["round"]) || undefined,
        playedAt: row.played_at as string,
        teamAPlayer1: row.team_a_player1 as string,
        teamAPlayer2: (row.team_a_player2 as string) || undefined,
        teamBPlayer1: row.team_b_player1 as string,
        teamBPlayer2: (row.team_b_player2 as string) || undefined,
        scoreA: row.score_a as number,
        scoreB: row.score_b as number,
        winner: row.winner as "A" | "B",
        eloChanges: (row.elo_changes as EloChange[]) || [],
        recordedBy: (row.recorded_by as string) || undefined,
        createdAt: row.created_at as string,
    };
}

function matchToDb(m: Partial<Match>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (m.id !== undefined) row.id = m.id;
    if (m.matchFormat !== undefined) row.match_format = m.matchFormat;
    if (m.matchType !== undefined) row.match_type = m.matchType;
    // Dùng "in" để cho phép set null khi gỡ trận khỏi giải (đổi về trận tập)
    if ("tournamentId" in m) row.tournament_id = m.tournamentId ?? null;
    if ("round" in m) row.round = m.round ?? null;
    if (m.playedAt !== undefined) row.played_at = m.playedAt;
    if (m.teamAPlayer1 !== undefined) row.team_a_player1 = m.teamAPlayer1;
    if ("teamAPlayer2" in m) row.team_a_player2 = m.teamAPlayer2 ?? null;
    if (m.teamBPlayer1 !== undefined) row.team_b_player1 = m.teamBPlayer1;
    if ("teamBPlayer2" in m) row.team_b_player2 = m.teamBPlayer2 ?? null;
    if (m.scoreA !== undefined) row.score_a = m.scoreA;
    if (m.scoreB !== undefined) row.score_b = m.scoreB;
    if (m.winner !== undefined) row.winner = m.winner;
    if (m.eloChanges !== undefined) row.elo_changes = m.eloChanges;
    if (m.recordedBy !== undefined) row.recorded_by = m.recordedBy || null;
    return row;
}

function dbToSession(row: Record<string, unknown>): TrainingSession {
    return {
        id: row.id as string,
        title: (row.title as string) || "Buổi tập",
        sessionDate: row.session_date as string,
        startTime: (row.start_time as string) || undefined,
        endTime: (row.end_time as string) || undefined,
        location: (row.location as string) || undefined,
        note: (row.note as string) || undefined,
        archived: row.archived === true,
        createdAt: row.created_at as string,
    };
}

function sessionToDb(s: Partial<TrainingSession>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (s.id !== undefined) row.id = s.id;
    if (s.title !== undefined) row.title = s.title;
    if (s.sessionDate !== undefined) row.session_date = s.sessionDate;
    if (s.startTime !== undefined) row.start_time = s.startTime || null;
    if (s.endTime !== undefined) row.end_time = s.endTime || null;
    if (s.location !== undefined) row.location = s.location || null;
    if (s.note !== undefined) row.note = s.note || null;
    if (s.archived !== undefined) row.archived = s.archived;
    return row;
}

function dbToVote(row: Record<string, unknown>): TrainingVote {
    return {
        id: row.id as string,
        sessionId: row.session_id as string,
        playerId: row.player_id as string,
        status: row.status as "yes" | "no",
        votedAt: row.voted_at as string,
    };
}

function dbToSessionCost(row: Record<string, unknown>): SessionCost {
    return {
        id: row.id as string,
        sessionId: row.session_id as string,
        label: row.label as string,
        amount: Number(row.amount),
        category: (row.category as SessionCost["category"]) || "khac",
        createdAt: row.created_at as string,
    };
}

function dbToSessionPayment(row: Record<string, unknown>): SessionPayment {
    return {
        id: row.id as string,
        sessionId: row.session_id as string,
        playerId: row.player_id as string,
        paid: row.paid !== false,
        paidAt: row.paid_at as string,
    };
}

function dbToFundDrive(row: Record<string, unknown>): FundDrive {
    return {
        id: row.id as string,
        title: row.title as string,
        kind: (row.kind as FundDrive["kind"]) || "custom",
        amount: Number(row.amount) || 0,
        period: (row.period as string) || undefined,
        note: (row.note as string) || undefined,
        createdAt: row.created_at as string,
    };
}

function dbToFundDriveMember(row: Record<string, unknown>): FundDriveMember {
    return {
        id: row.id as string,
        driveId: row.drive_id as string,
        playerId: row.player_id as string,
        paid: row.paid === true,
        amount: row.amount == null ? undefined : Number(row.amount),
        paidAt: (row.paid_at as string) || undefined,
    };
}

function dbToTournament(row: Record<string, unknown>): Tournament {
    return {
        id: row.id as string,
        name: row.name as string,
        tournamentDate: row.tournament_date as string,
        status: row.status as Tournament["status"],
        format: (row.format as Tournament["format"]) || "group_knockout",
        note: (row.note as string) || undefined,
        createdAt: row.created_at as string,
    };
}

function dbToTeam(row: Record<string, unknown>): TournamentTeam {
    return {
        id: row.id as string,
        tournamentId: row.tournament_id as string,
        name: row.name as string,
        player1Id: row.player1_id as string,
        player2Id: row.player2_id as string,
        groupName: row.group_name as "A" | "B",
        createdAt: row.created_at as string,
    };
}

function dbToTransaction(row: Record<string, unknown>): Transaction {
    return {
        id: row.id as string,
        type: row.type as "income" | "expense",
        amount: Number(row.amount),
        description: row.description as string,
        category: (row.category as Transaction["category"]) || "khac",
        playerId: (row.player_id as string) || undefined,
        date: row.date as string,
        createdAt: row.created_at as string,
    };
}

function dbToAnnouncement(row: Record<string, unknown>): Announcement {
    return {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string,
        isPinned: row.is_pinned === true,
        createdAt: row.created_at as string,
    };
}

// ============ PROVIDER ============

export function ClubProvider({ children }: { children: ReactNode }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [trainingVotes, setTrainingVotes] = useState<TrainingVote[]>([]);
    const [sessionCosts, setSessionCosts] = useState<SessionCost[]>([]);
    const [sessionPayments, setSessionPayments] = useState<SessionPayment[]>([]);
    const [fundDrives, setFundDrives] = useState<FundDrive[]>([]);
    const [fundDriveMembers, setFundDriveMembers] = useState<FundDriveMember[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [tournamentTeams, setTournamentTeams] = useState<TournamentTeam[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dbReady, setDbReady] = useState(false);

    const loadData = useCallback(async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [
                playersRes,
                matchesRes,
                sessionsRes,
                votesRes,
                costsRes,
                paymentsRes,
                drivesRes,
                driveMembersRes,
                tournamentsRes,
                teamsRes,
                txRes,
                announcementsRes,
            ] = await Promise.all([
                supabase.from("players").select("*").order("current_elo", { ascending: false }),
                supabase.from("matches").select("*").order("played_at", { ascending: false }),
                supabase.from("training_sessions").select("*").order("session_date", { ascending: false }),
                supabase.from("training_votes").select("*"),
                supabase.from("session_costs").select("*"),
                supabase.from("session_payments").select("*"),
                supabase.from("fund_drives").select("*").order("created_at", { ascending: false }),
                supabase.from("fund_drive_members").select("*"),
                supabase.from("tournaments").select("*").order("tournament_date", { ascending: false }),
                supabase.from("tournament_teams").select("*"),
                supabase.from("transactions").select("*").order("date", { ascending: false }),
                supabase.from("announcements").select("*").order("created_at", { ascending: false }),
            ]);

            if (playersRes.data) setPlayers(playersRes.data.map(dbToPlayer));
            if (matchesRes.data) setMatches(matchesRes.data.map(dbToMatch));
            if (sessionsRes.data) setTrainingSessions(sessionsRes.data.map(dbToSession));
            if (votesRes.data) setTrainingVotes(votesRes.data.map(dbToVote));
            if (costsRes.data) setSessionCosts(costsRes.data.map(dbToSessionCost));
            if (paymentsRes.data) setSessionPayments(paymentsRes.data.map(dbToSessionPayment));
            if (drivesRes.data) setFundDrives(drivesRes.data.map(dbToFundDrive));
            if (driveMembersRes.data) setFundDriveMembers(driveMembersRes.data.map(dbToFundDriveMember));
            if (tournamentsRes.data) setTournaments(tournamentsRes.data.map(dbToTournament));
            if (teamsRes.data) setTournamentTeams(teamsRes.data.map(dbToTeam));
            if (txRes.data) setTransactions(txRes.data.map(dbToTransaction));
            if (announcementsRes.data) setAnnouncements(announcementsRes.data.map(dbToAnnouncement));

            setDbReady(true);
        } catch (err) {
            console.error("Supabase load error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Realtime: players + matches + votes đồng bộ giữa nhiều thiết bị ở sân
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel("club-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "players" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const p = dbToPlayer(payload.new as Record<string, unknown>);
                    setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
                } else if (payload.eventType === "UPDATE") {
                    const p = dbToPlayer(payload.new as Record<string, unknown>);
                    setPlayers((prev) => prev.map((x) => (x.id === p.id ? p : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setPlayers((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const m = dbToMatch(payload.new as Record<string, unknown>);
                    setMatches((prev) => (prev.some((x) => x.id === m.id) ? prev : [m, ...prev]));
                } else if (payload.eventType === "UPDATE") {
                    const m = dbToMatch(payload.new as Record<string, unknown>);
                    setMatches((prev) => prev.map((x) => (x.id === m.id ? m : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setMatches((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "training_sessions" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const s = dbToSession(payload.new as Record<string, unknown>);
                    setTrainingSessions((prev) =>
                        prev.some((x) => x.id === s.id) ? prev : [s, ...prev]
                    );
                } else if (payload.eventType === "UPDATE") {
                    const s = dbToSession(payload.new as Record<string, unknown>);
                    setTrainingSessions((prev) => prev.map((x) => (x.id === s.id ? s : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setTrainingSessions((prev) => prev.filter((x) => x.id !== id));
                    setTrainingVotes((prev) => prev.filter((x) => x.sessionId !== id));
                    setSessionCosts((prev) => prev.filter((x) => x.sessionId !== id));
                    setSessionPayments((prev) => prev.filter((x) => x.sessionId !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "training_votes" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const v = dbToVote(payload.new as Record<string, unknown>);
                    setTrainingVotes((prev) => {
                        const filtered = prev.filter(
                            (x) => !(x.sessionId === v.sessionId && x.playerId === v.playerId)
                        );
                        return [...filtered, v];
                    });
                } else if (payload.eventType === "UPDATE") {
                    const v = dbToVote(payload.new as Record<string, unknown>);
                    setTrainingVotes((prev) => prev.map((x) => (x.id === v.id ? v : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setTrainingVotes((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "session_costs" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const c = dbToSessionCost(payload.new as Record<string, unknown>);
                    setSessionCosts((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
                } else if (payload.eventType === "UPDATE") {
                    const c = dbToSessionCost(payload.new as Record<string, unknown>);
                    setSessionCosts((prev) => prev.map((x) => (x.id === c.id ? c : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setSessionCosts((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "session_payments" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const p = dbToSessionPayment(payload.new as Record<string, unknown>);
                    setSessionPayments((prev) => {
                        const filtered = prev.filter(
                            (x) => !(x.sessionId === p.sessionId && x.playerId === p.playerId)
                        );
                        return [...filtered, p];
                    });
                } else if (payload.eventType === "UPDATE") {
                    const p = dbToSessionPayment(payload.new as Record<string, unknown>);
                    setSessionPayments((prev) => prev.map((x) => (x.id === p.id ? p : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setSessionPayments((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "fund_drives" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const d = dbToFundDrive(payload.new as Record<string, unknown>);
                    setFundDrives((prev) => (prev.some((x) => x.id === d.id) ? prev : [d, ...prev]));
                } else if (payload.eventType === "UPDATE") {
                    const d = dbToFundDrive(payload.new as Record<string, unknown>);
                    setFundDrives((prev) => prev.map((x) => (x.id === d.id ? d : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setFundDrives((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "fund_drive_members" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    const m = dbToFundDriveMember(payload.new as Record<string, unknown>);
                    setFundDriveMembers((prev) => {
                        const filtered = prev.filter(
                            (x) => !(x.driveId === m.driveId && x.playerId === m.playerId)
                        );
                        return [...filtered, m];
                    });
                } else if (payload.eventType === "UPDATE") {
                    const m = dbToFundDriveMember(payload.new as Record<string, unknown>);
                    setFundDriveMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));
                } else if (payload.eventType === "DELETE") {
                    const id = (payload.old as Record<string, unknown>).id as string;
                    setFundDriveMembers((prev) => prev.filter((x) => x.id !== id));
                }
            })
            .subscribe();

        return () => {
            if (supabase) supabase.removeChannel(channel);
        };
    }, []);

    // ---- Players ----
    const addPlayer = useCallback(
        async (player: Omit<Player, "id" | "createdAt">) => {
            const newPlayer: Player = {
                ...player,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setPlayers((prev) => [...prev, newPlayer]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("players").insert(playerToDb(newPlayer));
                if (error) console.error("Player insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updatePlayer = useCallback(
        async (id: string, updates: Partial<Omit<Player, "id" | "createdAt">>) => {
            setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            if (dbReady && supabase) {
                const { error } = await supabase.from("players").update(playerToDb(updates)).eq("id", id);
                if (error) console.error("Player update failed:", error.message);
            }
        },
        [dbReady]
    );

    const deletePlayer = useCallback(
        async (id: string) => {
            setPlayers((prev) => prev.filter((p) => p.id !== id));
            if (dbReady && supabase) {
                await supabase.from("players").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const getPlayer = useCallback((id: string) => players.find((p) => p.id === id), [players]);

    // ---- Matches ----
    const recordMatch = useCallback(
        async (input: {
            matchFormat?: MatchFormat;
            teamAPlayer1: string;
            teamAPlayer2?: string;
            teamBPlayer1: string;
            teamBPlayer2?: string;
            scoreA: number;
            scoreB: number;
            matchType: "training" | "tournament";
            tournamentId?: string;
            round?: MatchRound;
            recordedBy?: string;
            playedAt?: string;
        }): Promise<EloChange[]> => {
            const isTournament = input.matchType === "tournament" || Boolean(input.tournamentId);
            const matchFormat: MatchFormat = isTournament ? "doubles" : input.matchFormat || "doubles";
            if (matchFormat === "doubles" && (!input.teamAPlayer2 || !input.teamBPlayer2)) {
                throw new Error("Trận 2v2 cần đủ 4 người chơi");
            }

            const teamAIds =
                matchFormat === "singles"
                    ? [input.teamAPlayer1]
                    : [input.teamAPlayer1, input.teamAPlayer2!];
            const teamBIds =
                matchFormat === "singles"
                    ? [input.teamBPlayer1]
                    : [input.teamBPlayer1, input.teamBPlayer2!];
            const ids = [...teamAIds, ...teamBIds];

            if (new Set(ids).size !== ids.length) {
                throw new Error("Người chơi trong trận phải khác nhau");
            }

            // Lấy Elo mới nhất từ DB ngay trước khi tính — giảm rủi ro stale
            // khi nhiều người ghi trận cùng lúc trên các thiết bị khác nhau.
            let freshPlayers: Player[] = players.filter((p) => ids.includes(p.id));
            if (supabase) {
                const { data } = await supabase.from("players").select("*").in("id", ids);
                if (data && data.length === ids.length) freshPlayers = data.map(dbToPlayer);
            }

            const byId = new Map(freshPlayers.map((p) => [p.id, p]));
            if (ids.some((id) => !byId.has(id))) {
                throw new Error("Không tìm thấy đủ người chơi");
            }

            const toState = (p: Player): PlayerEloState => ({
                id: p.id,
                elo: p.currentElo,
                matchesPlayed: p.matchesPlayed,
                tournamentsPlayed: p.tournamentsPlayed,
                wins: p.wins,
                losses: p.losses,
                tournamentIds: new Set(),
            });

            const changes = calculateMatchElo({
                teamA: teamAIds.map((id) => toState(byId.get(id)!)),
                teamB: teamBIds.map((id) => toState(byId.get(id)!)),
                scoreA: input.scoreA,
                scoreB: input.scoreB,
                matchFormat,
                round: input.round,
            });

            const playedAt = input.playedAt || new Date().toISOString();
            const winner: "A" | "B" = input.scoreA > input.scoreB ? "A" : "B";

            const newMatch: Match = {
                id: crypto.randomUUID(),
                matchFormat,
                matchType: input.matchType,
                tournamentId: input.tournamentId,
                round: input.round,
                playedAt,
                teamAPlayer1: input.teamAPlayer1,
                teamAPlayer2: matchFormat === "doubles" ? input.teamAPlayer2 : undefined,
                teamBPlayer1: input.teamBPlayer1,
                teamBPlayer2: matchFormat === "doubles" ? input.teamBPlayer2 : undefined,
                scoreA: input.scoreA,
                scoreB: input.scoreB,
                winner,
                eloChanges: changes,
                recordedBy: input.recordedBy,
                createdAt: new Date().toISOString(),
            };

            setMatches((prev) => [newMatch, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("matches").insert(matchToDb(newMatch));
                if (error) console.error("Match insert failed:", error.message);
            }

            // Cập nhật người chơi trong trận
            for (const c of changes) {
                const p = byId.get(c.playerId)!;
                const won = teamAIds.includes(c.playerId) === (winner === "A");
                // Trận giải đầu tiên của người này trong giải → +1 tournaments_played
                const playedThisTournament =
                    input.tournamentId &&
                    matches.some(
                        (m) =>
                            m.tournamentId === input.tournamentId &&
                            getMatchPlayerIds(m).includes(c.playerId)
                    );
                const updates: Partial<Player> = {
                    currentElo: c.after,
                    matchesPlayed: p.matchesPlayed + 1,
                    wins: p.wins + (won ? 1 : 0),
                    losses: p.losses + (won ? 0 : 1),
                    lastMatchAt: playedAt,
                };
                if (input.tournamentId && !playedThisTournament) {
                    updates.tournamentsPlayed = p.tournamentsPlayed + 1;
                }
                setPlayers((prev) => prev.map((x) => (x.id === c.playerId ? { ...x, ...updates } : x)));
                if (dbReady && supabase) {
                    const { error } = await supabase
                        .from("players")
                        .update(playerToDb(updates))
                        .eq("id", c.playerId);
                    if (error) console.error("Player update failed:", error.message);
                }
            }

            return changes;
        },
        [dbReady, players, matches]
    );

    const addMatch = useCallback(
        async (match: Omit<Match, "id" | "createdAt">) => {
            const newMatch: Match = {
                ...match,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setMatches((prev) => [newMatch, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("matches").insert(matchToDb(newMatch));
                if (error) console.error("Match insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateMatch = useCallback(
        async (id: string, updates: Partial<Omit<Match, "id" | "createdAt">>) => {
            setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
            if (dbReady && supabase) {
                const { error } = await supabase.from("matches").update(matchToDb(updates)).eq("id", id);
                if (error) console.error("Match update failed:", error.message);
            }
        },
        [dbReady]
    );

    const deleteMatch = useCallback(
        async (id: string) => {
            const match = matches.find((m) => m.id === id);
            const remainingMatches = matches.filter((m) => m.id !== id);
            const rollbackUpdates: { id: string; updates: Partial<Player> }[] = [];

            if (match?.eloChanges?.length) {
                for (const change of match.eloChanges) {
                    const player = players.find((p) => p.id === change.playerId);
                    if (!player) continue;

                    const won = playerWasOnWinningTeam(match, change.playerId);
                    const updates: Partial<Player> = {
                        currentElo: round2(player.currentElo - change.delta),
                        matchesPlayed: Math.max(0, player.matchesPlayed - 1),
                        wins: Math.max(0, player.wins - (won ? 1 : 0)),
                        losses: Math.max(0, player.losses - (won ? 0 : 1)),
                        lastMatchAt: latestMatchAtForPlayer(remainingMatches, change.playerId) || "",
                    };

                    if (match.tournamentId) {
                        const stillPlayedTournament = remainingMatches.some(
                            (m) =>
                                m.tournamentId === match.tournamentId &&
                                getMatchPlayerIds(m).includes(change.playerId)
                        );
                        if (!stillPlayedTournament) {
                            updates.tournamentsPlayed = Math.max(0, player.tournamentsPlayed - 1);
                        }
                    }

                    rollbackUpdates.push({ id: change.playerId, updates });
                }
            }

            setPlayers((prev) =>
                prev.map((p) => {
                    const rollback = rollbackUpdates.find((u) => u.id === p.id);
                    return rollback ? { ...p, ...rollback.updates } : p;
                })
            );
            setMatches(() => remainingMatches);

            if (dbReady && supabase) {
                for (const rollback of rollbackUpdates) {
                    const { error } = await supabase
                        .from("players")
                        .update(playerToDb(rollback.updates))
                        .eq("id", rollback.id);
                    if (error) console.error("Player rollback failed:", error.message);
                }
                const { error } = await supabase.from("matches").delete().eq("id", id);
                if (error) console.error("Match delete failed:", error.message);
            }
        },
        [dbReady, matches, players]
    );

    const applyRecalculation = useCallback(
        async (
            playerUpdates: { id: string; updates: Partial<Player> }[],
            matchUpdates: { matchId: string; eloChanges: EloChange[] }[]
        ) => {
            setPlayers((prev) =>
                prev.map((p) => {
                    const u = playerUpdates.find((x) => x.id === p.id);
                    return u ? { ...p, ...u.updates } : p;
                })
            );
            setMatches((prev) =>
                prev.map((m) => {
                    const u = matchUpdates.find((x) => x.matchId === m.id);
                    return u ? { ...m, eloChanges: u.eloChanges } : m;
                })
            );
            if (dbReady && supabase) {
                for (const u of playerUpdates) {
                    await supabase.from("players").update(playerToDb(u.updates)).eq("id", u.id);
                }
                for (const u of matchUpdates) {
                    await supabase.from("matches").update({ elo_changes: u.eloChanges }).eq("id", u.matchId);
                }
            }
        },
        [dbReady]
    );

    // ---- Training ----
    const addTrainingSession = useCallback(
        async (s: Omit<TrainingSession, "id" | "createdAt">) => {
            const newSession: TrainingSession = {
                ...s,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setTrainingSessions((prev) => [newSession, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("training_sessions").insert(sessionToDb(newSession));
                if (error) console.error("Session insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateTrainingSession = useCallback(
        async (id: string, updates: Partial<Omit<TrainingSession, "id" | "createdAt">>) => {
            setTrainingSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
            if (dbReady && supabase) {
                await supabase.from("training_sessions").update(sessionToDb(updates)).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteTrainingSession = useCallback(
        async (id: string) => {
            setTrainingSessions((prev) => prev.filter((s) => s.id !== id));
            setTrainingVotes((prev) => prev.filter((v) => v.sessionId !== id));
            if (dbReady && supabase) {
                await supabase.from("training_sessions").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const voteTraining = useCallback(
        async (sessionId: string, playerId: string, status: "yes" | "no") => {
            const now = new Date().toISOString();
            setTrainingVotes((prev) => {
                const existing = prev.find((v) => v.sessionId === sessionId && v.playerId === playerId);
                if (existing) {
                    return prev.map((v) => (v.id === existing.id ? { ...v, status, votedAt: now } : v));
                }
                return [...prev, { id: crypto.randomUUID(), sessionId, playerId, status, votedAt: now }];
            });
            if (dbReady && supabase) {
                const { error } = await supabase
                    .from("training_votes")
                    .upsert(
                        { session_id: sessionId, player_id: playerId, status, voted_at: now },
                        { onConflict: "session_id,player_id" }
                    );
                if (error) console.error("Vote failed:", error.message);
            }
        },
        [dbReady]
    );

    // ---- Chi phí buổi tập ----
    const addSessionCost = useCallback(
        async (cost: Omit<SessionCost, "id" | "createdAt">) => {
            const newCost: SessionCost = {
                ...cost,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setSessionCosts((prev) => [...prev, newCost]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("session_costs").insert({
                    id: newCost.id,
                    session_id: newCost.sessionId,
                    label: newCost.label,
                    amount: newCost.amount,
                    category: newCost.category,
                });
                if (error) console.error("Session cost insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateSessionCost = useCallback(
        async (
            id: string,
            updates: Partial<Omit<SessionCost, "id" | "sessionId" | "createdAt">>
        ) => {
            setSessionCosts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.label !== undefined) row.label = updates.label;
                if (updates.amount !== undefined) row.amount = updates.amount;
                if (updates.category !== undefined) row.category = updates.category;
                const { error } = await supabase.from("session_costs").update(row).eq("id", id);
                if (error) console.error("Session cost update failed:", error.message);
            }
        },
        [dbReady]
    );

    const deleteSessionCost = useCallback(
        async (id: string) => {
            setSessionCosts((prev) => prev.filter((c) => c.id !== id));
            if (dbReady && supabase) {
                await supabase.from("session_costs").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const setSessionPayment = useCallback(
        async (sessionId: string, playerId: string, paid: boolean) => {
            const now = new Date().toISOString();
            setSessionPayments((prev) => {
                const existing = prev.find(
                    (p) => p.sessionId === sessionId && p.playerId === playerId
                );
                if (existing) {
                    return prev.map((p) =>
                        p.id === existing.id ? { ...p, paid, paidAt: now } : p
                    );
                }
                return [
                    ...prev,
                    { id: crypto.randomUUID(), sessionId, playerId, paid, paidAt: now },
                ];
            });
            if (dbReady && supabase) {
                const { error } = await supabase
                    .from("session_payments")
                    .upsert(
                        { session_id: sessionId, player_id: playerId, paid, paid_at: now },
                        { onConflict: "session_id,player_id" }
                    );
                if (error) console.error("Session payment failed:", error.message);
            }
        },
        [dbReady]
    );

    // ---- Đợt thu quỹ ----
    const addFundDrive = useCallback(
        async (drive: Omit<FundDrive, "id" | "createdAt">, memberIds: string[]) => {
            const newDrive: FundDrive = {
                ...drive,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            const newMembers: FundDriveMember[] = memberIds.map((pid) => ({
                id: crypto.randomUUID(),
                driveId: newDrive.id,
                playerId: pid,
                paid: false,
            }));
            setFundDrives((prev) => [newDrive, ...prev]);
            setFundDriveMembers((prev) => [...prev, ...newMembers]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("fund_drives").insert({
                    id: newDrive.id,
                    title: newDrive.title,
                    kind: newDrive.kind,
                    amount: newDrive.amount,
                    period: newDrive.period || null,
                    note: newDrive.note || null,
                });
                if (error) console.error("Fund drive insert failed:", error.message);
                if (newMembers.length > 0) {
                    const { error: mErr } = await supabase.from("fund_drive_members").insert(
                        newMembers.map((m) => ({
                            id: m.id,
                            drive_id: m.driveId,
                            player_id: m.playerId,
                            paid: false,
                        }))
                    );
                    if (mErr) console.error("Fund drive members insert failed:", mErr.message);
                }
            }
        },
        [dbReady]
    );

    const updateFundDrive = useCallback(
        async (id: string, updates: Partial<Omit<FundDrive, "id" | "createdAt">>) => {
            setFundDrives((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.title !== undefined) row.title = updates.title;
                if (updates.kind !== undefined) row.kind = updates.kind;
                if (updates.amount !== undefined) row.amount = updates.amount;
                if ("period" in updates) row.period = updates.period || null;
                if ("note" in updates) row.note = updates.note || null;
                await supabase.from("fund_drives").update(row).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteFundDrive = useCallback(
        async (id: string) => {
            setFundDrives((prev) => prev.filter((d) => d.id !== id));
            setFundDriveMembers((prev) => prev.filter((m) => m.driveId !== id));
            if (dbReady && supabase) {
                await supabase.from("fund_drives").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const addFundDriveMember = useCallback(
        async (driveId: string, playerId: string) => {
            const exists = fundDriveMembers.some(
                (m) => m.driveId === driveId && m.playerId === playerId
            );
            if (exists) return;
            const newMember: FundDriveMember = {
                id: crypto.randomUUID(),
                driveId,
                playerId,
                paid: false,
            };
            setFundDriveMembers((prev) => [...prev, newMember]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("fund_drive_members").insert({
                    id: newMember.id,
                    drive_id: driveId,
                    player_id: playerId,
                    paid: false,
                });
                if (error) console.error("Fund drive member insert failed:", error.message);
            }
        },
        [dbReady, fundDriveMembers]
    );

    const removeFundDriveMember = useCallback(
        async (driveId: string, playerId: string) => {
            setFundDriveMembers((prev) =>
                prev.filter((m) => !(m.driveId === driveId && m.playerId === playerId))
            );
            if (dbReady && supabase) {
                await supabase
                    .from("fund_drive_members")
                    .delete()
                    .eq("drive_id", driveId)
                    .eq("player_id", playerId);
            }
        },
        [dbReady]
    );

    const setFundDriveMemberPaid = useCallback(
        async (driveId: string, playerId: string, paid: boolean) => {
            const now = new Date().toISOString();
            setFundDriveMembers((prev) =>
                prev.map((m) =>
                    m.driveId === driveId && m.playerId === playerId
                        ? { ...m, paid, paidAt: paid ? now : undefined }
                        : m
                )
            );
            if (dbReady && supabase) {
                const { error } = await supabase
                    .from("fund_drive_members")
                    .update({ paid, paid_at: paid ? now : null })
                    .eq("drive_id", driveId)
                    .eq("player_id", playerId);
                if (error) console.error("Fund drive member update failed:", error.message);
            }
        },
        [dbReady]
    );

    const setFundDriveMemberAmount = useCallback(
        async (driveId: string, playerId: string, amount: number | null) => {
            setFundDriveMembers((prev) =>
                prev.map((m) =>
                    m.driveId === driveId && m.playerId === playerId
                        ? { ...m, amount: amount == null ? undefined : amount }
                        : m
                )
            );
            if (dbReady && supabase) {
                const { error } = await supabase
                    .from("fund_drive_members")
                    .update({ amount })
                    .eq("drive_id", driveId)
                    .eq("player_id", playerId);
                if (error) console.error("Fund drive member amount update failed:", error.message);
            }
        },
        [dbReady]
    );

    // ---- Tournaments ----
    const addTournament = useCallback(
        async (t: Omit<Tournament, "id" | "createdAt">) => {
            const newTournament: Tournament = {
                ...t,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setTournaments((prev) => [newTournament, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("tournaments").insert({
                    id: newTournament.id,
                    name: newTournament.name,
                    tournament_date: newTournament.tournamentDate,
                    status: newTournament.status,
                    format: newTournament.format || "double_elim",
                    note: newTournament.note || null,
                });
                if (error) console.error("Tournament insert failed:", error.message);
            }
            return newTournament.id;
        },
        [dbReady]
    );

    const updateTournament = useCallback(
        async (id: string, updates: Partial<Omit<Tournament, "id" | "createdAt">>) => {
            setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.name !== undefined) row.name = updates.name;
                if (updates.tournamentDate !== undefined) row.tournament_date = updates.tournamentDate;
                if (updates.status !== undefined) row.status = updates.status;
                if (updates.format !== undefined) row.format = updates.format;
                if (updates.note !== undefined) row.note = updates.note || null;
                await supabase.from("tournaments").update(row).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteTournament = useCallback(
        async (id: string) => {
            setTournaments((prev) => prev.filter((t) => t.id !== id));
            setTournamentTeams((prev) => prev.filter((t) => t.tournamentId !== id));
            if (dbReady && supabase) {
                await supabase.from("tournaments").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const addTournamentTeam = useCallback(
        async (team: Omit<TournamentTeam, "id" | "createdAt">) => {
            const newTeam: TournamentTeam = {
                ...team,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setTournamentTeams((prev) => [...prev, newTeam]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("tournament_teams").insert({
                    id: newTeam.id,
                    tournament_id: newTeam.tournamentId,
                    name: newTeam.name,
                    player1_id: newTeam.player1Id,
                    player2_id: newTeam.player2Id,
                    group_name: newTeam.groupName,
                });
                if (error) console.error("Team insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateTournamentTeam = useCallback(
        async (id: string, updates: Partial<Omit<TournamentTeam, "id" | "createdAt">>) => {
            setTournamentTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.name !== undefined) row.name = updates.name;
                if (updates.player1Id !== undefined) row.player1_id = updates.player1Id;
                if (updates.player2Id !== undefined) row.player2_id = updates.player2Id;
                if (updates.groupName !== undefined) row.group_name = updates.groupName;
                await supabase.from("tournament_teams").update(row).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteTournamentTeam = useCallback(
        async (id: string) => {
            setTournamentTeams((prev) => prev.filter((t) => t.id !== id));
            if (dbReady && supabase) {
                await supabase.from("tournament_teams").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    // ---- Transactions ----
    const addTransaction = useCallback(
        async (tx: Omit<Transaction, "id" | "createdAt">) => {
            const newTx: Transaction = {
                ...tx,
                id: generateId(),
                createdAt: new Date().toISOString(),
            };
            setTransactions((prev) => [newTx, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("transactions").insert({
                    id: newTx.id,
                    type: newTx.type,
                    amount: newTx.amount,
                    description: newTx.description,
                    category: newTx.category,
                    player_id: newTx.playerId || null,
                    date: newTx.date,
                });
                if (error) console.error("Transaction insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateTransaction = useCallback(
        async (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => {
            setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.type !== undefined) row.type = updates.type;
                if (updates.amount !== undefined) row.amount = updates.amount;
                if (updates.description !== undefined) row.description = updates.description;
                if (updates.category !== undefined) row.category = updates.category;
                if ("playerId" in updates) row.player_id = updates.playerId ?? null;
                if (updates.date !== undefined) row.date = updates.date;
                const { error } = await supabase.from("transactions").update(row).eq("id", id);
                if (error) console.error("Transaction update failed:", error.message);
            }
        },
        [dbReady]
    );

    const deleteTransaction = useCallback(
        async (id: string) => {
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            if (dbReady && supabase) {
                await supabase.from("transactions").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // ---- Announcements ----
    const addAnnouncement = useCallback(
        async (a: Omit<Announcement, "id" | "createdAt">) => {
            const newAnnouncement: Announcement = {
                ...a,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            setAnnouncements((prev) => [newAnnouncement, ...prev]);
            if (dbReady && supabase) {
                const { error } = await supabase.from("announcements").insert({
                    id: newAnnouncement.id,
                    title: newAnnouncement.title,
                    content: newAnnouncement.content,
                    is_pinned: newAnnouncement.isPinned,
                });
                if (error) console.error("Announcement insert failed:", error.message);
            }
        },
        [dbReady]
    );

    const updateAnnouncement = useCallback(
        async (id: string, updates: Partial<Omit<Announcement, "id" | "createdAt">>) => {
            setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
            if (dbReady && supabase) {
                const row: Record<string, unknown> = {};
                if (updates.title !== undefined) row.title = updates.title;
                if (updates.content !== undefined) row.content = updates.content;
                if (updates.isPinned !== undefined) row.is_pinned = updates.isPinned;
                await supabase.from("announcements").update(row).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteAnnouncement = useCallback(
        async (id: string) => {
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            if (dbReady && supabase) {
                await supabase.from("announcements").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    return (
        <ClubContext.Provider
            value={{
                players,
                addPlayer,
                updatePlayer,
                deletePlayer,
                getPlayer,
                matches,
                recordMatch,
                addMatch,
                updateMatch,
                deleteMatch,
                applyRecalculation,
                trainingSessions,
                addTrainingSession,
                updateTrainingSession,
                deleteTrainingSession,
                trainingVotes,
                voteTraining,
                sessionCosts,
                addSessionCost,
                updateSessionCost,
                deleteSessionCost,
                sessionPayments,
                setSessionPayment,
                fundDrives,
                fundDriveMembers,
                addFundDrive,
                updateFundDrive,
                deleteFundDrive,
                addFundDriveMember,
                removeFundDriveMember,
                setFundDriveMemberPaid,
                setFundDriveMemberAmount,
                tournaments,
                addTournament,
                updateTournament,
                deleteTournament,
                tournamentTeams,
                addTournamentTeam,
                updateTournamentTeam,
                deleteTournamentTeam,
                transactions,
                addTransaction,
                updateTransaction,
                deleteTransaction,
                totalIncome,
                totalExpense,
                balance,
                announcements,
                addAnnouncement,
                updateAnnouncement,
                deleteAnnouncement,
                isLoading,
                reloadData: loadData,
            }}
        >
            {children}
        </ClubContext.Provider>
    );
}

export function useClub() {
    const ctx = useContext(ClubContext);
    if (!ctx) throw new Error("useClub must be used within ClubProvider");
    return ctx;
}
