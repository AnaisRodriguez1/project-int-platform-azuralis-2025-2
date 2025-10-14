import { Home, StickyNote, FolderOpen, Settings, Users, Calendar, FileText, Activity } from "lucide-react";
import type { NavTab } from "@/components/BottomNavigation";

// Tabs para Paciente
export const patientTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'notes', icon: StickyNote, label: 'Notas' },
  { id: 'documents', icon: FolderOpen, label: 'Documentos' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];

// Tabs para Doctor
export const doctorTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'patients', icon: Users, label: 'Pacientes' },
  { id: 'appointments', icon: Calendar, label: 'Citas' },
  { id: 'reports', icon: FileText, label: 'Reportes' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];

// Tabs para Enfermera/o
export const nurseTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'patients', icon: Users, label: 'Pacientes' },
  { id: 'tasks', icon: Activity, label: 'Tareas' },
  { id: 'notes', icon: StickyNote, label: 'Notas' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];

// Tabs para Guardian/Tutor
export const guardianTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'appointments', icon: Calendar, label: 'Citas' },
  { id: 'documents', icon: FolderOpen, label: 'Documentos' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];
