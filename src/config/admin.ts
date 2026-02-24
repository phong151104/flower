export const SUPER_ADMIN_EMAIL = "phamhungphong1511@gmail.com";

export function isSuperAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}
