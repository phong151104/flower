// ============ LOGIC TÀI CHÍNH CLB (pure functions) ============
// Chi phí mỗi buổi tập được chia đều cho những người vote "đi tập".
// share = tổng chi phí buổi / số người đi.

import type {
    SessionCost,
    SessionCostCategory,
    SessionPayment,
    TrainingSession,
    TrainingVote,
    Player,
    FundDrive,
    FundDriveMember,
    Transaction,
} from "@/types/club";

export const SESSION_COST_LABEL: Record<SessionCostCategory, string> = {
    tien_san: "Tiền sân",
    tien_nuoc: "Tiền nước",
    tien_bong: "Tiền bóng",
    khac: "Khác",
};

export const SESSION_COST_ICON: Record<SessionCostCategory, string> = {
    tien_san: "🏟️",
    tien_nuoc: "💧",
    tien_bong: "🎾",
    khac: "🧾",
};

export function formatVND(n: number): string {
    return Math.round(n).toLocaleString("vi-VN") + "₫";
}

/** Danh sách id người "đi tập" (vote yes) của một buổi — đây là nhóm chia tiền. */
export function getSessionAttendees(sessionId: string, votes: TrainingVote[]): string[] {
    return votes
        .filter((v) => v.sessionId === sessionId && v.status === "yes")
        .map((v) => v.playerId);
}

/** Tổng chi phí của một buổi. */
export function getSessionTotal(sessionId: string, costs: SessionCost[]): number {
    return costs
        .filter((c) => c.sessionId === sessionId)
        .reduce((sum, c) => sum + c.amount, 0);
}

/** Số tiền mỗi người phải đóng cho buổi (0 nếu chưa có ai đi). */
export function getSessionShare(
    sessionId: string,
    costs: SessionCost[],
    votes: TrainingVote[]
): number {
    const total = getSessionTotal(sessionId, costs);
    const attendees = getSessionAttendees(sessionId, votes);
    if (attendees.length === 0) return 0;
    return total / attendees.length;
}

export function isSessionPaid(
    sessionId: string,
    playerId: string,
    payments: SessionPayment[]
): boolean {
    return payments.some(
        (p) => p.sessionId === sessionId && p.playerId === playerId && p.paid
    );
}

export interface SessionFinance {
    total: number;
    attendees: string[];
    share: number;
    paidPlayerIds: string[];
    paidCount: number;
    collected: number; // tiền đã thu
    outstanding: number; // tiền còn thiếu
}

/** Tổng hợp tài chính của một buổi tập. */
export function getSessionFinance(
    sessionId: string,
    costs: SessionCost[],
    votes: TrainingVote[],
    payments: SessionPayment[]
): SessionFinance {
    const total = getSessionTotal(sessionId, costs);
    const attendees = getSessionAttendees(sessionId, votes);
    const share = attendees.length === 0 ? 0 : total / attendees.length;
    const paidPlayerIds = attendees.filter((pid) => isSessionPaid(sessionId, pid, payments));
    const collected = paidPlayerIds.length * share;
    return {
        total,
        attendees,
        share,
        paidPlayerIds,
        paidCount: paidPlayerIds.length,
        collected,
        outstanding: total - collected,
    };
}

export interface PlayerDebt {
    playerId: string;
    itemCount: number; // số hạng mục phải đóng (buổi có chi phí + đợt thu quỹ)
    owed: number; // tổng phải đóng (chi phí buổi + quỹ)
    paid: number; // tổng đã đóng
    outstanding: number; // còn nợ
    unpaidSessions: string[]; // id các buổi chưa đóng
    unpaidDrives: string[]; // id các đợt thu chưa đóng
}

/** Công nợ của một người trên mọi hạng mục: chi phí buổi tập + các đợt thu quỹ. */
export function getPlayerDebt(
    playerId: string,
    sessions: TrainingSession[],
    costs: SessionCost[],
    votes: TrainingVote[],
    payments: SessionPayment[],
    drives: FundDrive[] = [],
    driveMembers: FundDriveMember[] = []
): PlayerDebt {
    let owed = 0;
    let paid = 0;
    let itemCount = 0;
    const unpaidSessions: string[] = [];
    const unpaidDrives: string[] = [];

    // Chi phí buổi tập (chia theo người đi)
    for (const s of sessions) {
        const total = getSessionTotal(s.id, costs);
        if (total <= 0) continue; // buổi chưa có chi phí thì bỏ qua
        const attendees = getSessionAttendees(s.id, votes);
        if (!attendees.includes(playerId)) continue;
        const share = total / attendees.length;
        owed += share;
        itemCount += 1;
        if (isSessionPaid(s.id, playerId, payments)) {
            paid += share;
        } else {
            unpaidSessions.push(s.id);
        }
    }

    // Đợt thu quỹ (quỹ tháng / quỹ giải / tùy chỉnh)
    for (const d of drives) {
        const m = driveMembers.find((x) => x.driveId === d.id && x.playerId === playerId);
        if (!m) continue;
        const amt = m.amount == null ? d.amount : m.amount;
        owed += amt;
        itemCount += 1;
        if (m.paid) {
            paid += amt;
        } else {
            unpaidDrives.push(d.id);
        }
    }

    return {
        playerId,
        itemCount,
        owed,
        paid,
        outstanding: owed - paid,
        unpaidSessions,
        unpaidDrives,
    };
}

// ============ ĐỢT THU QUỸ ============

export interface FundDriveSummary {
    total: number; // số người × số tiền
    paidCount: number;
    memberCount: number;
    collected: number; // đã thu
    outstanding: number; // còn thiếu
}

export function getDriveMembers(driveId: string, members: FundDriveMember[]): FundDriveMember[] {
    return members.filter((m) => m.driveId === driveId);
}

/** Số tiền một người phải đóng trong đợt: tiền riêng nếu có, không thì mức mặc định. */
export function driveMemberAmount(drive: FundDrive, member: FundDriveMember): number {
    return member.amount == null ? drive.amount : member.amount;
}

export function getDriveSummary(drive: FundDrive, members: FundDriveMember[]): FundDriveSummary {
    const list = getDriveMembers(drive.id, members);
    let total = 0;
    let collected = 0;
    let paidCount = 0;
    for (const m of list) {
        const amt = driveMemberAmount(drive, m);
        total += amt;
        if (m.paid) {
            collected += amt;
            paidCount += 1;
        }
    }
    return {
        total,
        paidCount,
        memberCount: list.length,
        collected,
        outstanding: total - collected,
    };
}

/** Công nợ của tất cả thành viên trên mọi hạng mục, sắp xếp theo còn nợ giảm dần. */
export function getAllDebts(
    players: Player[],
    sessions: TrainingSession[],
    costs: SessionCost[],
    votes: TrainingVote[],
    payments: SessionPayment[],
    drives: FundDrive[] = [],
    driveMembers: FundDriveMember[] = []
): PlayerDebt[] {
    return players
        .map((p) => getPlayerDebt(p.id, sessions, costs, votes, payments, drives, driveMembers))
        .filter((d) => d.itemCount > 0)
        .sort((a, b) => b.outstanding - a.outstanding || b.owed - a.owed);
}

// ============ TỔNG HỢP (gộp mọi hạng mục — tiền sân/nước CÓ tính vào quỹ) ============

export interface FinanceInput {
    transactions: Transaction[];
    sessions: TrainingSession[];
    sessionCosts: SessionCost[];
    votes: TrainingVote[];
    payments: SessionPayment[];
    drives: FundDrive[];
    driveMembers: FundDriveMember[];
}

/** Tháng (YYYY-MM) của một đợt thu: ưu tiên period, không thì theo created_at. */
function driveMonth(d: FundDrive): string {
    return d.period || (d.createdAt || "").slice(0, 7);
}

export interface OverallTotals {
    thu: number; // tổng đã thu (quỹ đã đóng + tiền buổi đã thu + thu giao dịch)
    chi: number; // tổng đã chi (chi giao dịch + chi phí buổi)
    conLai: number;
}

// LƯU Ý: tiền sân/nước theo buổi (session costs/payments) KHÔNG tính vào tổng quỹ.
// Tổng quỹ chỉ gồm: quỹ tháng/đợt thu (fund drives) + thu/chi trong giao dịch.
export function getOverallTotals(input: FinanceInput): OverallTotals {
    let thu = 0;
    let chi = 0;
    for (const t of input.transactions) {
        if (t.type === "income") thu += t.amount;
        else chi += t.amount;
    }
    for (const d of input.drives) {
        thu += getDriveSummary(d, input.driveMembers).collected;
    }
    return { thu, chi, conLai: thu - chi };
}

export interface MonthRow {
    month: string; // YYYY-MM
    thu: number;
    chi: number;
}

/** Tổng thu/chi theo từng tháng (gộp giao dịch + chi phí buổi + đợt thu quỹ). */
export function getMonthlyBreakdown(input: FinanceInput): MonthRow[] {
    const map = new Map<string, MonthRow>();
    const bump = (month: string, thu: number, chi: number) => {
        if (!month) return;
        const cur = map.get(month) || { month, thu: 0, chi: 0 };
        cur.thu += thu;
        cur.chi += chi;
        map.set(month, cur);
    };
    for (const t of input.transactions) {
        const m = (t.date || "").slice(0, 7);
        if (t.type === "income") bump(m, t.amount, 0);
        else bump(m, 0, t.amount);
    }
    for (const d of input.drives) {
        const sum = getDriveSummary(d, input.driveMembers);
        if (sum.collected > 0) bump(driveMonth(d), sum.collected, 0);
    }
    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
}
