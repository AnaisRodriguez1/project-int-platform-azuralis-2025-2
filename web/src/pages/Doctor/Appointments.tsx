import { usePatientData } from "@/hooks/usePatientData";

export function AppointmentsDoctor() {
  const { patientName } = usePatientData();
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Citas de {patientName}
      </h2>
      <p className="text-gray-500 text-center py-8">
        Gestión de citas en desarrollo...
      </p>
    </div>
  );
}
