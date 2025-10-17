import { DocumentsPatient } from "@/pages/Patient/Documents";

interface ScannedPatientDocumentsProps {
  patientName: string;
}

/**
 * Wrapper para DocumentsPatient cuando es visto por personal médico (doctor/enfermera)
 * 
 * Este componente reutiliza DocumentsPatient pero adapta los textos al contexto de visualización
 * por parte del personal médico. Los permisos se manejan automáticamente según medical.ts:
 * 
 * - Doctor: DOCTOR_PERMISSIONS - puede crear, leer, actualizar y eliminar TODOS los documentos
 * - Enfermera: NURSE_PERMISSIONS - puede crear, leer y actualizar todos los documentos (NO eliminar)
 * - Guardian/Paciente: Solo pueden eliminar sus propios documentos (no los de doctor/enfermera)
 * 
 * La lógica de permisos está implementada en DocumentsPatient.canDeleteDocument()
 */
export function ScannedPatientDocuments({ patientName }: ScannedPatientDocumentsProps) {
  return (
    <div className="space-y-4">
      {/* Header contextualizado para personal médico */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Documentos Médicos</h2>
        <p className="text-gray-600 mt-1">
          Exámenes, imágenes y registros documentales de {patientName}
        </p>
      </div>
      
      {/* 
        Reutilización sin duplicación de código:
        DocumentsPatient maneja automáticamente los permisos según el rol del usuario autenticado
        y el contexto del paciente establecido en PatientProvider.
        hideHeader={true} evita mostrar "Mis Documentos" ya que tenemos "Documentos Médicos" arriba.
      */}
      <DocumentsPatient hideHeader={true} />
    </div>
  );
}
