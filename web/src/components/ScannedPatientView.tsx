import { useState, useEffect } from "react";
import type { Patient } from "@/types/medical";
import { cancerColors } from "@/types/medical";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PatientRecord } from "@/components/PatientRecord";
import { ScannedPatientNotes } from "@/components/ScannedPatientNotes";
import { ScannedPatientDocuments } from "@/components/ScannedPatientDocuments";
import { PatientProvider, usePatientContext } from "@/context/PatientContext";
import { User, FileText, StickyNote } from "lucide-react";

interface ScannedPatientViewProps {
  patient: Patient;
  onBack: () => void;
}

/**
 * Vista completa de un paciente escaneado por personal médico
 * 
 * Esta vista muestra toda la información del paciente con navegación por pestañas.
 * Los permisos se manejan automáticamente según el rol del usuario autenticado (medical.ts):
 * 
 * PERMISOS POR ROL:
 * - Doctor: Acceso total (crear, leer, actualizar, eliminar notas y documentos)
 * - Enfermera: Crear, leer, actualizar (NO eliminar)
 * - Guardian/Paciente: Solo sus propios recursos
 * 
 * NAVEGACIÓN:
 * - Paciente: Información completa del paciente (PatientRecord)
 * - Notas: Historial clínico y evolución
 * - Documentos: Exámenes, imágenes, recetas
 * 
 * REUTILIZACIÓN: No duplica código, usa componentes existentes con wrappers mínimos
 */

/**
 * Componente interno que maneja la navegación y renderizado del contenido
 */
function ScannedPatientViewContent({ patient, onBack }: ScannedPatientViewProps) {
  const [activeTab, setActiveTab] = useState("home");
  const cancerColor = cancerColors[patient.cancerType];

  // Pestañas personalizadas para vista de paciente escaneado
  // Solo 3 pestañas: Paciente, Notas, Documentos (sin Perfil)
  const scannedPatientTabs = [
    { id: 'home', icon: User, label: 'Paciente' },
    { id: 'notes', icon: StickyNote, label: 'Notas' },
    { id: 'documents', icon: FileText, label: 'Documentos' },
  ];

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        // Ficha completa del paciente con toda su información médica
        return <PatientRecord patient={patient} onBack={onBack} />;
      
      case "notes":
        // Notas clínicas - Reutiliza NotesPatient con header contextualizado
        // Los permisos se aplican automáticamente según el rol del usuario
        return (
          <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <ScannedPatientNotes patientName={patient.name} />
            </div>
          </div>
        );
      
      case "documents":
        // Documentos médicos - Reutiliza DocumentsPatient con header contextualizado
        // Los permisos se aplican automáticamente según el rol del usuario
        return (
          <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <ScannedPatientDocuments patientName={patient.name} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
      
      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        accentColor={cancerColor.color}
        tabs={scannedPatientTabs}
      />
    </div>
  );
}

/**
 * Componente principal que envuelve todo en el PatientProvider
 * Esto permite que los componentes reutilizados (NotesPatient, DocumentsPatient)
 * accedan al contexto del paciente escaneado mediante usePatientData()
 */
export function ScannedPatientView({ patient, onBack }: ScannedPatientViewProps) {
  return (
    <PatientProvider>
      <PatientContextSetter patient={patient} />
      <ScannedPatientViewContent patient={patient} onBack={onBack} />
    </PatientProvider>
  );
}

/**
 * Helper component que establece el paciente escaneado en el contexto
 * Se ejecuta al montar y limpia al desmontar para evitar state residual
 */
function PatientContextSetter({ patient }: { patient: Patient }) {
  const { setCurrentPatient } = usePatientContext();

  useEffect(() => {
    // Establecer el paciente escaneado en el contexto
    setCurrentPatient({
      patientId: patient.id,
      cancerType: patient.cancerType,
      name: patient.name,
    });
    
    // Limpiar al desmontar para evitar mostrar datos incorrectos
    return () => {
      setCurrentPatient(null);
    };
  }, [patient.id, patient.cancerType, patient.name, setCurrentPatient]);

  return null;
}
