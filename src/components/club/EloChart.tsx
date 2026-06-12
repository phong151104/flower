"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { useClub } from "@/context/ClubContext";
import { getPlayerMatches } from "@/lib/stats";

export default function EloChart({ playerId }: { playerId: string }) {
    const { players, matches } = useClub();
    const player = players.find((p) => p.id === playerId);

    const data = useMemo(() => {
        if (!player) return [];
        // getPlayerMatches trả mới nhất trước → đảo lại theo thời gian
        const views = getPlayerMatches(playerId, matches).reverse();
        const points = [
            {
                label: "Khởi điểm",
                elo: player.initialElo,
            },
            ...views.map((v, i) => ({
                label: `Trận ${i + 1} (${new Date(v.match.playedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                })})`,
                elo: Math.round(v.eloAfter),
            })),
        ];
        return points;
    }, [player, playerId, matches]);

    if (!player || data.length <= 1) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Chưa có dữ liệu trận đấu để vẽ biểu đồ
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <XAxis dataKey="label" tick={false} stroke="#CBD5E1" />
                <YAxis
                    domain={["dataMin - 30", "dataMax + 30"]}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    stroke="#CBD5E1"
                />
                <Tooltip
                    formatter={(value) => [`${value} Elo`, ""]}
                    labelStyle={{ color: "#0F172A", fontWeight: 600, fontSize: 12 }}
                    contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 12,
                    }}
                />
                <ReferenceLine
                    y={player.initialElo}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    label={{
                        value: `Khởi điểm ${player.initialElo}`,
                        fontSize: 10,
                        fill: "#94A3B8",
                        position: "insideBottomLeft",
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="elo"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#16A34A" }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
