/**
 * DashboardClinicalStaff Component
 * 
 * Unified dashboard for clinical staff (doctors and nurses)
 * Features:
 * - Patient search by RUT
 * - Patient list management
 * - Profile completion workflow
 * - Statistics display
 * 
 * @component
 */

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { clinicalStaffTabs } from "@/common/config/navigationTabs";
import type { DoctorUser, NurseUser, Patient } from "@/types/medical";
import { SearchPatientByRut } from "@/components/SearchPatientByRut";
import { EditablePatientRecord } from "@/components/EditablePatientRecord";
import { Button } from "@/components/ui/button";
import { CompleteDoctorProfile } from "@/components/CompleteDoctorProfile";
import { CompleteNurseProfile } from "@/components/CompleteNurseProfile";
import { CareTeamPatientsList } from "@/components/CareTeamPatientsList";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalPatients: number;
  searchHistory: number;
  myPatients: number;
}

export function DashboardClinicalStaff() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [stats, setStats] = useState<Stats>({ 
    totalPatients: 0, 
    searchHistory: 0,
    myPatients: 0 
  });

  const isDoctor = user?.role === 'doctor';
  const isNurse = user?.role === 'nurse';
  const accentColor = isDoctor ? "#3B82F6" : "#00B4D8";
  const roleLabel = isDoctor ? "Doctor" : "Enfermera";

  // Check if profile needs completion
  useEffect(() => {
    if (!user) return;

    const needsCompletion = isDoctor
      ? !(user as DoctorUser).specialization || !(user as DoctorUser).license
      : !(user as NurseUser).department || !(user as NurseUser).license;

    setNeedsProfileCompletion(needsCompletion);
  }, [user, isDoctor, isNurse]);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!user || (!isDoctor && !isNurse)) return;
      
      try {
        const allPatients = await apiService.patients.getAll();
        const clinicalUser = user as DoctorUser | NurseUser;
        
        const myPatients = allPatients.filter((patient: Patient) => 
          patient.careTeam?.some((member) => member.userId === user.id)
        );
        
        setStats({
          totalPatients: allPatients.length,
          searchHistory: clinicalUser.searchHistory?.length || 0,
          myPatients: myPatients.length
        });
      } catch (error) {
        console.error('Error loading statistics:', error);
        setStats({ totalPatients: 0, searchHistory: 0, myPatients: 0 });
      }
    };

    if (!needsProfileCompletion) {
      loadStats();
    }
  }, [user, needsProfileCompletion, isDoctor, isNurse]);

  // Handle profile completion
  const handleProfileComplete = () => {
    setNeedsProfileCompletion(false);
    window.location.reload();
  };

  // Show profile completion form if needed
  if (needsProfileCompletion) {
    return isDoctor ? (
      <CompleteDoctorProfile onComplete={handleProfileComplete} />
    ) : (
      <CompleteNurseProfile onComplete={handleProfileComplete} />
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId); // Siempre actualizar el tab activo
    
    if (tabId === "search") {
      setShowSearch(true);
      setSelectedPatient(null);
    } else {
      setShowSearch(false);
      setSelectedPatient(null);
    }
  };

  const handlePatientFound = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowSearch(false);
    
    // Guardar en historial de búsquedas
    try {
      // TODO: HECHO, NO TOCAR
      console.log('Paciente encontrado:', patient.id, patient.rut);
    } catch (error) {
      console.error('Error al guardar historial:', error);
    }
  };

  const handleBackFromSearch = () => {
    setShowSearch(false);
    setActiveTab("home");
  };

  const handleBackFromRecord = () => {
    setSelectedPatient(null);
    setActiveTab("careTeam");
  };

  // Si está buscando, mostrar el buscador CON bottom navigation
  if (showSearch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchPatientByRut
          onPatientFound={handlePatientFound}
          onBack={handleBackFromSearch}
        />
        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          accentColor={accentColor}
          tabs={clinicalStaffTabs}
        />
      </div>
    );
  }

  // Si seleccionó un paciente, mostrar su ficha CON bottom navigation
  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EditablePatientRecord 
          patient={selectedPatient} 
          onBack={handleBackFromRecord} 
        />
        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          accentColor={accentColor}
          tabs={clinicalStaffTabs}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="mt-8 space-y-6">
            {/* Bienvenida */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Bienvenido/a, {user?.name}
                </h2>
                <p className="text-blue-100">
                  Panel de {roleLabel} - Sistema de Fichas Médicas
                </p>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Mis Pacientes
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {stats.myPatients}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Búsquedas
                      </p>
                      <p className="text-3xl font-bold text-green-900">
                        {stats.searchHistory}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">
                        Total Pacientes
                      </p>
                      <p className="text-3xl font-bold text-purple-900">
                        {stats.totalPatients}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => onTabChange("search")}
                    className="bg-blue-600 hover:bg-blue-700 h-auto py-4"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <div className="text-left">
                        <p className="font-semibold">Buscar Paciente</p>
                        <p className="text-xs text-blue-100">Por RUT</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => onTabChange("careTeam")}
                    variant="outline"
                    className="h-auto py-4"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="text-left">
                        <p className="font-semibold">Equipo de Cuidados</p>
                        <p className="text-xs text-gray-500">Mis pacientes</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "careTeam":
        return (
          <div className="mt-8">
            <CareTeamPatientsList onPatientSelect={setSelectedPatient} />
          </div>
        );

      case "profile":
        const clinicalUser = user as DoctorUser | NurseUser;
        return (
          <div className="mt-8 space-y-6">
            {/* Información Profesional */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Profesional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">RUT</p>
                      <p className="font-semibold text-gray-900">{user?.rut}</p>
                    </div>
                  </div>

                  {isDoctor && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Especialidad</p>
                        <p className="font-semibold text-gray-900">
                          {(clinicalUser as DoctorUser).specialization}
                        </p>
                      </div>
                    </div>
                  )}

                  {isNurse && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Departamento</p>
                        <p className="font-semibold text-gray-900">
                          {(clinicalUser as NurseUser).department}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Licencia</p>
                      <p className="font-semibold text-gray-900">
                        {clinicalUser.license}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón Cerrar Sesión */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
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
          <div 
            className="rounded-lg p-6 text-white mb-6"
            style={{ 
              background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)` 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-white/90 text-sm mt-1">
                    {isDoctor 
                      ? `Especialización: ${(user as DoctorUser).specialization}`
                      : `Departamento: ${(user as NurseUser).department}`
                    }
                  </p>
                  <p className="text-white/90 text-sm">{user?.email}</p>
                </div>
              </div>
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
        accentColor={accentColor}
        tabs={clinicalStaffTabs}
      />
    </div>
  );
}
