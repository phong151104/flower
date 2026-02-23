import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Bloomella - Beautiful Flower Bouquets & Arrangements",
    description:
        "Discover our rich collection of fresh flowers, bouquets, and floral arrangements. Perfect for weddings, anniversaries, birthdays, and every special moment.",
    keywords: [
        "hoa tươi",
        "bó hoa",
        "flower shop",
        "bouquet",
        "wedding flowers",
        "flower delivery",
    ],
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

