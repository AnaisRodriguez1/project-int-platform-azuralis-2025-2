import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft } from "lucide-react";
import type { Patient } from "@/types/medical";
import { apiService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { CancerRibbon } from "./CancerRibbon";
import LogoUniversidad from "../assets/icons/logo_ucn.svg?react";

interface ScannerProps {
  onPatientFound: (patient: Patient) => void;
  onBack: () => void;
}

export function DoctorScanner({ onPatientFound, onBack }: ScannerProps) {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(true);

  const handleMockScan = async () => {
    if (!user) return;

    // Simular escaneo exitoso después de 1.5 segundos
    setIsScanning(false);

    setTimeout(async () => {
      try {
        // Simular escaneo del primer paciente disponible
        const allPatients = await apiService.patients.getAll();
        const firstPatient = allPatients[0];
        
        if (firstPatient) {
          onPatientFound(firstPatient);
        } else {
          alert("No hay pacientes disponibles");
          setIsScanning(true);
        }
      } catch (error) {
        console.error("Error al escanear:", error);
        alert("Error al escanear el código QR");
        setIsScanning(true);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          {/* LOGOS */}
          <div className="flex items-center justify-center space-x-3">
            <CancerRibbon className="text-[#ff6299]" size="lg" />
            <LogoUniversidad className="w-8 h-8" style={{ fill: '#ff6299' }} />
          </div>
        </div>
      </div>

      {/* Camera View Simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Scanning overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Scanning Frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* QR Frame */}
          <div className="w-64 h-64 border-4 border-white rounded-lg relative">
            {/* Corner brackets */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-blue-400"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-blue-400"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-blue-400"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-blue-400"></div>

            {/* Scanning line */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="h-1 bg-blue-400 animate-pulse absolute top-0 left-0 right-0 shadow-lg shadow-blue-400/50"></div>
                <div className="h-1 bg-blue-400 animate-pulse absolute top-1/4 left-0 right-0 shadow-lg shadow-blue-400/50 animation-delay-75"></div>
                <div className="h-1 bg-blue-400 animate-pulse absolute top-1/2 left-0 right-0 shadow-lg shadow-blue-400/50 animation-delay-150"></div>
                <div className="h-1 bg-blue-400 animate-pulse absolute top-3/4 left-0 right-0 shadow-lg shadow-blue-400/50 animation-delay-300"></div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-white text-lg font-medium">
              Escanee el código QR del paciente.
            </p>
            <p className="text-gray-300 text-sm">
              Mantenga el código dentro del marco.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-8">

          {/* Mock Scan Button (for demo purposes) */}
          <Button
            onClick={handleMockScan}
            disabled={!isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {isScanning ? (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Simular escaneo
              </>
            ) : (
              "Procesando..."
            )}
          </Button>
        </div>
      </div>

      {/* Scanning status indicator */}
      {!isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-900">Procesando código QR...</p>
          </div>
        </div>
      )}
    </div>
  );
}
