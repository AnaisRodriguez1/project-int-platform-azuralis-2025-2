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

export type UserRole = 
  | 'patient' 
  | 'doctor' 
  | 'nurse' 
  | 'guardian';

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

export type DocumentType = 
  | 'examen'           // Exámenes de laboratorio, imagenología, biopsias
  | 'cirugia'          // Documentos relacionados a cirugías
  | 'quimioterapia'    // Protocolos, recetas y seguimiento de quimioterapia
  | 'radioterapia'     // Documentos de radioterapia
  | 'receta'           // Recetas médicas generales
  | 'informe_medico'   // Informes y resúmenes médicos
  | 'consentimiento'   // Consentimientos informados
  | 'otro';            // Otros documentos

export interface PatientDocument {
  id: string;
  title: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
  patientId: string;
  uploaderId: string;
  description?: string; // Descripción opcional del documento
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

export const doctorColor = '#3B82F6';
export const nurseColor = '#00B4D8';

export const documentType: Record<DocumentType, {color: string; name: string}> = {
  examen : {color: 'bg-blue-100 text-blue-800', name: 'Examen'},
  cirugia: {color: 'bg-red-100 text-red-800', name: 'Cirugía'},
  quimioterapia:{color: 'bg-purple-100 text-purple-800', name: 'Quimioterapia'},
  radioterapia:{color: 'bg-orange-100 text-orange-800', name: 'Radioterapia'},
  receta:{color: 'bg-green-100 text-green-800', name: 'Receta'},
  informe_medico:{color: 'bg-indigo-100 text-indigo-800', name: 'Informe Médico'},
  consentimiento:{color: 'bg-yellow-100 text-yellow-800', name: 'Consentimiento'},
  otro:{color: 'bg-gray-100 text-gray-800', name: 'Otro'},
};

// --- INTERFACES DE USUARIO (Simplificadas y limpias) ---

export interface ScanRecord {
  patientId: string;
  scannedAt: Date;
}

// Base para todos los usuarios.
interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Base para personal clínico para no repetir código.
interface ClinicalStaffUser extends BaseUser {
  role: 'doctor' | 'nurse';
  scanHistory?: ScanRecord[];
  assignedPatients?: string[];
}

// Tipos de usuario específicos.
export interface PatientUser extends BaseUser {
  role: 'patient';
  patientId: string;
}

export interface GuardianUser extends BaseUser {
  role: 'guardian';
  patientIds: string[];
}

export interface DoctorUser extends ClinicalStaffUser {
  role: 'doctor';
  specialization?: string;
  license?: string;
}

export interface NurseUser extends ClinicalStaffUser {
  role: 'nurse';
  department?: string;
}

// Tipo de unión final para cualquier tipo de usuario.
export type User = 
  | PatientUser 
  | GuardianUser 
  | DoctorUser 
  | NurseUser;

// --- MODELO DE PERMISOS UNIFICADO (RBAC) ---

export type CrudActions = {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
};

export type OwnershipScope = 'own' | 'all';

/**
 * Modelo único que cubre todos los permisos posibles en la aplicación.
 * Las propiedades son opcionales porque no todos los roles tendrán acceso a todo.
 */
export interface AppPermissions {
  patientProfile?: {
    editableFields: Set<keyof Patient>;
  };
  notes?: CrudActions & { scope: OwnershipScope };
  documents?: CrudActions & { scope: OwnershipScope };
}

// --- PERFILES DE PERMISOS POR ROL (LA ÚNICA FUENTE DE VERDAD) ---

export const DOCTOR_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>([
      'name', 'age', 'photo', 'diagnosis', 'stage', 'cancerType', 
      'allergies', 'currentMedications', 'emergencyContacts', 
      'operations', 'treatmentSummary', 'assignedDoctor'
    ]),
  },
  notes: { create: true, read: true, update: true, delete: true, scope: 'all' },
  documents: { create: true, read: true, update: true, delete: true, scope: 'all' },
};

export const NURSE_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>([
      'photo', 'allergies', 'currentMedications', 'emergencyContacts'
    ]),
  },
  notes: { create: true, read: true, update: true, delete: false, scope: 'own' },
  documents: { create: true, read: true, update: false, delete: false, scope: 'all' },
};

// Puedes definir perfiles similares para 'guardian' y 'patient' si es necesario.
export const GUARDIAN_PERMISSIONS: AppPermissions = {
  notes: { read: true, scope: 'all' },
  documents: { read: true, scope: 'all' },
};

// --- LÓGICA DE VERIFICACIÓN DE PERMISOS (EJEMPLO DE BACKEND) ---

const PERMISSIONS_BY_ROLE: Record<UserRole, AppPermissions> = {
  doctor: DOCTOR_PERMISSIONS,
  nurse: NURSE_PERMISSIONS,
  guardian: GUARDIAN_PERMISSIONS,
  patient: {}, // Un paciente no tiene permisos sobre otros, sino sobre sí mismo.
};

export function canUserPerformAction(
  user: User, 
  action: 'create' | 'read' | 'update' | 'delete',
  resource: 'notes' | 'documents'
): boolean {
  const permissions = PERMISSIONS_BY_ROLE[user.role];
  const resourcePermissions = permissions[resource];

  if (!resourcePermissions || !resourcePermissions[action]) {
    return false;
  }
  
  // Aquí se podría añadir lógica más compleja, como verificar el 'scope'.
  // Por ejemplo, para la acción 'delete', si es una enfermera,
  // se necesitaría verificar que la nota le pertenece (scope: 'own').
  
  return true;
}