import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoginScreen } from "./LoginScreen";
import { getDashboardRoute } from "@/common/helpers/GetDashboardRoute";
import { useEffect } from "react";

// Componente para la página de inicio (redirige si está autenticado)
export function HomePage() {
    const { isAuthenticated, user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Efecto para redirigir cuando el usuario se autentica
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            const dashboardRoute = getDashboardRoute(user.role);
            navigate(dashboardRoute, { replace: true });
        }
    }, [isAuthenticated, user, isLoading, navigate]);

    // Mientras verifica autenticación, mostrar spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa8fb5] mx-auto"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Si NO está autenticado, mostrar la pantalla de login
    return <LoginScreen />;
}