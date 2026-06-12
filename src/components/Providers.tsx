"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ClubProvider } from "@/context/ClubContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ClubProvider>{children}</ClubProvider>
        </AuthProvider>
    );
}
