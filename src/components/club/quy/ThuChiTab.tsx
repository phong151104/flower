"use client";

import { useMemo, useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { FundDrive } from "@/types/club";
import { getDriveSummary, driveMemberAmount, formatVND } from "@/lib/finance";
import { Plus, Trash2, X, UserPlus } from "lucide-react";

function monthLabel(month: string) {
    return `Tháng ${Number(month.slice(5))}/${month.slice(0, 4)}`;
}

// ---- Bảng CHI của một tháng (transactions type=expense) ----
function ExpenseTable({ month }: { month: string }) {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useClub();
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");

    const rows = transactions
        .filter((t) => t.type === "expense" && (t.date || "").startsWith(month))
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
    const total = rows.reduce((s, t) => s + t.amount, 0);

    const add = async () => {
        const amt = parseInt(amount.replace(/\D/g, ""), 10);
        if (!desc.trim() || isNaN(amt) || amt <= 0) return;
        await addTransaction({
            type: "expense",
            amount: amt,
            description: desc.trim(),
            category: "khac",
            date: `${month}-01`,
        });
        setDesc("");
        setAmount("");
    };

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-navy-100 text-gray-400 text-left">
                    <th className="px-3 py-2 font-medium w-10">Stt</th>
                    <th className="px-3 py-2 font-medium">Danh mục</th>
                    <th className="px-3 py-2 font-medium text-right w-32">Tiền</th>
                    <th className="w-9"></th>
                </tr>
            </thead>
            <tbody>
                {rows.map((t, i) => (
                    <tr key={t.id} className="border-b border-navy-50">
                        <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                        <td className="px-2 py-1">
                            <input
                                defaultValue={t.description}
                                onBlur={(e) =>
                                    e.target.value.trim() &&
                                    e.target.value !== t.description &&
                                    updateTransaction(t.id, { description: e.target.value.trim() })
                                }
                                className="w-full px-2 py-1 bg-transparent rounded hover:bg-navy-50 focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                            />
                        </td>
                        <td className="px-2 py-1">
                            <input
                                defaultValue={String(t.amount)}
                                inputMode="numeric"
                                onBlur={(e) => {
                                    const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                                    if (!isNaN(v) && v !== t.amount)
                                        updateTransaction(t.id, { amount: v });
                                }}
                                className="w-full px-2 py-1 text-right font-mono bg-transparent rounded hover:bg-navy-50 focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                            />
                        </td>
                        <td className="px-1">
                            <button
                                onClick={() => deleteTransaction(t.id)}
                                className="text-gray-300 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </td>
                    </tr>
                ))}
                <tr className="border-b border-navy-50 bg-navy-50/40">
                    <td className="px-3 py-1.5 text-gray-300">+</td>
                    <td className="px-2 py-1">
                        <input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Mua bóng / nước..."
                            className="w-full px-2 py-1 bg-white border border-navy-200 rounded focus:outline-none focus:border-court-500"
                        />
                    </td>
                    <td className="px-2 py-1">
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && add()}
                            inputMode="numeric"
                            placeholder="Tiền"
                            className="w-full px-2 py-1 text-right bg-white border border-navy-200 rounded focus:outline-none focus:border-court-500"
                        />
                    </td>
                    <td className="px-1">
                        <button onClick={add} className="text-court-600 hover:text-court-700">
                            <Plus size={16} />
                        </button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr className="font-semibold text-navy-900">
                    <td className="px-3 py-2" colSpan={2}>
                        Tổng chi tháng
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-red-500">
                        {formatVND(total)}
                    </td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

// ---- Bảng THU (đợt thu: quỹ tháng hoặc tùy chỉnh) ----
function DuesTable({ drive }: { drive: FundDrive }) {
    const {
        players,
        fundDriveMembers,
        updateFundDrive,
        deleteFundDrive,
        addFundDriveMember,
        removeFundDriveMember,
        setFundDriveMemberPaid,
        setFundDriveMemberAmount,
    } = useClub();
    const [adding, setAdding] = useState(false);

    const playerName = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";
    const members = fundDriveMembers
        .filter((m) => m.driveId === drive.id)
        .sort((a, b) => playerName(a.playerId).localeCompare(playerName(b.playerId), "vi"));
    const memberIds = new Set(members.map((m) => m.playerId));
    const remaining = [...players]
        .filter((p) => p.isActive && !memberIds.has(p.id))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));
    const summary = getDriveSummary(drive, fundDriveMembers);

    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-navy-100 text-gray-400 text-left">
                    <th className="px-3 py-2 font-medium">Thành viên</th>
                    <th className="px-3 py-2 font-medium text-center w-20">Đã đóng</th>
                    <th className="px-3 py-2 font-medium text-right w-32">Tiền</th>
                    <th className="w-9"></th>
                </tr>
            </thead>
            <tbody>
                {members.map((m) => (
                    <tr key={m.id} className="border-b border-navy-50">
                        <td className="px-3 py-1.5 font-medium text-navy-900">
                            {playerName(m.playerId)}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                            <input
                                type="checkbox"
                                checked={m.paid}
                                onChange={(e) =>
                                    setFundDriveMemberPaid(drive.id, m.playerId, e.target.checked)
                                }
                                className="w-4 h-4 accent-court-600 cursor-pointer"
                            />
                        </td>
                        <td className="px-2 py-1">
                            <input
                                key={`${m.id}-${driveMemberAmount(drive, m)}`}
                                defaultValue={String(driveMemberAmount(drive, m))}
                                inputMode="numeric"
                                onBlur={(e) => {
                                    const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                                    if (!isNaN(v) && v !== driveMemberAmount(drive, m))
                                        setFundDriveMemberAmount(drive.id, m.playerId, v);
                                }}
                                className="w-full px-2 py-1 text-right font-mono bg-transparent rounded hover:bg-navy-50 focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                            />
                        </td>
                        <td className="px-1">
                            <button
                                onClick={() => removeFundDriveMember(drive.id, m.playerId)}
                                className="text-gray-300 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        </td>
                    </tr>
                ))}
                {adding && remaining.length > 0 && (
                    <tr className="border-b border-navy-50 bg-navy-50/40">
                        <td className="px-2 py-1" colSpan={4}>
                            <select
                                autoFocus
                                value=""
                                onChange={(e) => {
                                    if (e.target.value)
                                        addFundDriveMember(drive.id, e.target.value);
                                    setAdding(false);
                                }}
                                onBlur={() => setAdding(false)}
                                className="px-2 py-1 bg-white border border-navy-200 rounded focus:outline-none focus:border-court-500"
                            >
                                <option value="">Chọn người thêm...</option>
                                {remaining.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr className="font-semibold text-navy-900">
                    <td className="px-3 py-2">
                        Tổng thu tháng
                        {remaining.length > 0 && (
                            <button
                                onClick={() => setAdding(true)}
                                className="ml-2 text-xs font-normal text-court-600 hover:text-court-700 inline-flex items-center gap-1"
                            >
                                <UserPlus size={13} /> Thêm người
                            </button>
                        )}
                    </td>
                    <td></td>
                    <td className="px-3 py-2 text-right font-mono text-court-600">
                        {formatVND(summary.collected)}
                    </td>
                    <td className="px-1">
                        <button
                            onClick={() => {
                                if (confirm(`Xóa đợt thu "${drive.title}"?`))
                                    deleteFundDrive(drive.id);
                            }}
                            className="text-gray-300 hover:text-red-500"
                            title="Xóa đợt thu"
                        >
                            <Trash2 size={14} />
                        </button>
                    </td>
                </tr>
                <tr className="text-xs text-gray-400">
                    <td className="px-3 pb-2" colSpan={4}>
                        Mức mặc định:{" "}
                        <input
                            key={`def-${drive.id}-${drive.amount}`}
                            defaultValue={String(drive.amount)}
                            inputMode="numeric"
                            onBlur={(e) => {
                                const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                                if (!isNaN(v) && v !== drive.amount)
                                    updateFundDrive(drive.id, { amount: v });
                            }}
                            className="w-24 px-2 py-0.5 text-right font-mono bg-navy-50 rounded focus:bg-white focus:outline-none focus:border focus:border-court-400"
                        />{" "}
                        đ/người (ô tiền để trống/đổi để nhập riêng từng người)
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}

function MonthBlock({ month, drive }: { month: string; drive?: FundDrive }) {
    const { players, addFundDrive } = useClub();

    const createDues = async () => {
        const ids = players.filter((p) => p.isActive).map((p) => p.id);
        await addFundDrive(
            { title: monthLabel(month), kind: "monthly", amount: 0, period: month },
            ids
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-bold text-navy-900 mb-3">{monthLabel(month)}</h3>
            <div className="grid lg:grid-cols-2 gap-6">
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Chi</p>
                    <ExpenseTable month={month} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        Thu (quỹ tháng)
                    </p>
                    {drive ? (
                        <DuesTable drive={drive} />
                    ) : (
                        <button
                            onClick={createDues}
                            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-court-600 hover:text-court-700"
                        >
                            <Plus size={15} /> Tạo quỹ tháng này
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ThuChiTab() {
    const { transactions, fundDrives, players, addFundDrive } = useClub();
    const [showAddMonth, setShowAddMonth] = useState(false);
    const [newMonth, setNewMonth] = useState(new Date().toISOString().slice(0, 7));
    const [newAmount, setNewAmount] = useState("");

    // Các tháng = union (kỳ quỹ tháng) ∪ (tháng có khoản chi)
    const months = useMemo(() => {
        const set = new Set<string>();
        fundDrives.filter((d) => d.kind === "monthly").forEach((d) => set.add(d.period || ""));
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => set.add((t.date || "").slice(0, 7)));
        return Array.from(set)
            .filter(Boolean)
            .sort((a, b) => b.localeCompare(a));
    }, [fundDrives, transactions]);

    const monthlyDrive = (month: string) =>
        fundDrives.find((d) => d.kind === "monthly" && d.period === month);
    const customDrives = fundDrives.filter((d) => d.kind !== "monthly");

    const addMonth = async () => {
        if (!newMonth) return;
        const ids = players.filter((p) => p.isActive).map((p) => p.id);
        const amt = parseInt(newAmount.replace(/\D/g, ""), 10);
        await addFundDrive(
            {
                title: monthLabel(newMonth),
                kind: "monthly",
                amount: isNaN(amt) ? 0 : amt,
                period: newMonth,
            },
            ids
        );
        setShowAddMonth(false);
        setNewAmount("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-display text-xl font-bold text-navy-900">Thu chi theo tháng</h2>
                {showAddMonth ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="month"
                            value={newMonth}
                            onChange={(e) => setNewMonth(e.target.value)}
                            className="px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                        />
                        <input
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="Mức/người"
                            inputMode="numeric"
                            className="w-28 px-3 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                        />
                        <button
                            onClick={addMonth}
                            className="px-3 py-2 bg-court-600 hover:bg-court-700 text-white rounded-xl text-sm font-medium"
                        >
                            Tạo
                        </button>
                        <button
                            onClick={() => setShowAddMonth(false)}
                            className="px-3 py-2 text-gray-400 text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddMonth(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-court-600 hover:bg-court-700 text-white rounded-full text-sm font-medium"
                    >
                        <Plus size={16} /> Thêm tháng
                    </button>
                )}
            </div>

            {months.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                    Chưa có tháng nào. Bấm &ldquo;Thêm tháng&rdquo; để bắt đầu.
                </div>
            ) : (
                months.map((m) => <MonthBlock key={m} month={m} drive={monthlyDrive(m)} />)
            )}

            {/* Đợt thu khác (quỹ giải / tùy chỉnh) */}
            {customDrives.length > 0 && (
                <div>
                    <h2 className="font-display text-xl font-bold text-navy-900 mb-3">
                        Đợt thu khác (quỹ giải...)
                    </h2>
                    <div className="space-y-4">
                        {customDrives.map((d) => (
                            <div key={d.id} className="bg-white rounded-2xl shadow-card p-5">
                                <h3 className="font-bold text-navy-900 mb-3">{d.title}</h3>
                                <DuesTable drive={d} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
