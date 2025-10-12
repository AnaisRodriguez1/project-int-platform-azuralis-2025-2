import axios from "axios"

const API_BASE_URL = import.meta.env.DEV 
  ? "http://localhost:8080/api" 
  : "https://backend-project-int-platform-azualis.up.railway.app/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password })
    return data
  },

  register: async (userData: any) => {
    const { data } = await api.post("/auth/register", userData)
    return data
  },

    checkAuthStatus: async (token: string) => {
    const { data } = await api.get("/auth/check-status", {
        headers: { Authorization: `Bearer ${token}` }, // Esto es redundante
    })
    return data
    },
}