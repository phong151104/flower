"use client";

import { useMemo, useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { SessionCostCategory } from "@/types/club";
import {
    getSessionShare,
    getSessionTotal,
    isSessionPaid,
    formatVND,
} from "@/lib/finance";
import { Plus, Trash2, Check, CalendarDays } from "lucide-react";

const COST_ROWS: { category: SessionCostCategory; label: string; icon: string }[] = [
    { category: "tien_san", label: "Sân", icon: "🏟️" },
    { category: "tien_nuoc", label: "Nước", icon: "💧" },
    { category: "khac", label: "Khác", icon: "🧾" },
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
    const [editCell, setEditCell] = useState<string | null>(null);

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
            {/* Thanh điều khiển */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-2xl shadow-card px-4 py-3">
                <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-court-600" />
                    <span className="text-sm text-gray-500">Tháng</span>
                    <select
                        value={activeMonth}
                        onChange={(e) => setMonth(e.target.value)}
                        className="px-3 py-2 bg-navy-50 border border-navy-200 rounded-xl text-sm font-medium focus:outline-none focus:border-court-500"
                    >
                        {monthsAvail.length === 0 && (
                            <option value={activeMonth}>
                                T{Number(activeMonth.slice(5))}/{activeMonth.slice(0, 4)}
                            </option>
                        )}
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-court-600 hover:bg-court-700 text-white rounded-full text-sm font-medium transition-colors"
                    >
                        <Plus size={16} /> Thêm buổi
                    </button>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400 text-sm">
                    Tháng này chưa có buổi nào. Chọn ngày rồi bấm &ldquo;Thêm buổi&rdquo;.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
                    <table className="text-sm border-collapse min-w-max">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-10 bg-navy-50 border-b-2 border-r border-navy-100 px-4 py-3 text-left font-semibold text-gray-500 min-w-[120px]">
                                    Thành viên
                                </th>
                                {sessions.map((s) => {
                                    const dl = dateLabel(s.sessionDate);
                                    const share = getSessionShare(s.id, sessionCosts, trainingVotes);
                                    return (
                                        <th
                                            key={s.id}
                                            className="border-b-2 border-l border-navy-100 px-3 py-2.5 min-w-[116px] bg-navy-50/50"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-navy-900">
                                                        {dl.day}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-normal">
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
                                                    <span className="text-[10px] font-medium bg-ball-100 text-ball-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {formatVND(share)}/người
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((p) => (
                                <tr key={p.id} className="border-b border-navy-50">
                                    <td className="sticky left-0 z-10 bg-white border-r border-navy-100 px-4 py-2 font-medium text-navy-900">
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
                                                className={`border-l border-navy-50 px-2 py-2 align-top ${
                                                    di ? "bg-court-50/40" : ""
                                                }`}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            voteTraining(
                                                                s.id,
                                                                p.id,
                                                                di ? "no" : "yes"
                                                            )
                                                        }
                                                        title={di ? "Bỏ tham gia" : "Tham gia"}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                                                            di
                                                                ? "bg-court-600 text-white"
                                                                : "border-2 border-navy-200 text-transparent hover:border-court-400"
                                                        }`}
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    {di && (
                                                        <>
                                                            <span className="text-[11px] font-mono text-gray-500">
                                                                {share > 0 ? formatVND(share) : "—"}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    setSessionPayment(
                                                                        s.id,
                                                                        p.id,
                                                                        !paid
                                                                    )
                                                                }
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                                                                    paid
                                                                        ? "bg-court-100 text-court-700"
                                                                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                                }`}
                                                            >
                                                                {paid ? "đã trả" : "chưa"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Chi phí Sân / Nước / Khác */}
                            {COST_ROWS.map((cr, ri) => (
                                <tr
                                    key={cr.category}
                                    className={`bg-ball-50/40 ${ri === 0 ? "border-t-2 border-navy-100" : ""}`}
                                >
                                    <td className="sticky left-0 z-10 bg-ball-50 border-r border-navy-100 px-4 py-1.5 font-medium text-gray-600">
                                        <span className="mr-1">{cr.icon}</span>
                                        {cr.label}
                                    </td>
                                    {sessions.map((s) => {
                                        const key = `${s.id}:${cr.category}`;
                                        const c = costFor(s.id, cr.category);
                                        const val = c?.amount ?? 0;
                                        return (
                                            <td
                                                key={s.id}
                                                className="border-l border-navy-50 px-1.5 py-1 text-right"
                                            >
                                                {editCell === key ? (
                                                    <input
                                                        autoFocus
                                                        defaultValue={val > 0 ? String(val) : ""}
                                                        inputMode="numeric"
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
                                                            setEditCell(null);
                                                        }}
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            (e.target as HTMLInputElement).blur()
                                                        }
                                                        className="w-full px-1.5 py-1 text-right text-xs font-mono bg-white border border-court-400 rounded focus:outline-none"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => setEditCell(key)}
                                                        className="w-full px-1.5 py-1 text-right text-xs font-mono rounded hover:bg-white text-navy-900"
                                                    >
                                                        {val > 0 ? (
                                                            formatVND(val)
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="bg-navy-50 border-t-2 border-navy-100 font-bold text-navy-900">
                                <td className="sticky left-0 z-10 bg-navy-50 border-r border-navy-100 px-4 py-2.5">
                                    Tổng
                                </td>
                                {sessions.map((s) => (
                                    <td
                                        key={s.id}
                                        className="border-l border-navy-100 px-2 py-2.5 text-right font-mono"
                                    >
                                        {formatVND(getSessionTotal(s.id, sessionCosts))}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
                Ô vuông xanh = đã điểm danh tham gia. Pill <span className="text-court-700">đã trả</span> /{" "}
                <span className="text-amber-700">chưa</span> để đánh dấu đóng tiền buổi. Bấm vào ô
                Sân/Nước/Khác để nhập tiền. Tiền/người = (Sân + Nước + Khác) ÷ số người tham gia.
                Đồng bộ với trang Lịch tập.
            </p>
        </div>
    );
}
