import { useState } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, UserSearch, AlertCircle } from 'lucide-react';
import type { Patient } from '@/types/medical';
import { validateRut as validateRutLibrary } from '@fdograph/rut-utilities';

interface SearchPatientByRutProps {
  onPatientFound: (patient: Patient) => void;
  onBack: () => void;
}

export function SearchPatientByRut({ onPatientFound, onBack }: SearchPatientByRutProps) {
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar RUT antes de buscar
    if (!rut.trim()) {
      setError('Por favor ingresa un RUT');
      return;
    }

    // Validar formato del RUT
    if (!validateRutLibrary(rut)) {
      setError('El RUT ingresado no es válido');
      return;
    }

    setLoading(true);

    try {
      // Buscar paciente por RUT usando el endpoint específico
      const patient = await apiService.patients.findByRut(rut);

      // Guardar en historial de búsquedas si es doctor o nurse
      if (user && (user.role === 'doctor' || user.role === 'nurse')) {
        try {
          await apiService.users.addSearchHistory(user.id, patient.id, patient.rut);
        } catch (err) {
          console.error('Error al guardar historial de búsqueda:', err);
          // No mostrar error al usuario, es un error secundario
        }
      }

      // Paciente encontrado - notificar al componente padre
      onPatientFound(patient);
    } catch (err: any) {
      console.error('Error al buscar paciente:', err);
      if (err.response?.status === 404) {
        setError('No se encontró ningún paciente con ese RUT');
      } else {
        setError(err.response?.data?.message || 'Error al buscar paciente. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Volver</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Buscar Paciente</h1>
        </div>

        {/* Tarjeta de búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserSearch className="w-6 h-6 text-blue-600" />
              <span>Buscar por RUT</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa el RUT del paciente para acceder a su ficha médica
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="rut">RUT del Paciente</Label>
                <div className="flex space-x-2">
                  <Input
                    id="rut"
                    type="text"
                    value={rut}
                    onChange={(e) => {
                      setRut(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="12345678-9 o 12.345.678-9"
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !rut.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Buscando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                      </div>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Puedes ingresar el RUT con o sin puntos
                </p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Acceso Rápido</h3>
                <p className="text-sm text-blue-800">
                  Una vez encontrado el paciente, podrás ver y editar su ficha médica completa,
                  agregar notas clínicas y subir documentos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
