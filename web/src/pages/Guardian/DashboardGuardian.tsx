import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState, useMemo } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { guardianTabs } from "@/common/config/navigationTabs";
import { PatientSelector } from "@/components/PatientSelector";
import { usePatientData } from "@/hooks/usePatientData";
import { getPatientsByUserId } from "@/services/mockApi";
import type { GuardianUser, Patient } from "@/types/medical";

export function DashboardGuardian() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const { cancerColor, patientName, patientId } = usePatientData();

    // Obtener pacientes reales desde mockApi
    const mockPatients = useMemo(() => {
        if (user?.role === 'guardian') {
            const guardianUser = user as GuardianUser;
            // Obtener pacientes a cargo del guardian
            const assignedPatients = getPatientsByUserId(guardianUser.id);
            
            // Mapear a formato esperado por PatientSelector
            return assignedPatients.map((patient: Patient) => ({
                patientId: patient.id,
                name: patient.name,
                cancerType: patient.cancerType
            }));
        }
        return [];
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const onTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    const renderContent = () => {
        if (!patientId) {
            return (
                <div className="mt-8 text-center py-12">
                    <p className="text-gray-500 text-lg">
                        Por favor, seleccione un paciente para ver su información
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case 'home':
                return (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Resumen de {patientName}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-teal-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-teal-900">
                                    Próxima Consulta
                                </h3>
                                <p className="text-teal-600 text-sm font-medium mt-2">
                                    No programada
                                </p>
                            </div>
                            <div className="bg-orange-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-orange-900">
                                    Recordatorios
                                </h3>
                                <p className="text-orange-600 text-3xl font-bold mt-2">0</p>
                            </div>
                            <div className="bg-indigo-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-indigo-900">
                                    Documentos
                                </h3>
                                <p className="text-indigo-600 text-3xl font-bold mt-2">0</p>
                            </div>
                        </div>
                    </div>
                );
            case 'appointments':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Citas de {patientName}
                        </h2>
                        <p className="text-gray-500 text-center py-8">
                            Sección de citas en desarrollo...
                        </p>
                    </div>
                );
            case 'documents':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Documentos de {patientName}
                        </h2>
                        <p className="text-gray-500 text-center py-8">
                            Sección de documentos en desarrollo...
                        </p>
                    </div>
                );
            case 'profile':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h2>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-gray-700">
                                <strong>Nombre:</strong> {user?.name}
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Email:</strong> {user?.email}
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Rol:</strong> Guardian/Tutor
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Pacientes a cargo:</strong> {mockPatients.length}
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard - Guardian
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Bienvenido/a, {user?.name}
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Cerrar Sesión
                        </Button>
                    </div>

                    {/* Selector de Paciente */}
                    <PatientSelector patients={mockPatients} />

                    {/* Contenido dinámico */}
                    {renderContent()}
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
                accentColor={cancerColor.color}
                tabs={guardianTabs}
            />
        </div>
    );
}
