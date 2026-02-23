import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#FFF0F5",
                    100: "#FFE0EB",
                    200: "#FFC2D6",
                    300: "#FFA3C2",
                    400: "#F8B4C8",
                    500: "#E91E63",
                    600: "#C2185B",
                    700: "#AD1457",
                    800: "#880E4F",
                    900: "#6A0F3B",
                },
                cream: {
                    50: "#FFFCF9",
                    100: "#FFF8F0",
                    200: "#FEF0E7",
                    300: "#FDE8D8",
                    400: "#F5E6D3",
                    500: "#EDD9C7",
                },
                forest: {
                    50: "#E8F5E9",
                    100: "#C8E6C9",
                    200: "#A5D6A7",
                    300: "#81C784",
                    400: "#66BB6A",
                    500: "#1B4332",
                    600: "#163A2B",
                    700: "#113024",
                    800: "#0C271D",
                    900: "#071D16",
                },
                peach: {
                    50: "#FFF5EE",
                    100: "#FFEBD9",
                    200: "#FFD7B3",
                    300: "#FFC38D",
                    400: "#FFAF67",
                    500: "#FF9B41",
                },
            },
            fontFamily: {
                display: ["Playfair Display", "Georgia", "serif"],
                body: ["Inter", "system-ui", "sans-serif"],
                script: ["Dancing Script", "cursive"],
            },
            backgroundImage: {
                "gradient-pastel":
                    "linear-gradient(135deg, #FFF8F0 0%, #FFE0EB 50%, #FEF0E7 100%)",
                "gradient-pink":
                    "linear-gradient(135deg, #FFC2D6 0%, #F8B4C8 50%, #FFE0EB 100%)",
                "gradient-warm":
                    "linear-gradient(135deg, #FEF0E7 0%, #FDE8D8 50%, #FFF8F0 100%)",
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
            },
            boxShadow: {
                soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
                pastel:
                    "0 4px 20px -2px rgba(248, 180, 200, 0.3), 0 2px 10px -2px rgba(248, 180, 200, 0.2)",
                card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            },
            animation: {
                "fade-in": "fadeIn 0.6s ease-out",
                "slide-up": "slideUp 0.6s ease-out",
                "float": "float 6s ease-in-out infinite",
                "pulse-soft": "pulseSoft 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                pulseSoft: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.8" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
