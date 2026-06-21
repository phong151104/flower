"use client";

import type { ReactNode } from "react";
import type { DoubleElimBracket, KnockoutMatchup } from "@/lib/tournament";

// Sơ đồ nhánh kiểu LCK: dựng bằng toạ độ tuyệt đối + đường nối.
// Chỉ lo phần hiển thị; nội dung từng ô (kèm nút ghi kết quả) do trang truyền vào.

const COL_W = 248;
const GAP = 44;
const NODE_H = 132; // chiều cao dành cho mỗi ô (đủ chứa nút)
const V_GAP = 40; // khoảng dọc giữa 2 ô xếp chồng
const ANCHOR = 46; // điểm nối (giữa 2 dòng đội) tính từ đỉnh ô
const HEADER = 26; // chừa chỗ cho nhãn cột
const BAND_GAP = 64; // khoảng giữa nhánh thắng và nhánh thua

const colLeft = (i: number) => i * (COL_W + GAP);
const colRight = (i: number) => colLeft(i) + COL_W;

export default function DoubleElimBracketView({
    bracket,
    renderMatch,
    ur2m1Node,
}: {
    bracket: DoubleElimBracket;
    renderMatch: (mu: KnockoutMatchup) => ReactNode;
    ur2m1Node: ReactNode;
}) {
    // Toạ độ tuyệt đối (đỉnh ô)
    const ur1m1Top = HEADER;
    const ur1m2Top = HEADER + NODE_H + V_GAP;
    const ur2m1Top = ur1m1Top;
    const ur2m2Top = ur1m2Top;
    const ur3Top = HEADER + (NODE_H + V_GAP) / 2;
    const lowerTop = HEADER + 2 * NODE_H + V_GAP + BAND_GAP;

    const aUr1m1 = ur1m1Top + ANCHOR;
    const aUr1m2 = ur1m2Top + ANCHOR;
    const aUr2m1 = ur2m1Top + ANCHOR;
    const aUr2m2 = ur2m2Top + ANCHOR;
    const aUr3 = ur3Top + ANCHOR;
    const aLower = lowerTop + ANCHOR;
    const aGf = (aUr3 + aLower) / 2;
    const gfTop = aGf - ANCHOR;

    const canvasW = colLeft(4) + COL_W;
    const canvasH = lowerTop + NODE_H + 10;

    const midUR2 = colRight(1) + GAP / 2;
    const elbowGF = colLeft(4) - GAP / 2;

    const node = (left: number, top: number, content: ReactNode, key: string) => (
        <div key={key} className="absolute z-10" style={{ left, top, width: COL_W }}>
            {content}
        </div>
    );
    const hLine = (x: number, y: number, w: number, key: string) => (
        <div
            key={key}
            className="absolute bg-navy-200 z-0"
            style={{ left: x, top: y - 1, width: Math.max(0, w), height: 2 }}
        />
    );
    const vLine = (x: number, y1: number, y2: number, key: string) => (
        <div
            key={key}
            className="absolute bg-navy-200 z-0"
            style={{ left: x - 1, top: Math.min(y1, y2), width: 2, height: Math.abs(y2 - y1) }}
        />
    );

    const upperLabels = [
        { x: colLeft(0), t: "Play-in" },
        { x: colLeft(1), t: "Nhánh thắng V2" },
        { x: colLeft(2), t: "CK nhánh thắng" },
        { x: colLeft(4), t: "Chung kết" },
    ];
    const lowerLabels = [
        { x: colLeft(0), t: "Nhánh thua V1" },
        { x: colLeft(1), t: "Nhánh thua V2" },
        { x: colLeft(2), t: "Nhánh thua V3" },
        { x: colLeft(3), t: "CK nhánh thua" },
    ];

    return (
        <div className="overflow-x-auto pb-2">
            <div className="relative mx-auto" style={{ width: canvasW, height: canvasH }}>
                {/* Nhãn cột */}
                {upperLabels.map((l, i) => (
                    <div
                        key={`ul${i}`}
                        className="absolute text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
                        style={{ left: l.x, top: 0, width: COL_W }}
                    >
                        {l.t}
                    </div>
                ))}
                {lowerLabels.map((l, i) => (
                    <div
                        key={`ll${i}`}
                        className="absolute text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
                        style={{ left: l.x, top: lowerTop - 20, width: COL_W }}
                    >
                        {l.t}
                    </div>
                ))}

                {/* Đường nối — nhánh thắng */}
                {hLine(colRight(0), aUr1m1, colLeft(1) - colRight(0), "c1")}
                {hLine(colRight(0), aUr1m2, colLeft(1) - colRight(0), "c2")}
                {hLine(colRight(1), aUr2m1, midUR2 - colRight(1), "c3")}
                {hLine(colRight(1), aUr2m2, midUR2 - colRight(1), "c4")}
                {vLine(midUR2, aUr2m1, aUr2m2, "c5")}
                {hLine(midUR2, aUr3, colLeft(2) - midUR2, "c6")}
                {hLine(colRight(2), aUr3, elbowGF - colRight(2), "c7")}
                {vLine(elbowGF, aUr3, aGf, "c8")}
                {hLine(elbowGF, aGf, colLeft(4) - elbowGF, "c9")}

                {/* Đường nối — nhánh thua + hội tụ chung kết */}
                {hLine(colRight(0), aLower, colLeft(1) - colRight(0), "c12")}
                {hLine(colRight(1), aLower, colLeft(2) - colRight(1), "c13")}
                {hLine(colRight(2), aLower, colLeft(3) - colRight(2), "c14")}
                {hLine(colRight(3), aLower, elbowGF - colRight(3), "c10")}
                {vLine(elbowGF, aLower, aGf, "c11")}

                {/* Các ô */}
                {node(colLeft(0), ur1m1Top, renderMatch(bracket.ur1m1), "ur1m1")}
                {node(colLeft(0), ur1m2Top, renderMatch(bracket.ur1m2), "ur1m2")}
                {node(colLeft(1), ur2m1Top, ur2m1Node, "ur2m1")}
                {node(colLeft(1), ur2m2Top, renderMatch(bracket.ur2m2), "ur2m2")}
                {node(colLeft(2), ur3Top, renderMatch(bracket.ur3), "ur3")}
                {node(colLeft(4), gfTop, renderMatch(bracket.grandFinal), "gf")}
                {node(colLeft(0), lowerTop, renderMatch(bracket.lr1), "lr1")}
                {node(colLeft(1), lowerTop, renderMatch(bracket.lr2), "lr2")}
                {node(colLeft(2), lowerTop, renderMatch(bracket.lr3), "lr3")}
                {node(colLeft(3), lowerTop, renderMatch(bracket.lrFinal), "lrFinal")}
            </div>
        </div>
    );
}
