"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    MessageCircle,
    CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6 },
};

const contactInfo = [
    {
        icon: MapPin,
        title: "Địa chỉ",
        details: ["44 Ng. 176 P. Lê Trọng Tấn", "Khương Mai, Thanh Xuân, Hà Nội"],
        color: "text-primary-500",
        bg: "bg-primary-50",
    },
    {
        icon: Phone,
        title: "Điện thoại",
        details: ["0888 229 955"],
        color: "text-forest-500",
        bg: "bg-green-50",
    },
    {
        icon: Mail,
        title: "Email",
        details: ["blommella102@gmail.com"],
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: Clock,
        title: "Giờ mở cửa",
        details: ["Thứ 2 - Thứ 7: 7:00 - 21:00", "Chủ nhật: 8:00 - 20:00"],
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
];

const socials = [
    {
        name: "Facebook",
        handle: "Bloomella Vietnam",
        url: "https://www.facebook.com/bloomella102",
        desc: "Cập nhật mẫu hoa mới, chương trình khuyến mãi",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        gradient: "from-blue-500 to-blue-600",
        hoverBg: "hover:bg-blue-50",
        textColor: "text-blue-600",
    },
    {
        name: "Instagram",
        handle: "@bloomella.vn",
        url: "https://www.instagram.com/bloomella.florist/",
        desc: "Hình ảnh bó hoa đẹp, behind the scenes",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
        gradient: "from-pink-500 via-purple-500 to-orange-400",
        hoverBg: "hover:bg-pink-50",
        textColor: "text-pink-600",
    },
    {
        name: "TikTok",
        handle: "@bloomella.102",
        url: "https://www.tiktok.com/@bloomella.102",
        desc: "Video hoa đẹp, tips cắm hoa, behind the scenes",
        icon: (
            <svg viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6">
                <path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8A162.6 162.6 0 11185 188.3v89.9a74.6 74.6 0 1052.2 71.2V0h88a121 121 0 00122.8 121.3z" />
            </svg>
        ),
        gradient: "from-gray-800 to-black",
        hoverBg: "hover:bg-gray-50",
        textColor: "text-gray-800",
    },
    {
        name: "Zalo",
        handle: "Bloomella Shop",
        url: "https://zalo.me/0342081925",
        desc: "Chat tư vấn nhanh, đặt hoa trực tiếp",
        icon: (
            <svg viewBox="0 0 48 48" className="w-6 h-6">
                <path d="M24 2C11.85 2 2 10.95 2 22c0 5.2 2.15 9.95 5.7 13.55L5.5 44l9.15-4.8C17.4 40.35 20.6 41 24 41c12.15 0 22-8.5 22-19S36.15 2 24 2z" fill="currentColor" />
                <text x="24" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">Zalo</text>
            </svg>
        ),
        gradient: "from-blue-400 to-blue-500",
        hoverBg: "hover:bg-sky-50",
        textColor: "text-blue-500",
    },
];

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormState({ name: "", email: "", phone: "", subject: "", message: "" });
    };

    return (
        <main className="min-h-screen bg-cream-50">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-28 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest-50 via-cream-50 to-primary-50" />
                <div className="absolute top-20 left-10 w-64 h-64 bg-forest-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-10 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div {...fadeIn}>
                        <span className="inline-block px-4 py-1.5 bg-forest-100 text-forest-600 rounded-full text-sm font-medium mb-6">
                            💌 Liên hệ với chúng tôi
                        </span>
                        <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                            Chúng tôi luôn sẵn sàng{" "}
                            <span className="font-script text-primary-500">lắng nghe</span>{" "}
                            bạn
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Có câu hỏi, góp ý hay muốn đặt hoa? Hãy liên hệ với Bloomella
                            qua bất kỳ kênh nào bên dưới — chúng tôi sẽ phản hồi trong vòng 30 phút!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{}}
                        whileInView={{ transition: { staggerChildren: 0.1 } }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {contactInfo.map((info, i) => (
                            <motion.div
                                key={info.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-pastel transition-all duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className={`w-12 h-12 ${info.bg} rounded-xl flex items-center justify-center mb-4`}
                                >
                                    <info.icon size={22} className={info.color} />
                                </div>
                                <h3 className="font-display font-bold text-gray-800 mb-2">
                                    {info.title}
                                </h3>
                                {info.details.map((d) => (
                                    <p key={d} className="text-gray-500 text-sm leading-relaxed">
                                        {d}
                                    </p>
                                ))}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Social Media + Form */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Social + Map — left side */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Social Links */}
                            <motion.div {...fadeIn}>
                                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                                    Kết nối với{" "}
                                    <span className="font-script text-primary-500">Bloomella</span>
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Theo dõi chúng tôi để cập nhật mẫu hoa mới và ưu đãi hấp dẫn
                                </p>

                                <div className="space-y-4">
                                    {socials.map((s, i) => (
                                        <motion.a
                                            key={s.name}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: i * 0.1 }}
                                            className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm ${s.hoverBg} hover:shadow-md hover:border-transparent transition-all duration-300`}
                                        >
                                            {/* Icon with gradient bg */}
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                {s.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-sm ${s.textColor}`}>
                                                        {s.name}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">•</span>
                                                    <span className="text-gray-500 text-xs truncate">
                                                        {s.handle}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs mt-0.5">
                                                    {s.desc}
                                                </p>
                                            </div>
                                            <svg
                                                className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Map */}
                            <motion.div
                                {...fadeIn}
                                className="rounded-2xl overflow-hidden shadow-card h-52"
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.696!2d105.8136!3d21.0003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac!2sL%C3%AA%20Tr%E1%BB%8Dng%20T%E1%BA%A5n%2C%20Kh%C6%B0%C6%A1ng%20Mai%2C%20Thanh%20Xu%C3%A2n%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1708000000000!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Bloomella location"
                                />
                            </motion.div>
                        </div>

                        {/* Contact Form — right side */}
                        <motion.div
                            {...fadeIn}
                            className="lg:col-span-3"
                        >
                            <div className="bg-white rounded-3xl shadow-pastel p-8 lg:p-10">
                                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                                    Gửi tin nhắn cho chúng tôi
                                </h2>
                                <p className="text-gray-400 text-sm mb-8">
                                    Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất
                                </p>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-xl flex items-center gap-3"
                                    >
                                        <CheckCircle size={20} className="text-forest-500" />
                                        <span className="text-forest-700 text-sm font-medium">
                                            Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất. 💐
                                        </span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Họ và tên <span className="text-primary-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formState.name}
                                                onChange={handleChange}
                                                placeholder="Nguyễn Văn A"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-cream-50 text-gray-800 text-sm
                                                         focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200
                                                         placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Số điện thoại <span className="text-primary-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formState.phone}
                                                onChange={handleChange}
                                                placeholder="0888 229 955"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-cream-50 text-gray-800 text-sm
                                                         focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200
                                                         placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formState.email}
                                            onChange={handleChange}
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-cream-50 text-gray-800 text-sm
                                                     focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200
                                                     placeholder:text-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Chủ đề
                                        </label>
                                        <select
                                            name="subject"
                                            value={formState.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-cream-50 text-gray-800 text-sm
                                                     focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200
                                                     appearance-none cursor-pointer"
                                        >
                                            <option value="">Chọn chủ đề...</option>
                                            <option value="order">Đặt hoa</option>
                                            <option value="custom">Thiết kế bó hoa riêng</option>
                                            <option value="event">Hoa sự kiện / đám cưới</option>
                                            <option value="corporate">Hợp tác doanh nghiệp</option>
                                            <option value="feedback">Góp ý / Phản hồi</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Tin nhắn <span className="text-primary-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={formState.message}
                                            onChange={handleChange}
                                            placeholder="Mô tả yêu cầu của bạn..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-cream-50 text-gray-800 text-sm resize-none
                                                     focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200
                                                     placeholder:text-gray-300"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-4 bg-primary-500 text-white rounded-full font-semibold flex items-center justify-center gap-2
                                                 hover:bg-primary-600 transition-colors duration-300 shadow-pastel hover:shadow-xl"
                                    >
                                        <Send size={18} />
                                        Gửi tin nhắn
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-12">
                        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                            Câu hỏi{" "}
                            <span className="font-script text-primary-500">thường gặp</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Bloomella có giao hoa tận nơi không?",
                                a: "Có! Chúng tôi giao hoa trong vòng 2 giờ nội thành Hà Nội. Đối với các quận huyện ngoại thành và tỉnh lân cận, thời gian giao hàng từ 3-5 giờ.",
                            },
                            {
                                q: "Tôi có thể đặt hoa theo mẫu riêng không?",
                                a: "Tất nhiên rồi! Bạn có thể sử dụng tính năng \"Tự thiết kế bó hoa AI\" trên website, hoặc gửi ảnh mẫu qua Zalo để chúng tôi làm theo ý bạn.",
                            },
                            {
                                q: "Bloomella có nhận hoa sự kiện, đám cưới không?",
                                a: "Có ạ! Chúng tôi chuyên cung cấp hoa cưới, hoa sự kiện với số lượng lớn. Liên hệ sớm để được tư vấn và báo giá chi tiết nhé.",
                            },
                            {
                                q: "Phương thức thanh toán nào được chấp nhận?",
                                a: "Bloomella chấp nhận: tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, ví MoMo, ZaloPay, và thẻ tín dụng/ghi nợ.",
                            },
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="bg-cream-50 rounded-2xl p-6"
                            >
                                <h3 className="font-display font-bold text-gray-800 mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
