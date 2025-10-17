import axios from "axios"
import { API_CONFIG } from "../common/config/api.config"
import type { 
  Patient, 
  PatientNote, 
  PatientDocument, 
  CareTeamMember,
  UserRole 
} from "../types/medical"

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
})

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types para las respuestas de autenticación
export interface LoginResponse {
  access_token: string
  role: UserRole
}

export interface RegisterResponse {
  message: string
  email: string
  role: UserRole
  id: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  rut: string
  role: UserRole
}

export const apiService = {
  // ==================== AUTH ====================
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/login", { email, password })
    return data
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const { data } = await api.post("/auth/register", userData)
    return data
  },

  getProfile: async (userId: string) => {
    const { data } = await api.get(`/auth/profile/${userId}`)
    return data
  },

  checkAuthStatus: async () => {
    // Este método necesita un endpoint en el backend
    const { data } = await api.get("/auth/me")
    return data
  },

  // ==================== PATIENTS ====================
  patients: {
    create: async (patientData: Partial<Patient>): Promise<Patient> => {
      const { data } = await api.post("/patients", patientData)
      return data
    },

    getAll: async (): Promise<Patient[]> => {
      const { data } = await api.get("/patients")
      return data
    },

    getOne: async (id: string): Promise<Patient> => {
      const { data } = await api.get(`/patients/${id}`)
      return data
    },

    update: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
      const { data } = await api.put(`/patients/${id}`, patientData)
      return data
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patients/${id}`)
    },

    getQRCode: (id: string): string => {
      return `${API_CONFIG.BASE_URL}/patients/${id}/qr`
    },
  },

  // ==================== PATIENT NOTES ====================
  notes: {
    create: async (noteData: Partial<PatientNote>): Promise<PatientNote> => {
      const { data } = await api.post("/patient-notes", noteData)
      return data
    },

    getAll: async (): Promise<PatientNote[]> => {
      const { data } = await api.get("/patient-notes")
      return data
    },

    getOne: async (id: string): Promise<PatientNote> => {
      const { data } = await api.get(`/patient-notes/${id}`)
      return data
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patient-notes/${id}`)
    },
  },

  // ==================== PATIENT DOCUMENTS ====================
  documents: {
    create: async (docData: Partial<PatientDocument>): Promise<PatientDocument> => {
      const { data } = await api.post("/patient-documents", docData)
      return data
    },

    getAll: async (): Promise<PatientDocument[]> => {
      const { data } = await api.get("/patient-documents")
      return data
    },

    getOne: async (id: string): Promise<PatientDocument> => {
      const { data } = await api.get(`/patient-documents/${id}`)
      return data
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patient-documents/${id}`)
    },
  },

  // ==================== CARE TEAM ====================
  careTeam: {
    addMember: async (memberData: Partial<CareTeamMember>): Promise<CareTeamMember> => {
      const { data } = await api.post("/care-team", memberData)
      return data
    },

    getAll: async (): Promise<CareTeamMember[]> => {
      const { data } = await api.get("/care-team")
      return data
    },

    getByPatient: async (patientId: string): Promise<CareTeamMember[]> => {
      const { data } = await api.get(`/care-team/by-patient/${patientId}`)
      return data
    },

    update: async (id: string, memberData: Partial<CareTeamMember>): Promise<CareTeamMember> => {
      const { data } = await api.put(`/care-team/${id}`, memberData)
      return data
    },

    remove: async (id: string): Promise<void> => {
      await api.delete(`/care-team/${id}`)
    },
  },
}