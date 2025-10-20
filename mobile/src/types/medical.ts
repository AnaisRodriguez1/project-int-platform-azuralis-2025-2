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
  | 'other';

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'guardian';

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

export type CareTeamRole =
  | 'oncologo_principal'
  | 'cirujano'
  | 'radiologo'
  | 'enfermera_jefe'
  | 'consultor';

export interface CareTeamMember {
  userId: string;
  name: string;
  role: CareTeamRole;
  assignedAt: Date;
  status: 'active' | 'inactive';
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
  treatmentSummary: string;
  careTeam: CareTeamMember[];
  qrCode: string;
}

export interface PatientNote {
  id: string;
  title?: string;
  content: string;
  date?: string;
  createdAt?: string | Date;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
}

export type DocumentType =
  | 'examen'
  | 'cirugia'
  | 'quimioterapia'
  | 'radioterapia'
  | 'receta'
  | 'informe_medico'
  | 'consentimiento'
  | 'otro';

export interface PatientDocument {
  id: string;
  title: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
  patientId: string;
  uploaderId: string;
  description?: string;
}

// --- Otras Interfaces y Constantes ---

export interface RegisterFormData {
  name: string;
  rut: string;
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

// 🎨 colores equivalentes a las clases Tailwind, seguros para RN
export const documentType: Record<
  DocumentType,
  { background: string; text: string; name: string }
> = {
  examen: { background: '#DBEAFE', text: '#1E40AF', name: 'Examen' },
  cirugia: { background: '#FECACA', text: '#7F1D1D', name: 'Cirugía' },
  quimioterapia: { background: '#E9D5FF', text: '#581C87', name: 'Quimioterapia' },
  radioterapia: { background: '#FED7AA', text: '#9A3412', name: 'Radioterapia' },
  receta: { background: '#BBF7D0', text: '#065F46', name: 'Receta' },
  informe_medico: { background: '#E0E7FF', text: '#3730A3', name: 'Informe Médico' },
  consentimiento: { background: '#FEF9C3', text: '#92400E', name: 'Consentimiento' },
  otro: { background: '#F3F4F6', text: '#374151', name: 'Otro' },
};

export const getDocumentTypeColor = (type: DocumentType): string =>
  documentType[type]?.background || documentType.otro.background;

export const getDocumentTypeLabel = (type: DocumentType): string =>
  documentType[type]?.name || documentType.otro.name;

// --- INTERFACES DE USUARIO ---

export interface SearchRecord {
  patientId: string;
  patientRut: string;
  patientName?: string;
  searchedAt: Date;
}

interface BaseUser {
  id: string;
  name: string;
  rut: string;
  email: string;
  role: UserRole;
}

interface ClinicalStaffUser extends BaseUser {
  role: 'doctor' | 'nurse';
  scanHistory?: SearchRecord[];
  searchHistory?: SearchRecord[];
  assignedPatients?: string[];
}

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
  license?: string;
}

export type User = PatientUser | GuardianUser | DoctorUser | NurseUser;

// --- PERMISOS ---

export type CrudActions = {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
};

export type OwnershipScope = 'own' | 'all';

export interface AppPermissions {
  patientProfile?: {
    editableFields: Set<keyof Patient>;
  };
  notes?: CrudActions & { scope: OwnershipScope };
  documents?: CrudActions & { scope: OwnershipScope };
}

export const DOCTOR_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>([
      'diagnosis',
      'stage',
      'cancerType',
      'allergies',
      'currentMedications',
      'emergencyContacts',
      'operations',
      'treatmentSummary',
      'careTeam',
    ]),
  },
  notes: { create: true, read: true, update: true, delete: true, scope: 'all' },
  documents: { create: true, read: true, update: true, delete: true, scope: 'all' },
};

export const NURSE_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>(['currentMedications', 'treatmentSummary']),
  },
  notes: { create: true, read: true, update: true, delete: false, scope: 'all' },
  documents: { create: true, read: true, update: true, delete: false, scope: 'all' },
};

export const GUARDIAN_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>([
      'diagnosis',
      'stage',
      'cancerType',
      'allergies',
      'currentMedications',
      'emergencyContacts',
      'operations',
      'treatmentSummary',
      'careTeam',
    ]),
  },
  notes: { create: true, read: true, update: true, delete: true, scope: 'own' },
  documents: { create: true, read: true, update: true, delete: true, scope: 'own' },
};

export const PATIENT_PERMISSIONS: AppPermissions = {
  patientProfile: {
    editableFields: new Set<keyof Patient>([
      'photo',
      'name',
      'diagnosis',
      'stage',
      'cancerType',
      'allergies',
      'currentMedications',
      'emergencyContacts',
      'operations',
      'treatmentSummary',
      'careTeam',
    ]),
  },
  notes: { create: true, read: true, update: true, delete: true, scope: 'own' },
  documents: { create: true, read: true, update: true, delete: true, scope: 'own' },
};

const PERMISSIONS_BY_ROLE: Record<UserRole, AppPermissions> = {
  doctor: DOCTOR_PERMISSIONS,
  nurse: NURSE_PERMISSIONS,
  guardian: GUARDIAN_PERMISSIONS,
  patient: PATIENT_PERMISSIONS,
};

export function canUserModifyResource(
  user: User,
  action: 'update' | 'delete',
  resource: PatientNote | PatientDocument
): boolean {
  const permissions = PERMISSIONS_BY_ROLE[user.role];
  const resourceType = 'content' in resource ? 'notes' : 'documents';
  const resourcePermissions = permissions[resourceType];
  if (!resourcePermissions?.[action]) return false;

  const scope = resourcePermissions.scope;
  if (scope === 'all') return true;

  if (scope === 'own') {
    const authorId = 'authorId' in resource ? resource.authorId : resource.uploaderId;
    return user.id === authorId;
  }

  return false;
}
