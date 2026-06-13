"use client";

import { useState } from "react";
import Link from "next/link";
import { useClub } from "@/context/ClubContext";
import type { TrainingSession } from "@/types/club";
import PlayerSelect from "@/components/club/PlayerSelect";
import SessionCostPanel from "@/components/club/SessionCostPanel";
import { Check, X as XIcon, MapPin, Clock, Sparkles } from "lucide-react";

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatTime(t?: string) {
    return t ? t.slice(0, 5) : "";
}

export default function VotePanel({ session }: { session: TrainingSession }) {
    const { players, trainingVotes, voteTraining } = useClub();
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [error, setError] = useState("");

    const votes = trainingVotes.filter((v) => v.sessionId === session.id);
    const yesVotes = votes.filter((v) => v.status === "yes");
    const noVotes = votes.filter((v) => v.status === "no");

    const name = (id: string) => players.find((p) => p.id === id)?.name || "(đã xóa)";

    const isPast = new Date(session.sessionDate + "T23:59:59") < new Date();

    const handleVote = async (status: "yes" | "no") => {
        if (!selectedPlayer) {
            setError("Chọn tên của bạn trước khi vote");
            return;
        }
        setError("");
        await voteTraining(session.id, selectedPlayer, status);
    };

    const myVote = votes.find((v) => v.playerId === selectedPlayer);

    return (
        <div className="bg-white rounded-3xl shadow-card p-6 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-bold text-navy-900 text-lg">{session.title}</h3>
                    <p className="text-court-600 font-medium text-sm mt-0.5 capitalize">
                        {formatDate(session.sessionDate)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        {(session.startTime || session.endTime) && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(session.startTime)}
                                {session.endTime && ` - ${formatTime(session.endTime)}`}
                            </span>
                        )}
                        {session.location && (
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {session.location}
                            </span>
                        )}
                    </div>
                    {session.note && (
                        <p className="text-sm text-gray-400 mt-2 italic">{session.note}</p>
                    )}
                </div>
                <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0">
                    <div className="text-center bg-court-50 rounded-2xl px-4 py-2">
                        <p className="text-2xl font-bold text-court-600">{yesVotes.length}</p>
                        <p className="text-[11px] text-gray-500">người đi</p>
                    </div>
                    {yesVotes.length >= 4 && (
                        <Link
                            href={`/lineup?session=${session.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-ball-700 bg-ball-100 hover:bg-ball-200 px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
                        >
                            <Sparkles size={13} />
                            Xếp đội
                        </Link>
                    )}
                </div>
            </div>

            {/* Vote controls */}
            {!isPast && (
                <div className="border-t border-navy-100 pt-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <PlayerSelect
                                value={selectedPlayer}
                                onChange={(id) => {
                                    setSelectedPlayer(id);
                                    setError("");
                                }}
                                placeholder="Chọn tên của bạn"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleVote("yes")}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    myVote?.status === "yes"
                                        ? "bg-court-600 text-white"
                                        : "bg-court-100 text-court-700 hover:bg-court-200"
                                }`}
                            >
                                <Check size={16} />
                                Đi tập
                            </button>
                            <button
                                onClick={() => handleVote("no")}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    myVote?.status === "no"
                                        ? "bg-red-500 text-white"
                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                            >
                                <XIcon size={16} />
                                Bận
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
            )}

            {/* Danh sách vote */}
            {votes.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-xs font-semibold text-court-700 uppercase mb-1.5">
                            Đi tập ({yesVotes.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {yesVotes.map((v) => (
                                <span
                                    key={v.id}
                                    className="px-2.5 py-1 bg-court-100 text-court-800 rounded-full text-xs font-medium"
                                >
                                    {name(v.playerId)}
                                </span>
                            ))}
                        </div>
                    </div>
                    {noVotes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">
                                Bận ({noVotes.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {noVotes.map((v) => (
                                    <span
                                        key={v.id}
                                        className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs"
                                    >
                                        {name(v.playerId)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Chi phí buổi tập + chia tiền */}
            <SessionCostPanel session={session} />
        </div>
    );
}
