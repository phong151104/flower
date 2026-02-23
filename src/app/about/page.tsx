"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    Sparkles,
    Truck,
    Leaf,
    Award,
    Clock,
    Users,
    MapPin,
    Phone,
    Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6 },
};

const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.15 } },
    viewport: { once: true },
};

const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
};

const values = [
    {
        icon: Heart,
        title: "Tình yêu hoa",
        desc: "Mỗi bó hoa là một tác phẩm nghệ thuật, được tạo ra bằng cả trái tim và sự đam mê.",
        color: "text-primary-500",
        bg: "bg-primary-50",
    },
    {
        icon: Leaf,
        title: "Tươi mới mỗi ngày",
        desc: "Hoa được nhập trực tiếp từ vườn và nhà kính mỗi sáng sớm, đảm bảo tươi nguyên.",
        color: "text-forest-500",
        bg: "bg-green-50",
    },
    {
        icon: Sparkles,
        title: "Sáng tạo không giới hạn",
        desc: "Kết hợp AI và nghệ nhân, tạo nên những thiết kế độc đáo chỉ dành riêng cho bạn.",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
    {
        icon: Truck,
        title: "Giao nhanh 2 giờ",
        desc: "Đội ngũ shipper chuyên nghiệp, giao hoa an toàn trong vòng 2 giờ nội thành.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
];

const milestones = [
    { year: "2020", title: "Khởi đầu", desc: "Bloomella ra đời từ một shop hoa nhỏ tại HCM" },
    { year: "2021", title: "Mở rộng", desc: "Phục vụ hơn 5,000 khách hàng, mở thêm 2 chi nhánh" },
    { year: "2023", title: "Đổi mới", desc: "Tích hợp AI vào thiết kế bó hoa tùy chỉnh" },
    { year: "2024", title: "Phát triển", desc: "Top 10 shop hoa được yêu thích nhất Việt Nam" },
];

const team = [
    {
        name: "Mai Lưu Ly",
        role: "Founder & Lead Florist",
        initial: "L",
        gradient: "from-pink-400 to-rose-500",
        quote: "Hoa không chỉ đẹp, hoa là ngôn ngữ của trái tim.",
    },
    {
        name: "Nguyễn Thị Quỳnh",
        role: "Creative Director",
        initial: "Q",
        gradient: "from-violet-400 to-purple-500",
        quote: "Mỗi bó hoa kể một câu chuyện riêng.",
    },
    {
        name: "Nguyễn Thị Như",
        role: "Head of Operations",
        initial: "N",
        gradient: "from-amber-400 to-orange-500",
        quote: "Sự hài lòng của khách hàng là niềm vui của chúng tôi.",
    },
    {
        name: "Phạm Hùng Phong",
        role: "AI & Tech Lead",
        initial: "P",
        gradient: "from-cyan-400 to-blue-500",
        quote: "Công nghệ giúp hoa đến gần hơn với mọi người.",
    },
];

const stats = [
    { number: "50,000+", label: "Bó hoa đã tạo", icon: Sparkles },
    { number: "15,000+", label: "Khách hàng tin tưởng", icon: Users },
    { number: "4.9/5", label: "Đánh giá trung bình", icon: Award },
    { number: "2h", label: "Giao hàng nhanh nhất", icon: Clock },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-cream-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-28 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-peach-50" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-peach-200/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeIn}>
                            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-6">
                                🌸 Về chúng tôi
                            </span>
                            <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                Nơi mỗi bó hoa là{" "}
                                <span className="font-script text-primary-500">
                                    một câu chuyện
                                </span>
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Bloomella không chỉ bán hoa — chúng tôi tạo nên những khoảnh khắc đặc biệt,
                                kết nối yêu thương qua từng cánh hoa tinh tế. Với sự kết hợp giữa nghệ thuật
                                truyền thống và công nghệ AI hiện đại, mỗi tác phẩm đều là duy nhất.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/shop"
                                    className="px-8 py-3.5 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-all duration-300 shadow-pastel hover:shadow-xl"
                                >
                                    Khám phá cửa hàng
                                </Link>
                                <a
                                    href="#our-story"
                                    className="px-8 py-3.5 border-2 border-forest-500 text-forest-500 rounded-full font-semibold hover:bg-forest-500 hover:text-white transition-all duration-300"
                                >
                                    Câu chuyện của chúng tôi
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=750&fit=crop&q=80"
                                    alt="Bloomella flower shop"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-pastel p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                                    <Award className="text-forest-500" size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Top 10</p>
                                    <p className="text-gray-400 text-xs">Shop hoa yêu thích nhất 2024</p>
                                </div>
                            </div>
                            {/* Floating badge 2 */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-pastel p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Heart className="text-primary-500 fill-primary-500" size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">15K+</p>
                                    <p className="text-gray-400 text-xs">Khách hàng hạnh phúc</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        {...staggerContainer}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                {...staggerItem}
                                className="text-center"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-cream-100 rounded-2xl flex items-center justify-center">
                                    <stat.icon size={24} className="text-primary-500" />
                                </div>
                                <p className="font-display text-3xl font-bold text-gray-900 mb-1">
                                    {stat.number}
                                </p>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section id="our-story" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Câu chuyện{" "}
                            <span className="font-script text-primary-500">Bloomella</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Từ một cô gái yêu hoa đến thương hiệu hoa được tin yêu
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="relative">
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-pastel">
                                    <Image
                                        src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop&q=80"
                                        alt="Bloomella story"
                                        width={600}
                                        height={600}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary-100 rounded-full -z-10" />
                                <div className="absolute -top-8 -left-8 w-32 h-32 bg-peach-100 rounded-full -z-10" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Bloomella bắt đầu từ năm 2020, khi Mai Lưu Ly — một cô gái đam mê hoa từ nhỏ —
                                quyết định biến tình yêu thành sự nghiệp. Từ một góc nhỏ trong căn phòng trọ,
                                với vài xô hoa và chiếc kéo, Bloomella ra đời.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                &ldquo;Tôi tin rằng hoa có sức mạnh kỳ diệu — có thể làm ai đó mỉm cười,
                                có thể xoa dịu nỗi buồn, và có thể nói lên những điều mà lời nói không thể.
                                Bloomella sinh ra để mang sức mạnh đó đến gần hơn với mọi người.&rdquo;
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Ngày nay, Bloomella tự hào là một trong những shop hoa tiên phong ứng dụng
                                công nghệ AI vào thiết kế hoa, giúp khách hàng tạo nên những bó hoa
                                độc nhất vô nhị chỉ trong vài phút.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">L</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Mai Lưu Ly</p>
                                    <p className="text-sm text-gray-400">Founder, Bloomella</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Giá trị{" "}
                            <span className="font-script text-primary-500">cốt lõi</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Những điều chúng tôi luôn giữ vững trong mỗi bó hoa
                        </p>
                    </motion.div>

                    <motion.div
                        {...staggerContainer}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {values.map((v) => (
                            <motion.div
                                key={v.title}
                                {...staggerItem}
                                className="group p-6 bg-cream-50 rounded-3xl hover:shadow-pastel transition-all duration-500 hover:-translate-y-1"
                            >
                                <div
                                    className={`w-14 h-14 ${v.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <v.icon size={24} className={v.color} />
                                </div>
                                <h3 className="font-display text-lg font-bold text-gray-800 mb-2">
                                    {v.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {v.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Hành trình{" "}
                            <span className="font-script text-primary-500">phát triển</span>
                        </h2>
                    </motion.div>

                    <div className="relative">
                        {/* Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 -translate-x-1/2 hidden md:block" />

                        <div className="space-y-12">
                            {milestones.map((m, i) => (
                                <motion.div
                                    key={m.year}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={`relative flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                >
                                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                        <div className="bg-white p-6 rounded-2xl shadow-card inline-block">
                                            <span className="text-primary-500 font-bold text-lg">
                                                {m.year}
                                            </span>
                                            <h3 className="font-display text-xl font-bold text-gray-800 mt-1">
                                                {m.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-2">{m.desc}</p>
                                        </div>
                                    </div>
                                    {/* Dot */}
                                    <div className="hidden md:flex w-4 h-4 bg-primary-500 rounded-full border-4 border-cream-50 shadow-md z-10 flex-shrink-0" />
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Đội ngũ{" "}
                            <span className="font-script text-primary-500">Bloomella</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Những con người đam mê đứng sau mỗi bó hoa
                        </p>
                    </motion.div>

                    <motion.div
                        {...staggerContainer}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {team.map((member) => (
                            <motion.div
                                key={member.name}
                                {...staggerItem}
                                className="group text-center"
                            >
                                <div className={`relative w-40 h-40 mx-auto mb-5 rounded-full bg-gradient-to-br ${member.gradient} shadow-pastel group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center`}>
                                    <span className="text-white font-display text-5xl font-bold">{member.initial}</span>
                                </div>
                                <h3 className="font-display text-lg font-bold text-gray-800">
                                    {member.name}
                                </h3>
                                <p className="text-primary-500 text-sm font-medium mb-3">
                                    {member.role}
                                </p>
                                <p className="text-gray-400 text-sm italic leading-relaxed">
                                    &ldquo;{member.quote}&rdquo;
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact / CTA */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest-500 to-forest-700" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-forest-400/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div {...fadeIn}>
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">
                            Hãy để Bloomella tô điểm{" "}
                            <span className="font-script text-primary-200">khoảnh khắc</span>{" "}
                            của bạn
                        </h2>
                        <p className="text-forest-100 text-lg mb-10 max-w-2xl mx-auto">
                            Dù là một bó hoa nhỏ gửi tặng bạn bè, hay một tác phẩm hoành tráng cho sự kiện —
                            Bloomella luôn sẵn sàng phục vụ bạn.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            <Link
                                href="/shop"
                                className="px-8 py-4 bg-white text-forest-600 rounded-full font-semibold hover:bg-cream-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Đặt hoa ngay
                            </Link>
                            <Link
                                href="/shop"
                                className="px-8 py-4 border-2 border-white/50 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                            >
                                Tự thiết kế với AI ✨
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-center gap-3 text-forest-100">
                                <MapPin size={18} className="text-primary-300" />
                                <span className="text-sm">44 Ng. 176 P. Lê Trọng Tấn, Khương Mai, Thanh Xuân, HN</span>
                            </div>
                            <div className="flex items-center justify-center gap-3 text-forest-100">
                                <Phone size={18} className="text-primary-300" />
                                <span className="text-sm">0888 229 955</span>
                            </div>
                            <div className="flex items-center justify-center gap-3 text-forest-100">
                                <Mail size={18} className="text-primary-300" />
                                <span className="text-sm">blommella102@gmail.com</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
