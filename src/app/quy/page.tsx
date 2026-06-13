"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionCostPanel from "@/components/club/SessionCostPanel";
import PlayerSelect from "@/components/club/PlayerSelect";
import { useClub } from "@/context/ClubContext";
import {
    getSessionFinance,
    getSessionTotal,
    getAllDebts,
    formatVND,
    type PlayerDebt,
} from "@/lib/finance";
import type { TransactionCategory } from "@/types/club";
import {
    Wallet,
    Receipt,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Plus,
    CalendarDays,
    PiggyBank,
    X,
    Check,
    Users,
} from "lucide-react";

const FUND_CATEGORY_LABEL: Record<Exclude<TransactionCategory, "tien_san">, string> = {
    bong: "Quỹ bóng / dụng cụ",
    quy_thang: "Quỹ tháng",
    khac: "Khác",
};

function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
}

export default function PublicFinancePage() {
    const {
        players,
        trainingSessions,
        trainingVotes,
        sessionCosts,
        sessionPayments,
        setSessionPayment,
        transactions,
        balance,
        addTransaction,
        isLoading,
    } = useClub();

    const [showFund, setShowFund] = useState(false);
    const [fundAmount, setFundAmount] = useState("");
    const [fundDesc, setFundDesc] = useState("");
    const [fundCategory, setFundCategory] =
        useState<Exclude<TransactionCategory, "tien_san">>("bong");
    const [fundPlayer, setFundPlayer] = useState("");
    const [fundError, setFundError] = useState("");

    // Tổng hợp chi phí buổi tập
    const sessionAgg = useMemo(() => {
        let total = 0;
        let collected = 0;
        for (const s of trainingSessions) {
            const fin = getSessionFinance(s.id, sessionCosts, trainingVotes, sessionPayments);
            total += fin.total;
            collected += fin.collected;
        }
        return { total, collected, outstanding: total - collected };
    }, [trainingSessions, sessionCosts, trainingVotes, sessionPayments]);

    // Công nợ theo thành viên
    const debts = useMemo(
        () => getAllDebts(players, trainingSessions, sessionCosts, trainingVotes, sessionPayments),
        [players, trainingSessions, sessionCosts, trainingVotes, sessionPayments]
    );
    const playerName = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const debtors = debts.filter((d) => d.outstanding > 0.5);
    const settled = debts.filter((d) => d.outstanding <= 0.5);
    const totalOutstanding = debtors.reduce((s, d) => s + d.outstanding, 0);

    // Đánh dấu đã đóng cho tất cả buổi còn nợ của một người
    const markAllPaid = async (d: PlayerDebt) => {
        for (const sid of d.unpaidSessions) {
            await setSessionPayment(sid, d.playerId, true);
        }
    };

    // Các buổi để ghi chi phí: có chi phí HOẶC có người vote đi, sắp theo ngày mới nhất
    const relevantSessions = useMemo(() => {
        return [...trainingSessions]
            .filter(
                (s) =>
                    getSessionTotal(s.id, sessionCosts) > 0 ||
                    trainingVotes.some((v) => v.sessionId === s.id && v.status === "yes")
            )
            .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
            .slice(0, 10);
    }, [trainingSessions, sessionCosts, trainingVotes]);

    const fundTransactions = transactions.slice(0, 8);

    const handleAddFund = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(fundAmount.replace(/\D/g, ""), 10);
        if (isNaN(amt) || amt <= 0) {
            setFundError("Số tiền không hợp lệ");
            return;
        }
        await addTransaction({
            type: "income",
            amount: amt,
            description:
                fundDesc.trim() ||
                `${FUND_CATEGORY_LABEL[fundCategory]}${
                    fundPlayer ? ` — ${playerName(fundPlayer)}` : ""
                }`,
            category: fundCategory,
            playerId: fundPlayer || undefined,
            date: new Date().toISOString().slice(0, 10),
        });
        setFundAmount("");
        setFundDesc("");
        setFundPlayer("");
        setFundError("");
        setShowFund(false);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-8 animate-fade-in">
                    <h1 className="section-heading">Quỹ &amp; Chi phí</h1>
                    <p className="text-gray-500 mt-2">
                        Ghi tiền sân, tiền nước theo từng buổi — tự chia cho người đi tập, theo dõi
                        ai đã đóng.
                    </p>
                </div>

                {/* Tổng quan */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
                    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-court-600 text-xs sm:text-sm mb-1.5">
                            <PiggyBank size={16} />
                            Quỹ chung
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-navy-900">
                            {formatVND(balance)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-1.5">
                            <Receipt size={16} />
                            Chi phí buổi
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-navy-900">
                            {formatVND(sessionAgg.total)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-court-600 text-xs sm:text-sm mb-1.5">
                            <TrendingUp size={16} />
                            Đã thu
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-court-600">
                            {formatVND(sessionAgg.collected)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm mb-1.5">
                            <AlertCircle size={16} />
                            Còn thiếu
                        </div>
                        <p
                            className={`text-xl sm:text-2xl font-bold ${
                                sessionAgg.outstanding > 0.5 ? "text-red-500" : "text-court-600"
                            }`}
                        >
                            {formatVND(sessionAgg.outstanding)}
                        </p>
                    </div>
                </section>

                {/* Dashboard công nợ */}
                <section className="mb-10">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                            <Wallet size={20} className="text-ball-500" />
                            Công nợ thành viên
                        </h2>
                        {debts.length > 0 && (
                            <span className="text-sm text-gray-500">
                                {debtors.length > 0 ? (
                                    <>
                                        <span className="font-semibold text-red-500">
                                            {debtors.length} người
                                        </span>{" "}
                                        còn thiếu{" "}
                                        <span className="font-semibold text-red-500">
                                            {formatVND(totalOutstanding)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="font-semibold text-court-600">
                                        Mọi người đã đóng đủ 🎉
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    {debts.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                            Chưa có buổi nào ghi chi phí. Thêm chi phí ở mục bên dưới để bắt đầu chia
                            tiền.
                        </div>
                    ) : (
                      <>
                        {/* Thẻ nổi bật: ai còn thiếu bao nhiêu */}
                        {debtors.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                {debtors.map((d) => (
                                    <div
                                        key={d.playerId}
                                        className="bg-white rounded-2xl shadow-card border-l-4 border-red-400 p-4 flex flex-col"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-navy-900">
                                                {playerName(d.playerId)}
                                            </p>
                                            <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {d.unpaidSessions.length}/{d.sessionCount} buổi
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-500 mt-1.5 leading-none">
                                            {formatVND(d.outstanding)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            chưa đóng · đã đóng {formatVND(d.paid)}
                                        </p>
                                        <button
                                            onClick={() => markAllPaid(d)}
                                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-court-600 hover:bg-court-700 text-white rounded-xl text-sm font-medium transition-colors"
                                        >
                                            <Check size={15} />
                                            Đánh dấu đã đóng
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Người đã đóng đủ */}
                        {settled.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                    <Users size={15} />
                                    Đã đóng đủ:
                                </span>
                                {settled.map((d) => (
                                    <span
                                        key={d.playerId}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-court-100 text-court-800 rounded-full text-xs font-medium"
                                    >
                                        <Check size={12} />
                                        {playerName(d.playerId)}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Bảng chi tiết */}
                        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-navy-100 text-gray-400 text-left">
                                            <th className="px-4 py-3 font-medium">Thành viên</th>
                                            <th className="px-4 py-3 font-medium text-center">
                                                Buổi
                                            </th>
                                            <th className="px-4 py-3 font-medium text-right">
                                                Phải đóng
                                            </th>
                                            <th className="px-4 py-3 font-medium text-right">
                                                Đã đóng
                                            </th>
                                            <th className="px-4 py-3 font-medium text-right">
                                                Còn nợ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {debts.map((d) => {
                                            const settled = d.outstanding <= 0.5;
                                            return (
                                                <tr
                                                    key={d.playerId}
                                                    className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50"
                                                >
                                                    <td className="px-4 py-3 font-medium text-navy-900">
                                                        <span className="flex items-center gap-2">
                                                            {settled && (
                                                                <CheckCircle2
                                                                    size={15}
                                                                    className="text-court-500 shrink-0"
                                                                />
                                                            )}
                                                            {playerName(d.playerId)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-500">
                                                        {d.sessionCount}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-gray-600 whitespace-nowrap">
                                                        {formatVND(d.owed)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-court-600 whitespace-nowrap">
                                                        {formatVND(d.paid)}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                                                            settled
                                                                ? "text-court-600"
                                                                : "text-red-500"
                                                        }`}
                                                    >
                                                        {settled ? "✓" : formatVND(d.outstanding)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                      </>
                    )}
                </section>

                {/* Chi phí theo buổi */}
                <section className="mb-10">
                    <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-court-600" />
                        Chi phí theo buổi
                    </h2>
                    {isLoading ? (
                        <p className="text-gray-400 text-sm py-8 text-center">Đang tải...</p>
                    ) : relevantSessions.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                            Chưa có buổi tập nào. Tạo buổi tập và vote ở mục Lịch tập trước.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {relevantSessions.map((s) => {
                                const hasCost = getSessionTotal(s.id, sessionCosts) > 0;
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-white rounded-2xl shadow-card p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-navy-900">
                                                    {s.title}
                                                </h3>
                                                <p className="text-court-600 text-sm font-medium capitalize">
                                                    {formatDate(s.sessionDate)}
                                                    {s.location ? ` · ${s.location}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <SessionCostPanel session={s} defaultExpanded={hasCost} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Quỹ chung */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                            <PiggyBank size={20} className="text-ball-500" />
                            Quỹ chung
                        </h2>
                        <button
                            onClick={() => setShowFund(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-court-600 hover:bg-court-700 text-white rounded-full text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            Đóng góp quỹ
                        </button>
                    </div>
                    {fundTransactions.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                            Chưa có giao dịch quỹ nào.
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-card divide-y divide-navy-50">
                            {fundTransactions.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between px-4 py-3 text-sm"
                                >
                                    <div>
                                        <p className="font-medium text-navy-900">
                                            {t.description}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(t.date + "T00:00:00").toLocaleDateString(
                                                "vi-VN"
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        className={`font-mono font-semibold whitespace-nowrap ${
                                            t.type === "income" ? "text-court-600" : "text-red-500"
                                        }`}
                                    >
                                        {t.type === "income" ? "+" : "−"}
                                        {formatVND(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />

            {/* Modal đóng góp quỹ */}
            {showFund && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFund(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-soft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                                <PiggyBank size={20} className="text-ball-500" />
                                Đóng góp quỹ
                            </h2>
                            <button
                                onClick={() => setShowFund(false)}
                                className="text-gray-400 hover:text-navy-900"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddFund} className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {(
                                    Object.entries(FUND_CATEGORY_LABEL) as [
                                        Exclude<TransactionCategory, "tien_san">,
                                        string,
                                    ][]
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFundCategory(value)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                            fundCategory === value
                                                ? "bg-court-600 text-white"
                                                : "bg-navy-50 text-gray-600 hover:bg-navy-100"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">
                                    Số tiền (₫) *
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    placeholder="VD: 100000"
                                    className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">
                                    Người đóng (tùy chọn)
                                </label>
                                <PlayerSelect
                                    value={fundPlayer}
                                    onChange={setFundPlayer}
                                    placeholder="Chọn thành viên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1.5">
                                    Ghi chú (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={fundDesc}
                                    onChange={(e) => setFundDesc(e.target.value)}
                                    placeholder="VD: Góp tiền mua bóng mới"
                                    className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500"
                                />
                            </div>
                            {fundError && (
                                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                    {fundError}
                                </p>
                            )}
                            <button type="submit" className="btn-primary w-full">
                                Lưu đóng góp
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
