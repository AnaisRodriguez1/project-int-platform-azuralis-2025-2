import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePatientContext } from "../context/PatientContext";
import { apiService } from "../services/api";
import { cancerColors } from "../types/medical";
import type { CancerType, PatientUser } from "../types/medical";

interface PatientData {
  cancerType: CancerType;
  cancerColor: { color: string; name: string };
  patientId: string;
  patientName: string;
}

/**
 * Hook para obtener los datos del paciente actual en la app móvil.
 * 
 * Funciona según el rol:
 * - PACIENTE → obtiene sus propios datos desde la API.
 * - GUARDIAN / DOCTOR / NURSE → usa el paciente actual del contexto.
 */
export function usePatientData(): PatientData {
  const { user } = useAuth();
  const { currentPatient } = usePatientContext();

  const [patientData, setPatientData] = useState<PatientData>({
    cancerType: "other",
    cancerColor: cancerColors.other,
    patientId: "",
    patientName: "Cargando...",
  });

 useEffect(() => {
  let isMounted = true;

  const loadPatientData = async () => {
    if (!user) return;

    try {
      if (user.role === "patient") {
        // Buscar paciente por RUT (igual que en la web)
        const allPatients = await apiService.patients.getAll();
        const patientFound = allPatients.find((p: any) => p.rut === user.rut);

        if (isMounted && patientFound) {
          const colorKey = patientFound.selectedColor || patientFound.cancerType;
          setPatientData({
            patientId: patientFound.id,
            patientName: patientFound.name,
            cancerType: patientFound.cancerType,
            cancerColor: cancerColors[colorKey] || cancerColors.other,
          });
        } else {
          setPatientData({
            patientId: "",
            patientName: user.name,
            cancerType: "other",
            cancerColor: cancerColors.other,
          });
        }
      } else if (
        user.role === "guardian" ||
        user.role === "doctor" ||
        user.role === "nurse"
      ) {
        if (!currentPatient) {
          setPatientData({
            patientId: "",
            patientName: "No seleccionado",
            cancerType: "other",
            cancerColor: cancerColors.other,
          });
        } else {
          const colorKey = currentPatient.selectedColor || currentPatient.cancerType;
          setPatientData({
            patientId: currentPatient.patientId,
            patientName: currentPatient.name,
            cancerType: currentPatient.cancerType,
            cancerColor:
              cancerColors[colorKey] || cancerColors.other,
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del paciente:", error);
      if (isMounted) {
        setPatientData({
          patientId: "",
          patientName: user.name,
          cancerType: "other",
          cancerColor: cancerColors.other,
        });
      }
    }
  };

  loadPatientData();

  return () => {
    isMounted = false;
  };
}, [user, currentPatient]);


  return patientData;
}
