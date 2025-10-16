import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  Calendar,
  User,
  Pill,
  Scissors,
} from "lucide-react";
import type { Patient } from "@/types/medical";
import { cancerColors } from "@/types/medical";
import { CancerRibbon } from "./CancerRibbon";
import LogoUniversidad from "../assets/icons/logo_ucn.svg?react";

interface PatientRecordProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientRecord({ patient, onBack }: PatientRecordProps) {
  const cancerColor = cancerColors[patient.cancerType];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const callEmergencyContact = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al escáner
            </Button>
            {/* LOGOS */}
            <div className="flex items-center justify-center space-x-3">
              <CancerRibbon className="text-[#ff6299]" size="lg" />
              <LogoUniversidad className="w-8 h-8 " />
            </div>
          </div>

          {/* Patient Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={patient.photo} alt={patient.name} />
              <AvatarFallback
                className="text-lg"
                style={{ backgroundColor: cancerColor.color + "40" }}
              >
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{patient.age} años</span>
                <span>RUT: {patient.rut}</span>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Badge
                  className="text-white border-0"
                  style={{ backgroundColor: cancerColor.color }}
                >
                  {cancerColor.name}
                </Badge>
                <Badge variant="outline">
                  {patient.diagnosis} - {patient.stage}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Critical Information Alert */}
        {patient.allergies.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>⚠️ ALERGIAS:</strong> {patient.allergies.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill
                  className="w-5 h-5"
                  style={{ color: cancerColor.color }}
                />
                <span>Medicamentos Actuales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.currentMedications.length > 0 ? (
                <ul className="space-y-2">
                  {patient.currentMedications.map((med, index) => (
                    <li
                      key={index}
                      className="text-sm bg-gray-50 p-3 rounded-lg flex items-start"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 mr-2"
                        style={{ backgroundColor: cancerColor.color }}
                      ></div>
                      {med}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Sin medicamentos registrados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span>Contactos de Emergencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">
                        {contact.relationship}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contact.phone}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => callEmergencyContact(contact.phone)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Llamar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          {patient.operations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scissors
                    className="w-5 h-5"
                    style={{ color: cancerColor.color }}
                  />
                  <span>Operaciones Relevantes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.operations.map((operation, index) => (
                    <div
                      key={index}
                      className="border-l-4 pl-4 py-2"
                      style={{ borderColor: cancerColor.color }}
                    >
                      <p className="font-medium text-sm">
                        {operation.procedure}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(operation.date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {operation.hospital}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Treatment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User
                  className="w-5 h-5"
                  style={{ color: cancerColor.color }}
                />
                <span>Estado del Tratamiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                {patient.treatmentSummary}
              </p>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: cancerColor.color + "20" }}
              >
                <p className="text-sm font-semibold mb-2">Equipo de Cuidados:</p>
                <div className="space-y-2">
                  {patient.careTeam.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cancerColor.color }}
                      ></div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-gray-600">
                        - {member.role === 'oncologo_principal' ? 'Oncólogo Principal' : 
                           member.role === 'enfermera_jefe' ? 'Enfermera Jefe' : 
                           member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient ID */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar
                  className="w-5 h-5"
                  style={{ color: cancerColor.color }}
                />
                <span>Información de Ficha</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">ID de Ficha Médica</p>
                <p className="font-mono font-medium text-lg mt-1">
                  {patient.qrCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add some bottom padding to avoid fixed navigation overlap */}
      <div className="h-20"></div>
    </div>
  );
}
