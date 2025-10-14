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
                    <div className="mt-8 space-y-6">
                        {/* Header con Avatar */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                                    <p className="text-blue-100 mt-1">Médico Oncólogo</p>
                                    <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas Principales */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium mb-1">Pacientes Activos</p>
                                        <p className="text-3xl font-bold text-blue-900">{patientStats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium mb-1">Escaneos QR</p>
                                        <p className="text-3xl font-bold text-green-900">{patientStats.scanHistory}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium mb-1">Años de Experiencia</p>
                                        <p className="text-3xl font-bold text-purple-900">8+</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información Profesional */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Información Profesional</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">RUT Profesional</p>
                                            <p className="font-semibold text-gray-900">12.345.678-9</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Especialidad</p>
                                            <p className="font-semibold text-gray-900">Oncología Médica</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Institución</p>
                                            <p className="font-semibold text-gray-900">Hospital Clínico UCN</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Teléfono</p>
                                            <p className="font-semibold text-gray-900">+56 9 8765 4321</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Horarios de Atención */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-900">Lunes - Viernes</span>
                                            <span className="text-blue-600 font-semibold">08:00 - 18:00</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-900">Sábado</span>
                                            <span className="text-blue-600 font-semibold">09:00 - 13:00</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-900 font-medium mb-2">Próxima Jornada</p>
                                        <p className="text-2xl font-bold text-blue-600">Lunes 08:00</p>
                                        <p className="text-sm text-blue-700 mt-1">Consultas programadas: 12</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuración y Seguridad */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => alert('Funcionalidad próximamente')}>
                                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    Cambiar Contraseña
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => alert('Funcionalidad próximamente')}>
                                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Preferencias de Notificaciones
                                </Button>
                                <div className="pt-3 border-t border-gray-200">
                                    <Button 
                                        variant="destructive" 
                                        className="w-full"
                                        onClick={handleLogout}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Cerrar Sesión
                                    </Button>
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
