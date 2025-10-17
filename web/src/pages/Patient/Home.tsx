import { useAuth } from '@/context/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Share2, User, StickyNote, FolderOpen, Settings } from 'lucide-react';
import { getPatientById } from '@/services/mockApi';
import type { PatientUser } from '@/types/medical';

interface HomePatientProps {
  onTabChange?: (tab: string) => void;
}

export function HomePatient({ onTabChange }: HomePatientProps) {
  const { user } = useAuth();
  const { cancerColor } = usePatientData();

  // Obtener datos completos del paciente
  const patientUser = user as PatientUser;
  const patient = patientUser?.patientId ? getPatientById(patientUser.patientId) : null;

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
      navigator.clipboard.writeText(patient.qrCode);
      alert('Código copiado al portapapeles');
    }
  };

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se encontraron datos del paciente</p>
      </div>
    );
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
            <QRCodeGenerator 
              value={patient.qrCode}
              size={200}
              className="mx-auto"
            />
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
                  <strong>Médico tratante:</strong> {patient.assignedDoctor}
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
                <Settings className="w-6 h-6" style={{ color: cancerColor.color }} />
              </div>
              <div>
                <h3 className="font-medium">Mi Perfil</h3>
                <p className="text-sm text-gray-600">Configuración y personalización</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
