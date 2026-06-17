"use client";

import { useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { FundDrive } from "@/types/club";
import { getDriveSummary, formatVND } from "@/lib/finance";
import {
    Check,
    X,
    Trash2,
    Pencil,
    ChevronDown,
    ChevronUp,
    UserPlus,
    PiggyBank,
    CalendarRange,
} from "lucide-react";

export default function FundDrivePanel({
    drive,
    defaultExpanded = true,
}: {
    drive: FundDrive;
    defaultExpanded?: boolean;
}) {
    const {
        players,
        fundDriveMembers,
        setFundDriveMemberPaid,
        addFundDriveMember,
        removeFundDriveMember,
        updateFundDrive,
        deleteFundDrive,
    } = useClub();

    const [expanded, setExpanded] = useState(defaultExpanded);
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(drive.title);
    const [editAmount, setEditAmount] = useState(String(drive.amount));
    const [adding, setAdding] = useState(false);

    const members = fundDriveMembers
        .filter((m) => m.driveId === drive.id)
        .sort((a, b) => playerName(a.playerId).localeCompare(playerName(b.playerId), "vi"));
    const summary = getDriveSummary(drive, fundDriveMembers);

    function playerName(id: string) {
        return players.find((p) => p.id === id)?.name || "(đã xóa)";
    }

    const memberIds = new Set(members.map((m) => m.playerId));
    const remaining = [...players]
        .filter((p) => p.isActive && !memberIds.has(p.id))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    const saveEdit = async () => {
        const amt = parseInt(editAmount.replace(/\D/g, ""), 10);
        await updateFundDrive(drive.id, {
            title: editTitle.trim() || drive.title,
            amount: isNaN(amt) || amt < 0 ? drive.amount : amt,
        });
        setEditing(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-card p-5">
            {/* Header */}
            {editing ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:border-court-500"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            placeholder="Tiền/người"
                            className="w-32 px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm text-right focus:outline-none focus:border-court-500"
                        />
                        <button onClick={saveEdit} className="text-court-600 hover:text-court-700">
                            <Check size={18} />
                        </button>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setEditTitle(drive.title);
                                setEditAmount(String(drive.amount));
                            }}
                            className="text-gray-400 hover:text-navy-900"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start justify-between gap-3">
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="flex items-start gap-2.5 text-left min-w-0"
                    >
                        <span className="mt-0.5 text-ball-500 shrink-0">
                            {drive.kind === "monthly" ? (
                                <CalendarRange size={18} />
                            ) : (
                                <PiggyBank size={18} />
                            )}
                        </span>
                        <span className="min-w-0">
                            <span className="font-bold text-navy-900 flex items-center gap-2 flex-wrap">
                                {drive.title}
                                <span className="text-xs font-medium bg-ball-100 text-ball-700 px-2 py-0.5 rounded-full">
                                    {formatVND(drive.amount)}/người
                                </span>
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5 block">
                                Đã thu{" "}
                                <span className="text-court-600 font-medium">
                                    {formatVND(summary.collected)}
                                </span>{" "}
                                / {formatVND(summary.total)} · {summary.paidCount}/
                                {summary.memberCount} người
                                {summary.outstanding > 0.5 && (
                                    <>
                                        {" "}
                                        · còn{" "}
                                        <span className="text-red-500 font-medium">
                                            {formatVND(summary.outstanding)}
                                        </span>
                                    </>
                                )}
                            </span>
                        </span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setEditing(true)}
                            className="p-1.5 text-gray-300 hover:text-court-600 rounded-lg"
                            aria-label="Sửa"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Xóa đợt thu "${drive.title}"?`))
                                    deleteFundDrive(drive.id);
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            aria-label="Xóa"
                        >
                            <Trash2 size={15} />
                        </button>
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="p-1.5 text-gray-400"
                        >
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>
            )}

            {expanded && !editing && (
                <div className="mt-4">
                    {members.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Chưa có người nào trong đợt thu.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {members.map((m) => (
                                <div
                                    key={m.id}
                                    className={`group flex items-center justify-between gap-1 pl-3 pr-2 py-2 rounded-xl text-sm transition-colors ${
                                        m.paid
                                            ? "bg-court-100 text-court-800"
                                            : "bg-navy-50 text-gray-600"
                                    }`}
                                >
                                    <button
                                        onClick={() =>
                                            setFundDriveMemberPaid(drive.id, m.playerId, !m.paid)
                                        }
                                        className="flex items-center justify-between gap-1 flex-1 min-w-0"
                                    >
                                        <span className="truncate">{playerName(m.playerId)}</span>
                                        {m.paid ? (
                                            <Check size={15} className="shrink-0 text-court-600" />
                                        ) : (
                                            <span className="text-[11px] text-gray-400 shrink-0">
                                                chưa
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => removeFundDriveMember(drive.id, m.playerId)}
                                        className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Bỏ khỏi đợt thu"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Thêm người */}
                    {adding ? (
                        <select
                            autoFocus
                            value=""
                            onChange={(e) => {
                                if (e.target.value) addFundDriveMember(drive.id, e.target.value);
                                setAdding(false);
                            }}
                            onBlur={() => setAdding(false)}
                            className="mt-3 w-full sm:w-auto px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:border-court-500"
                        >
                            <option value="">Chọn người thêm vào...</option>
                            {remaining.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        remaining.length > 0 && (
                            <button
                                onClick={() => setAdding(true)}
                                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-court-600 hover:text-court-700"
                            >
                                <UserPlus size={15} />
                                Thêm người đóng
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
