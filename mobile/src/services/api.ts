import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../common/config/api.config";
import type { Patient, PatientNote, PatientDocument, CareTeamMember, UserRole, User} from "../types/medical";

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
});

// Interceptor corregido (no async)
api.interceptors.request.use(
  (config) => {
    // Retorna config sincrónicamente, pero intentamos obtener token antes
    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    });
    return config;
  },
  (error) => Promise.reject(error)
);


// ==================== Tipos de Auth ====================

export interface LoginResponse {
  access_token: string;
  role: UserRole;
}

export interface RegisterResponse {
  message: string;
  email: string;
  role: UserRole;
  id: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  rut: string;
  role: UserRole;
}

// ==================== API SERVICE ====================

export const apiService = {
  // ---------- AUTH ----------
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>("/auth/register", userData);
    return data;
  },

  getProfile: async (userId: string): Promise<User> => {
    const { data } = await api.get<User>(`/auth/profile/${userId}`);
    return data;
  },

  checkAuthStatus: async (token?: string): Promise<User> => {
    const { data } = await api.get<User>("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data;
  },

  // ---------- USERS ----------
  users: {
    update: async (userId: string, userData: Partial<User>): Promise<User> => {
      const { data } = await api.put<User>(`/users/${userId}`, userData);
      return data;
    },

    addSearchHistory: async (
      userId: string,
      patientId: string,
      patientRut: string
    ): Promise<any> => {
      const { data } = await api.post(`/users/${userId}/search-history`, {
        patientId,
        patientRut,
      });
      return data;
    },
  },

  // ---------- PATIENTS ----------
  patients: {
    create: async (patientData: Partial<Patient>): Promise<Patient> => {
      const { data } = await api.post<Patient>("/patients", patientData);
      return data;
    },

    getAll: async (): Promise<Patient[]> => {
      const { data } = await api.get<Patient[]>("/patients");
      return data;
    },

    getMyCareTeam: async (): Promise<Patient[]> => {
      const { data } = await api.get<Patient[]>("/patients/my-care-team/patients");
      return data;
    },

    findByRut: async (rut: string): Promise<Patient> => {
      const { data } = await api.get<Patient>(`/patients/search/by-rut/${rut}`);
      return data;
    },

    getOne: async (id: string): Promise<Patient> => {
      const { data } = await api.get<Patient>(`/patients/${id}`);
      return data;
    },

    update: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
      const { data } = await api.put<Patient>(`/patients/${id}`, patientData);
      return data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patients/${id}`);
    },

    getNotes: async (patientId: string): Promise<PatientNote[]> => {
      const { data } = await api.get<PatientNote[]>(`/patients/${patientId}/notes`);
      return data;
    },

    getDocuments: async (patientId: string): Promise<PatientDocument[]> => {
      const { data } = await api.get<PatientDocument[]>(`/patients/${patientId}/documents`);
      return data;
    },

    getQRCode: (id: string): string => {
      return `${API_CONFIG.BASE_URL}/patients/${id}/qr`;
    },

    getName: async (id: string): Promise<string> => {
      const { data } = await api.get<{ name: string }>(`/patients/${id}/name`);
      return data.name;
    },
  },

  // ---------- NOTES ----------
  notes: {
    create: async (noteData: Partial<PatientNote>): Promise<PatientNote> => {
      const { data } = await api.post<PatientNote>("/patient-notes", noteData);
      return data;
    },

    getAll: async (): Promise<PatientNote[]> => {
      const { data } = await api.get<PatientNote[]>("/patient-notes");
      return data;
    },

    getOne: async (id: string): Promise<PatientNote> => {
      const { data } = await api.get<PatientNote>(`/patient-notes/${id}`);
      return data;
    },

    update: async (id: string, noteData: Partial<PatientNote>): Promise<PatientNote> => {
      const { data } = await api.put<PatientNote>(`/patient-notes/${id}`, noteData);
      return data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patient-notes/${id}`);
    },
  },

  // ---------- DOCUMENTS ----------
  documents: {
    create: async (docData: Partial<PatientDocument>, file?: File): Promise<PatientDocument> => {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      }

      Object.entries(docData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const { data } = await api.post<PatientDocument>("/patient-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },

    getAll: async (): Promise<PatientDocument[]> => {
      const { data } = await api.get<PatientDocument[]>("/patient-documents");
      return data;
    },

    getOne: async (id: string): Promise<PatientDocument> => {
      const { data } = await api.get<PatientDocument>(`/patient-documents/${id}`);
      return data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/patient-documents/${id}`);
    },

    getDownloadUrl:  async (
      id: string
    ): Promise<{ id: string; fileName: string; url: string; expiresIn: number; expiresAt: string }> => {
      const { data } = await api.get<{ id: string; fileName: string; url: string; expiresIn: number; expiresAt: string }>(
        `/patient-documents/${id}/download-url`
      );
      return data;
    },
  },

  // ---------- CARE TEAM ----------
  careTeam: {
    addMember: async (memberData: Partial<CareTeamMember>): Promise<CareTeamMember> => {
      const { data } = await api.post<CareTeamMember>("/care-team", memberData);
      return data;
    },

    getAll: async (): Promise<CareTeamMember[]> => {
      const { data } = await api.get<CareTeamMember[]>("/care-team");
      return data;
    },

    getByPatient: async (patientId: string): Promise<CareTeamMember[]> => {
      const { data } = await api.get<CareTeamMember[]>(`/care-team/by-patient/${patientId}`);
      return data;
    },

    addToPatient: async (
      patientId: string,
      userId: string,
      name: string,
      role: string
    ): Promise<CareTeamMember> => {
      const { data } = await api.post<CareTeamMember>(
        `/care-team/patient/${patientId}/member`,
        { userId, name, role }
      );
      return data;
    },

    removeFromPatient: async (patientId: string, userId: string): Promise<void> => {
      await api.delete(`/care-team/patient/${patientId}/member/${userId}`);
    },

    update: async (id: string, memberData: Partial<CareTeamMember>): Promise<CareTeamMember> => {
      const { data } = await api.put<CareTeamMember>(`/care-team/${id}`, memberData);
      return data;
    },

    remove: async (id: string): Promise<void> => {
      await api.delete(`/care-team/${id}`);
    },
  },
};
