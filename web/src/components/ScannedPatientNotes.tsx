import { NotesPatient } from "@/pages/Patient/Notes";

interface ScannedPatientNotesProps {
  patientName: string;
}

/**
 * Wrapper para NotesPatient cuando es visto por personal médico (doctor/enfermera)
 * 
 * Este componente reutiliza NotesPatient pero adapta los textos al contexto de visualización
 * por parte del personal médico. Los permisos se manejan automáticamente según medical.ts:
 * 
 * - Doctor: DOCTOR_PERMISSIONS - puede crear, leer, actualizar y eliminar TODAS las notas
 * - Enfermera: NURSE_PERMISSIONS - puede crear, leer y actualizar todas las notas (NO eliminar)
 * - Guardian/Paciente: Solo pueden editar sus propias notas
 * 
 * La lógica de permisos está implementada en NotesPatient.canEditNote()
 */
export function ScannedPatientNotes({ patientName }: ScannedPatientNotesProps) {
  return (
    <div className="space-y-4">
      {/* Header contextualizado para personal médico */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notas Clínicas</h2>
        <p className="text-gray-600 mt-1">
          Historial de evolución y observaciones de {patientName}
        </p>
      </div>
      
      {/* 
        Reutilización sin duplicación de código:
        NotesPatient maneja automáticamente los permisos según el rol del usuario autenticado
        y el contexto del paciente establecido en PatientProvider.
        hideHeader={true} evita mostrar "Mis Notas" ya que tenemos "Notas Clínicas" arriba.
      */}
      <NotesPatient hideHeader={true} />
    </div>
  );
}
