import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { LoginScreen } from "./LoginScreen";
import { getDashboardRoute } from "@/common/helpers/GetDashboardRoute";

// Componente para la página de inicio (redirige si está autenticado)
export function HomePage() {
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