// src/services/mockApi.ts
import type { User } from '../types/medical';

//  Usuarios de prueba
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Juan Pérez',
    email: 'doctor@ucn.cl',
    role: 'doctor',
  },
  {
    id: '2',
    name: 'María González',
    email: 'paciente@ucn.cl',
    role: 'patient',
    patientId: 'p001',
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'guardian@ucn.cl',
    role: 'guardian',
    patientIds: ['p001'],
  },
  {
    id: '4',
    name: 'Ana Silva',
    email: 'enfermera@ucn.cl',
    role: 'nurse',
  },
];

// Simula latencia de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  // LOGIN SIMULADO
  login: async (email: string, _password: string) => {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email === email);

    if (!user) {
      throw new Error('Usuario no encontrado. Usa uno de los correos de prueba.');
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    return { token, user };
  },

  //  CHECK AUTH
  checkAuthStatus: async (token: string) => {
    await delay(300);
    const userId = token.split('-')[2];
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw new Error('Token inválido');
    return user;
  },

  // REGISTRO
  register: async (userData: any) => {
    await delay(800);
    const newUser: User = {
      id: `${MOCK_USERS.length + 1}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      ...(userData.role === 'patient' && { patientId: `p00${MOCK_USERS.length + 1}` }),
    };

    MOCK_USERS.push(newUser);
    return { message: 'Usuario registrado exitosamente', user: newUser };
  },
};

// Devuelve los usuarios mock para mostrar en la UI
export const getMockUsers = () => MOCK_USERS;
