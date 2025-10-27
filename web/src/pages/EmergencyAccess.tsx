import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { PatientRecord } from "../components/PatientRecord";
import { validateRut, formatRut, cleanRut } from "../common/helpers/ValidateRut";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import type { Patient } from "../types/medical";
import { CancerRibbon } from "../components/CancerRibbon";

export function EmergencyAccess() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  
  const [showRutDialog, setShowRutDialog] = useState(true);
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [accessError, setAccessError] = useState("");

  // Validate QR code parameter
  useEffect(() => {
    if (!qrCode) {
      setAccessError("Código QR inválido o no proporcionado");
    }
  }, [qrCode]);

  // Handle RUT input with automatic formatting
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatRut(value);
    setRut(formatted);
    setRutError("");
  };

  // Validate and submit RUT
  const handleSubmitRut = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate RUT format
    if (!validateRut(rut)) {
      setRutError("RUT inválido. Verifica el formato y dígito verificador.");
      return;
    }

    if (!qrCode) {
      setAccessError("Código QR no válido");
      return;
    }

    setLoading(true);
    setAccessError("");

    try {
      // Register emergency access and get patient data
      const patientData = await apiService.emergencyAccess.registerAccess(
        qrCode,
        cleanRut(rut)
      );
      
      setPatient(patientData);
      setShowRutDialog(false);
    } catch (error: any) {
      console.error("Error al registrar acceso de emergencia:", error);
      
      if (error.response?.status === 404) {
        setAccessError("Paciente no encontrado con este código QR");
      } else if (error.response?.status === 400) {
        setRutError(error.response?.data?.message || "RUT inválido");
      } else {
        setAccessError("Error al acceder a la información del paciente. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle going back
  const handleBack = () => {
    navigate("/");
  };

  // Show error screen if there's an access error
  if (accessError && !showRutDialog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">
              {accessError}
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack} className="w-full mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Show patient record if access granted
  if (patient && !showRutDialog) {
    return <PatientRecord patient={patient} onBack={handleBack} />;
  }

  // Show RUT verification dialog
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Dialog open={showRutDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CancerRibbon className="text-[#ff6299]" size="lg" />
            </div>
            <DialogTitle className="text-center text-xl">
              Acceso de Emergencia
            </DialogTitle>
            <DialogDescription className="text-center">
              Para acceder a la información médica del paciente, ingresa tu RUT. 
              Este acceso quedará registrado por seguridad.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRut} className="space-y-4 mt-4">
            <Alert className="border-blue-200 bg-blue-50">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm ml-2">
                Tu identidad será verificada y registrada
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={rut}
                onChange={handleRutChange}
                maxLength={12}
                className={rutError ? "border-red-500" : ""}
                disabled={loading}
                autoFocus
              />
              {rutError && (
                <p className="text-sm text-red-600">{rutError}</p>
              )}
            </div>

            {accessError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm ml-2">
                  {accessError}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !rut}
                className="flex-1 bg-[#ff6299] hover:bg-[#e5588a]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acceder"
                )}
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Este acceso es para uso exclusivo de personal médico en situaciones de emergencia
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
