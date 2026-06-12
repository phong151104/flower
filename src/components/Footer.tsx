import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-navy-900 text-gray-300 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-court rounded-lg flex items-center justify-center">
                            <Zap size={16} className="text-ball-300" />
                        </div>
                        <span className="font-display font-bold text-lg text-white">
                            Pickle<span className="text-court-400">Club</span>
                        </span>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                        <Link href="/rankings" className="hover:text-court-400 transition-colors">
                            Bảng xếp hạng
                        </Link>
                        <Link href="/matches" className="hover:text-court-400 transition-colors">
                            Trận đấu
                        </Link>
                        <Link href="/training" className="hover:text-court-400 transition-colors">
                            Lịch tập
                        </Link>
                        <Link href="/tournaments" className="hover:text-court-400 transition-colors">
                            Giải đấu
                        </Link>
                    </nav>

                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} PickleClub — Chơi hết mình, xếp hạng công bằng 🏓
                    </p>
                </div>
            </div>
        </footer>
    );
}
