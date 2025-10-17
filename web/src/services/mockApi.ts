import type { 
    User, 
    Patient, 
    DoctorUser, 
    PatientUser, 
    GuardianUser, 
    NurseUser,
    PatientNote,
    PatientDocument
} from '@/types/medical.ts';

// ============================================
// USUARIOS DE EJEMPLO - USANDO MAPS PARA MEJOR PERFORMANCE
// ============================================

// Datos raw para exportar como arrays (para compatibilidad)
const DOCTORS_DATA: DoctorUser[] = [
    {
        id: 'doc-001',
        name: 'Dr. Carlos Mendoza',
        rut: '12345678-9',
        email: 'carlos.mendoza@hospital.cl',
        role: 'doctor',
        specialization: 'Oncología',
        license: 'D-123456'
    },
    {
        id: 'doc-002',
        name: 'Dra. María González',
        rut: '23456789-0',
        email: 'maria.gonzalez@hospital.cl',
        role: 'doctor',
        specialization: 'Hematología',
        license: 'D-234567'
    }
];

const NURSES_DATA: NurseUser[] = [
    {
        id: 'nurse-001',
        name: 'Enfermera Ana Pérez',
        rut: '34567890-1',
        email: 'ana.perez@hospital.cl',
        role: 'nurse',
        department: 'Oncología',
        license: 'N-345678'
    },
    {
        id: 'nurse-002',
        name: 'Enfermero José Silva',
        rut: '45678901-2',
        email: 'jose.silva@hospital.cl',
        role: 'nurse',
        department: 'Urgencias',
        license: 'N-456789'
    }
];

const PATIENT_USERS_DATA: PatientUser[] = [
    {
        id: 'user-pat-001',
        name: 'Sofía Ramírez',
        rut: '56789012-3',
        email: 'sofia.ramirez@email.cl',
        role: 'patient',
        patientId: 'pat-001'
    },
    {
        id: 'user-pat-002',
        name: 'Pedro Flores',
        rut: '67890123-4',
        email: 'pedro.flores@email.cl',
        role: 'patient',
        patientId: 'pat-002'
    }
];

const GUARDIANS_DATA: GuardianUser[] = [
    {
        id: 'guard-001',
        name: 'Laura Ramírez',
        rut: '78901234-5',
        email: 'laura.ramirez@email.cl',
        role: 'guardian',
        patientIds: ['pat-001']
    },
    {
        id: 'guard-002',
        name: 'Carmen Flores',
        rut: '89012345-6',
        email: 'carmen.flores@email.cl',
        role: 'guardian',
        patientIds: ['pat-002']
    }
];

// Exportar arrays para compatibilidad con código existente
export const MOCK_DOCTORS = DOCTORS_DATA;
export const MOCK_NURSES = NURSES_DATA;
export const MOCK_PATIENT_USERS = PATIENT_USERS_DATA;
export const MOCK_GUARDIANS = GUARDIANS_DATA;

// ============================================
// PACIENTES DE EJEMPLO
// ============================================

const PATIENTS_DATA: Patient[] = [
    {
        id: 'pat-001',
        name: 'Sofía Ramírez',
        age: 45,
        rut: '56789012-3',
        photo: 'https://i.pravatar.cc/150?img=1',
        diagnosis: 'Cáncer de Mama',
        stage: 'Etapa II',
        cancerType: 'breast',
        allergies: ['Penicilina', 'Ibuprofeno'],
        currentMedications: [
            'Tamoxifeno 20mg - cada 12 horas',
            'Paracetamol 500mg - según necesidad'
        ],
        emergencyContacts: [
            {
                name: 'Laura Ramírez',
                relationship: 'Hermana',
                phone: '+56 9 8765 4321'
            },
            {
                name: 'Roberto Ramírez',
                relationship: 'Esposo',
                phone: '+56 9 7654 3210'
            }
        ],
        operations: [
            {
                date: '2024-06-15',
                procedure: 'Mastectomía parcial',
                hospital: 'Hospital Regional - Dr. Carlos Mendoza'
            }
        ],
        treatmentSummary: 'Paciente diagnosticada con cáncer de mama en estadio II. Se realizó mastectomía parcial seguida de quimioterapia adyuvante. Actualmente en terapia hormonal con Tamoxifeno. Pronóstico favorable.',
        careTeam: [
            {
                userId: 'doc-001',
                name: 'Dr. Carlos Mendoza',
                role: 'oncologo_principal',
                assignedAt: new Date('2024-05-01'),
                status: 'active'
            },
            {
                userId: 'nurse-001',
                name: 'Enfermera Ana Pérez',
                role: 'enfermera_jefe',
                assignedAt: new Date('2024-05-01'),
                status: 'active'
            }
        ],
        qrCode: 'PAT001ABC123XYZ'
    },
    {
        id: 'pat-002',
        name: 'Pedro Flores',
        age: 62,
        rut: '67890123-4',
        photo: 'https://i.pravatar.cc/150?img=12',
        diagnosis: 'Linfoma de Hodgkin',
        stage: 'Etapa III',
        cancerType: 'other',
        allergies: ['Aspirina'],
        currentMedications: [
            'Doxorrubicina 50mg IV - cada 21 días',
            'Prednisona 40mg - diario',
            'Ondansetrón 8mg - según necesidad'
        ],
        emergencyContacts: [
            {
                name: 'Carmen Flores',
                relationship: 'Esposa',
                phone: '+56 9 6543 2109'
            },
            {
                name: 'Diego Flores',
                relationship: 'Hijo',
                phone: '+56 9 5432 1098'
            }
        ],
        operations: [],
        treatmentSummary: 'Paciente con Linfoma de Hodgkin estadio III. En tratamiento con quimioterapia combinada (esquema ABVD). Tolera bien el tratamiento con efectos secundarios controlables. Respuesta parcial favorable después de 4 ciclos.',
        careTeam: [
            {
                userId: 'doc-002',
                name: 'Dra. María González',
                role: 'oncologo_principal',
                assignedAt: new Date('2024-03-15'),
                status: 'active'
            },
            {
                userId: 'nurse-002',
                name: 'Enfermero José Silva',
                role: 'enfermera_jefe',
                assignedAt: new Date('2024-03-15'),
                status: 'active'
            }
        ],
        qrCode: 'PAT002DEF456UVW'
    }
];

export const MOCK_PATIENTS = PATIENTS_DATA;

// ============================================
// NOTAS CLÍNICAS DE EJEMPLO
// ============================================

const NOTES_DATA: PatientNote[] = [
    {
        id: 'note-001',
        title: 'Consulta de seguimiento post-cirugía',
        content: 'Paciente acude a control post-operatorio. Herida quirúrgica en buen estado, sin signos de infección. Retiro de puntos programado para próxima semana. Paciente refiere dolor leve controlado con analgésicos. Se inicia protocolo de quimioterapia adyuvante.',
        date: '2024-07-01',
        patientId: 'pat-001',
        authorId: 'doc-001',
        authorName: 'Dr. Carlos Mendoza'
    },
    {
        id: 'note-002',
        title: 'Inicio de terapia hormonal',
        content: 'Se inicia tratamiento con Tamoxifeno 20mg cada 12 horas. Se explican efectos secundarios potenciales a la paciente. Controles mensuales programados para monitoreo. Paciente comprende indicaciones y firma consentimiento informado.',
        date: '2024-08-15',
        patientId: 'pat-001',
        authorId: 'doc-001',
        authorName: 'Dr. Carlos Mendoza'
    },
    {
        id: 'note-003',
        title: 'Evaluación pre-quimioterapia',
        content: 'Paciente en condiciones para inicio de quimioterapia. Hemograma dentro de parámetros aceptables. Función renal y hepática normales. Se programa primer ciclo de ABVD para esta semana. Paciente orientado sobre cuidados y posibles efectos adversos.',
        date: '2024-04-01',
        patientId: 'pat-002',
        authorId: 'doc-002',
        authorName: 'Dra. María González'
    },
    {
        id: 'note-004',
        title: 'Control post 4to ciclo de quimioterapia',
        content: 'Paciente completó 4to ciclo de quimioterapia. Tolera tratamiento adecuadamente. Náuseas controladas con antiemético. TAC de control muestra reducción del 40% en tamaño de lesiones. Se continúa con protocolo establecido.',
        date: '2024-08-20',
        patientId: 'pat-002',
        authorId: 'doc-002',
        authorName: 'Dra. María González'
    }
];

export const MOCK_NOTES = NOTES_DATA;

// ============================================
// DOCUMENTOS DE EJEMPLO
// ============================================

const DOCUMENTS_DATA: PatientDocument[] = [
    {
        id: 'doc-001',
        title: 'Biopsia de mama - Resultado histopatológico',
        type: 'examen',
        url: 'https://example.com/documents/biopsia-pat001.pdf',
        uploadDate: '2024-05-10',
        patientId: 'pat-001',
        uploaderId: 'doc-001'
    },
    {
        id: 'doc-002',
        title: 'Mamografía bilateral',
        type: 'examen',
        url: 'https://example.com/documents/mamografia-pat001.pdf',
        uploadDate: '2024-05-05',
        patientId: 'pat-001',
        uploaderId: 'doc-001'
    },
    {
        id: 'doc-003',
        title: 'TAC de tórax - Evaluación inicial',
        type: 'examen',
        url: 'https://example.com/documents/tac-pat002.pdf',
        uploadDate: '2024-03-10',
        patientId: 'pat-002',
        uploaderId: 'doc-002'
    },
    {
        id: 'doc-004',
        title: 'Hemograma completo pre-tratamiento',
        type: 'examen',
        url: 'https://example.com/documents/hemograma-pat002.pdf',
        uploadDate: '2024-03-28',
        patientId: 'pat-002',
        uploaderId: 'doc-002'
    }
];

export const MOCK_DOCUMENTS = DOCUMENTS_DATA;

// ============================================
// TODOS LOS USUARIOS COMBINADOS
// ============================================

const ALL_USERS_DATA: User[] = [
    ...DOCTORS_DATA,
    ...NURSES_DATA,
    ...PATIENT_USERS_DATA,
    ...GUARDIANS_DATA
];

export const MOCK_USERS = ALL_USERS_DATA;

// ============================================
// MAPS PARA ACCESO RÁPIDO (O(1) lookup)
// ============================================

// Maps para búsquedas rápidas por ID
export const USERS_BY_ID = new Map<string, User>(
    ALL_USERS_DATA.map(user => [user.id, user])
);

export const PATIENTS_BY_ID = new Map<string, Patient>(
    PATIENTS_DATA.map(patient => [patient.id, patient])
);

export const NOTES_BY_ID = new Map<string, PatientNote>(
    NOTES_DATA.map(note => [note.id, note])
);

export const DOCUMENTS_BY_ID = new Map<string, PatientDocument>(
    DOCUMENTS_DATA.map(doc => [doc.id, doc])
);

// Índices secundarios para búsquedas comunes
export const USERS_BY_EMAIL = new Map<string, User>(
    ALL_USERS_DATA.map(user => [user.email.toLowerCase(), user])
);

export const NOTES_BY_PATIENT = new Map<string, PatientNote[]>();
NOTES_DATA.forEach(note => {
    const existing = NOTES_BY_PATIENT.get(note.patientId) || [];
    NOTES_BY_PATIENT.set(note.patientId, [...existing, note]);
});

export const DOCUMENTS_BY_PATIENT = new Map<string, PatientDocument[]>();
DOCUMENTS_DATA.forEach(doc => {
    const existing = DOCUMENTS_BY_PATIENT.get(doc.patientId) || [];
    DOCUMENTS_BY_PATIENT.set(doc.patientId, [...existing, doc]);
});

// Índice de pacientes por usuario del equipo de cuidado
export const PATIENTS_BY_CARE_TEAM_MEMBER = new Map<string, Patient[]>();
PATIENTS_DATA.forEach(patient => {
    patient.careTeam.forEach(member => {
        const existing = PATIENTS_BY_CARE_TEAM_MEMBER.get(member.userId) || [];
        PATIENTS_BY_CARE_TEAM_MEMBER.set(member.userId, [...existing, patient]);
    });
});

// ============================================
// FUNCIONES DE ACCESO A DATOS (OPTIMIZADAS CON MAPS)
// ============================================

/**
 * Obtiene un usuario por ID - O(1) lookup
 */
export const getUserById = (userId: string): User | undefined => {
    return USERS_BY_ID.get(userId);
};

/**
 * Obtiene un usuario por email - O(1) lookup
 */
export const getUserByEmail = (email: string): User | undefined => {
    return USERS_BY_EMAIL.get(email.toLowerCase());
};

/**
 * Obtiene un paciente por ID - O(1) lookup
 */
export const getPatientById = (patientId: string): Patient | undefined => {
    return PATIENTS_BY_ID.get(patientId);
};

/**
 * Obtiene las notas de un paciente - O(1) lookup
 */
export const getNotesByPatientId = (patientId: string): PatientNote[] => {
    return NOTES_BY_PATIENT.get(patientId) || [];
};

/**
 * Obtiene los documentos de un paciente - O(1) lookup
 */
export const getDocumentsByPatientId = (patientId: string): PatientDocument[] => {
    return DOCUMENTS_BY_PATIENT.get(patientId) || [];
};

/**
 * Obtiene los pacientes asociados a un usuario según su rol - O(1) o O(n) optimizado
 */
export const getPatientsByUserId = (userId: string): Patient[] => {
    const user = USERS_BY_ID.get(userId);
    
    if (!user) return [];
    
    switch (user.role) {
        case 'doctor':
        case 'nurse':
            // O(1) lookup usando el índice preconstruido
            return PATIENTS_BY_CARE_TEAM_MEMBER.get(userId) || [];
        
        case 'guardian':
            // O(n) pero n es pequeño (pocos pacientes por guardian)
            const patientIds = (user as GuardianUser).patientIds;
            return patientIds
                .map(id => PATIENTS_BY_ID.get(id))
                .filter((p): p is Patient => p !== undefined);
        
        case 'patient':
            // O(1) lookup
            const patientId = (user as PatientUser).patientId;
            const patient = PATIENTS_BY_ID.get(patientId);
            return patient ? [patient] : [];
        
        default:
            return [];
    }
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Retorna todos los usuarios (para compatibilidad con código legacy)
 * @deprecated Usa MOCK_USERS directamente o las funciones específicas como getUserById
 */
export const getMockUsers = () => MOCK_USERS;

/**
 * Retorna todos los pacientes (para compatibilidad con código legacy)
 * @deprecated Usa MOCK_PATIENTS directamente o las funciones específicas como getPatientById
 */
export const getMockPatients = () => MOCK_PATIENTS;

/**
 * Retorna credenciales de login para todos los usuarios
 */
export const getLoginCredentials = () => {
    return MOCK_USERS.map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
        password: "test123"
    }));
};

export const printLoginInfo = () => {
    console.log('\n=== CREDENCIALES DE ACCESO ===\n');
    console.log('Contraseña para todos: test123\n');
    
    console.log('DOCTORES:');
    MOCK_DOCTORS.forEach(d => console.log(`  - ${d.email} (${d.name})`));
    
    console.log('\nENFERMERAS/OS:');
    MOCK_NURSES.forEach(n => console.log(`  - ${n.email} (${n.name})`));
    
    console.log('\nPACIENTES:');
    MOCK_PATIENT_USERS.forEach(p => console.log(`  - ${p.email} (${p.name})`));
    
    console.log('\nCUIDADORES:');
    MOCK_GUARDIANS.forEach(g => console.log(`  - ${g.email} (${g.name})`));
    
    console.log('\n==============================\n');
};

// ============================================
// MOCK API SERVICE (Compatible con apiService)
// ============================================

/**
 * Servicio Mock API compatible con la interfaz de apiService
 * Para usar durante desarrollo sin backend
 */
export const mockApiService = {
    /**
     * Mock de login - Busca usuario por email
     */
    login: async (email: string, _password: string) => {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = getUserByEmail(email);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // En mock, cualquier contraseña funciona
        // Generar un token fake
        const token = `mock-token-${user.id}-${Date.now()}`;
        
        return {
            token,
            user
        };
    },

    /**
     * Mock de registro - Crea un nuevo usuario
     */
    register: async (userData: any) => {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Verificar si el email ya existe
        const existingUser = getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }
        
        // Crear nuevo usuario (en mock solo lo retornamos, no lo guardamos)
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            rut: userData.rut || '00000000-0',
            email: userData.email,
            role: userData.role || 'patient',
            ...(userData.role === 'patient' ? { patientId: `pat-${Date.now()}` } : {}),
            ...(userData.role === 'guardian' ? { patientIds: [] } : {}),
        } as User;
        
        return {
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    },

    /**
     * Mock de verificación de estado de autenticación
     */
    checkAuthStatus: async () => {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Obtener token de localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error('Token no encontrado');
        }
        
        // Extraer ID del token mock
        const match = token.match(/mock-token-([^-]+)-/);
        if (!match) {
            throw new Error('Token inválido');
        }
        
        const userId = match[1];
        const user = getUserById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        return user;
    },

    /**
     * Mock de escaneo de QR de paciente
     */
    scanPatientQR: async (userId: string, patientId: string) => {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const user = getUserById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // Buscar paciente por ID o por QR code
        let patient = getPatientById(patientId);
        
        // Si no se encuentra por ID, buscar por código QR
        if (!patient) {
            patient = PATIENTS_DATA.find(p => p.qrCode === patientId);
        }
        
        if (!patient) {
            throw new Error('Paciente no encontrado');
        }
        
        // Verificar que el usuario tenga acceso al paciente
        const hasAccess = patient.careTeam.some(member => member.userId === userId);
        
        if (!hasAccess && user.role !== 'doctor' && user.role !== 'nurse') {
            throw new Error('No tiene permisos para acceder a este paciente');
        }
        
        // Registrar el escaneo en el historial del doctor/enfermera
        if (user.role === 'doctor' || user.role === 'nurse') {
            const clinicalUser = user as DoctorUser | NurseUser;
            if (!clinicalUser.scanHistory) {
                clinicalUser.scanHistory = [];
            }
            clinicalUser.scanHistory.push({
                patientId: patient.id,
                scannedAt: new Date()
            });
        }
        
        return {
            success: true,
            patient,
            scannedAt: new Date()
        };
    }
};

// ============================================
// FUNCIONES CRUD PARA NOTAS Y DOCUMENTOS
// ============================================

/**
 * Crea una nueva nota para un paciente
 */
export const createNote = async (noteData: Omit<PatientNote, 'id' | 'date'>): Promise<PatientNote> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newNote: PatientNote = {
        id: `note-${String(NOTES_DATA.length + 1).padStart(3, '0')}`,
        ...noteData,
        date: new Date().toISOString().split('T')[0]
    };
    
    // Agregar a los datos y actualizar índices
    NOTES_DATA.push(newNote);
    NOTES_BY_ID.set(newNote.id, newNote);
    
    const existingNotes = NOTES_BY_PATIENT.get(newNote.patientId) || [];
    NOTES_BY_PATIENT.set(newNote.patientId, [...existingNotes, newNote]);
    
    return newNote;
};

/**
 * Actualiza una nota existente
 */
export const updateNote = async (noteId: string, updates: Partial<PatientNote>): Promise<PatientNote> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const note = NOTES_BY_ID.get(noteId);
    if (!note) {
        throw new Error("Nota no encontrada");
    }
    
    const updatedNote = { ...note, ...updates };
    
    // Actualizar en todas las estructuras de datos
    const noteIndex = NOTES_DATA.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        NOTES_DATA[noteIndex] = updatedNote;
    }
    
    NOTES_BY_ID.set(noteId, updatedNote);
    
    // Actualizar en el índice por paciente
    const patientNotes = NOTES_BY_PATIENT.get(note.patientId) || [];
    const updatedPatientNotes = patientNotes.map(n => n.id === noteId ? updatedNote : n);
    NOTES_BY_PATIENT.set(note.patientId, updatedPatientNotes);
    
    return updatedNote;
};

/**
 * Elimina una nota
 */
export const deleteNote = async (noteId: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const note = NOTES_BY_ID.get(noteId);
    if (!note) {
        throw new Error("Nota no encontrada");
    }
    
    // Eliminar de todas las estructuras de datos
    const noteIndex = NOTES_DATA.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        NOTES_DATA.splice(noteIndex, 1);
    }
    
    NOTES_BY_ID.delete(noteId);
    
    // Eliminar del índice por paciente
    const patientNotes = NOTES_BY_PATIENT.get(note.patientId) || [];
    const updatedPatientNotes = patientNotes.filter(n => n.id !== noteId);
    NOTES_BY_PATIENT.set(note.patientId, updatedPatientNotes);
    
    return true;
};

/**
 * Sube un nuevo documento para un paciente
 */
export const uploadDocument = async (docData: Omit<PatientDocument, 'id' | 'uploadDate'>): Promise<PatientDocument> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newDoc: PatientDocument = {
        id: `doc-${String(DOCUMENTS_DATA.length + 1).padStart(3, '0')}`,
        ...docData,
        uploadDate: new Date().toISOString().split('T')[0]
    };
    
    // Agregar a los datos y actualizar índices
    DOCUMENTS_DATA.push(newDoc);
    DOCUMENTS_BY_ID.set(newDoc.id, newDoc);
    
    const existingDocs = DOCUMENTS_BY_PATIENT.get(newDoc.patientId) || [];
    DOCUMENTS_BY_PATIENT.set(newDoc.patientId, [...existingDocs, newDoc]);
    
    return newDoc;
};

/**
 * Elimina un documento
 */
export const deleteDocument = async (docId: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doc = DOCUMENTS_BY_ID.get(docId);
    if (!doc) {
        throw new Error("Documento no encontrado");
    }
    
    // Eliminar de todas las estructuras de datos
    const docIndex = DOCUMENTS_DATA.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        DOCUMENTS_DATA.splice(docIndex, 1);
    }
    
    DOCUMENTS_BY_ID.delete(docId);
    
    // Eliminar del índice por paciente
    const patientDocs = DOCUMENTS_BY_PATIENT.get(doc.patientId) || [];
    const updatedPatientDocs = patientDocs.filter(d => d.id !== docId);
    DOCUMENTS_BY_PATIENT.set(doc.patientId, updatedPatientDocs);
    
    return true;
};
