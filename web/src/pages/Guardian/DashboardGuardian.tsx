import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { guardianTabs } from "@/common/config/navigationTabs";
import { PatientSelector } from "@/components/PatientSelector";
import { usePatientData } from "@/hooks/usePatientData";
import { apiService } from "@/services/api";
import type { GuardianUser } from "@/types/medical";

export function DashboardGuardian() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const { cancerColor, patientName, patientId } = usePatientData();
    const [patients, setPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasNoPatients, setHasNoPatients] = useState(false);

    // Cargar pacientes asignados al guardian
    useEffect(() => {
        const loadPatients = async () => {
            if (!user || user.role !== 'guardian') return;
            
            try {
                setIsLoading(true);
                const guardianUser = user as GuardianUser;
                
                // Si el guardian tiene patientIds, buscar esos pacientes
                if (guardianUser.patientIds && guardianUser.patientIds.length > 0) {
                    const allPatients = await apiService.patients.getAll();
                    const myPatients = allPatients.filter((p: any) => 
                        guardianUser.patientIds.includes(p.id)
                    );
                    
                    setPatients(myPatients.map((p: any) => ({
                        patientId: p.id,
                        name: p.name,
                        cancerType: p.cancerType
                    })));
                    setHasNoPatients(myPatients.length === 0);
                } else {
                    setHasNoPatients(true);
                }
            } catch (error) {
                console.error('Error al cargar pacientes:', error);
                setPatients([]);
                setHasNoPatients(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadPatients();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const onTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    // Si no tiene pacientes asignados, mostrar instrucciones
    if (hasNoPatients && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard - Guardian
                            </h1>
                            <Button onClick={handleLogout} variant="outline">
                                Cerrar Sesión
                            </Button>
                        </div>
                        
                        <div className="mt-8 text-center py-12 bg-blue-50 rounded-lg">
                            <div className="max-w-2xl mx-auto">
                                <svg className="mx-auto h-16 w-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    No tienes pacientes asignados
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Para poder ver información de pacientes, primero deben agregarte como cuidador desde su dashboard.
                                </p>
                                <div className="bg-white p-6 rounded-lg border border-blue-200 text-left">
                                    <h3 className="font-semibold text-gray-900 mb-3">📋 Instrucciones:</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                        <li>Pide al paciente que inicie sesión en su cuenta</li>
                                        <li>El paciente debe ir a su dashboard y buscar la sección "Familiares/Cuidadores"</li>
                                        <li>Debe agregarte usando tu email: <strong className="text-blue-600">{user?.email}</strong></li>
                                        <li>Una vez agregado, podrás ver su información aquí</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

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
                                <strong>Pacientes a cargo:</strong> {patients.length}
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
                    <PatientSelector patients={patients} />

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
