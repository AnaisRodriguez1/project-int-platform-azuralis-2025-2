import { useAuth } from "@/context/AuthContext";
import { usePatientContext } from "@/context/PatientContext";
import { cancerColors } from "@/types/medical";
import type { CancerType, PatientUser } from "@/types/medical";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

interface PatientData {
  cancerType: CancerType;
  cancerColor: { color: string; name: string };
  patientId: string;
  patientName: string;
}

/**
 * Custom hook para obtener datos del paciente actual
 * 
 * Funciona de manera diferente según el rol del usuario:
 * - PACIENTE: Retorna sus propios datos desde la API
 * - GUARDIAN: Retorna datos del paciente seleccionado en PatientContext
 * - DOCTOR/NURSE: Retorna datos del paciente que están visualizando
 */
export function usePatientData(): PatientData {
  const { user } = useAuth();
  const { currentPatient } = usePatientContext();
  const [patientData, setPatientData] = useState<PatientData>({
    cancerType: 'other',
    cancerColor: cancerColors.other,
    patientId: '',
    patientName: 'Cargando...'
  });

  useEffect(() => {
    const loadPatientData = async () => {
      if (user?.role === 'patient') {
        try {
          const patientUser = user as PatientUser;
          // Buscar el paciente por RUT
          const allPatients = await apiService.patients.getAll();
          const patientFound = allPatients.find((p: any) => p.rut === user.rut);
          
          if (patientFound) {
            setPatientData({
              patientId: patientFound.id,
              patientName: patientFound.name,
              cancerType: patientFound.cancerType,
              cancerColor: cancerColors[patientFound.cancerType] || cancerColors.other
            });
          } else {
            // Fallback si no se encuentra
            setPatientData({
              patientId: patientUser.patientId || '',
              patientName: user.name,
              cancerType: 'other',
              cancerColor: cancerColors.other
            });
          }
        } catch (error) {
          console.error('Error al cargar datos del paciente:', error);
          setPatientData({
            patientId: '',
            patientName: user.name,
            cancerType: 'other',
            cancerColor: cancerColors.other
          });
        }
      } else if (user?.role === 'guardian' || user?.role === 'doctor' || user?.role === 'nurse') {
        // Para guardian/doctor/nurse: usar el paciente seleccionado del contexto
        if (!currentPatient) {
          setPatientData({
            patientId: '',
            patientName: 'No seleccionado',
            cancerType: 'other',
            cancerColor: cancerColors.other
          });
        } else {
          setPatientData({
            patientId: currentPatient.patientId,
            patientName: currentPatient.name,
            cancerType: currentPatient.cancerType,
            cancerColor: cancerColors[currentPatient.cancerType] || cancerColors.other
          });
        }
      }
    };

    loadPatientData();
  }, [user, currentPatient]);

  return patientData;
}
