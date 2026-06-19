"use client";

import { useMemo } from "react";
import { useClub } from "@/context/ClubContext";
import type { Gender } from "@/types/club";
import { getOverallTotals, getMonthlyBreakdown, formatVND } from "@/lib/finance";

const GENDERS: { value: Gender; label: string }[] = [
    { value: "nam", label: "Nam" },
    { value: "nu", label: "Nữ" },
    { value: "khac", label: "Khác" },
];

export default function SummaryTab() {
    const {
        players,
        updatePlayer,
        transactions,
        trainingSessions,
        sessionCosts,
        trainingVotes,
        sessionPayments,
        fundDrives,
        fundDriveMembers,
    } = useClub();

    const input = {
        transactions,
        sessions: trainingSessions,
        sessionCosts,
        votes: trainingVotes,
        payments: sessionPayments,
        drives: fundDrives,
        driveMembers: fundDriveMembers,
    };

    const totals = useMemo(() => getOverallTotals(input), [input]);
    const months = useMemo(() => getMonthlyBreakdown(input), [input]);

    const members = [...players]
        .filter((p) => p.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Danh sách thành viên + giới tính */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-navy-100 text-gray-400 text-left">
                            <th className="px-4 py-3 font-medium w-12">STT</th>
                            <th className="px-4 py-3 font-medium">Thành viên</th>
                            <th className="px-4 py-3 font-medium w-32">Giới tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((p, i) => (
                            <tr
                                key={p.id}
                                className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50"
                            >
                                <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-2.5 font-medium text-navy-900">{p.name}</td>
                                <td className="px-4 py-2">
                                    <select
                                        value={p.gender || ""}
                                        onChange={(e) =>
                                            updatePlayer(p.id, {
                                                gender: (e.target.value || undefined) as
                                                    | Gender
                                                    | undefined,
                                            })
                                        }
                                        className="w-full px-2 py-1.5 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:border-court-500"
                                    >
                                        <option value="">—</option>
                                        {GENDERS.map((g) => (
                                            <option key={g.value} value={g.value}>
                                                {g.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tổng quan + theo tháng */}
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Còn lại</p>
                        <p
                            className={`text-lg font-bold ${
                                totals.conLai < 0 ? "text-red-500" : "text-navy-900"
                            }`}
                        >
                            {formatVND(totals.conLai)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Tổng quỹ đã thu</p>
                        <p className="text-lg font-bold text-court-600">{formatVND(totals.thu)}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Đã chi</p>
                        <p className="text-lg font-bold text-red-500">{formatVND(totals.chi)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-navy-100 text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Tháng</th>
                                <th className="px-4 py-3 font-medium text-right">Tổng thu</th>
                                <th className="px-4 py-3 font-medium text-right">Tổng chi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {months.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-gray-400"
                                    >
                                        Chưa có dữ liệu tháng nào.
                                    </td>
                                </tr>
                            ) : (
                                months.map((m) => (
                                    <tr
                                        key={m.month}
                                        className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50"
                                    >
                                        <td className="px-4 py-2.5 font-medium text-navy-900">
                                            T{Number(m.month.slice(5))}/{m.month.slice(0, 4)}
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-mono text-court-600 whitespace-nowrap">
                                            {formatVND(m.thu)}
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-mono text-red-500 whitespace-nowrap">
                                            {formatVND(m.chi)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
