"use client";

import { useState } from "react";
import RankingTable from "@/components/club/RankingTable";
import MonthlyRankingTable from "@/components/club/MonthlyRankingTable";

type RankingTab = "current" | "monthly";

const TABS: { value: RankingTab; label: string }[] = [
    { value: "current", label: "Hiện tại" },
    { value: "monthly", label: "Theo tháng" },
];

export default function RankingsView() {
    const [tab, setTab] = useState<RankingTab>("current");

    return (
        <div className="animate-slide-up space-y-6">
            <div className="flex gap-1 bg-white rounded-2xl shadow-card p-1.5 w-fit">
                {TABS.map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setTab(item.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            tab === item.value
                                ? "bg-court-600 text-white"
                                : "text-gray-500 hover:bg-navy-50"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === "current" ? <RankingTable /> : <MonthlyRankingTable />}
        </div>
    );
}
