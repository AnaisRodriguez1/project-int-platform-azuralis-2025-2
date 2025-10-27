import type { UserRole } from "../../types/medical";

/**
 * Devuelve el nombre de la pantalla del dashboard correspondiente al rol.
 * 
 * En mobile, las rutas no son paths, sino nombres de screen registrados en React Navigation.
 */
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case "doctor":
      return "DashboardDoctor";
    case "patient":
      return "DashboardPatient";
    case "guardian":
      return "DashboardGuardian";
    case "nurse":
      return "DashboardNurse";
    default:
      return "HomePage";
  }
};
