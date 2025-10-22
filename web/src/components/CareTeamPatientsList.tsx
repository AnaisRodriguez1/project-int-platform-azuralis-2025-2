import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import type { Patient } from "@/types/medical";
import { cancerColors } from "@/types/medical";
import { calculateAge } from "@/common/helpers/CalculateAge";
import { Users, ChevronRight, Loader2 } from "lucide-react";
import { CancerRibbon } from "./CancerRibbon";

interface CareTeamPatientsListProps {
  onPatientSelect: (patient: Patient) => void;
}

export function CareTeamPatientsList({ onPatientSelect }: CareTeamPatientsListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyCareTeamPatients();
  }, []);

  const loadMyCareTeamPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar el endpoint específico
      const myPatients = await apiService.patients.getMyCareTeam();
      
      // Debug: ver qué datos estamos recibiendo
      console.log('🔍 Pacientes recibidos:', myPatients);
      myPatients.forEach(p => {
        console.log(`📋 Paciente ${p.name}:`, {
          careTeam: p.careTeam,
          totalMembers: p.careTeam?.length,
          activeMembers: p.careTeam?.filter(m => m.status === 'active').length
        });
      });
      
      setPatients(myPatients);
    } catch (err) {
      console.error('Error al cargar pacientes del equipo:', err);
      setError('Error al cargar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando pacientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadMyCareTeamPatients} 
            variant="outline" 
            className="mt-4"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No tienes pacientes asignados
          </h3>
          <p className="text-gray-500">
            Actualmente no formas parte del equipo de cuidados de ningún paciente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mi Equipo de Cuidados
        </h2>
        <span className="text-sm text-gray-500">
          {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => {
          const cancerInfo = cancerColors[patient.cancerType];
          const myRole = patient.careTeam?.find(
            member => member.userId === localStorage.getItem('userId')
          )?.role;

          return (
            <Card 
              key={patient.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2"
              style={{ borderColor: `${cancerInfo.color}40` }}
              onClick={() => onPatientSelect(patient)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {patient.photo ? (
                      <img 
                        src={patient.photo} 
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: cancerInfo.color }}
                      >
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {calculateAge(patient.dateOfBirth)} años
                      </p>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cancerInfo.color }}
                    title={cancerInfo.name}
                  >
                    <CancerRibbon size="sm" className="text-white" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Diagnóstico:</span>
                    <span className="font-medium text-gray-900">
                      {cancerInfo.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estadio:</span>
                    <span className="font-medium text-gray-900">
                      {patient.stage}
                    </span>
                  </div>
                  {myRole && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Mi rol:</span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${cancerInfo.color}20`,
                          color: cancerInfo.color 
                        }}
                      >
                        {myRole.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Equipo: {patient.careTeam?.length || 0} miembros</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
