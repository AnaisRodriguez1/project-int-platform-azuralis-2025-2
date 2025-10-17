import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

interface CompleteNurseProfileProps {
  onComplete: () => void;
}

export const CompleteNurseProfile = ({ onComplete }: CompleteNurseProfileProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    department: '',
    license: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department.trim() || !formData.license.trim()) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar perfil del usuario con los datos de enfermera
      await apiService.users.update(user.id, {
        department: formData.department.trim(),
        license: formData.license.trim(),
      });

      // Notificar éxito
      onComplete();
    } catch (err: any) {
      console.error('Error al completar perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Completa tu Perfil de Enfermera
          </CardTitle>
          <CardDescription className="text-center">
            Por favor, proporciona la siguiente información profesional para activar tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="department">
                  Departamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Ej: Oncología, Cuidados Intensivos, Pediatría"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="license">
                  Número de Licencia Profesional <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="license"
                  type="text"
                  placeholder="Ej: RN-12345"
                  value={formData.license}
                  onChange={(e) => handleChange('license', e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Completar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
