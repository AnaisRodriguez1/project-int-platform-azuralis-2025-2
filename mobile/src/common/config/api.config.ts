
import Constants from "expo-constants";

// 🔹 Detectamos el entorno automáticamente
const ENV = Constants?.manifest?.extra?.env || "development";

// 🔹 Dirección IP del servidor local (ajusta según tu PC)
const LOCAL_HOST = "http://192.168.1.86:3000"; // ⬅️ cambia por tu IP real de red local

export const API_CONFIG = {
  // En Expo, no puedes usar "localhost" porque corre en otro dispositivo
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    (ENV === "development" ? LOCAL_HOST : "https://tu-servidor-produccion.com"),

  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
};

// 🔹 Endpoints iguales a los del web (pueden reutilizarse)
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
};
