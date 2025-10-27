import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

// Componente para proteger rutas que requieren autenticación
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar spinner mientras verifica autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa8fb5] mx-auto"></div>
                    <p className="text-gray-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Si NO está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado, mostrar el contenido protegido
    return <>{children}</>;
}