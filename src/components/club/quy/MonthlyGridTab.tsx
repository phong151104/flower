"use client";

import { useMemo, useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { SessionCostCategory } from "@/types/club";
import {
    getSessionShare,
    getSessionTotal,
    getSessionAttendees,
    isSessionPaid,
    formatVND,
} from "@/lib/finance";
import { Plus, Trash2, Check } from "lucide-react";

const COST_ROWS: { category: SessionCostCategory; label: string }[] = [
    { category: "tien_san", label: "Sân" },
    { category: "tien_nuoc", label: "Nước" },
    { category: "khac", label: "Khác" },
];

function dateLabel(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const wd = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
    return { day: `${d.getDate()}/${d.getMonth() + 1}`, wd };
}

export default function MonthlyGridTab() {
    const {
        players,
        trainingSessions,
        trainingVotes,
        sessionCosts,
        sessionPayments,
        voteTraining,
        setSessionPayment,
        addSessionCost,
        updateSessionCost,
        addTrainingSession,
        deleteTrainingSession,
    } = useClub();

    const monthsAvail = useMemo(() => {
        const set = new Set(trainingSessions.map((s) => s.sessionDate.slice(0, 7)));
        return Array.from(set).sort((a, b) => b.localeCompare(a));
    }, [trainingSessions]);

    const [month, setMonth] = useState(monthsAvail[0] || new Date().toISOString().slice(0, 7));
    const [newDate, setNewDate] = useState("");

    const activeMonth = monthsAvail.includes(month) ? month : monthsAvail[0] || month;

    const sessions = trainingSessions
        .filter((s) => s.sessionDate.slice(0, 7) === activeMonth)
        .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

    const members = [...players]
        .filter((p) => p.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    const isYes = (sid: string, pid: string) =>
        trainingVotes.some((v) => v.sessionId === sid && v.playerId === pid && v.status === "yes");
    const costFor = (sid: string, cat: SessionCostCategory) =>
        sessionCosts.find((c) => c.sessionId === sid && c.category === cat);

    const setCost = async (sid: string, cat: SessionCostCategory, label: string, amount: number) => {
        const existing = costFor(sid, cat);
        if (existing) {
            if (amount !== existing.amount) await updateSessionCost(existing.id, { amount });
        } else if (amount > 0) {
            await addSessionCost({ sessionId: sid, label, amount, category: cat });
        }
    };

    const addSession = async () => {
        if (!newDate) return;
        await addTrainingSession({ title: "Buổi tập", sessionDate: newDate });
        setMonth(newDate.slice(0, 7));
        setNewDate("");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-500">Tháng:</label>
                    <select
                        value={activeMonth}
                        onChange={(e) => setMonth(e.target.value)}
                        className="px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                    >
                        {monthsAvail.length === 0 && <option value={activeMonth}>{activeMonth}</option>}
                        {monthsAvail.map((m) => (
                            <option key={m} value={m}>
                                T{Number(m.slice(5))}/{m.slice(0, 4)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                    />
                    <button
                        onClick={addSession}
                        className="flex items-center gap-1.5 px-4 py-2 bg-court-600 hover:bg-court-700 text-white rounded-full text-sm font-medium"
                    >
                        <Plus size={16} /> Thêm buổi
                    </button>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                    Tháng này chưa có buổi nào. Chọn ngày rồi bấm &ldquo;Thêm buổi&rdquo;.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
                    <table className="text-sm border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-navy-100">
                                <th className="px-3 py-2 text-left font-medium text-gray-400 sticky left-0 bg-white min-w-[120px]">
                                    Thành viên
                                </th>
                                {sessions.map((s) => {
                                    const dl = dateLabel(s.sessionDate);
                                    const share = getSessionShare(
                                        s.id,
                                        sessionCosts,
                                        trainingVotes
                                    );
                                    return (
                                        <th
                                            key={s.id}
                                            className="px-3 py-2 text-center font-medium text-navy-900 border-l border-navy-100 min-w-[110px]"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                {dl.day}
                                                <span className="text-gray-400 font-normal">
                                                    {dl.wd}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Xóa buổi ${dl.day}? (mất chi phí/điểm danh của buổi)`
                                                            )
                                                        )
                                                            deleteTrainingSession(s.id);
                                                    }}
                                                    className="text-gray-300 hover:text-red-500"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            {share > 0 && (
                                                <div className="text-[10px] font-normal text-ball-600">
                                                    {formatVND(share)}/ng
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((p) => (
                                <tr key={p.id} className="border-b border-navy-50">
                                    <td className="px-3 py-1.5 font-medium text-navy-900 sticky left-0 bg-white">
                                        {p.name}
                                    </td>
                                    {sessions.map((s) => {
                                        const di = isYes(s.id, p.id);
                                        const paid = isSessionPaid(s.id, p.id, sessionPayments);
                                        const share = getSessionShare(
                                            s.id,
                                            sessionCosts,
                                            trainingVotes
                                        );
                                        return (
                                            <td
                                                key={s.id}
                                                className="px-2 py-1.5 text-center border-l border-navy-50"
                                            >
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={di}
                                                        onChange={(e) =>
                                                            voteTraining(
                                                                s.id,
                                                                p.id,
                                                                e.target.checked ? "yes" : "no"
                                                            )
                                                        }
                                                        title="Tham gia"
                                                        className="w-4 h-4 accent-court-600 cursor-pointer"
                                                    />
                                                    {di && (
                                                        <button
                                                            onClick={() =>
                                                                setSessionPayment(
                                                                    s.id,
                                                                    p.id,
                                                                    !paid
                                                                )
                                                            }
                                                            title={paid ? "Đã trả" : "Chưa trả"}
                                                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                                                                paid
                                                                    ? "bg-court-600 text-white"
                                                                    : "bg-navy-100 text-gray-400 hover:bg-navy-200"
                                                            }`}
                                                        >
                                                            {paid ? <Check size={12} /> : "đ"}
                                                        </button>
                                                    )}
                                                </div>
                                                {di && share > 0 && (
                                                    <div className="text-[10px] text-gray-400">
                                                        {formatVND(share)}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Hàng chi phí Sân / Nước / Khác */}
                            {COST_ROWS.map((cr) => (
                                <tr key={cr.category} className="border-b border-navy-50 bg-navy-50/30">
                                    <td className="px-3 py-1.5 font-medium text-gray-500 sticky left-0 bg-navy-50/30">
                                        {cr.label}
                                    </td>
                                    {sessions.map((s) => {
                                        const c = costFor(s.id, cr.category);
                                        return (
                                            <td
                                                key={s.id}
                                                className="px-2 py-1 border-l border-navy-50"
                                            >
                                                <input
                                                    key={`${s.id}-${cr.category}-${c?.amount ?? 0}`}
                                                    defaultValue={c ? String(c.amount) : ""}
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    onBlur={(e) => {
                                                        const v = parseInt(
                                                            e.target.value.replace(/\D/g, ""),
                                                            10
                                                        );
                                                        setCost(
                                                            s.id,
                                                            cr.category,
                                                            cr.label,
                                                            isNaN(v) ? 0 : v
                                                        );
                                                    }}
                                                    className="w-full px-1 py-1 text-right text-xs font-mono bg-transparent rounded hover:bg-white focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="font-semibold text-navy-900">
                                <td className="px-3 py-2 sticky left-0 bg-white">Tổng</td>
                                {sessions.map((s) => (
                                    <td
                                        key={s.id}
                                        className="px-2 py-2 text-right font-mono border-l border-navy-50"
                                    >
                                        {formatVND(getSessionTotal(s.id, sessionCosts))}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-gray-400">
                Ô vuông = tham gia (điểm danh). Nút <span className="font-medium">đ</span> = đánh dấu
                đã trả tiền buổi. Tiền/người = (Sân + Nước + Khác) / số người tham gia. Đồng bộ với
                trang Lịch tập.
            </p>
        </div>
    );
}
