"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { TrainingSession, SessionCostCategory } from "@/types/club";
import {
    getSessionFinance,
    formatVND,
    SESSION_COST_LABEL,
    SESSION_COST_ICON,
} from "@/lib/finance";
import { Wallet, Plus, Trash2, Check, ChevronDown, ChevronUp, Receipt } from "lucide-react";

const CATEGORIES: SessionCostCategory[] = ["tien_san", "tien_nuoc", "tien_bong", "khac"];

export default function SessionCostPanel({
    session,
    defaultExpanded = false,
}: {
    session: TrainingSession;
    defaultExpanded?: boolean;
}) {
    const {
        players,
        trainingVotes,
        sessionCosts,
        sessionPayments,
        addSessionCost,
        deleteSessionCost,
        setSessionPayment,
    } = useClub();

    const [expanded, setExpanded] = useState(defaultExpanded);
    const [showAdd, setShowAdd] = useState(false);
    const [category, setCategory] = useState<SessionCostCategory>("tien_san");
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    const costs = sessionCosts.filter((c) => c.sessionId === session.id);
    const fin = getSessionFinance(session.id, sessionCosts, trainingVotes, sessionPayments);
    const playerName = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const handleAddCost = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(amount.replace(/\D/g, ""), 10);
        if (isNaN(amt) || amt <= 0) {
            setError("Số tiền không hợp lệ");
            return;
        }
        await addSessionCost({
            sessionId: session.id,
            label: label.trim() || SESSION_COST_LABEL[category],
            amount: amt,
            category,
        });
        setLabel("");
        setAmount("");
        setError("");
        setShowAdd(false);
    };

    return (
        <div className="border-t border-navy-100 pt-4 mt-4">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className="flex items-center gap-2 font-semibold text-navy-900">
                    <Wallet size={17} className="text-ball-600" />
                    Chi phí & chia tiền
                    {fin.total > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                            ({formatVND(fin.total)})
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-2">
                    {fin.total > 0 && fin.attendees.length > 0 && (
                        <span className="text-xs font-medium bg-ball-100 text-ball-700 px-2.5 py-1 rounded-full">
                            {formatVND(fin.share)}/người
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                    )}
                </span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-4 animate-fade-in">
                    {/* Danh sách chi phí */}
                    <div className="space-y-2">
                        {costs.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">
                                Chưa có chi phí nào cho buổi này.
                            </p>
                        ) : (
                            costs.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between bg-navy-50 rounded-xl px-3 py-2 text-sm"
                                >
                                    <span className="flex items-center gap-2 text-navy-900">
                                        <span>{SESSION_COST_ICON[c.category]}</span>
                                        {c.label}
                                    </span>
                                    <span className="flex items-center gap-3">
                                        <span className="font-mono font-medium text-navy-900">
                                            {formatVND(c.amount)}
                                        </span>
                                        <button
                                            onClick={() => deleteSessionCost(c.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                            aria-label="Xóa chi phí"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Thêm chi phí */}
                    {showAdd ? (
                        <form
                            onSubmit={handleAddCost}
                            className="bg-white border border-navy-200 rounded-xl p-3 space-y-2.5"
                        >
                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            category === cat
                                                ? "bg-court-600 text-white"
                                                : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                        }`}
                                    >
                                        {SESSION_COST_ICON[cat]} {SESSION_COST_LABEL[cat]}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder={SESSION_COST_LABEL[category]}
                                    className="flex-1 px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:border-court-500"
                                />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Số tiền"
                                    className="w-32 px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:border-court-500"
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-court-600 hover:bg-court-700 text-white rounded-lg text-sm font-medium"
                                >
                                    Thêm chi phí
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdd(false);
                                        setError("");
                                    }}
                                    className="px-4 py-2 bg-navy-50 text-gray-600 rounded-lg text-sm"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-1.5 text-sm font-medium text-court-600 hover:text-court-700"
                        >
                            <Plus size={16} />
                            Thêm chi phí (sân, nước, bóng...)
                        </button>
                    )}

                    {/* Chia tiền theo người đi tập */}
                    {fin.total > 0 && (
                        <div className="border-t border-navy-100 pt-3">
                            {fin.attendees.length === 0 ? (
                                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                    Chưa có ai vote &ldquo;Đi tập&rdquo; — vote trước để chia tiền.
                                </p>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                                            <Receipt size={13} />
                                            Chia {formatVND(fin.share)}/người · {fin.attendees.length}{" "}
                                            người
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Đã thu{" "}
                                            <span className="font-semibold text-court-600">
                                                {formatVND(fin.collected)}
                                            </span>
                                            {fin.outstanding > 0.5 && (
                                                <>
                                                    {" "}
                                                    · còn{" "}
                                                    <span className="font-semibold text-red-500">
                                                        {formatVND(fin.outstanding)}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {fin.attendees.map((pid) => {
                                            const paid = fin.paidPlayerIds.includes(pid);
                                            return (
                                                <button
                                                    key={pid}
                                                    onClick={() =>
                                                        setSessionPayment(session.id, pid, !paid)
                                                    }
                                                    className={`flex items-center justify-between gap-1 px-3 py-2 rounded-xl text-sm transition-colors ${
                                                        paid
                                                            ? "bg-court-100 text-court-800"
                                                            : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                                    }`}
                                                >
                                                    <span className="truncate">
                                                        {playerName(pid)}
                                                    </span>
                                                    {paid ? (
                                                        <Check size={15} className="shrink-0 text-court-600" />
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 shrink-0">
                                                            chưa
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
