

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CancerRibbon } from "@/components/CancerRibbon";
import LogoUniversidad from "@/assets/icons/logo_ucn.svg?react";
import {
  validateRegistrationForm,
  formatRUT,
  ERROR_MESSAGES
} from "@/common/helpers/ValidateForm";
import type {
  FieldErrors
} from "@/common/helpers/ValidateForm";
import type { RegisterFormData, UserRole } from "@/types/medical";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    rut:"",
    password: "",
    confirmPassword: "",
    role: "patient"
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    // Format RUT automatically as user types
    const processedValue = field === 'rut' ? formatRUT(value) : value;
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { isValid, errors } = validateRegistrationForm(formData);
    
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement API call for registration
      // await registerUser(formData);
      console.log("Registration data:", formData);
      
      // On success, navigate to login
      // navigate('/login');
    } catch (error) {
      setFieldErrors({ general: ERROR_MESSAGES.REGISTRATION_ERROR });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-4">
          {/* LOGOS */}
          <div className="flex items-center justify-center space-x-3">
            <CancerRibbon className="text-[#ff6299]" size="lg" />
            <LogoUniversidad className="w-8 h-8" />
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

        {/* REGISTER FORM */}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Únete a nuestra plataforma médica.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ingresa tu nombre"
                className={fieldErrors.name ? "border-red-500" : ""}
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* RUT Field */}
            <div>
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                type="text"
                value={formData.rut}
                onChange={(e) => handleInputChange("rut", e.target.value)}
                placeholder="12345678-9"
                maxLength={10}
                className={fieldErrors.rut ? "border-red-500" : ""}
              />
              {fieldErrors.rut && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.rut}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="ejemplo@correo.com"
                className={fieldErrors.email ? "border-red-500" : ""}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <Label htmlFor="role">Tipo de usuario</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value as UserRole)}
                className={`w-full px-3 py-2 border rounded-md ${
                  fieldErrors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Enfermera/o</option>
                <option value="guardian">Cuidador/a</option>
              </select>
              {fieldErrors.role && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={fieldErrors.password ? "border-red-500" : ""}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Repite tu contraseña"
                className={fieldErrors.confirmPassword ? "border-red-500" : ""}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* General Error */}
            {fieldErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{fieldErrors.general}</p>
              </div>
            )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outline"
                className="w-full bg-[#fa8fb5] hover:bg-[#dd6d94]"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-[#fa8fb5] hover:text-[#dd6d94] font-medium hover:underline transition-colors"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
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
}