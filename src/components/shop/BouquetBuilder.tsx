"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Flower2,
    Palette,
    Gift,
    ScrollText,
    DollarSign,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Loader2,
    RotateCcw,
} from "lucide-react";

const steps = [
    { icon: <Flower2 size={18} />, label: "Loại hoa" },
    { icon: <Palette size={18} />, label: "Màu sắc" },
    { icon: <Gift size={18} />, label: "Style bó" },
    { icon: <ScrollText size={18} />, label: "Giấy gói" },
    { icon: <DollarSign size={18} />, label: "Khoảng giá" },
    { icon: <Sparkles size={18} />, label: "AI Preview" },
];

const flowerOptions = [
    { id: "rose", name: "Hoa Hồng", emoji: "🌹" },
    { id: "tulip", name: "Hoa Tulip", emoji: "🌷" },
    { id: "sunflower", name: "Hướng Dương", emoji: "🌻" },
    { id: "lily", name: "Hoa Ly", emoji: "💐" },
    { id: "daisy", name: "Hoa Cúc", emoji: "🌼" },
    { id: "orchid", name: "Hoa Lan", emoji: "🪻" },
    { id: "hydrangea", name: "Cẩm Tú Cầu", emoji: "💠" },
    { id: "baby_breath", name: "Baby Breath", emoji: "🤍" },
];

const colorChoices = [
    { id: "pink", name: "Hồng Pastel", color: "#F8B4C8" },
    { id: "red", name: "Đỏ Đậm", color: "#E53935" },
    { id: "white", name: "Trắng Tinh", color: "#F5F5F5" },
    { id: "yellow", name: "Vàng Ấm", color: "#FFD54F" },
    { id: "purple", name: "Tím Oải Hương", color: "#AB47BC" },
    { id: "orange", name: "Cam Rực", color: "#FF8A65" },
    { id: "mix", name: "Mix Nhiều Màu", color: "linear-gradient(135deg, #F8B4C8, #FFD54F, #AB47BC, #66BB6A)" },
];

const styleOptions = [
    { id: "round", name: "Bó Tròn", desc: "Cổ điển, cân đối", icon: "⭕" },
    { id: "long", name: "Bó Dài", desc: "Sang trọng, thanh lịch", icon: "📏" },
    { id: "cascade", name: "Cascade", desc: "Thác đổ, lãng mạn", icon: "🌊" },
    { id: "basket", name: "Giỏ Hoa", desc: "Ấm cúng, trang trí", icon: "🧺" },
    { id: "box", name: "Hộp Hoa", desc: "Hiện đại, cao cấp", icon: "📦" },
];

const wrappingOptions = [
    { id: "kraft", name: "Giấy Kraft", desc: "Vintage, tự nhiên", color: "#C4A882" },
    { id: "silk", name: "Giấy Lụa", desc: "Mềm mại, sang trọng", color: "#F8B4C8" },
    { id: "korean", name: "Giấy Hàn Quốc", desc: "Hiện đại, tinh tế", color: "#E8D5B7" },
    { id: "transparent", name: "Giấy Trong Suốt", desc: "Tối giản, trẻ trung", color: "#E0F2F1" },
    { id: "newspaper", name: "Giấy Báo", desc: "Phong cách, cá tính", color: "#F5F5DC" },
];

const priceRanges = [
    { id: "budget", name: "200K - 400K", range: [200000, 400000], desc: "Đơn giản, dễ thương" },
    { id: "mid", name: "400K - 700K", range: [400000, 700000], desc: "Phổ biến nhất" },
    { id: "premium", name: "700K - 1.2M", range: [700000, 1200000], desc: "Sang trọng" },
    { id: "luxury", name: "Trên 1.2M", range: [1200000, 5000000], desc: "Đẳng cấp, đặc biệt" },
];



interface BuilderState {
    flowers: string[];
    color: string;
    style: string;
    wrapping: string;
    priceRange: string;
}

export default function BouquetBuilder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selections, setSelections] = useState<BuilderState>({
        flowers: [],
        color: "",
        style: "",
        wrapping: "",
        priceRange: "",
    });

    const toggleFlower = (id: string) => {
        setSelections((prev) => ({
            ...prev,
            flowers: prev.flowers.includes(id)
                ? prev.flowers.filter((f) => f !== id)
                : [...prev.flowers, id],
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return selections.flowers.length > 0;
            case 1: return selections.color !== "";
            case 2: return selections.style !== "";
            case 3: return selections.wrapping !== "";
            case 4: return selections.priceRange !== "";
            case 5: return true;
            default: return false;
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedImage(null);
        setErrorMessage(null);

        try {
            const res = await fetch("/api/generate-bouquet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selections),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
            } else {
                setGeneratedImage(data.image);
            }
        } catch {
            setErrorMessage("Không thể kết nối tới server. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setGeneratedImage(null);
        setIsGenerating(false);
        setErrorMessage(null);
        setSelections({ flowers: [], color: "", style: "", wrapping: "", priceRange: "" });
    };

    const getSelectionSummary = () => {
        const flowerNames = selections.flowers.map(
            (id) => flowerOptions.find((f) => f.id === id)?.name
        ).filter(Boolean);
        const colorName = colorChoices.find((c) => c.id === selections.color)?.name;
        const styleName = styleOptions.find((s) => s.id === selections.style)?.name;
        const wrapName = wrappingOptions.find((w) => w.id === selections.wrapping)?.name;
        const priceName = priceRanges.find((p) => p.id === selections.priceRange)?.name;
        return { flowerNames, colorName, styleName, wrapName, priceName };
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <button
                            onClick={() => index < currentStep && setCurrentStep(index)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                ${index === currentStep
                                    ? "bg-primary-500 text-white shadow-pastel"
                                    : index < currentStep
                                        ? "bg-forest-50 text-forest-500 cursor-pointer hover:bg-forest-100"
                                        : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {step.icon}
                            <span className="hidden sm:inline">{step.label}</span>
                        </button>
                        {index < steps.length - 1 && (
                            <div className={`w-6 sm:w-10 h-0.5 mx-1 ${index < currentStep ? "bg-forest-300" : "bg-gray-200"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Step 0: Flowers */}
                    {currentStep === 0 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Chọn loại hoa yêu thích
                            </h3>
                            <p className="text-gray-400 mb-6">Bạn có thể chọn nhiều loại hoa</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {flowerOptions.map((flower) => (
                                    <button
                                        key={flower.id}
                                        onClick={() => toggleFlower(flower.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${selections.flowers.includes(flower.id)
                                                ? "border-primary-500 bg-primary-50 shadow-pastel scale-105"
                                                : "border-gray-100 hover:border-primary-200 hover:bg-cream-50"
                                            }`}
                                    >
                                        <span className="text-3xl block mb-2">{flower.emoji}</span>
                                        <span className="text-sm font-medium text-gray-700">{flower.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Colors */}
                    {currentStep === 1 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Chọn màu sắc chủ đạo
                            </h3>
                            <p className="text-gray-400 mb-6">Chọn tông màu bạn yêu thích</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {colorChoices.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelections((p) => ({ ...p, color: color.id }))}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300
                                            ${selections.color === color.id
                                                ? "border-primary-500 shadow-pastel scale-105"
                                                : "border-gray-100 hover:border-primary-200"
                                            }`}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full mx-auto mb-3 border border-gray-200"
                                            style={{ background: color.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Style */}
                    {currentStep === 2 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Chọn kiểu bó hoa
                            </h3>
                            <p className="text-gray-400 mb-6">Mỗi kiểu bó mang một phong cách riêng</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {styleOptions.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelections((p) => ({ ...p, style: style.id }))}
                                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                            ${selections.style === style.id
                                                ? "border-primary-500 bg-primary-50 shadow-pastel"
                                                : "border-gray-100 hover:border-primary-200 hover:bg-cream-50"
                                            }`}
                                    >
                                        <span className="text-3xl block mb-3">{style.icon}</span>
                                        <span className="font-semibold text-gray-800 block">{style.name}</span>
                                        <span className="text-xs text-gray-400">{style.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Wrapping */}
                    {currentStep === 3 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Chọn giấy gói
                            </h3>
                            <p className="text-gray-400 mb-6">Giấy gói tạo nên ấn tượng đầu tiên</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {wrappingOptions.map((wrap) => (
                                    <button
                                        key={wrap.id}
                                        onClick={() => setSelections((p) => ({ ...p, wrapping: wrap.id }))}
                                        className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left flex items-center gap-4
                                            ${selections.wrapping === wrap.id
                                                ? "border-primary-500 bg-primary-50 shadow-pastel"
                                                : "border-gray-100 hover:border-primary-200 hover:bg-cream-50"
                                            }`}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex-shrink-0 border border-gray-200"
                                            style={{ backgroundColor: wrap.color }}
                                        />
                                        <div>
                                            <span className="font-semibold text-gray-800 block">{wrap.name}</span>
                                            <span className="text-xs text-gray-400">{wrap.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Price */}
                    {currentStep === 4 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Chọn khoảng giá
                            </h3>
                            <p className="text-gray-400 mb-6">Phù hợp với ngân sách của bạn</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {priceRanges.map((price) => (
                                    <button
                                        key={price.id}
                                        onClick={() => setSelections((p) => ({ ...p, priceRange: price.id }))}
                                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                            ${selections.priceRange === price.id
                                                ? "border-primary-500 bg-primary-50 shadow-pastel"
                                                : "border-gray-100 hover:border-primary-200 hover:bg-cream-50"
                                            }`}
                                    >
                                        <span className="font-bold text-lg text-gray-800 block">{price.name}</span>
                                        <span className="text-sm text-gray-400">{price.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: AI Preview */}
                    {currentStep === 5 && (
                        <div>
                            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                                Xem trước bó hoa của bạn ✨
                            </h3>
                            <p className="text-gray-400 mb-6">AI sẽ tạo ảnh dựa trên lựa chọn của bạn</p>

                            {/* Summary */}
                            <div className="bg-cream-100 rounded-2xl p-5 mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3">Tóm tắt lựa chọn:</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {(() => {
                                        const s = getSelectionSummary();
                                        return (
                                            <>
                                                <div><span className="text-gray-400">Loại hoa:</span> <span className="font-medium text-gray-700">{s.flowerNames?.join(", ")}</span></div>
                                                <div><span className="text-gray-400">Màu sắc:</span> <span className="font-medium text-gray-700">{s.colorName}</span></div>
                                                <div><span className="text-gray-400">Kiểu bó:</span> <span className="font-medium text-gray-700">{s.styleName}</span></div>
                                                <div><span className="text-gray-400">Giấy gói:</span> <span className="font-medium text-gray-700">{s.wrapName}</span></div>
                                                <div><span className="text-gray-400">Khoảng giá:</span> <span className="font-medium text-gray-700">{s.priceName}</span></div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Generate button / Result */}
                            <div className="text-center">
                                {!generatedImage && !isGenerating && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleGenerate}
                                        className="btn-pink text-lg px-12 py-4 gap-2"
                                    >
                                        <Sparkles size={20} />
                                        Tạo Ảnh AI
                                    </motion.button>
                                )}

                                {isGenerating && (
                                    <div className="py-16">
                                        <Loader2 size={48} className="animate-spin text-primary-400 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">AI đang tạo bó hoa cho bạn...</p>
                                        <p className="text-gray-400 text-sm mt-1">Quá trình này có thể mất 10-30 giây</p>
                                    </div>
                                )}

                                {errorMessage && !isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8"
                                    >
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 max-w-md mx-auto mb-4">
                                            <p className="text-red-600 text-sm">{errorMessage}</p>
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            className="btn-pink gap-2"
                                        >
                                            <RotateCcw size={16} /> Thử lại
                                        </button>
                                    </motion.div>
                                )}

                                {generatedImage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className="w-80 h-80 mx-auto rounded-3xl overflow-hidden shadow-pastel mb-6">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={generatedImage}
                                                alt="AI generated bouquet"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4">
                                            * Ảnh do AI tạo mang tính tham khảo. Sản phẩm thực tế có thể khác đôi chút.
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={handleGenerate}
                                                className="btn-outline gap-2"
                                            >
                                                <RotateCcw size={16} /> Tạo lại
                                            </button>
                                            <button className="btn-primary gap-2">
                                                🛒 Đặt Hàng
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-cream-300">
                <button
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : handleReset()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    {currentStep > 0 ? (
                        <>
                            <ChevronLeft size={18} /> Quay lại
                        </>
                    ) : (
                        <>
                            <RotateCcw size={16} /> Làm lại
                        </>
                    )}
                </button>

                {currentStep < 5 && (
                    <motion.button
                        whileHover={{ scale: canProceed() ? 1.05 : 1 }}
                        whileTap={{ scale: canProceed() ? 0.95 : 1 }}
                        onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                            ${canProceed()
                                ? "bg-forest-500 text-white hover:bg-forest-600 shadow-lg"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Tiếp theo <ChevronRight size={18} />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
