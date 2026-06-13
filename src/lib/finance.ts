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
    sessionCount: number; // số buổi có chi phí mà người này tham gia
    owed: number; // tổng phải đóng
    paid: number; // tổng đã đóng
    outstanding: number; // còn nợ
    unpaidSessions: string[]; // id các buổi chưa đóng
}

/** Công nợ của một người trên tất cả các buổi có chi phí. */
export function getPlayerDebt(
    playerId: string,
    sessions: TrainingSession[],
    costs: SessionCost[],
    votes: TrainingVote[],
    payments: SessionPayment[]
): PlayerDebt {
    let owed = 0;
    let paid = 0;
    let sessionCount = 0;
    const unpaidSessions: string[] = [];

    for (const s of sessions) {
        const total = getSessionTotal(s.id, costs);
        if (total <= 0) continue; // buổi chưa có chi phí thì bỏ qua
        const attendees = getSessionAttendees(s.id, votes);
        if (!attendees.includes(playerId)) continue;
        const share = total / attendees.length;
        owed += share;
        sessionCount += 1;
        if (isSessionPaid(s.id, playerId, payments)) {
            paid += share;
        } else {
            unpaidSessions.push(s.id);
        }
    }

    return {
        playerId,
        sessionCount,
        owed,
        paid,
        outstanding: owed - paid,
        unpaidSessions,
    };
}

/** Công nợ của tất cả thành viên, sắp xếp theo còn nợ giảm dần. */
export function getAllDebts(
    players: Player[],
    sessions: TrainingSession[],
    costs: SessionCost[],
    votes: TrainingVote[],
    payments: SessionPayment[]
): PlayerDebt[] {
    return players
        .map((p) => getPlayerDebt(p.id, sessions, costs, votes, payments))
        .filter((d) => d.sessionCount > 0)
        .sort((a, b) => b.outstanding - a.outstanding || b.owed - a.owed);
}
