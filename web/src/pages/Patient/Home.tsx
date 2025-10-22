import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Share2, User, StickyNote, FolderOpen, ClipboardList } from 'lucide-react';
import { apiService } from '@/services/api';
import { cancerColors } from '@/types/medical';
import type { Patient } from '@/types/medical';
import { useState, useEffect } from 'react';
import { CompleteProfileForm } from '@/components/CompleteProfileForm';

interface HomePatientProps {
  onTabChange?: (tab: string) => void;
}

export function HomePatient({ onTabChange }: HomePatientProps) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Buscar el paciente por RUT (ya que el usuario tiene el mismo RUT que el paciente)
  useEffect(() => {
    const fetchPatient = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Obtener todos los pacientes y buscar el que coincida con el RUT del usuario
        const patients = await apiService.patients.getAll();
        const foundPatient = patients.find(p => p.rut === user.rut);
        
        if (foundPatient) {
          setPatient(foundPatient);
          setQrImageUrl(apiService.patients.getQRCode(foundPatient.id));
        }
      } catch (error) {
        console.error('Error al obtener paciente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [user]);

  // Función para recargar datos después de completar el perfil
  const handleProfileComplete = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const patients = await apiService.patients.getAll();
      const foundPatient = patients.find(p => p.rut === user.rut);
      
      if (foundPatient) {
        setPatient(foundPatient);
        setQrImageUrl(apiService.patients.getQRCode(foundPatient.id));
      }
    } catch (error) {
      console.error('Error al recargar paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener color del tipo de cáncer (usar selectedColor si existe)
  const cancerColor = patient 
    ? cancerColors[patient.selectedColor || patient.cancerType] 
    : cancerColors.other;

  const shareQRCode = async () => {
    if (!patient) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Código QR Médico',
          text: `Código QR de ${patient.name} - Ficha Médica UCN`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      if (qrImageUrl) {
        navigator.clipboard.writeText(qrImageUrl);
        alert('URL del QR copiado al portapapeles');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando datos del paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return <CompleteProfileForm onComplete={handleProfileComplete} />;
  }

  return (
    <div className="space-y-6">
      {/* QR Code Card */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Mi Código QR Médico</CardTitle>
          <p className="text-sm text-gray-600">
            Muestra este código al personal médico para acceso inmediato a tu información
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {qrImageUrl ? (
              <img 
                src={qrImageUrl} 
                alt="QR Code del Paciente"
                className="w-[200px] h-[200px] border-2 border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Cargando QR...</p>
              </div>
            )}
          </div>
          <Button 
            onClick={shareQRCode}
            className="w-full sm:w-auto"
            style={{ backgroundColor: cancerColor.color }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir / Guardar
          </Button>
        </CardContent>
      </Card>

      {/* Patient Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" style={{ color: cancerColor.color }} />
            <span>Mi Ficha Resumida</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={patient.photo} alt={patient.name} />
              <AvatarFallback>
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <Badge
                  className="text-white border-0 mb-2"
                  style={{ backgroundColor: cancerColor.color }}
                >
                  {patient.diagnosis} - {patient.stage}
                </Badge>
                <p className="text-sm text-gray-600">
                  <strong>RUT:</strong> {patient.rut}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{patient.treatmentSummary}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {onTabChange && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onTabChange('notes')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${cancerColor.color}20` }}
              >
                <StickyNote className="w-6 h-6" style={{ color: cancerColor.color }} />
              </div>
              <div>
                <h3 className="font-medium">Mis Notas</h3>
                <p className="text-sm text-gray-600">Registra tus síntomas y observaciones</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onTabChange('documents')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${cancerColor.color}20` }}
              >
                <FolderOpen className="w-6 h-6" style={{ color: cancerColor.color }} />
              </div>
              <div>
                <h3 className="font-medium">Mis Documentos</h3>
                <p className="text-sm text-gray-600">Guarda recetas y resultados</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onTabChange('profile')}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${cancerColor.color}20` }}
              >
                <ClipboardList className="w-6 h-6" style={{ color: cancerColor.color }} />
              </div>
              <div>
                <h3 className="font-medium">Mi Ficha Médica</h3>
                <p className="text-sm text-gray-600">Información y configuración</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
