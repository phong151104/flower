"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VotePanel from "@/components/club/VotePanel";
import { useClub } from "@/context/ClubContext";
import { CalendarDays } from "lucide-react";

export default function TrainingPage() {
    const { trainingSessions, isLoading } = useClub();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = trainingSessions
        .filter((s) => new Date(s.sessionDate + "T23:59:59") >= today)
        .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
    const past = trainingSessions
        .filter((s) => new Date(s.sessionDate + "T23:59:59") < today)
        .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-8 animate-fade-in">
                    <h1 className="section-heading">Lịch tập luyện</h1>
                    <p className="text-gray-500 mt-2">
                        Chọn tên của bạn và vote để mọi người biết ai đi tập.
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-gray-400">Đang tải...</div>
                ) : (
                    <>
                        <section className="mb-10">
                            <h2 className="font-bold text-navy-900 mb-4">Buổi tập sắp tới</h2>
                            {upcoming.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                                    <CalendarDays size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">
                                        Chưa có buổi tập nào được lên lịch.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-slide-up">
                                    {upcoming.map((s) => (
                                        <VotePanel key={s.id} session={s} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {past.length > 0 && (
                            <section>
                                <h2 className="font-bold text-gray-400 mb-4">Buổi tập đã qua</h2>
                                <div className="space-y-4 opacity-70">
                                    {past.slice(0, 5).map((s) => (
                                        <VotePanel key={s.id} session={s} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}
