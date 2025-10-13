import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function DashboardPatient() {
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
                                Mi Ficha Médica
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
                        <div className="bg-pink-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-pink-900">
                                Próxima Consulta
                            </h3>
                            <p className="text-pink-600 text-sm font-medium mt-2">
                                No programada
                            </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900">
                                Medicamentos Actuales
                            </h3>
                            <p className="text-blue-600 text-3xl font-bold mt-2">0</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-900">
                                Documentos
                            </h3>
                            <p className="text-purple-600 text-3xl font-bold mt-2">0</p>
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
