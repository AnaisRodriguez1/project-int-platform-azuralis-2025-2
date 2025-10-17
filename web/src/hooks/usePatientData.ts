import { useAuth } from "@/context/AuthContext";
import { usePatientContext } from "@/context/PatientContext";
import { cancerColors } from "@/types/medical";
import type { CancerType, PatientUser } from "@/types/medical";
import { getPatientById } from "@/services/mockApi";

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
 * - PACIENTE: Retorna sus propios datos desde mockApi
 * - GUARDIAN: Retorna datos del paciente seleccionado en PatientContext
 * - DOCTOR/NURSE: Retorna datos del paciente que están visualizando
 */
export function usePatientData(): PatientData {
  const { user } = useAuth();
  const { currentPatient } = usePatientContext();

  // Determinar de dónde obtener los datos según el rol
  let cancerType: CancerType;
  let patientId: string;
  let patientName: string;

  if (user?.role === 'patient') {
    // Para paciente: obtener datos reales desde mockApi
    const patientUser = user as PatientUser;
    const patientData = getPatientById(patientUser.patientId);
    
    if (patientData) {
      patientId = patientData.id;
      patientName = patientData.name;
      cancerType = patientData.cancerType;
    } else {
      // Fallback si no se encuentra el paciente
      patientId = patientUser.patientId;
      patientName = user.name;
      cancerType = 'other';
    }
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
