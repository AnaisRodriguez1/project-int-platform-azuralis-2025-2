import { useAuth } from "@/context/AuthContext";
import { usePatientData } from "@/hooks/usePatientData";

export function ProfilePatient() {
    const { user } = useAuth();
    const { cancerColor } = usePatientData();

    return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h2>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700">
          <strong>Nombre:</strong> {user?.name}
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Email:</strong> {user?.email}
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Rol:</strong> Paciente
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Tipo de cáncer:</strong> {cancerColor.name}
        </p>
      </div>
    </div>
  );
}
