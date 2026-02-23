"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    ArrowLeft,
    User,
    Phone,
    MapPin,
    FileText,
    CreditCard,
    Banknote,
    QrCode,
    CheckCircle2,
    Truck,
    ShoppingBag,
    ChevronRight,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/data/products";
import Link from "next/link";

const SHIPPING_FEE = 30000;

type PaymentMethod = "cod" | "bank";

// === CẤU HÌNH NGÂN HÀNG ===
// Thay đổi thông tin ngân hàng của bạn tại đây
const BANK_ID = "970436"; // Vietcombank
const BANK_ACCOUNT = "9888229955";
const BANK_ACCOUNT_NAME = "PHAM HUNG PHONG";

interface Province {
    code: number;
    name: string;
}
interface District {
    code: number;
    name: string;
}
interface Ward {
    code: number;
    name: string;
}

const steps = [
    { id: 1, title: "Thông tin", icon: User },
    { id: 2, title: "Thanh toán", icon: CreditCard },
    { id: 3, title: "Xác nhận", icon: CheckCircle2 },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const { addOrder } = useAdmin();
    const { user, setIsAuthModalOpen } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [customerNote, setCustomerNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

    // Address picker state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [provinceName, setProvinceName] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [wardName, setWardName] = useState("");
    const [loadingAddr, setLoadingAddr] = useState<"province" | "district" | "ward" | null>("province");

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-fill from auth user
    useEffect(() => {
        if (user) {
            if (!customerName && user.fullName) setCustomerName(user.fullName);
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // Compose full address
    const customerAddress = [streetAddress, wardName, districtName, provinceName]
        .filter(Boolean)
        .join(", ");

    // Fetch provinces on mount
    useEffect(() => {
        setLoadingAddr("province");
        fetch("https://provinces.open-api.vn/api/p/")
            .then((r) => r.json())
            .then((data: Province[]) => setProvinces(data))
            .catch(() => { })
            .finally(() => setLoadingAddr(null));
    }, []);

    // Fetch districts when province changes
    const handleProvinceChange = useCallback((code: string) => {
        setSelectedProvince(code);
        setSelectedDistrict("");
        setSelectedWard("");
        setDistricts([]);
        setWards([]);
        setDistrictName("");
        setWardName("");
        if (!code) { setProvinceName(""); return; }
        const prov = provinces.find((p) => String(p.code) === code);
        setProvinceName(prov?.name || "");
        setLoadingAddr("district");
        fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
            .then((r) => r.json())
            .then((data: { districts: District[] }) => setDistricts(data.districts || []))
            .catch(() => { })
            .finally(() => setLoadingAddr(null));
    }, [provinces]);

    // Fetch wards when district changes
    const handleDistrictChange = useCallback((code: string) => {
        setSelectedDistrict(code);
        setSelectedWard("");
        setWards([]);
        setWardName("");
        if (!code) { setDistrictName(""); return; }
        const dist = districts.find((d) => String(d.code) === code);
        setDistrictName(dist?.name || "");
        setLoadingAddr("ward");
        fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
            .then((r) => r.json())
            .then((data: { wards: Ward[] }) => setWards(data.wards || []))
            .catch(() => { })
            .finally(() => setLoadingAddr(null));
    }, [districts]);

    const handleWardChange = useCallback((code: string) => {
        setSelectedWard(code);
        if (!code) { setWardName(""); return; }
        const w = wards.find((w) => String(w.code) === code);
        setWardName(w?.name || "");
    }, [wards]);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!customerName.trim()) newErrors.name = "Vui lòng nhập họ tên";
        if (!customerPhone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
        else if (!/^(0[0-9]{9})$/.test(customerPhone.trim()))
            newErrors.phone = "Số điện thoại không hợp lệ";
        if (!selectedProvince) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
        if (!selectedDistrict) newErrors.district = "Vui lòng chọn quận/huyện";
        if (!selectedWard) newErrors.ward = "Vui lòng chọn phường/xã";
        if (!streetAddress.trim()) newErrors.street = "Vui lòng nhập số nhà, tên đường";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !validateStep1()) return;
        setCurrentStep((s) => Math.min(s + 1, 3));
    };

    const handlePrevStep = () => {
        setCurrentStep((s) => Math.max(s - 1, 1));
    };

    // Bank transfer: user confirms they transferred, create order with pending_payment
    const handleBankTransferConfirm = async () => {
        setIsSubmitting(true);
        try {
            addOrder({
                items: items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    size: item.size,
                    quantity: item.quantity,
                })),
                totalPrice: totalPrice + SHIPPING_FEE,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(),
                customerNote: customerNote.trim() || undefined,
                paymentMethod: "bank",
                userId: user?.id,
            });

            clearCart();
            setBankTransferConfirmed(true);
            setCurrentStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOrder = async () => {
        setIsSubmitting(true);
        try {
            addOrder({
                items: items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    size: item.size,
                    quantity: item.quantity,
                })),
                totalPrice: totalPrice + SHIPPING_FEE,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(),
                customerNote: customerNote.trim() || undefined,
                paymentMethod: "cod",
                userId: user?.id,
            });

            clearCart();

            // Store order info for success page
            sessionStorage.setItem(
                "lastOrder",
                JSON.stringify({
                    paymentMethod,
                    totalPrice: totalPrice + SHIPPING_FEE,
                    customerName: customerName.trim(),
                })
            );

            router.push("/checkout/success");
        } catch {
            alert("Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white flex items-center justify-center">
                <div className="text-center px-6">
                    <span className="text-7xl block mb-6">🛒</span>
                    <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">
                        Giỏ hàng trống
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Hãy thêm sản phẩm vào giỏ trước khi thanh toán nhé!
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-forest-500 text-white font-semibold rounded-full hover:bg-forest-600 transition-all shadow-lg"
                    >
                        <ShoppingBag size={20} />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-pink-50/30">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-cream-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => (currentStep > 1 ? handlePrevStep() : router.back())}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-cream-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-display text-xl font-bold text-gray-900">
                        Thanh toán
                    </h1>
                </div>

                {/* Step indicator */}
                <div className="max-w-md mx-auto px-8 pb-4">
                    <div className="flex items-center justify-between relative">
                        {/* Connection line */}
                        <div className="absolute top-5 left-8 right-8 h-0.5 bg-cream-200" />
                        <div
                            className="absolute top-5 left-8 h-0.5 bg-forest-500 transition-all duration-500"
                            style={{
                                width: `${((currentStep - 1) / 2) * (100 - 16)}%`,
                            }}
                        />

                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep >= step.id;
                            return (
                                <div key={step.id} className="relative flex flex-col items-center z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                            ? "bg-forest-500 text-white shadow-lg shadow-forest-500/30"
                                            : "bg-cream-100 text-gray-400"
                                            }`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium ${isActive ? "text-forest-600" : "text-gray-400"
                                            }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl shadow-lg shadow-black/5 p-8"
                                >
                                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <User className="text-forest-500" size={24} />
                                        Thông tin giao hàng
                                    </h2>

                                    <div className="space-y-5">
                                        {/* Login suggestion */}
                                        {!user && (
                                            <div className="flex items-center gap-3 p-4 bg-primary-50/50 border border-primary-100 rounded-2xl">
                                                <User className="text-primary-400 flex-shrink-0" size={20} />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700">
                                                        <button
                                                            onClick={() => setIsAuthModalOpen(true)}
                                                            className="text-primary-500 font-semibold hover:text-primary-600"
                                                        >
                                                            Đăng nhập
                                                        </button>{" "}
                                                        để theo dõi đơn hàng và tự động điền thông tin
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Họ và tên <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <User
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={customerName}
                                                    onChange={(e) => {
                                                        setCustomerName(e.target.value);
                                                        setErrors((p) => ({ ...p, name: "" }));
                                                    }}
                                                    placeholder="Nguyễn Văn A"
                                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-0 ${errors.name
                                                        ? "border-red-300 bg-red-50/50 focus:border-red-400"
                                                        : "border-cream-200 bg-cream-50/50 focus:border-forest-400"
                                                        }`}
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-red-400 text-sm mt-1.5">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Số điện thoại <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="tel"
                                                    value={customerPhone}
                                                    onChange={(e) => {
                                                        setCustomerPhone(e.target.value);
                                                        setErrors((p) => ({ ...p, phone: "" }));
                                                    }}
                                                    placeholder="0912345678"
                                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-0 ${errors.phone
                                                        ? "border-red-300 bg-red-50/50 focus:border-red-400"
                                                        : "border-cream-200 bg-cream-50/50 focus:border-forest-400"
                                                        }`}
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-red-400 text-sm mt-1.5">{errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Address - Cascading dropdowns */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                Địa chỉ giao hàng <span className="text-red-400">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {/* Province */}
                                                <div className="relative">
                                                    <select
                                                        value={selectedProvince}
                                                        onChange={(e) => {
                                                            handleProvinceChange(e.target.value);
                                                            setErrors((p) => ({ ...p, province: "" }));
                                                        }}
                                                        className={`w-full px-4 py-3.5 rounded-xl border-2 appearance-none bg-cream-50/50 transition-all focus:outline-none focus:ring-0 text-sm ${errors.province
                                                            ? "border-red-300 focus:border-red-400"
                                                            : "border-cream-200 focus:border-forest-400"
                                                            } ${!selectedProvince ? "text-gray-400" : "text-gray-800"}`}
                                                    >
                                                        <option value="">Tỉnh/Thành phố</option>
                                                        {provinces.map((p) => (
                                                            <option key={p.code} value={p.code}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        {loadingAddr === "province" ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                                    </div>
                                                    {errors.province && <p className="text-red-400 text-xs mt-1">{errors.province}</p>}
                                                </div>

                                                {/* District */}
                                                <div className="relative">
                                                    <select
                                                        value={selectedDistrict}
                                                        onChange={(e) => {
                                                            handleDistrictChange(e.target.value);
                                                            setErrors((p) => ({ ...p, district: "" }));
                                                        }}
                                                        disabled={!selectedProvince}
                                                        className={`w-full px-4 py-3.5 rounded-xl border-2 appearance-none bg-cream-50/50 transition-all focus:outline-none focus:ring-0 text-sm ${errors.district
                                                            ? "border-red-300 focus:border-red-400"
                                                            : "border-cream-200 focus:border-forest-400"
                                                            } ${!selectedDistrict ? "text-gray-400" : "text-gray-800"} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        <option value="">Quận/Huyện</option>
                                                        {districts.map((d) => (
                                                            <option key={d.code} value={d.code}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        {loadingAddr === "district" ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                                    </div>
                                                    {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district}</p>}
                                                </div>

                                                {/* Ward */}
                                                <div className="relative">
                                                    <select
                                                        value={selectedWard}
                                                        onChange={(e) => {
                                                            handleWardChange(e.target.value);
                                                            setErrors((p) => ({ ...p, ward: "" }));
                                                        }}
                                                        disabled={!selectedDistrict}
                                                        className={`w-full px-4 py-3.5 rounded-xl border-2 appearance-none bg-cream-50/50 transition-all focus:outline-none focus:ring-0 text-sm ${errors.ward
                                                            ? "border-red-300 focus:border-red-400"
                                                            : "border-cream-200 focus:border-forest-400"
                                                            } ${!selectedWard ? "text-gray-400" : "text-gray-800"} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        <option value="">Phường/Xã</option>
                                                        {wards.map((w) => (
                                                            <option key={w.code} value={w.code}>{w.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        {loadingAddr === "ward" ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                                    </div>
                                                    {errors.ward && <p className="text-red-400 text-xs mt-1">{errors.ward}</p>}
                                                </div>
                                            </div>

                                            {/* Street address */}
                                            <div className="relative mt-3">
                                                <MapPin
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={streetAddress}
                                                    onChange={(e) => {
                                                        setStreetAddress(e.target.value);
                                                        setErrors((p) => ({ ...p, street: "" }));
                                                    }}
                                                    placeholder="Số nhà, tên đường"
                                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-0 ${errors.street
                                                        ? "border-red-300 bg-red-50/50 focus:border-red-400"
                                                        : "border-cream-200 bg-cream-50/50 focus:border-forest-400"
                                                        }`}
                                                />
                                            </div>
                                            {errors.street && (
                                                <p className="text-red-400 text-sm mt-1.5">{errors.street}</p>
                                            )}
                                        </div>

                                        {/* Note */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Ghi chú
                                            </label>
                                            <div className="relative">
                                                <FileText
                                                    size={18}
                                                    className="absolute left-4 top-4 text-gray-400"
                                                />
                                                <textarea
                                                    value={customerNote}
                                                    onChange={(e) => setCustomerNote(e.target.value)}
                                                    placeholder="VD: Giao vào buổi chiều, gọi trước khi giao..."
                                                    rows={2}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-cream-200 bg-cream-50/50 focus:border-forest-400 focus:outline-none focus:ring-0 resize-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNextStep}
                                        className="mt-8 w-full py-4 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        Tiếp tục <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl shadow-lg shadow-black/5 p-8"
                                >
                                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <CreditCard className="text-forest-500" size={24} />
                                        Phương thức thanh toán
                                    </h2>

                                    <div className="space-y-4">
                                        {/* COD */}
                                        <label
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "cod"
                                                ? "border-forest-400 bg-forest-50/50 shadow-md"
                                                : "border-cream-200 bg-cream-50/30 hover:border-cream-300"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cod"
                                                checked={paymentMethod === "cod"}
                                                onChange={() => setPaymentMethod("cod")}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "cod"
                                                    ? "bg-forest-500 text-white"
                                                    : "bg-cream-100 text-gray-400"
                                                    }`}
                                            >
                                                <Banknote size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">
                                                    Thanh toán khi nhận hàng (COD)
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Thanh toán bằng tiền mặt khi nhận hoa
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod"
                                                    ? "border-forest-500"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {paymentMethod === "cod" && (
                                                    <div className="w-3 h-3 rounded-full bg-forest-500" />
                                                )}
                                            </div>
                                        </label>

                                        {/* Bank Transfer */}
                                        <label
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "bank"
                                                ? "border-forest-400 bg-forest-50/50 shadow-md"
                                                : "border-cream-200 bg-cream-50/30 hover:border-cream-300"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bank"
                                                checked={paymentMethod === "bank"}
                                                onChange={() => setPaymentMethod("bank")}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "bank"
                                                    ? "bg-forest-500 text-white"
                                                    : "bg-cream-100 text-gray-400"
                                                    }`}
                                            >
                                                <QrCode size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">
                                                    Chuyển khoản ngân hàng
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Chuyển khoản qua QR code hoặc số tài khoản
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bank"
                                                    ? "border-forest-500"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {paymentMethod === "bank" && (
                                                    <div className="w-3 h-3 rounded-full bg-forest-500" />
                                                )}
                                            </div>
                                        </label>

                                        {/* Bank info popup with VietQR */}
                                        <AnimatePresence>
                                            {paymentMethod === "bank" && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 ml-0 sm:ml-16">
                                                        {/* QR Code */}
                                                        <div className="flex flex-col items-center mb-5">
                                                            <p className="font-semibold text-blue-800 text-sm mb-4">
                                                                Quét mã QR để thanh toán
                                                            </p>
                                                            <div className="bg-white p-3 rounded-2xl shadow-lg shadow-blue-500/10">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={`https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?amount=${totalPrice + SHIPPING_FEE}&addInfo=${encodeURIComponent(`BLOOM ${customerPhone}`)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`}
                                                                    alt="QR chuyển khoản"
                                                                    width={220}
                                                                    height={220}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-900 mt-3">
                                                                {formatPrice(totalPrice + SHIPPING_FEE)}
                                                            </p>
                                                        </div>

                                                        {/* Bank details */}
                                                        <div className="space-y-2 text-sm bg-white/60 rounded-xl p-4">
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-600">Ngân hàng:</span>
                                                                <span className="font-semibold text-blue-900">
                                                                    Vietcombank
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-600">Số TK:</span>
                                                                <span className="font-semibold text-blue-900 font-mono">
                                                                    {BANK_ACCOUNT}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-600">Chủ TK:</span>
                                                                <span className="font-semibold text-blue-900">
                                                                    {BANK_ACCOUNT_NAME}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-600">Nội dung CK:</span>
                                                                <span className="font-semibold text-blue-900 font-mono">
                                                                    BLOOM {customerPhone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-blue-500 mt-3 text-center">
                                                            * Mở app ngân hàng → Quét QR → Tự điền số tiền + tài khoản
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>

                                    {paymentMethod === "bank" ? (
                                        <button
                                            onClick={handleBankTransferConfirm}
                                            disabled={isSubmitting}
                                            className="mt-8 w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    Tôi đã chuyển khoản
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNextStep}
                                            className="mt-8 w-full py-4 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            Tiếp tục <ChevronRight size={18} />
                                        </button>
                                    )}
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl shadow-lg shadow-black/5 p-8"
                                >
                                    {/* Bank transfer: waiting for admin approval */}
                                    {bankTransferConfirmed ? (
                                        <div className="text-center py-6">
                                            <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                >
                                                    <Banknote size={36} className="text-amber-600" />
                                                </motion.div>
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
                                                Đang chờ xác nhận thanh toán
                                            </h2>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ xác nhận sau khi kiểm tra chuyển khoản thành công.
                                            </p>

                                            {/* Order details */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left mb-6 max-w-md mx-auto">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-amber-700">Tổng tiền:</span>
                                                        <span className="font-bold text-amber-900">{formatPrice(totalPrice + SHIPPING_FEE)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-amber-700">Người nhận:</span>
                                                        <span className="font-medium text-amber-900">{customerName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-amber-700">Trạng thái:</span>
                                                        <span className="font-medium text-amber-600 flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                            Chờ xác nhận
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                                <button
                                                    onClick={() => router.push("/shop")}
                                                    className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 text-gray-700 font-semibold rounded-xl transition-all"
                                                >
                                                    Tiếp tục mua sắm
                                                </button>
                                                <button
                                                    onClick={() => router.push("/")}
                                                    className="flex-1 py-3 bg-forest-500 hover:bg-forest-600 text-white font-semibold rounded-xl transition-all"
                                                >
                                                    Về trang chủ
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* COD: regular confirmation */
                                        <>
                                            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <CheckCircle2 className="text-forest-500" size={24} />
                                                Xác nhận đơn hàng
                                            </h2>

                                            {/* Customer info summary */}
                                            <div className="bg-cream-50 rounded-2xl p-5 mb-6">
                                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Truck size={18} className="text-forest-500" />
                                                    Thông tin giao hàng
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex gap-3">
                                                        <span className="text-gray-500 w-24 shrink-0">Người nhận:</span>
                                                        <span className="text-gray-800 font-medium">{customerName}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <span className="text-gray-500 w-24 shrink-0">Điện thoại:</span>
                                                        <span className="text-gray-800 font-medium">{customerPhone}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <span className="text-gray-500 w-24 shrink-0">Địa chỉ:</span>
                                                        <span className="text-gray-800 font-medium">{customerAddress}</span>
                                                    </div>
                                                    {customerNote && (
                                                        <div className="flex gap-3">
                                                            <span className="text-gray-500 w-24 shrink-0">Ghi chú:</span>
                                                            <span className="text-gray-800">{customerNote}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment method summary */}
                                            <div className="bg-cream-50 rounded-2xl p-5 mb-6">
                                                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <CreditCard size={18} className="text-forest-500" />
                                                    Thanh toán
                                                </h3>
                                                <p className="text-sm text-gray-800 font-medium">
                                                    💵 Thanh toán khi nhận hàng (COD)
                                                </p>
                                            </div>

                                            {/* Items */}
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <ShoppingBag size={18} className="text-forest-500" />
                                                    Sản phẩm ({totalItems})
                                                </h3>
                                                <div className="space-y-3">
                                                    {items.map((item) => (
                                                        <div
                                                            key={`${item.productId}-${item.size}`}
                                                            className="flex items-center gap-3 p-3 bg-cream-50/50 rounded-xl"
                                                        >
                                                            <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {item.size} × {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order button */}
                                            <button
                                                onClick={handleOrder}
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        🌸 Đặt hàng — {formatPrice(totalPrice + SHIPPING_FEE)}
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar: Order summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg shadow-black/5 p-6 sticky top-40">
                            <h3 className="font-display text-lg font-bold text-gray-900 mb-5">
                                Đơn hàng của bạn
                            </h3>

                            {/* Items */}
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-5">
                                {items.map((item) => (
                                    <div
                                        key={`${item.productId}-${item.size}`}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 line-clamp-1">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.size} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-cream-200 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tạm tính</span>
                                    <span className="font-medium text-gray-700">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phí vận chuyển</span>
                                    <span className="font-medium text-gray-700">
                                        {formatPrice(SHIPPING_FEE)}
                                    </span>
                                </div>
                                <div className="border-t border-cream-200 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-xl font-bold text-primary-500">
                                        {formatPrice(totalPrice + SHIPPING_FEE)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
