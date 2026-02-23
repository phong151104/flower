"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ============ TYPES ============

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    phone?: string;
    provider?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (open: boolean) => void;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (
        email: string,
        password: string,
        fullName: string
    ) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ HELPERS ============

function extractUser(user: User): AuthUser {
    const meta = user.user_metadata || {};
    return {
        id: user.id,
        email: user.email || "",
        fullName:
            meta.full_name ||
            meta.name ||
            meta.user_name ||
            user.email?.split("@")[0] ||
            "",
        avatarUrl: meta.avatar_url || meta.picture || undefined,
        phone: user.phone || meta.phone || undefined,
        provider: user.app_metadata?.provider || "email",
    };
}

// ============ PROVIDER ============

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(extractUser(session.user));
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                if (session?.user) {
                    setUser(extractUser(session.user));
                } else {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error("Google sign-in error:", error.message);
    }, []);

    const signInWithFacebook = useCallback(async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "facebook",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error("Facebook sign-in error:", error.message);
    }, []);

    const signInWithEmail = useCallback(
        async (email: string, password: string) => {
            if (!supabase) return { error: "Supabase chưa được cấu hình" };
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    return { error: "Email hoặc mật khẩu không đúng" };
                }
                return { error: error.message };
            }
            setIsAuthModalOpen(false);
            return {};
        },
        []
    );

    const signUpWithEmail = useCallback(
        async (email: string, password: string, fullName: string) => {
            if (!supabase) return { error: "Supabase chưa được cấu hình" };
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });
            if (error) {
                if (error.message.includes("already registered")) {
                    return { error: "Email này đã được đăng ký" };
                }
                return { error: error.message };
            }
            setIsAuthModalOpen(false);
            return {};
        },
        []
    );

    const signOut = useCallback(async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthModalOpen,
                setIsAuthModalOpen,
                signInWithGoogle,
                signInWithFacebook,
                signInWithEmail,
                signUpWithEmail,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
