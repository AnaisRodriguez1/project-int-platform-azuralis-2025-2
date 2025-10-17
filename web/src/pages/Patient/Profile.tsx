import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { usePatientData } from "@/hooks/usePatientData";
import { apiService } from '@/services/api';
import { cancerColors } from '@/types/medical';
import type { Patient } from '@/types/medical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Palette, Lock, LogOut, Edit3, Save, AlertCircle, Phone, Pill, Scissors } from 'lucide-react';

export function ProfilePatient() {
  const { user, logout } = useAuth();
  const { patientId, cancerColor } = usePatientData();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [patient, setPatient] = useState<Patient | null>(null);

  // Obtener datos completos del paciente
  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        try {
          const allPatients = await apiService.patients.getAll();
          const foundPatient = allPatients.find(p => p.id === patientId);
          setPatient(foundPatient || null);
        } catch (error) {
          console.error('Error loading patient:', error);
        }
      }
    };
    loadPatient();
  }, [patientId]);

  const handleSaveProfile = () => {
    // En producción aquí se llamaría a updatePatient del mockApi
    console.log('Guardando perfil:', { name: editedName, email: editedEmail });
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
    }
  };

  if (!patient) {
    return (
      <div className="mt-8">
        <p className="text-gray-500 text-center">No se pudo cargar la información del paciente</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mi Perfil</h2>
        <p className="text-gray-600">Configuración y datos personales</p>
      </div>

      {/* Datos Personales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" style={{ color: cancerColor.color }} />
              <span>Datos Personales</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfile(true);
                }
              }}
            >
              {isEditingProfile ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={patient.photo} alt={patient.name} />
              <AvatarFallback className="text-lg" style={{ backgroundColor: cancerColor.color + '40' }}>
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Nombre completo</Label>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Edad</Label>
                    <p className="font-medium">{patient.age} años</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">RUT</Label>
                    <p className="font-medium">{patient.rut}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Correo electrónico</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Médica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Información Médica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600">Diagnóstico</Label>
            <p className="font-medium">{patient.diagnosis}</p>
            <Badge className="mt-1" style={{ backgroundColor: cancerColor.color }}>
              Estadio {patient.stage}
            </Badge>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Tipo de cáncer</Label>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: cancerColor.color }}
              />
              <span className="font-medium">{cancerColor.name}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Médico tratante</Label>
            <p className="font-medium">{patient.careTeam?.[0]?.name || 'No asignado'}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Resumen de tratamiento</Label>
            <p className="text-sm text-gray-700">{patient.treatmentSummary}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">ID de ficha médica</Label>
            <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
              {patient.qrCode}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alergias */}
      {patient.allergies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Alergias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive">
                  {allergy}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicamentos Actuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Medicamentos Actuales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.currentMedications.length > 0 ? (
            <ul className="space-y-2">
              {patient.currentMedications.map((medication, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: cancerColor.color }}
                  />
                  <span className="text-sm text-gray-700">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Sin medicamentos registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Operaciones */}
      {patient.operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scissors className="w-5 h-5" style={{ color: cancerColor.color }} />
              <span>Historial de Cirugías</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patient.operations.map((operation, index) => (
                <div key={index} className="border-l-4 pl-4" style={{ borderColor: cancerColor.color }}>
                  <p className="font-medium">{operation.procedure}</p>
                  <p className="text-sm text-gray-600">{operation.hospital}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(operation.date).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contactos de Emergencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Contactos de Emergencia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.emergencyContacts.length > 0 ? (
            <div className="space-y-4">
              {patient.emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <a href={`tel:${contact.phone}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin contactos de emergencia registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Personalización de Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Personalización</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Color de la aplicación basado en tu tipo de cáncer
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.entries(cancerColors).map(([type, config]) => (
              <div
                key={type}
                className={`flex flex-col items-center p-3 rounded-lg border-2 ${
                  patient.cancerType === type 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mb-2 shadow-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-center leading-tight">
                  {config.name}
                </span>
                {patient.cancerType === type && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: cancerColor.color + '20' }}>
            <p className="text-sm" style={{ color: cancerColor.color }}>
              <strong>Color actual:</strong> {cancerColor.name} - 
              Este color se aplica a los elementos destacados de tu aplicación.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Seguridad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Contraseña</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm">••••••••</p>
                <Button variant="outline" size="sm">
                  Cambiar contraseña
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
