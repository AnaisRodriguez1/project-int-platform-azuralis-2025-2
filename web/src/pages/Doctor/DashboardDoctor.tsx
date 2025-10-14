import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { doctorTabs } from "@/common/config/navigationTabs";
import { getPatientsByDoctor } from "@/services/mockApi";
import type { DoctorUser, Patient } from "@/types/medical";
import { DoctorScanner } from "@/components/DoctorScanner";
import { PatientRecord } from "@/components/PatientRecord";
import { HomeDoctor } from "./Home";
import { PatientsDoctor } from "./Patients";

export function DashboardDoctor() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const doctorColor = '#3B82F6'; // Color azul para doctor

    // Obtener estadísticas de pacientes del doctor
    const patientStats = useMemo(() => {
        if (user?.role === 'doctor') {
            const doctorUser = user as DoctorUser;
            const assignedPatients = getPatientsByDoctor(doctorUser.name);
            return {
                total: assignedPatients.length,
                scanHistory: doctorUser.scanHistory?.length || 0
            };
        }
        return { total: 0, scanHistory: 0 };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const onTabChange = (tabId: string) => {
        if (tabId === 'scanner') {
            setShowScanner(true);
            setScannedPatient(null);
        } else {
            setShowScanner(false);
            setScannedPatient(null);
            setActiveTab(tabId);
        }
    };

    const handlePatientFound = (patient: Patient) => {
        setScannedPatient(patient);
        setShowScanner(false);
    };

    const handleBackFromScanner = () => {
        setShowScanner(false);
        setActiveTab('home');
    };

    const handleBackFromRecord = () => {
        setScannedPatient(null);
        setActiveTab('home');
    };

    // Si está escaneando, mostrar el scanner
    if (showScanner) {
        return <DoctorScanner onPatientFound={handlePatientFound} onBack={handleBackFromScanner} />;
    }

    // Si se escaneó un paciente, mostrar su ficha
    if (scannedPatient) {
        return <PatientRecord patient={scannedPatient} onBack={handleBackFromRecord} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (<HomeDoctor />);
            case 'patients':
                return (<PatientsDoctor/>);
            case 'profile':
                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h2>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <div>
                                <p className="text-gray-700">
                                    <strong>Nombre:</strong> {user?.name}
                                </p>
                                <p className="text-gray-700 mt-2">
                                    <strong>Email:</strong> {user?.email}
                                </p>
                                <p className="text-gray-700 mt-2">
                                    <strong>Rol:</strong> Doctor
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3">Estadísticas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-600 mb-1">Pacientes Asignados</p>
                                        <p className="text-2xl font-bold text-blue-900">{patientStats.total}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-green-600 mb-1">Escaneos Realizados</p>
                                        <p className="text-2xl font-bold text-green-900">{patientStats.scanHistory}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard - Doctor
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Bienvenido, {user?.name}
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Cerrar Sesión
                        </Button>
                    </div>

                    {/* Contenido dinámico */}
                    {renderContent()}
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
                accentColor={doctorColor}
                tabs={doctorTabs}
            />
        </div>
    );
}
