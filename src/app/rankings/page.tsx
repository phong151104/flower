import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RankingsView from "@/components/club/RankingsView";

export const metadata = {
    title: "Bảng xếp hạng Elo — PickleClub",
};

export default function RankingsPage() {
    return (
        <>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
                <div className="mb-8 animate-fade-in">
                    <h1 className="section-heading">Bảng xếp hạng Elo</h1>
                    <p className="text-gray-500 mt-2">
                        Xếp hạng Elo chính thức của CLB, cập nhật sau mỗi trận.
                    </p>
                </div>
                <RankingsView />
            </main>
            <Footer />
        </>
    );
}
