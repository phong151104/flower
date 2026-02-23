import Link from "next/link";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    Instagram,
    Heart,
} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-1">
                            <span className="font-display text-2xl font-bold text-white">
                                Bloom
                            </span>
                            <span className="font-script text-2xl text-primary-400">
                                ella
                            </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Mang đến vẻ đẹp tự nhiên qua từng cánh hoa, tạo nên những khoảnh
                            khắc đáng nhớ trong cuộc sống.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-500 rounded-full flex items-center justify-center
                         transition-all duration-300 hover:-translate-y-1"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-500 rounded-full flex items-center justify-center
                         transition-all duration-300 hover:-translate-y-1"
                            >
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-display text-lg font-semibold text-white mb-6">
                            Liên Kết
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: "Trang chủ", href: "/" },
                                { name: "Cửa hàng", href: "/shop" },
                                { name: "Bộ sưu tập", href: "/gallery" },
                                { name: "Giới thiệu", href: "/about" },
                                { name: "Liên hệ", href: "/contact" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors duration-300 hover:pl-2"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-display text-lg font-semibold text-white mb-6">
                            Dịch Vụ
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Hoa cưới",
                                "Hoa sinh nhật",
                                "Hoa khai trương",
                                "Hoa chia buồn",
                                "Hoa trang trí sự kiện",
                            ].map((service) => (
                                <li key={service}>
                                    <span className="text-gray-400 hover:text-primary-400 transition-colors duration-300 cursor-pointer hover:pl-2 block">
                                        {service}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-display text-lg font-semibold text-white mb-6">
                            Liên Hệ
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">
                                    44 Ng. 176 P. Lê Trọng Tấn, Khương Mai, Thanh Xuân, Hà Nội
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                                <span className="text-gray-400">0888 229 955</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                                <span className="text-gray-400">blommella102@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock size={18} className="text-primary-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-400">
                                    T2 - CN: 8:00 - 21:00
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            © {currentYear} Bloomella. Tất cả quyền được bảo lưu.
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                            Thiết kế với{" "}
                            <Heart size={14} className="text-primary-400 fill-primary-400" />{" "}
                            tại Việt Nam
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
