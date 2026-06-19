"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SummaryTab from "@/components/club/quy/SummaryTab";
import ThuChiTab from "@/components/club/quy/ThuChiTab";
import MonthlyGridTab from "@/components/club/quy/MonthlyGridTab";
import { useClub } from "@/context/ClubContext";

type Tab = "summary" | "thuchi" | "monthly";

const TABS: [Tab, string][] = [
    ["summary", "Tổng hợp"],
    ["thuchi", "Thu chi"],
    ["monthly", "Theo tháng"],
];

export default function PublicFinancePage() {
    const { isLoading } = useClub();
    const [tab, setTab] = useState<Tab>("summary");

    return (
        <>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-6 animate-fade-in">
                    <h1 className="section-heading">Quỹ &amp; Chi phí</h1>
                    <p className="text-gray-500 mt-2">
                        Quản lý quỹ tháng, thu chi và tiền sân/nước theo buổi — dạng bảng.
                    </p>
                </div>

                {/* Tabs con */}
                <div className="flex gap-1 mb-8 bg-white rounded-2xl shadow-card p-1.5 w-fit">
                    {TABS.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                tab === key
                                    ? "bg-court-600 text-white"
                                    : "text-gray-500 hover:bg-navy-50"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <p className="text-gray-400 text-sm py-12 text-center">Đang tải...</p>
                ) : (
                    <>
                        {tab === "summary" && <SummaryTab />}
                        {tab === "thuchi" && <ThuChiTab />}
                        {tab === "monthly" && <MonthlyGridTab />}
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}
