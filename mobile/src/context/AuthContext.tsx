import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';
import type { User } from '../types/medical';


// Cambia este flag cuando el backend esté listo
const USE_MOCK_API = true;
const authApi = USE_MOCK_API ? mockApiService : apiService;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verifica si hay un usuario logueado al abrir la app
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData : any = await authApi.checkAuthStatus(token); // AGREGUE EL ANY AQUI
        setUser(userData);
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN
  const login  = async (email: string, password: string) => {
    try {
      const data : any = await authApi.login(email, password); // AQUI TAMBIEN AGREGUE EL ANY

      // Guardar token y usuario en AsyncStorage
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }
      const userData : any = data.user || (await authApi.checkAuthStatus(data.token));  // AGREGUE EL ANY AQUÍ
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      throw error;
    }
  };

  //  REGISTER
  const register = async (userData: any) => {
    try {
      const registrationData = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
      };

      const response = await authApi.register(registrationData);

      // Login automático post-registro
      await login(userData.email, userData.password);

      return response;
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
