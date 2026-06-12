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
                court: {
                    50: "#F0FDF4",
                    100: "#DCFCE7",
                    200: "#BBF7D0",
                    300: "#86EFAC",
                    400: "#4ADE80",
                    500: "#16A34A",
                    600: "#15803D",
                    700: "#166534",
                    800: "#14532D",
                    900: "#0F3D21",
                },
                ball: {
                    50: "#FEFCE8",
                    100: "#FEF9C3",
                    200: "#FEF08A",
                    300: "#FDE047",
                    400: "#FACC15",
                    500: "#EAB308",
                    600: "#CA8A04",
                    700: "#A16207",
                },
                navy: {
                    50: "#F8FAFC",
                    100: "#F1F5F9",
                    200: "#E2E8F0",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    600: "#475569",
                    700: "#334155",
                    800: "#1E293B",
                    900: "#0F172A",
                },
            },
            fontFamily: {
                display: ["Be Vietnam Pro", "Montserrat", "system-ui", "sans-serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-court":
                    "linear-gradient(135deg, #15803D 0%, #16A34A 50%, #4ADE80 100%)",
                "gradient-dark":
                    "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #166534 100%)",
                "gradient-ball":
                    "linear-gradient(135deg, #FACC15 0%, #EAB308 50%, #CA8A04 100%)",
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
            },
            boxShadow: {
                soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
                court: "0 4px 20px -2px rgba(22, 163, 74, 0.25), 0 2px 10px -2px rgba(22, 163, 74, 0.15)",
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
