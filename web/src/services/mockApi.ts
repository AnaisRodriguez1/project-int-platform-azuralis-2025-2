import type { User } from "@/types/medical";

// Usuarios de prueba para desarrollo
const MOCK_USERS: User[] = [
    {
        id: "1",
        name: "Dr. Juan Pérez",
        email: "doctor@ucn.cl",
        role: "doctor",
    },
    {
        id: "2",
        name: "María González",
        email: "paciente@ucn.cl",
        role: "patient",
        patientId: "p001",
    },
    {
        id: "3",
        name: "Carlos Rodríguez",
        email: "guardian@ucn.cl",
        role: "guardian",
    },
    {
        id: "4",
        name: "Ana Silva",
        email: "enfermera@ucn.cl",
        role: "nurse",
    },
];

// Simula un delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
    login: async (email: string, _password: string) => {
        await delay(800); // Simula latencia de red

        // Para desarrollo, cualquier contraseña funciona (por eso _password no se usa)
        const user = MOCK_USERS.find(u => u.email === email);
        
        if (!user) {
            throw new Error("Usuario no encontrado. Usa uno de los correos de prueba.");
        }

        // Simula un token JWT (en realidad es solo un string random)
        const token = `mock-token-${user.id}-${Date.now()}`;

        return {
            token,
            user,
        };
    },

    checkAuthStatus: async (token: string) => {
        await delay(300);

        // Extraer el ID del usuario del token mock
        const userId = token.split('-')[2];
        const user = MOCK_USERS.find(u => u.id === userId);

        if (!user) {
            throw new Error("Token inválido");
        }

        return user;
    },

    register: async (userData: any) => {
        await delay(800);

        // Simula registro exitoso
        const newUser: User = {
            id: `${MOCK_USERS.length + 1}`,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            ...(userData.role === 'patient' && { patientId: `p00${MOCK_USERS.length + 1}` }),
        };

        MOCK_USERS.push(newUser);

        return {
            message: "Usuario registrado exitosamente",
            user: newUser,
        };
    },
};

// Exporta los usuarios para mostrarlos en la UI
export const getMockUsers = () => MOCK_USERS;
