import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { nurseTabs } from "@/common/config/navigationTabs";
import { PatientSelector } from "@/components/PatientSelector";
import { usePatientData } from "@/hooks/usePatientData";
import { apiService } from "@/services/api";
import { nurseColor } from "@/types/medical";
import { CompleteNurseProfile } from "@/components/CompleteNurseProfile";

export function DashboardNurse() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const { cancerColor, patientName, patientId } = usePatientData();
    const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar si la enfermera necesita completar su perfil
    useEffect(() => {
        if (user && user.role === 'nurse') {
            const nurseUser = user as any;
            if (!nurseUser.department || !nurseUser.license) {
                setNeedsProfileCompletion(true);
            }
        }
    }, [user]);

    // Si necesita completar el perfil, mostrar el formulario
    if (needsProfileCompletion) {
        return (
            <CompleteNurseProfile
                onComplete={() => {
                    setNeedsProfileCompletion(false);
                    window.location.reload();
                }}
            />
        );
    }

    // Cargar pacientes desde la API real
    useEffect(() => {
        const loadPatients = async () => {
            if (!user) return;
            
            try {
                setIsLoading(true);
                const allPatients = await apiService.patients.getAll();
                // Filtrar pacientes que tienen a la enfermera en su careTeam
                const myPatients = allPatients.filter((patient: any) => 
                    patient.careTeam?.some((member: any) => member.userId === user.id)
                );
                setPatients(myPatients);
            } catch (error) {
                console.error('Error al cargar pacientes:', error);
                setPatients([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPatients();
    }, [user]);

    // Obtener pacientes asignados a la enfermera desde el careTeam
    // Si no tiene pacientes asignados específicamente, puede ver todos los pacientes del hospital
    const mockPatients = useMemo(() => {
        return patients.map((patient: any) => ({
            patientId: patient.id,
            name: patient.name,
            cancerType: patient.cancerType
        }));
    }, [patients]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

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
                            <div className="bg-cyan-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-cyan-900">
                                    Estado
                                </h3>
                                <p className="text-cyan-600 text-sm font-medium mt-2">
                                    Estable
                                </p>
                            </div>
                            <div className="bg-amber-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-amber-900">
                                    Tareas Pendientes
                                </h3>
                                <p className="text-amber-600 text-3xl font-bold mt-2">0</p>
                            </div>
                            <div className="bg-rose-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-rose-900">
                                    Alertas
                                </h3>
                                <p className="text-rose-600 text-3xl font-bold mt-2">0</p>
                            </div>
                        </div>
                    </div>
                );
            case 'patients':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Pacientes</h2>
                        <p className="text-gray-500 text-center py-8">
                            Lista completa de pacientes asignados en desarrollo...
                        </p>
                    </div>
                );
            case 'tasks':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Tareas para {patientName}
                        </h2>
                        <p className="text-gray-500 text-center py-8">
                            Lista de tareas en desarrollo...
                        </p>
                    </div>
                );
            case 'notes':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Notas de Enfermería - {patientName}
                        </h2>
                        <p className="text-gray-500 text-center py-8">
                            Sección de notas en desarrollo...
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
                                <strong>Rol:</strong> Enfermera/o
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Pacientes asignados:</strong> {mockPatients.length}
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
                                Dashboard - Enfermería
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
                accentColor={patientId ? cancerColor.color : nurseColor}
                tabs={nurseTabs}
            />
        </div>
    );
}
