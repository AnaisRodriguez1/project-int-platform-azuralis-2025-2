// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL del backend
// Usa tu URL de Railway o el entorno local según corresponda
const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api' // desarrollo local
  : 'https://backend-project-int-platform-azualis.up.railway.app/api'; // producción

// Crear instancia Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor: agrega automáticamente el token en cada request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service principal (equivalente al de la web)
export const apiService = {
  //  Login (autenticación real)
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Guarda token en almacenamiento local
    await AsyncStorage.setItem('token', data.token);
    return data;
  },

  // Registro de usuario (paciente, doctor, etc.)
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  //  Verifica el estado de sesión con el backend
  checkAuthStatus: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No hay token guardado');

    const { data } = await api.get('/auth/check-status', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  },

  // Logout (elimina token)
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};
