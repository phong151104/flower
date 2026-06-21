"use client";

import { Fragment, useMemo, useState } from "react";
import { useClub } from "@/context/ClubContext";
import type { FundDrive } from "@/types/club";
import { getDriveSummary, driveMemberAmount, formatVND } from "@/lib/finance";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

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

// ---- Lưới THU: mỗi đợt thu = 1 cặp cột [Đã đóng | Tiền] ----
function DuesGrid({ month, drives }: { month?: string; drives: FundDrive[] }) {
    const {
        players,
        fundDriveMembers,
        addFundDrive,
        updateFundDrive,
        deleteFundDrive,
        addFundDriveMember,
        setFundDriveMemberPaid,
        setFundDriveMemberAmount,
    } = useClub();

    const members = [...players]
        .filter((p) => p.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));
    const memberOf = (driveId: string, playerId: string) =>
        fundDriveMembers.find((m) => m.driveId === driveId && m.playerId === playerId);

    const addDot = async () => {
        const ids = members.map((p) => p.id);
        const title = month
            ? drives.length === 0
                ? "Quỹ tháng"
                : `Đợt ${drives.length + 1}`
            : "Quỹ giải";
        await addFundDrive(
            { title, kind: month ? "monthly" : "custom", amount: 0, period: month },
            ids
        );
    };

    const grandTotal = drives.reduce(
        (s, d) => s + getDriveSummary(d, fundDriveMembers).collected,
        0
    );

    return (
        <div>
            {drives.length === 0 ? (
                <p className="text-sm text-gray-400 mb-2">Chưa có đợt thu nào trong tháng.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="text-sm border-collapse w-full min-w-[360px]">
                        <thead>
                            <tr>
                                <th
                                    rowSpan={2}
                                    className="sticky left-0 z-10 bg-navy-50 border-b-2 border-r border-navy-200 px-3 py-2 text-left font-semibold text-gray-500 min-w-[110px] align-bottom"
                                >
                                    Thành viên
                                </th>
                                {drives.map((d) => (
                                    <th
                                        key={d.id}
                                        colSpan={2}
                                        className="border-b border-l border-navy-200 px-2 py-1.5 bg-navy-50/60"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                key={`t-${d.id}-${d.title}`}
                                                defaultValue={d.title}
                                                onBlur={(e) =>
                                                    e.target.value.trim() &&
                                                    e.target.value !== d.title &&
                                                    updateFundDrive(d.id, {
                                                        title: e.target.value.trim(),
                                                    })
                                                }
                                                className="w-28 px-1.5 py-0.5 text-center font-semibold text-navy-900 bg-transparent rounded hover:bg-white focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Xóa đợt "${d.title}"?`))
                                                        deleteFundDrive(d.id);
                                                }}
                                                className="text-gray-300 hover:text-red-500"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                                            mặc định{" "}
                                            <input
                                                key={`a-${d.id}-${d.amount}`}
                                                defaultValue={String(d.amount)}
                                                inputMode="numeric"
                                                onBlur={(e) => {
                                                    const v = parseInt(
                                                        e.target.value.replace(/\D/g, ""),
                                                        10
                                                    );
                                                    if (!isNaN(v) && v !== d.amount)
                                                        updateFundDrive(d.id, { amount: v });
                                                }}
                                                className="w-16 px-1 text-right font-mono bg-white/70 rounded focus:bg-white focus:outline-none"
                                            />
                                            đ
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            <tr className="text-gray-400">
                                {drives.map((d) => (
                                    <Fragment key={d.id}>
                                        <th className="border-b-2 border-l border-navy-200 px-2 py-1 font-medium text-center w-16">
                                            Đã đóng
                                        </th>
                                        <th className="border-b-2 border-navy-200 px-2 py-1 font-medium text-right w-24">
                                            Tiền
                                        </th>
                                    </Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((p) => (
                                <tr key={p.id} className="border-b border-navy-50">
                                    <td className="sticky left-0 z-10 bg-white border-r border-navy-200 px-3 py-1.5 font-medium text-navy-900">
                                        {p.name}
                                    </td>
                                    {drives.map((d) => {
                                        const m = memberOf(d.id, p.id);
                                        return (
                                            <Fragment key={d.id}>
                                                <td className="border-l border-navy-200 px-2 py-1 text-center">
                                                    {m ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={m.paid}
                                                            onChange={(e) =>
                                                                setFundDriveMemberPaid(
                                                                    d.id,
                                                                    p.id,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="w-4 h-4 accent-court-600 cursor-pointer"
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                addFundDriveMember(d.id, p.id)
                                                            }
                                                            className="text-gray-300 hover:text-court-600"
                                                            title="Thêm vào đợt này"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-1 py-1">
                                                    {m && (
                                                        <input
                                                            key={`m-${m.id}-${driveMemberAmount(d, m)}`}
                                                            defaultValue={String(
                                                                driveMemberAmount(d, m)
                                                            )}
                                                            inputMode="numeric"
                                                            onBlur={(e) => {
                                                                const v = parseInt(
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        ""
                                                                    ),
                                                                    10
                                                                );
                                                                if (
                                                                    !isNaN(v) &&
                                                                    v !== driveMemberAmount(d, m)
                                                                )
                                                                    setFundDriveMemberAmount(
                                                                        d.id,
                                                                        p.id,
                                                                        v
                                                                    );
                                                            }}
                                                            className="w-full px-1.5 py-1 text-right font-mono bg-transparent rounded hover:bg-navy-50 focus:bg-white focus:border focus:border-court-400 focus:outline-none"
                                                        />
                                                    )}
                                                </td>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="bg-navy-50 border-t-2 border-navy-200 font-bold text-navy-900">
                                <td className="sticky left-0 z-10 bg-navy-50 border-r border-navy-200 px-3 py-2">
                                    Tổng thu
                                </td>
                                {drives.map((d) => (
                                    <Fragment key={d.id}>
                                        <td className="border-l border-navy-200"></td>
                                        <td className="px-2 py-2 text-right font-mono text-court-600">
                                            {formatVND(
                                                getDriveSummary(d, fundDriveMembers).collected
                                            )}
                                        </td>
                                    </Fragment>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
                <button
                    onClick={addDot}
                    className="flex items-center gap-1.5 text-sm font-medium text-court-600 hover:text-court-700"
                >
                    <Plus size={15} /> Thêm đợt thu
                </button>
                {drives.length > 0 && (
                    <span className="text-sm text-gray-500">
                        Tổng thu {month ? "tháng" : ""}:{" "}
                        <span className="font-semibold text-court-600">
                            {formatVND(grandTotal)}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
}

function MonthBlock({ month, drives }: { month: string; drives: FundDrive[] }) {
    return (
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
            <h3 className="font-bold text-navy-900">{monthLabel(month)}</h3>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Chi</p>
                <ExpenseTable month={month} />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Thu (quỹ tháng &amp; các đợt)
                </p>
                <DuesGrid month={month} drives={drives} />
            </div>
        </div>
    );
}

export default function ThuChiTab() {
    const { transactions, fundDrives, players, addFundDrive } = useClub();
    const [showAddMonth, setShowAddMonth] = useState(false);
    const [newMonth, setNewMonth] = useState(new Date().toISOString().slice(0, 7));
    const [newAmount, setNewAmount] = useState("");
    const [showPast, setShowPast] = useState(false);

    // Các tháng = union (kỳ của đợt thu có period) ∪ (tháng có khoản chi)
    const months = useMemo(() => {
        const set = new Set<string>();
        fundDrives.forEach((d) => d.period && set.add(d.period));
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => set.add((t.date || "").slice(0, 7)));
        return Array.from(set)
            .filter(Boolean)
            .sort((a, b) => b.localeCompare(a));
    }, [fundDrives, transactions]);

    const drivesForMonth = (month: string) => fundDrives.filter((d) => d.period === month);
    const noPeriodDrives = fundDrives.filter((d) => !d.period);

    const curMonth = new Date().toISOString().slice(0, 7);
    const pastMonths = months.filter((m) => m < curMonth);
    const recentMonths = months.filter((m) => m >= curMonth);

    const addMonth = async () => {
        if (!newMonth) return;
        const ids = players.filter((p) => p.isActive).map((p) => p.id);
        const amt = parseInt(newAmount.replace(/\D/g, ""), 10);
        await addFundDrive(
            { title: "Quỹ tháng", kind: "monthly", amount: isNaN(amt) ? 0 : amt, period: newMonth },
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
                <>
                    {recentMonths.length === 0 && !showPast && (
                        <div className="bg-white rounded-2xl shadow-card p-6 text-center text-gray-400 text-sm">
                            Các tháng đều đã qua và đang được ẩn.
                        </div>
                    )}
                    {recentMonths.map((m) => (
                        <MonthBlock key={m} month={m} drives={drivesForMonth(m)} />
                    ))}

                    {pastMonths.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowPast((v) => !v)}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-court-700"
                            >
                                {showPast ? <EyeOff size={15} /> : <Eye size={15} />}
                                {showPast
                                    ? "Ẩn tháng đã qua"
                                    : `Hiện tháng đã qua (${pastMonths.length})`}
                            </button>
                            {showPast && (
                                <div className="space-y-6 mt-4 opacity-90">
                                    {pastMonths.map((m) => (
                                        <MonthBlock key={m} month={m} drives={drivesForMonth(m)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Đợt thu không theo tháng (quỹ giải / khác) */}
            {noPeriodDrives.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-5">
                    <h3 className="font-bold text-navy-900 mb-3">Đợt thu khác (quỹ giải...)</h3>
                    <DuesGrid drives={noPeriodDrives} />
                </div>
            )}
        </div>
    );
}
