import { useAuth } from "@/context/AuthContext";
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
import { EditableClinicalProfile } from "@/pages/ClinicalStaff/EditableProfile";
import { apiService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stats {
  totalPatients: number;
  searchHistory: number;
  myPatients: number;
}

export function DashboardClinicalStaff() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    searchHistory: 0,
    myPatients: 0,
  });
  const [userPhoto, setUserPhoto] = useState<any>(null);

  const isDoctor = user?.role === "doctor";
  const isNurse = user?.role === "nurse";
  const accentColor = isDoctor ? "#001663" : "#00B4D8";
  const roleLabel = isDoctor ? "Doctor" : "Enfermera";

  // Load user profile picture
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (user?.id) {
        try {
          const photoData = await apiService.users.getProfilePicture(user.id);
          setUserPhoto(photoData);
        } catch (error) {
          console.log('No profile picture found');
        }
      }
    };
    loadUserPhoto();
  }, [user?.id]);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!user || (!isDoctor && !isNurse)) return;

      try {
        const allPatients = await apiService.patients.getAll();
        const clinicalUser = user as DoctorUser | NurseUser;

        const myPatients = allPatients.filter((patient: Patient) =>
          patient.careTeam?.some((member) => {
            // La comparación ahora es insensible a mayúsculas/minúsculas
            return member.userId.toLowerCase() === user.id.toLowerCase();
          })
        );

        setStats({
          totalPatients: allPatients.length,
          searchHistory: clinicalUser.searchHistory?.length || 0,
          myPatients: myPatients.length,
        });
      } catch (error) {
        console.error("Error loading statistics:", error);
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
      console.log("Paciente encontrado:", patient.id, patient.rut);
    } catch (error) {
      console.error("Error al guardar historial:", error);
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
                  Bienvenido/a
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
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
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
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
                      <svg
                        className="w-6 h-6"
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
        return <EditableClinicalProfile />;

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
              background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userPhoto?.url} alt={user?.name} />
                    <AvatarFallback className="text-3xl font-bold" style={{ backgroundColor: accentColor + '40', color: accentColor }}>
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-white text-sm mt-1">
                    {isDoctor
                      ? `Especialización: ${
                          (user as DoctorUser).specialization
                        }`
                      : `Departamento: ${(user as NurseUser).department}`}
                  </p>
                  <p className="text-white text-sm">{user?.email}</p>
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
