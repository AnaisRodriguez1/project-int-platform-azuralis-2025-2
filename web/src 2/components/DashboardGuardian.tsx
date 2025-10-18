import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function DashboardGuardian() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard - Cuidador
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Bienvenido/a, {user?.name}
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Cerrar Sesión
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-teal-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-teal-900">
                                Pacientes a Cargo
                            </h3>
                            <p className="text-teal-600 text-3xl font-bold mt-2">0</p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-orange-900">
                                Recordatorios
                            </h3>
                            <p className="text-orange-600 text-3xl font-bold mt-2">0</p>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-indigo-900">
                                Accesos Autorizados
                            </h3>
                            <p className="text-indigo-600 text-3xl font-bold mt-2">0</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-gray-500 text-center">
                            Contenido del dashboard en desarrollo...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
