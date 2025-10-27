import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, Award } from 'lucide-react';

interface CompleteDoctorProfileProps {
  onComplete: () => void;
}

export function CompleteDoctorProfile({ onComplete }: CompleteDoctorProfileProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    specialization: '',
    license: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Actualizar el usuario con los datos adicionales
      await apiService.users.update(user!.id, {
        specialization: formData.specialization,
        license: formData.license,
      });
      
      onComplete();
    } catch (err: any) {
      console.error('Error al completar perfil:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <span>Completa tu Perfil Profesional</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Para completar tu registro como médico, necesitamos algunos datos profesionales.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="specialization">Especialización *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Ej: Oncología, Cirugía Oncológica"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tu área de especialización médica
              </p>
            </div>

            <div>
              <Label htmlFor="license">Número de Licencia Médica *</Label>
              <Input
                id="license"
                value={formData.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
                placeholder="Ej: MED-12345"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tu número de registro médico profesional
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.specialization || !formData.license}
            >
              {loading ? 'Guardando...' : 'Completar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <Award className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-medium text-sm mb-1">Información Profesional</h3>
          <p className="text-xs text-gray-600">
            Estos datos serán visibles para los pacientes y te identificarán como médico certificado en la plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
