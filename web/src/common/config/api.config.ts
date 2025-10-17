/**
 * API Configuration
 * 
 * Configuración centralizada para las URLs de la API.
 * En desarrollo: usa localhost:3000
 * En producción: debes cambiar esta URL a tu servidor de Azure
 */

export const API_CONFIG = {
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV 
      ? "http://localhost:3000" 
      : "http://localhost:3000"), // TODO: Cambiar a URL de producción
  
  // Timeout para las peticiones (en ms)
  TIMEOUT: 30000,
  
  // Si se deben enviar credenciales (cookies)
  WITH_CREDENTIALS: true,
}

// Endpoints específicos
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    CHECK_STATUS: "/auth/check-status",
  },
  PATIENTS: {
    BASE: "/patients",
    BY_ID: (id: string) => `/patients/${id}`,
    QR: (id: string) => `/patients/${id}/qr`,
  },
  NOTES: {
    BASE: "/patient-notes",
    BY_ID: (id: string) => `/patient-notes/${id}`,
  },
  DOCUMENTS: {
    BASE: "/patient-documents",
    BY_ID: (id: string) => `/patient-documents/${id}`,
  },
  CARE_TEAM: {
    BASE: "/care-team",
    BY_ID: (id: string) => `/care-team/${id}`,
    BY_PATIENT: (patientId: string) => `/care-team/by-patient/${patientId}`,
  },
}
