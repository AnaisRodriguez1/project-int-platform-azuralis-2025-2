import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, Phone, User } from 'lucide-react';
import { cancerColors, type CancerType } from '@/types/medical';

interface CompleteProfileFormProps {
  onComplete: () => void;
}

export function CompleteProfileForm({ onComplete }: CompleteProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Datos del formulario
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    diagnosis: '',
    stage: '',
    cancerType: '' as CancerType,
    allergies: '',
    currentMedications: '',
    treatmentSummary: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Preparar arrays de alergias y medicamentos
      const allergiesArray = formData.allergies 
        ? formData.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
        : [];
      
      const medicationsArray = formData.currentMedications 
        ? formData.currentMedications.split(',').map(m => m.trim()).filter(m => m.length > 0)
        : [];

      // Crear el paciente con los datos del formulario
      const patientData = {
        name: user?.name || '',
        rut: user?.rut || '',
        dateOfBirth: formData.dateOfBirth,
        diagnosis: formData.diagnosis,
        stage: formData.stage,
        cancerType: formData.cancerType,
        allergies: allergiesArray,
        currentMedications: medicationsArray,
        treatmentSummary: formData.treatmentSummary,
      };

      await apiService.patients.create(patientData);
      
      // Llamar onComplete para recargar los datos
      onComplete();
    } catch (err: any) {
      console.error('Error al crear perfil:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Input
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleInputChange('diagnosis', e.target.value)}
          placeholder="Ej: Cáncer de Mama"
          required
        />
      </div>

      <div>
        <Label htmlFor="stage">Etapa/Estadio *</Label>
        <Input
          id="stage"
          value={formData.stage}
          onChange={(e) => handleInputChange('stage', e.target.value)}
          placeholder="Ej: Etapa II"
          required
        />
      </div>

      <div>
        <Label htmlFor="cancerType">Tipo de Cáncer *</Label>
        <Select
          value={formData.cancerType}
          onValueChange={(value) => handleInputChange('cancerType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de cáncer" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(cancerColors).map(([type, config]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{config.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        onClick={() => setStep(2)}
        className="w-full"
        disabled={!formData.dateOfBirth || !formData.diagnosis || !formData.stage || !formData.cancerType}
      >
        Siguiente
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="allergies">Alergias</Label>
        <Input
          id="allergies"
          value={formData.allergies}
          onChange={(e) => handleInputChange('allergies', e.target.value)}
          placeholder="Ej: Penicilina, Ibuprofeno (separadas por comas)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separa múltiples alergias con comas
        </p>
      </div>

      <div>
        <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
        <Textarea
          id="currentMedications"
          value={formData.currentMedications}
          onChange={(e) => handleInputChange('currentMedications', e.target.value)}
          placeholder="Ej: Tamoxifeno 20mg - cada 12 horas, Paracetamol 500mg - según necesidad"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Separa múltiples medicamentos con comas
        </p>
      </div>

      <div>
        <Label htmlFor="treatmentSummary">Resumen de Tratamiento</Label>
        <Textarea
          id="treatmentSummary"
          value={formData.treatmentSummary}
          onChange={(e) => handleInputChange('treatmentSummary', e.target.value)}
          placeholder="Describe brevemente tu tratamiento actual..."
          rows={4}
        />
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="w-1/2"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={() => setStep(3)}
          className="w-1/2"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          <strong>Contacto de Emergencia</strong> - Opcional pero recomendado
        </p>
      </div>

      <div>
        <Label htmlFor="emergencyContactName">Nombre del Contacto</Label>
        <Input
          id="emergencyContactName"
          value={formData.emergencyContactName}
          onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
          placeholder="Ej: María García"
        />
      </div>

      <div>
        <Label htmlFor="emergencyContactRelationship">Relación</Label>
        <Input
          id="emergencyContactRelationship"
          value={formData.emergencyContactRelationship}
          onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
          placeholder="Ej: Hermana, Esposo/a, Hijo/a"
        />
      </div>

      <div>
        <Label htmlFor="emergencyContactPhone">Teléfono</Label>
        <Input
          id="emergencyContactPhone"
          type="tel"
          value={formData.emergencyContactPhone}
          onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
          placeholder="Ej: +56 9 1234 5678"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(2)}
          className="w-1/3"
          disabled={loading}
        >
          Atrás
        </Button>
        <Button
          type="submit"
          className="w-2/3"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Completar Perfil'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-purple-600" />
            <span>Completa tu Perfil Médico</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Para poder usar todas las funcionalidades de la aplicación, necesitamos algunos datos sobre tu condición médica.
          </p>
          
          {/* Indicador de pasos */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepNumber
                      ? 'bg-purple-600 text-white'
                      : step > stepNumber
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <p className="text-sm font-medium text-gray-700">
              {step === 1 && 'Paso 1: Información Básica'}
              {step === 2 && 'Paso 2: Tratamiento y Medicación'}
              {step === 3 && 'Paso 3: Contacto de Emergencia'}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <AlertCircle className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-sm mb-1">Información Segura</h3>
            <p className="text-xs text-gray-600">
              Tus datos están protegidos y solo son accesibles por tu equipo médico
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-sm mb-1">Editable</h3>
            <p className="text-xs text-gray-600">
              Podrás editar esta información en cualquier momento desde tu perfil
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <Phone className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-sm mb-1">QR Automático</h3>
            <p className="text-xs text-gray-600">
              Se generará tu código QR único para acceso rápido de emergencias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
