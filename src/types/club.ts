// ============ KIỂU DỮ LIỆU CLB PICKLEBALL ============

export type Tier = 1 | 2 | 3 | 4;

export type Gender = "nam" | "nu" | "khac";

export interface Player {
    id: string;
    name: string;
    nickname?: string;
    avatarUrl?: string;
    tier: Tier;
    initialElo: number;
    currentElo: number;
    matchesPlayed: number;
    tournamentsPlayed: number;
    wins: number;
    losses: number;
    lastMatchAt?: string;
    isActive: boolean;
    gender?: Gender;
    createdAt: string;
}

export type MatchRound =
    // Thể thức cũ (group_knockout)
    | "group"
    | "semi"
    | "third"
    | "final"
    // Thể thức double-elimination
    | "seeding" // vòng xác định seed (nhất gặp nhất...)
    | "ur1" // play-in nhánh thắng (seed3v6, seed4v5)
    | "ur2" // nhánh thắng vòng 2 (seed1/seed2)
    | "ur3" // chung kết nhánh thắng
    | "lr1" // nhánh thua vòng 1
    | "lr2"
    | "lr3"
    | "lr_final" // chung kết nhánh thua
    | "grand_final"; // chung kết

export interface EloChange {
    playerId: string;
    before: number;
    after: number;
    delta: number;
    k: number;
    h: number;
    m: number;
    expected: number;
}

export interface Match {
    id: string;
    matchType: "training" | "tournament";
    tournamentId?: string;
    round?: MatchRound;
    playedAt: string;
    teamAPlayer1: string;
    teamAPlayer2: string;
    teamBPlayer1: string;
    teamBPlayer2: string;
    scoreA: number;
    scoreB: number;
    winner: "A" | "B";
    eloChanges: EloChange[];
    recordedBy?: string;
    createdAt: string;
}

export interface TrainingSession {
    id: string;
    title: string;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    note?: string;
    archived?: boolean;
    createdAt: string;
}

export interface TrainingVote {
    id: string;
    sessionId: string;
    playerId: string;
    status: "yes" | "no";
    votedAt: string;
}

export type TournamentStatus = "draft" | "group" | "knockout" | "completed";

export type TournamentFormat = "group_knockout" | "double_elim";

export interface Tournament {
    id: string;
    name: string;
    tournamentDate: string;
    status: TournamentStatus;
    format: TournamentFormat;
    note?: string;
    createdAt: string;
}

export interface TournamentTeam {
    id: string;
    tournamentId: string;
    name: string;
    player1Id: string;
    player2Id: string;
    groupName: "A" | "B";
    createdAt: string;
}

export type SessionCostCategory = "tien_san" | "tien_nuoc" | "tien_bong" | "khac";

/** Một khoản chi của buổi tập (tiền sân, tiền nước, tiền bóng...). */
export interface SessionCost {
    id: string;
    sessionId: string;
    label: string;
    amount: number;
    category: SessionCostCategory;
    createdAt: string;
}

/** Trạng thái đóng tiền của một người cho một buổi tập. */
export interface SessionPayment {
    id: string;
    sessionId: string;
    playerId: string;
    paid: boolean;
    paidAt: string;
}

export type FundDriveKind = "monthly" | "custom";

/** Một đợt thu quỹ (quỹ tháng / quỹ giải / tùy chỉnh) — số tiền cố định mỗi người. */
export interface FundDrive {
    id: string;
    title: string;
    kind: FundDriveKind;
    amount: number;
    period?: string; // 'YYYY-MM' cho quỹ tháng
    note?: string;
    createdAt: string;
}

/** Người trong một đợt thu + trạng thái đã đóng hay chưa. */
export interface FundDriveMember {
    id: string;
    driveId: string;
    playerId: string;
    paid: boolean;
    amount?: number; // tiền riêng người này (undefined = dùng mức mặc định của đợt)
    paidAt?: string;
}

export type TransactionCategory = "tien_san" | "bong" | "quy_thang" | "khac";

export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    category: TransactionCategory;
    playerId?: string;
    date: string;
    createdAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
}

export type RankStatus = "official" | "inactive";
