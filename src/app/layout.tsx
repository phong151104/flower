import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "PickleClub — CLB Pickleball | Xếp hạng Elo & Lịch tập",
    description:
        "Website nội bộ CLB Pickleball: bảng xếp hạng Elo, lịch sử trận đấu, lịch tập luyện, vote đi tập và quản lý giải đấu.",
    keywords: ["pickleball", "elo", "câu lạc bộ", "xếp hạng", "giải đấu"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className="min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
