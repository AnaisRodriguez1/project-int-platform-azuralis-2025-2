import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CancerRibbon } from "../components/CancerRibbon";
import LogoUniversidad from "../assets/icons/logo_ucn.svg?react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { getDashboardRoute } from "@/common/helpers/GetDashboardRoute";
import { getLoginCredentials } from "@/services/mockApi";

export function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor ingresa tu correo y contraseña');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const user = await login(email, password);
            // Redirigir al dashboard correspondiente según el role del usuario
            const dashboardRoute = getDashboardRoute(user.role);
            navigate(dashboardRoute);
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* HEADER */}
                <div className="text-center space-y-4">
                    {/* LOGOS */}
                    <div className="flex items-center justify-center space-x-3">
                        <CancerRibbon className="text-[#ff6299]" size="lg" />
                        <LogoUniversidad className="w-8 h-8 " />
                    </div>
                    {/* SUBTITULO */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900 text-center">
                        Ficha Médica Portátil
                        </h1>
                        <p className="text-sm text-gray-600 text-center">
                            Universidad Católica del Norte
                        </p>
                    </div>
                </div>
                {/* LOGIN FORM */}
                <Card>
                    <CardHeader className="flex items-center justify-center">
                        <CardTitle>Iniciar Sesión</CardTitle>
                        <CardDescription>Accede a tu información médica de forma segura.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/*Correo Electrónico*/}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@ucn.cl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {/*Contraseña*/}
                        <div className="space-y-2 pt-4">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {/*Mensaje de error*/}
                        {error && (
                            <div className="text-red-600 text-sm pt-2 text-center">
                                {error}
                            </div>
                        )}
                        {/*Botón para iniciar sesión*/}
                        <div className="space-y-2 pt-4">
                            <Button
                                onClick={handleLogin}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full bg-[#fa8fb5] hover:bg-[#dd6d94]"
                            >
                                {isLoading
                                    ? "Iniciando sesión..."
                                    : "Iniciar Sesión"}
                            </Button>
                        </div>
                        {/* Enlace a registro */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-600">
                                ¿No tienes cuenta?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="text-[#fa8fb5] hover:text-[#dd6d94] font-medium hover:underline transition-colors"
                                >
                                    Regístrate aquí
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Usuarios de prueba */}
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription>
                        <p className="font-semibold text-blue-900 mb-2">👥 Usuarios de prueba:</p>
                        <div className="space-y-1 text-xs text-blue-800">
                            {getLoginCredentials().map((cred) => (
                                <div key={cred.email} className="flex justify-between">
                                    <span className="font-medium">{cred.role}:</span>
                                    <span>{cred.email}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-blue-700 italic">
                            💡 Contraseña: {getLoginCredentials()[0]?.password}
                        </p>
                    </AlertDescription>
                </Alert>

                {/* Footer*/}
                <div className="text-center text-sm text-gray-500">
                    <p>
                        Sistema desarrollado para mejorar la atención oncológica.
                    </p>
                    <p className="mt-1">
                        © 2025 Azuralis
                    </p>
                </div>
            </div>
        </div>
    );
};