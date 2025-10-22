import { usePatientContext } from "@/context/PatientContext";
import type { CancerType } from "@/types/medical";

interface Patient {
  patientId: string;
  name: string;
  cancerType: CancerType;
  selectedColor?: CancerType; // Color personalizado elegido por el paciente
  relationship?: string;
}

interface PatientSelectorProps {
  patients: Patient[];
}

/**
 * Componente para que Guardian/Doctor/Nurse seleccione un paciente
 * Actualiza el contexto global del paciente seleccionado
 */
export function PatientSelector({ patients }: PatientSelectorProps) {
  const { currentPatient, setCurrentPatient } = usePatientContext();

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient({
      patientId: patient.patientId,
      name: patient.name,
      cancerType: patient.cancerType,
      selectedColor: patient.selectedColor, // Incluir el color personalizado
    });
  };

  return (
    <div className="mb-6">
      <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar Paciente
      </label>
      <select
        id="patient-select"
        value={currentPatient?.patientId || ''}
        onChange={(e) => {
          const selectedPatient = patients.find(p => p.patientId === e.target.value);
          if (selectedPatient) {
            handleSelectPatient(selectedPatient);
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- Seleccione un paciente --</option>
        {patients.map((patient) => (
          <option key={patient.patientId} value={patient.patientId}>
            {patient.name} {patient.relationship ? `(${patient.relationship})` : ''}
          </option>
        ))}
      </select>

      {currentPatient && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viendo:</strong> {currentPatient.name}
          </p>
        </div>
      )}
    </div>
  );
}
