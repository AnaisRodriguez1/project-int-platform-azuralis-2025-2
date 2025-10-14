import { useAuth } from "@/context/AuthContext";
import { usePatientContext } from "@/context/PatientContext";
import { cancerColors } from "@/types/medical";
import type { CancerType } from "@/types/medical";

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
 * - PACIENTE: Retorna sus propios datos
 * - GUARDIAN: Retorna datos del paciente seleccionado en PatientContext
 * - DOCTOR/NURSE: Retorna datos del paciente que están visualizando
 * 
 * TODO: Conectar con API real para obtener datos del backend
 */
export function usePatientData(): PatientData {
  const { user } = useAuth();
  const { currentPatient } = usePatientContext();

  // Determinar de dónde obtener los datos según el rol
  let cancerType: CancerType;
  let patientId: string;
  let patientName: string;

  if (user?.role === 'patient') {
    // Para paciente: usar sus propios datos
    // TODO: Obtener desde user.cancerType cuando esté en el backend
    patientId = user.id;
    patientName = user.name;
    cancerType = 'hepatic'; // Temporal - TODO: user.cancerType
  } else if (user?.role === 'guardian' || user?.role === 'doctor' || user?.role === 'nurse') {
    // Para guardian/doctor/nurse: usar el paciente seleccionado del contexto
    if (!currentPatient) {
      // Si no hay paciente seleccionado, usar valores por defecto
      patientId = '';
      patientName = 'No seleccionado';
      cancerType = 'other';
    } else {
      patientId = currentPatient.patientId;
      patientName = currentPatient.name;
      cancerType = currentPatient.cancerType;
    }
  } else {
    // Fallback para otros roles
    patientId = '';
    patientName = 'Desconocido';
    cancerType = 'other';
  }

  // Obtener el color asociado al tipo de cáncer
  const cancerColor = cancerColors[cancerType] || cancerColors.other;

  return {
    cancerType,
    cancerColor,
    patientId,
    patientName,
  };
}
