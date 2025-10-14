// --- Interfaces relacionadas al Paciente ---

export type CancerType =
  | 'breast'
  | 'colorectal'
  | 'gastric'
  | 'cervical'
  | 'lung'
  | 'prostate'
  | 'testicular'
  | 'renal'
  | 'hepatic'
  | 'other'

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Operation {
  date: string;
  procedure: string;
  hospital: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  rut: string;
  photo?: string;
  diagnosis: string;
  stage: string;
  cancerType: CancerType;
  allergies: string[];
  currentMedications: string[];
  emergencyContacts: EmergencyContact[];
  operations: Operation[];
  treatmentSummary: string; //Resumen de tratamientos del paciente
  assignedDoctor: string;
  qrCode: string;
}

export interface PatientNote {
  id: string;
  title: string;
  content: string;
  date: string;
  patientId: string;
  authorId: string;
  authorName: string;
}

export interface PatientDocument {
  id: string;
  title: string;
  type: 'prescription' | 'test_result' | 'image' | 'other';
  url: string;
  uploadDate: string;
  patientId: string;
  uploaderId: string;
}

// --- Interfaces relacionadas al Usuario y Permisos ---

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'guardian';

// Interfaz para registrar un escaneo de QR, útil para doctores y enfermeras
export interface ScanRecord {
  patientId: string;    // El ID del paciente que fue escaneado
  scannedAt: Date;      // La fecha y hora exactas del escaneo
}

// Interfaz base con campos comunes para todos los usuarios
interface BaseUser {
  id: string;
  name: string;
  email: string;
}

// Tipos específicos para cada rol, extendiendo la base
export interface PatientUser extends BaseUser {
  role: 'patient';
  patientId: string; // El paciente tiene su propio ID de paciente único
}

export interface GuardianUser extends BaseUser {
  role: 'guardian';
  // Un array para almacenar los IDs de todos los pacientes a su cargo
  patientIds: string[]; 
}

export interface DoctorUser extends BaseUser {
  role: 'doctor';
  // Historial de escaneos, opcional
  scanHistory?: ScanRecord[]; 
}

export interface NurseUser extends BaseUser {
  role: 'nurse';
  // Historial de escaneos, opcional
  scanHistory?: ScanRecord[];
}

// El tipo User final es una unión de todos los tipos específicos.
export type User = PatientUser | GuardianUser | DoctorUser | NurseUser;


// --- Interfaces relacionadas a Permisos y Acceso ---

export type Permission =
  | 'read'
  | 'write_notes'
  | 'upload_documents';

export type RelationshipType = 
  | 'hijo/a'
  | 'esposo/a'
  | 'padre'
  | 'madre'
  | 'hermano/a'
  | 'cuidador/a principal'
  | 'otro';

export interface AccessGrant {
  id: string;
  patientId: string;
  grantedToUserId: string;
  grantedByUserId: string;
  relationship: RelationshipType;
  permissions: Permission[];
  status: 'pending' | 'active' | 'revoked';
  invitationDate: string;
  activationDate?: string;
}

// --- Otras Interfaces y Constantes ---

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export const cancerColors: Record<CancerType, { color: string; name: string }> = {
  breast: { color: '#e8a0b9', name: 'Mama' },
  colorectal: { color: '#0033a0', name: 'Colorrectal' },
  gastric: { color: '#ccccff', name: 'Gástrico' },
  cervical: { color: '#008080', name: 'Cervicouterino' },
  lung: { color: '#fdeed9', name: 'Pulmón' },
  prostate: { color: '#75aadb', name: 'Próstata' },
  testicular: { color: '#da70d6', name: 'Testicular' },
  renal: { color: '#ff8c00', name: 'Renal' },
  hepatic: { color: '#50c878', name: 'Hepático' },
  other: { color: '#9333EA', name: 'Otro tipo' },
};