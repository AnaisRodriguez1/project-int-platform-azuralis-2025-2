import { Home, StickyNote, FolderOpen, Settings, Users, Calendar, Search, ClipboardList } from "lucide-react";
import type { NavTab } from "@/components/BottomNavigation";

// Tabs para Paciente
export const patientTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'notes', icon: StickyNote, label: 'Notas' },
  { id: 'documents', icon: FolderOpen, label: 'Documentos' },
  { id: 'profile', icon: ClipboardList, label: 'Ficha Médica' }
];

// Tabs para Personal Clínico (Doctor y Enfermera/o)
export const clinicalStaffTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'careTeam', icon: Users, label: 'Equipo de Cuidados' },
  { id: 'search', icon: Search, label: 'Búsqueda' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];

// Tabs para Doctor (DEPRECADO - usar clinicalStaffTabs)
export const doctorTabs: NavTab[] = clinicalStaffTabs;

// Tabs para Enfermera/o (DEPRECADO - usar clinicalStaffTabs)
export const nurseTabs: NavTab[] = clinicalStaffTabs;

// Tabs para Guardian/Tutor
export const guardianTabs: NavTab[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'appointments', icon: Calendar, label: 'Citas' },
  { id: 'documents', icon: FolderOpen, label: 'Documentos' },
  { id: 'profile', icon: Settings, label: 'Perfil' }
];
