import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { doctorTabs } from "@/common/config/navigationTabs";
import { PatientSelector } from "@/components/PatientSelector";
import { usePatientData } from "@/hooks/usePatientData";
import type { CancerType } from "@/types/medical";
import { HomeDoctor } from "./Home";
import { PatientsDoctor } from "./Patients";
import { AppointmentsDoctor } from "./Appointments";
import { ReportsDoctor } from "./Reports";

// Mock de pacientes - TODO: Obtener desde API según doctorUser.scanHistory o pacientes asignados
const mockPatients = [
  { patientId: '1', name: 'María González', cancerType: 'breast' as CancerType },
  { patientId: '2', name: 'Juan Pérez', cancerType: 'lung' as CancerType },
  { patientId: '3', name: 'Ana Rodríguez', cancerType: 'colon' as CancerType },
  { patientId: '4', name: 'Carlos Sánchez', cancerType: 'prostate' as CancerType },
];

export function DashboardDoctor() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const { cancerColor, patientName, patientId } = usePatientData();
    const doctorColor = '#3B82F6'; // Color azul para doctor

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
                        Por favor, seleccione un paciente para ver su información médica
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900">
                                Total Pacientes
                            </h3>
                            <p className="text-blue-600 text-3xl font-bold mt-2">{mockPatients.length}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-900">
                                Consultas Hoy
                            </h3>
                            <p className="text-green-600 text-3xl font-bold mt-2">0</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-900">
                                Reportes Pendientes
                            </h3>
                            <p className="text-purple-600 text-3xl font-bold mt-2">0</p>
                        </div>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'home':
                return (<HomeDoctor />);
            case 'patients':
                return (<PatientsDoctor/>);
            case 'appointments':
                return (<AppointmentsDoctor/>);
            case 'reports':
                return (<ReportsDoctor/>);
            case 'profile':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h2>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-gray-700">
                                <strong>Nombre:</strong> Dr./Dra. {user?.name}
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Email:</strong> {user?.email}
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Rol:</strong> Doctor
                            </p>
                            <p className="text-gray-700 mt-2">
                                <strong>Pacientes activos:</strong> {mockPatients.length}
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
                                Dashboard - Doctor
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Bienvenido, Dr./Dra. {user?.name}
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
                accentColor={patientId ? cancerColor.color : doctorColor}
                tabs={doctorTabs}
            />
        </div>
    );
}
