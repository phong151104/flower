"use client";

import { useClub } from "@/context/ClubContext";

interface PlayerSelectProps {
    value: string;
    onChange: (playerId: string) => void;
    /** Các id đã được chọn ở vị trí khác — sẽ bị disable. */
    excludeIds?: string[];
    placeholder?: string;
    className?: string;
}

export default function PlayerSelect({
    value,
    onChange,
    excludeIds = [],
    placeholder = "Chọn người chơi",
    className = "",
}: PlayerSelectProps) {
    const { players } = useClub();
    const sorted = [...players]
        .filter((p) => p.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2.5 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-court-500 ${className}`}
        >
            <option value="">{placeholder}</option>
            {sorted.map((p) => (
                <option key={p.id} value={p.id} disabled={excludeIds.includes(p.id)}>
                    {p.name}
                    {p.nickname ? ` (${p.nickname})` : ""} — {Math.round(p.currentElo)}
                </option>
            ))}
        </select>
    );
}
