import { apiService } from "@/services/api";
import { mockApiService } from "@/services/mockApi";
import type { User } from "@/types/medical";
import { createContext, useContext, useEffect, useState } from "react";

// Toggle para usar API real o mock
const USE_MOCK_API = true; // Cambia a false cuando el backend esté listo
const authApi = USE_MOCK_API ? mockApiService : apiService;

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email:string, password: string) => Promise<User>;
    logout: () => void;
    register: (userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({children}: {children:React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkAuthStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("token")
            if (token) {
                const userData = await authApi.checkAuthStatus(token)
                setUser(userData)
            }
        } catch (error) {
        // Token inválido, limpiar
        localStorage.removeItem("token")
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {

        try {
            const data = await authApi.login(email, password)
            //Guardamos el token
            localStorage.setItem("token", data.token)
            //Obtener los datos completos del usuario
            const userData = data.user || await authApi.checkAuthStatus(data.token)
            setUser(userData)
            //Guardar usuario en localStorage para acceso inmediato
            localStorage.setItem("user", JSON.stringify(userData))
            return userData
        } catch (error) {
            throw error
        }
    }


    const register = async (userData: any) => {
        try {
            //Preparación del registroData acordado para el el CreateUserDto
            const registrationData = {
                email: userData.email,
                password: userData,
                name: userData.name,
                role: userData.role
            }

            const registrationResponse = await authApi.register(registrationData)

            //Hace login automático después del registro
            await login(userData.email, userData.password)

            //Retona la respuesta del registro para procesos adicionales
            return registrationResponse;
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

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
    )
}

function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvide (Mensaje de src/context/AuthContext)")
    }
    return context
}

export { AuthContext, AuthProvider, useAuth}