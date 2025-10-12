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
    qrCode:string;
}

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

export interface PatientNote {
    id: string;
    title: string;
    content: string;
    date: string;
    patientId: string;
    authorId:string;
    authorName:string;
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

export type CancerType =
    | 'breast'
    | 'colorectal'
    | 'gastric'
    | 'cervical'
    | 'lung'
    | 'prostate'
    | 'testicular'
    | 'renal'
    | 'hepatic';

export const cancerColors : Record<CancerType, {color: string; name: string }> = {
    breast: {color: '#e8a0b9', name: 'Mama'},
    colorectal: {color: '#0033a0', name: 'Colorrectal'},
    gastric: {color: '#ccccff', name: 'Gástrico'},
    cervical: {color: '#008080', name: 'Cervicouterino'},
    lung: {color: '#fdeed9', name: 'Pulmón'},
    prostate: {color: '#75aadb', name: 'Próstata'},
    testicular: {color: '#da70d6', name: 'Testicular'},
    renal: {color: '#ff8c00', name: 'Renal'},
    hepatic: {color: '#50c878', name: 'Hepático'},
};

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'guardian';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string; // Only for patient users
}

export type Permission =
    | 'read'
    | 'write_notes'
    | 'upload_documents';

export interface AccessGrant {
    id: string;
    patientId: string;
    grantedToUserId: string;
    grantedByUserId: string;
    relationship: RelationshipType;
    permissions: Permission[];
    status: 'pending' | 'active' | 'revoked';
    invitationDate: string;
    activationDate?:string;
}

export type RelationshipType = 
  | 'hijo/a'
  | 'esposo/a'
  | 'padre'
  | 'madre'
  | 'hermano/a'
  | 'cuidador/a principal'
  | 'otro';

export interface RegistrationData {
    email:string;
    password:string;
    name:string;
    role: UserRole;
}