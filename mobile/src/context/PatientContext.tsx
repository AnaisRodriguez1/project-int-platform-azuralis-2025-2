import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CancerType } from "../types/medical";

interface PatientContextData {
  patientId: string;
  cancerType: CancerType;
  name: string;
  selectedColor?: CancerType;
  // Agrega más campos si los usas en el dashboard móvil (ej: stage, diagnosis, etc.)
}

interface PatientContextType {
  currentPatient: PatientContextData | null;
  setCurrentPatient: React.Dispatch<React.SetStateAction<PatientContextData | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [currentPatient, setCurrentPatient] = useState<PatientContextData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PatientContext.Provider
      value={{
        currentPatient,
        setCurrentPatient,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext debe ser usado dentro de un PatientProvider");
  }
  return context;
}
