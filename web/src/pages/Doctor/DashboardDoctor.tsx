import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { doctorTabs } from "@/common/config/navigationTabs";
import { getPatientsByUserId } from "@/services/mockApi";
import type { DoctorUser, Patient } from "@/types/medical";
import { DoctorScanner } from "@/components/Scanner";
import { ScannedPatientView } from "@/components/ScannedPatientView";
import { HomeDoctor } from "./Home";
import { PatientsDoctor } from "./Patients";
import { Button } from "@/components/ui/button";

export function DashboardDoctor() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const doctorColor = "#3B82F6"; // Color azul para doctor

  // Obtener el doctor con tipo correcto
  const doctorUser = user?.role === "doctor" ? (user as DoctorUser) : null;

  // Obtener estadísticas de pacientes del doctor
  const patientStats = useMemo(() => {
    if (doctorUser) {
      const assignedPatients = getPatientsByUserId(doctorUser.id);
      return {
        total: assignedPatients.length,
        scanHistory: doctorUser.scanHistory?.length || 0,
      };
    }
    return { total: 0, scanHistory: 0 };
  }, [doctorUser]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const onTabChange = (tabId: string) => {
    if (tabId === "scanner") {
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
    setActiveTab("home");
  };

  const handleBackFromRecord = () => {
    setScannedPatient(null);
    setActiveTab("home");
  };

  // Si está escaneando, mostrar el scanner
  if (showScanner) {
    return (
      <DoctorScanner
        onPatientFound={handlePatientFound}
        onBack={handleBackFromScanner}
      />
    );
  }

  // Si se escaneó un paciente, mostrar su ficha con navegación
  if (scannedPatient) {
    return (
      <ScannedPatientView patient={scannedPatient} onBack={handleBackFromRecord} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeDoctor />;
      case "patients":
        return <PatientsDoctor />;
      case "profile":
        return (
          <div className="mt-8 space-y-6">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Pacientes Activos
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {patientStats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">
                      Escaneos QR
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {patientStats.scanHistory}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      Años de Experiencia
                    </p>
                    <p className="text-3xl font-bold text-purple-900">8+</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Profesional
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">RUT Profesional</p>
                      <p className="font-semibold text-gray-900">
                        {user?.rut || "No disponible"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Especialidad</p>
                      <p className="font-semibold text-gray-900">
                        {doctorUser?.specialization || ""}
                      </p>
                    </div>
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
          {/* Header con Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Especialización: {doctorUser?.specialization}
                </p>
                <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white"
              >
                Cerrar Sesión
              </Button>
            </div>
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
