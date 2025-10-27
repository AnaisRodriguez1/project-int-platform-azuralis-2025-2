/**
 * Configuración de tabs de navegación (versión mobile)
 * 
 * Usa lucide-react-native en lugar de lucide-react.
 * Cada tab incluye id, ícono y label.
 */

import {
  Home, StickyNote, FolderOpen, Settings, Users, Calendar, Search, ClipboardList,} from "lucide-react-native";

export interface NavTab {
  id: string;
  icon: any;
  label: string;
}

// 🔹 Tabs para Paciente
export const patientTabs: NavTab[] = [
  { id: "home", icon: Home, label: "Inicio" },
  { id: "notes", icon: StickyNote, label: "Notas" },
  { id: "documents", icon: FolderOpen, label: "Documentos" },
  { id: "profile", icon: ClipboardList, label: "Ficha Médica" },
];

// 🔹 Tabs para Personal Clínico (Doctor / Enfermera/o)
export const clinicalStaffTabs: NavTab[] = [
  { id: "home", icon: Home, label: "Inicio" },
  { id: "careTeam", icon: Users, label: "Equipo" },
  { id: "search", icon: Search, label: "Buscar" },
  { id: "profile", icon: Settings, label: "Perfil" },
];

// 🔹 Tabs para Doctor / Enfermera (alias de clinicalStaffTabs)
export const doctorTabs = clinicalStaffTabs;
export const nurseTabs = clinicalStaffTabs;

// 🔹 Tabs para Guardian / Tutor
export const guardianTabs: NavTab[] = [
  { id: "home", icon: Home, label: "Inicio" },
  { id: "appointments", icon: Calendar, label: "Citas" },
  { id: "documents", icon: FolderOpen, label: "Documentos" },
  { id: "profile", icon: Settings, label: "Perfil" },
];
