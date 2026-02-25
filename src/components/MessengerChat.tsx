"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FB_PAGE_ID = "100063905831084";

export default function MessengerChat() {
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [fallback, setFallback] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Try loading Facebook SDK for Customer Chat Plugin
        if (typeof window === "undefined") return;

        // Define fbAsyncInit
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
                xfbml: true,
                version: "v18.0",
            });
            setSdkLoaded(true);
        };

        // Load SDK script
        if (!document.getElementById("facebook-jssdk")) {
            const script = document.createElement("script");
            script.id = "facebook-jssdk";
            script.src = "https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js";
            script.async = true;
            script.defer = true;
            script.onerror = () => {
                // SDK failed to load → use fallback
                setFallback(true);
            };
            document.body.appendChild(script);

            // Timeout fallback if SDK doesn't load in 5s
            setTimeout(() => {
                if (!(window as any).FB) {
                    setFallback(true);
                }
            }, 5000);
        }
    }, []);

    const openMessenger = () => {
        window.open(
            `https://m.me/${FB_PAGE_ID}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <>
            {/* Facebook Chat Plugin (SDK-based, chat inside website) */}
            <div id="fb-root"></div>
            <div
                className="fb-customerchat"
                // @ts-ignore
                attribution="biz_inbox"
                page_id={FB_PAGE_ID}
                theme_color="#0084ff"
                logged_in_greeting="Xin chào! 🌸 Bạn cần tư vấn về hoa không?"
                logged_out_greeting="Xin chào! 🌸 Bạn cần tư vấn về hoa không?"
            />

            {/* Fallback: floating Messenger button if SDK doesn't load */}
            {fallback && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                    <AnimatePresence>
                        {showPopup && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 p-5 w-72"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg viewBox="0 0 36 36" className="w-5 h-5 text-white fill-current">
                                                <path d="M18 0C7.8 0 0 7.13 0 16.32c0 4.93 2.2 9.33 5.67 12.35V36l6.84-3.76c1.73.48 3.56.74 5.49.74 10.2 0 18-7.13 18-16.32S28.2 0 18 0zm1.88 21.87l-4.59-4.9-8.94 4.9 9.84-10.43 4.7 4.9 8.83-4.9-9.84 10.43z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Bloomella</p>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-gray-500">Đang hoạt động</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPopup(false)}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                    <p className="text-sm text-gray-700">
                                        Xin chào! 👋 Bạn cần tư vấn về hoa hay đặt hàng? Nhắn tin cho mình nhé!
                                    </p>
                                </div>

                                <button
                                    onClick={openMessenger}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                >
                                    <svg viewBox="0 0 36 36" className="w-5 h-5 fill-current">
                                        <path d="M18 0C7.8 0 0 7.13 0 16.32c0 4.93 2.2 9.33 5.67 12.35V36l6.84-3.76c1.73.48 3.56.74 5.49.74 10.2 0 18-7.13 18-16.32S28.2 0 18 0zm1.88 21.87l-4.59-4.9-8.94 4.9 9.84-10.43 4.7 4.9 8.83-4.9-9.84 10.43z" />
                                    </svg>
                                    Chat qua Messenger
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        onClick={() => setShowPopup(!showPopup)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-blue-500/40 transition-shadow relative"
                    >
                        <AnimatePresence mode="wait">
                            {showPopup ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <MessageCircle size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!showPopup && (
                            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-25" />
                        )}
                    </motion.button>
                </div>
            )}
        </>
    );
}
