import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CancerType } from "@/types/medical";

interface PatientContextData {
  patientId: string;
  cancerType: CancerType;
  selectedColor?: CancerType; // Color personalizado elegido por el paciente
  name: string;
  // Agregar más campos según necesidad
}

interface PatientContextType {
  currentPatient: PatientContextData | null;
  setCurrentPatient: (patient: PatientContextData | null) => void;
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [currentPatient, setCurrentPatient] = useState<PatientContextData | null>(null);
  const [isLoading] = useState(false);

  return (
    <PatientContext.Provider
      value={{
        currentPatient,
        setCurrentPatient,
        isLoading,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext must be used within PatientProvider");
  }
  return context;
}
