export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    shortDescription: string;
    images: string[];
    category: string;
    occasion: string[];
    flowerTypes: string[];
    colors: string[];
    badge?: "Bán chạy" | "Mới" | "Premium" | "Giảm giá";
    rating: number;
    reviewCount: number;
    sizes: { name: string; price: number }[];
    inStock: boolean;
}

const categoryDefs = [
    { id: "all", name: "Tất cả" },
    { id: "bouquet", name: "Bó hoa" },
    { id: "basket", name: "Giỏ hoa" },
    { id: "box", name: "Hộp hoa" },
    { id: "wedding", name: "Hoa cưới" },
    { id: "dried", name: "Hoa khô" },
];

export const occasions = [
    "Sinh nhật",
    "Kỷ niệm",
    "Đám cưới",
    "Khai trương",
    "Tặng bạn",
    "Ngày lễ",
    "Chia buồn",
];

export const flowerTypeOptions = [
    "Hoa hồng",
    "Hoa tulip",
    "Hoa cúc",
    "Hoa ly",
    "Hướng dương",
    "Hoa lan",
    "Baby breath",
    "Hoa cẩm tú cầu",
];

export const colorOptions = [
    { name: "Hồng", value: "#F8B4C8" },
    { name: "Đỏ", value: "#E53935" },
    { name: "Trắng", value: "#FAFAFA" },
    { name: "Vàng", value: "#FFD54F" },
    { name: "Tím", value: "#AB47BC" },
    { name: "Cam", value: "#FF8A65" },
    { name: "Xanh", value: "#66BB6A" },
    { name: "Mix", value: "linear-gradient(135deg, #F8B4C8, #FFD54F, #AB47BC)" },
];

export const products: Product[] = [
    {
        id: "1",
        name: "Hồng Pastel Ngọt Ngào",
        price: 350000,
        originalPrice: 420000,
        description:
            "Bó hoa hồng pastel với sắc hồng nhẹ nhàng, kết hợp baby breath trắng tạo nên vẻ đẹp tinh khôi. Phù hợp tặng người yêu, bạn bè trong những dịp đặc biệt.",
        shortDescription: "Bó hồng pastel kết hợp baby breath",
        images: [
            "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Sinh nhật", "Kỷ niệm", "Tặng bạn"],
        flowerTypes: ["Hoa hồng", "Baby breath"],
        colors: ["Hồng"],
        badge: "Bán chạy",
        rating: 4.8,
        reviewCount: 124,
        sizes: [
            { name: "S - 10 bông", price: 350000 },
            { name: "M - 20 bông", price: 550000 },
            { name: "L - 30 bông", price: 750000 },
        ],
        inStock: true,
    },
    {
        id: "2",
        name: "Nắng Hướng Dương",
        price: 280000,
        description:
            "Bó hướng dương rực rỡ mang năng lượng tích cực. Mỗi bông hướng dương tượng trưng cho sự lạc quan và niềm vui.",
        shortDescription: "Bó hướng dương tươi sáng đầy năng lượng",
        images: [
            "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Sinh nhật", "Khai trương", "Tặng bạn"],
        flowerTypes: ["Hướng dương"],
        colors: ["Vàng"],
        rating: 4.7,
        reviewCount: 89,
        sizes: [
            { name: "S - 5 bông", price: 280000 },
            { name: "M - 10 bông", price: 450000 },
            { name: "L - 15 bông", price: 620000 },
        ],
        inStock: true,
    },
    {
        id: "3",
        name: "Lavender Dream",
        price: 450000,
        description:
            "Bó hoa mix tím lavender thanh lịch, kết hợp hoa hồng tím và cẩm tú cầu. Tông màu tím dịu dàng tạo cảm giác bình yên.",
        shortDescription: "Bó hoa tím lavender thanh lịch",
        images: [
            "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Sinh nhật", "Kỷ niệm"],
        flowerTypes: ["Hoa hồng", "Hoa cẩm tú cầu"],
        colors: ["Tím"],
        badge: "Mới",
        rating: 4.9,
        reviewCount: 67,
        sizes: [
            { name: "S", price: 450000 },
            { name: "M", price: 650000 },
            { name: "L", price: 850000 },
        ],
        inStock: true,
    },
    {
        id: "4",
        name: "Red Romance",
        price: 520000,
        originalPrice: 600000,
        description:
            "Bó hoa hồng đỏ cổ điển - biểu tượng vĩnh cửu của tình yêu. 20 bông hồng Ecuador nhập khẩu, to đẹp và bền lâu.",
        shortDescription: "Bó hồng đỏ Ecuador cổ điển",
        images: [
            "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Kỷ niệm", "Ngày lễ"],
        flowerTypes: ["Hoa hồng"],
        colors: ["Đỏ"],
        badge: "Giảm giá",
        rating: 4.9,
        reviewCount: 203,
        sizes: [
            { name: "S - 10 bông", price: 350000 },
            { name: "M - 20 bông", price: 520000 },
            { name: "L - 50 bông", price: 1200000 },
        ],
        inStock: true,
    },
    {
        id: "5",
        name: "Giỏ Hoa Xuân",
        price: 680000,
        description:
            "Giỏ hoa mix nhiều loại với tông màu tươi sáng. Sự kết hợp hoàn hảo giữa hồng, cúc, và lá xanh tạo nên tác phẩm nghệ thuật.",
        shortDescription: "Giỏ hoa mix tươi sáng nhiều màu",
        images: [
            "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=600&fit=crop&q=80",
        ],
        category: "basket",
        occasion: ["Sinh nhật", "Khai trương", "Ngày lễ"],
        flowerTypes: ["Hoa hồng", "Hoa cúc"],
        colors: ["Mix"],
        badge: "Premium",
        rating: 4.6,
        reviewCount: 45,
        sizes: [
            { name: "M", price: 680000 },
            { name: "L", price: 950000 },
        ],
        inStock: true,
    },
    {
        id: "6",
        name: "White Elegance",
        price: 750000,
        description:
            "Hộp hoa trắng tinh khôi với hồng trắng, ly trắng và baby breath. Sang trọng và thanh lịch, phù hợp cho mọi dịp trang trọng.",
        shortDescription: "Hộp hoa trắng tinh khôi sang trọng",
        images: [
            "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&h=600&fit=crop&q=80",
        ],
        category: "box",
        occasion: ["Đám cưới", "Kỷ niệm"],
        flowerTypes: ["Hoa hồng", "Hoa ly", "Baby breath"],
        colors: ["Trắng"],
        badge: "Premium",
        rating: 5.0,
        reviewCount: 38,
        sizes: [
            { name: "M", price: 750000 },
            { name: "L", price: 1100000 },
        ],
        inStock: true,
    },
    {
        id: "7",
        name: "Tulip Mùa Xuân",
        price: 320000,
        description:
            "Bó tulip tươi nhiều màu sắc, nhập khẩu trực tiếp từ Hà Lan. Hoa tulip mang thông điệp về tình yêu hoàn hảo.",
        shortDescription: "Bó tulip Hà Lan nhiều màu",
        images: [
            "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Sinh nhật", "Tặng bạn", "Ngày lễ"],
        flowerTypes: ["Hoa tulip"],
        colors: ["Mix"],
        rating: 4.7,
        reviewCount: 91,
        sizes: [
            { name: "S - 10 bông", price: 320000 },
            { name: "M - 20 bông", price: 580000 },
        ],
        inStock: true,
    },
    {
        id: "8",
        name: "Giỏ Hoa Khai Trương",
        price: 900000,
        description:
            "Giỏ hoa lớn với tông đỏ - vàng may mắn, phù hợp tặng khai trương, chúc mừng. Thiết kế hoành tráng, ấn tượng.",
        shortDescription: "Giỏ hoa khai trương đỏ vàng may mắn",
        images: [
            "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop&q=80",
        ],
        category: "basket",
        occasion: ["Khai trương", "Ngày lễ"],
        flowerTypes: ["Hoa hồng", "Hoa ly", "Hoa cúc"],
        colors: ["Đỏ", "Vàng"],
        rating: 4.5,
        reviewCount: 52,
        sizes: [
            { name: "M", price: 900000 },
            { name: "L", price: 1400000 },
            { name: "XL", price: 2000000 },
        ],
        inStock: true,
    },
    {
        id: "9",
        name: "Hộp Hoa Hồng Nhung",
        price: 580000,
        description:
            "Hộp hoa hồng nhung đỏ đẳng cấp, 16 bông xếp đều trong hộp tròn sang trọng. Quà tặng hoàn hảo cho người đặc biệt.",
        shortDescription: "Hộp tròn hồng nhung đỏ sang trọng",
        images: [
            "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=600&fit=crop&q=80",
        ],
        category: "box",
        occasion: ["Kỷ niệm", "Ngày lễ"],
        flowerTypes: ["Hoa hồng"],
        colors: ["Đỏ"],
        badge: "Bán chạy",
        rating: 4.8,
        reviewCount: 156,
        sizes: [
            { name: "16 bông", price: 580000 },
            { name: "25 bông", price: 850000 },
            { name: "36 bông", price: 1200000 },
        ],
        inStock: true,
    },
    {
        id: "10",
        name: "Cúc Họa Mi Tinh Khôi",
        price: 220000,
        description:
            "Bó cúc họa mi nhỏ xinh, tươi sáng và dễ thương. Giá cả phải chăng, phù hợp tặng hàng ngày.",
        shortDescription: "Bó cúc họa mi nhỏ xinh tươi sáng",
        images: [
            "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=600&fit=crop&q=80",
        ],
        category: "bouquet",
        occasion: ["Tặng bạn", "Sinh nhật"],
        flowerTypes: ["Hoa cúc"],
        colors: ["Trắng", "Vàng"],
        rating: 4.4,
        reviewCount: 73,
        sizes: [
            { name: "S", price: 220000 },
            { name: "M", price: 350000 },
        ],
        inStock: true,
    },
    {
        id: "11",
        name: "Bó Hoa Cưới Trắng",
        price: 850000,
        description:
            "Bó hoa cưới cầm tay với hồng trắng, mẫu đơn và eucalyptus. Thiết kế tinh tế, phù hợp cho cô dâu trong ngày trọng đại.",
        shortDescription: "Bó hoa cưới cầm tay tinh tế",
        images: [
            "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&h=600&fit=crop&q=80",
        ],
        category: "wedding",
        occasion: ["Đám cưới"],
        flowerTypes: ["Hoa hồng", "Baby breath"],
        colors: ["Trắng"],
        badge: "Premium",
        rating: 5.0,
        reviewCount: 29,
        sizes: [
            { name: "Standard", price: 850000 },
            { name: "Premium", price: 1200000 },
        ],
        inStock: true,
    },
    {
        id: "12",
        name: "Hoa Khô Pastel",
        price: 380000,
        description:
            "Bó hoa khô tông pastel nhẹ nhàng, bền đẹp theo thời gian. Không cần tưới nước, phù hợp trang trí nhà cửa hoặc làm quà tặng.",
        shortDescription: "Bó hoa khô pastel bền đẹp",
        images: [
            "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&h=600&fit=crop&q=80",
        ],
        category: "dried",
        occasion: ["Tặng bạn", "Sinh nhật"],
        flowerTypes: [],
        colors: ["Hồng", "Trắng"],
        badge: "Mới",
        rating: 4.6,
        reviewCount: 44,
        sizes: [
            { name: "S", price: 380000 },
            { name: "M", price: 550000 },
        ],
        inStock: true,
    },
];

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}

export const categories = categoryDefs.map((cat) => ({
    ...cat,
    count:
        cat.id === "all"
            ? products.length
            : products.filter((p) => p.category === cat.id).length,
}));
