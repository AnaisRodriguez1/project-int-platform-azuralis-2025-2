import type { UserRole } from "@/types/medical";

export const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
        case 'doctor':
            return '/dashboard-doctor';
        case 'patient':
            return '/dashboard-patient';
        case 'guardian':
            return '/dashboard-guardian';
        case 'nurse':
            return '/dashboard-nurse';
        default:
            return '/';
    }
};