export function HomePatient() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-pink-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-pink-900">
          Próxima Consulta
        </h3>
        <p className="text-pink-600 text-sm font-medium mt-2">No programada</p>
      </div>
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">
          Medicamentos Actuales
        </h3>
        <p className="text-blue-600 text-3xl font-bold mt-2">0</p>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900">Documentos</h3>
        <p className="text-purple-600 text-3xl font-bold mt-2">0</p>
      </div>
    </div>
  );
}
