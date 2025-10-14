import { usePatientData } from "@/hooks/usePatientData";

export function HomeDoctor() {
    const { cancerColor, patientName, patientId } = usePatientData();
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ficha Médica de {patientName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">
            Última Consulta
          </h3>
          <p className="text-blue-600 text-sm font-medium mt-2">Hace 15 días</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">
            Tratamiento Actual
          </h3>
          <p className="text-green-600 text-sm font-medium mt-2">En curso</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900">Estado</h3>
          <p className="text-purple-600 text-sm font-medium mt-2">Estable</p>
        </div>
      </div>
    </div>
  );
}
