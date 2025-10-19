import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { UserRole } from "./types/medical";
import { LoginScreen } from "./pages/LoginScreen";
import { DashboardClinicalStaff } from "./pages/ClinicalStaff/DashboardClinicalStaff";
import { DashboardPatient } from "./pages/Patient/DashboardPatient";
import { DashboardGuardian } from "./pages/Guardian/DashboardGuardian";

// Helper function para obtener la ruta del dashboard según el role
const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
        case 'doctor':
        case 'nurse':
            return '/dashboard-clinical';
        case 'patient':
            return '/dashboard-patient';
        case 'guardian':
            return '/dashboard-guardian';
        default:
            return '/';
    }
};

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

// Componente para la página de inicio (redirige si está autenticado)
function HomePage() {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando...</p>
            </div>
        );
    }

    if (isAuthenticated && user) {
        const dashboardRoute = getDashboardRoute(user.role);
        return <Navigate to={dashboardRoute} replace />;
    }

    return <LoginScreen />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública - Login (o redirige a dashboard si está autenticado) */}
                <Route path="/" element={<HomePage />} />

                {/* Rutas protegidas - Dashboards */}
                <Route
                    path="/dashboard-clinical"
                    element={
                        <ProtectedRoute>
                            <DashboardClinicalStaff />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard-patient"
                    element={
                        <ProtectedRoute>
                            <DashboardPatient />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard-guardian"
                    element={
                        <ProtectedRoute>
                            <DashboardGuardian />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta 404 - Redirigir al inicio */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
