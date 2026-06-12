"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RankingTable from "@/components/club/RankingTable";
import MatchCard from "@/components/club/MatchCard";
import VotePanel from "@/components/club/VotePanel";
import { useClub } from "@/context/ClubContext";
import { Megaphone, Pin, ArrowRight, Trophy, Swords, CalendarDays } from "lucide-react";

export default function HomePage() {
    const { announcements, trainingSessions, matches, players, isLoading } = useClub();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pinned = announcements.filter((a) => a.isPinned);
    const latestNews = announcements.filter((a) => !a.isPinned).slice(0, 3);
    const nextSession = trainingSessions
        .filter((s) => new Date(s.sessionDate + "T23:59:59") >= today)
        .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))[0];
    const recentMatches = matches.slice(0, 5);

    return (
        <>
            <Navbar />
            <main className="min-h-[60vh]">
                {/* Hero */}
                <section className="bg-gradient-dark text-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
                        <div className="max-w-2xl animate-fade-in">
                            <p className="text-ball-300 font-semibold text-sm uppercase tracking-widest mb-3">
                                🏓 Câu lạc bộ Pickleball
                            </p>
                            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
                                Chơi hết mình.
                                <br />
                                Xếp hạng <span className="text-court-400">công bằng</span>.
                            </h1>
                            <p className="text-gray-300 text-lg mb-8">
                                Hệ thống Elo cá nhân cho đánh đôi — ghi trận ngay tại sân,
                                bảng xếp hạng cập nhật tức thì.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/matches" className="btn-ball gap-2">
                                    <Swords size={18} />
                                    Ghi trận đấu
                                </Link>
                                <Link
                                    href="/rankings"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Trophy size={18} />
                                    Xem bảng xếp hạng
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
                    {/* Thông báo ghim */}
                    {pinned.length > 0 && (
                        <section className="space-y-3 animate-slide-up">
                            {pinned.map((a) => (
                                <div
                                    key={a.id}
                                    className="bg-ball-50 border border-ball-200 rounded-2xl p-5 flex gap-3"
                                >
                                    <Pin size={18} className="text-ball-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-navy-900">{a.title}</p>
                                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                            {a.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Buổi tập sắp tới */}
                    {nextSession && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <CalendarDays size={20} className="text-court-600" />
                                    Buổi tập sắp tới
                                </h2>
                                <Link
                                    href="/training"
                                    className="text-sm text-court-600 hover:text-court-700 flex items-center gap-1"
                                >
                                    Tất cả lịch tập
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                            <VotePanel session={nextSession} />
                        </section>
                    )}

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Top Elo */}
                        <section className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <Trophy size={20} className="text-ball-500" />
                                    Top Elo
                                </h2>
                                <Link
                                    href="/rankings"
                                    className="text-sm text-court-600 hover:text-court-700 flex items-center gap-1"
                                >
                                    Xem đầy đủ
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                            <RankingTable limit={5} />
                        </section>

                        {/* Trận gần đây */}
                        <section className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <Swords size={20} className="text-court-600" />
                                    Trận gần đây
                                </h2>
                                <Link
                                    href="/matches"
                                    className="text-sm text-court-600 hover:text-court-700 flex items-center gap-1"
                                >
                                    Tất cả
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                            {isLoading ? (
                                <p className="text-gray-400 text-sm py-8 text-center">Đang tải...</p>
                            ) : recentMatches.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400 text-sm">
                                    Chưa có trận nào được ghi
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentMatches.map((m) => (
                                        <MatchCard key={m.id} match={m} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Tin khác */}
                    {latestNews.length > 0 && (
                        <section>
                            <h2 className="font-display text-xl font-bold text-navy-900 flex items-center gap-2 mb-4">
                                <Megaphone size={20} className="text-court-600" />
                                Bảng tin
                            </h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {latestNews.map((a) => (
                                    <div key={a.id} className="bg-white rounded-2xl shadow-card p-5">
                                        <p className="font-semibold text-navy-900 mb-1">{a.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-3 whitespace-pre-line">
                                            {a.content}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3">
                                            {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Stats tổng quan */}
                    {players.length > 0 && (
                        <section className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl shadow-card p-5 text-center">
                                <p className="text-3xl font-bold text-court-600">{players.length}</p>
                                <p className="text-sm text-gray-500 mt-1">Thành viên</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-5 text-center">
                                <p className="text-3xl font-bold text-court-600">{matches.length}</p>
                                <p className="text-sm text-gray-500 mt-1">Trận đã đấu</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-5 text-center">
                                <p className="text-3xl font-bold text-court-600">
                                    {trainingSessions.length}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Buổi tập</p>
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
