import type { 
    User, 
    Patient, 
    DoctorUser, 
    PatientUser, 
    GuardianUser, 
    NurseUser,
    PatientNote,
    PatientDocument
} from "@/types/medical";

// ============================================
// PACIENTES DE PRUEBA (Datos médicos completos)
// ============================================
export const MOCK_PATIENTS: Patient[] = [
    {
        id: "p001",
        name: "María González López",
        age: 45,
        rut: "12.345.678-9",
        photo: "https://i.pravatar.cc/150?img=5",
        diagnosis: "Carcinoma ductal infiltrante",
        stage: "IIA",
        cancerType: "breast",
        allergies: ["Penicilina", "Látex"],
        currentMedications: [
            "Tamoxifeno 20mg (1 vez al día)",
            "Ácido fólico 5mg",
            "Omeprazol 20mg"
        ],
        emergencyContacts: [
            {
                name: "Carlos Rodríguez",
                relationship: "Esposo",
                phone: "+56 9 8765 4321"
            },
            {
                name: "Ana González",
                relationship: "Hermana",
                phone: "+56 9 8765 1234"
            }
        ],
        operations: [
            {
                date: "2024-08-15",
                procedure: "Mastectomía parcial izquierda",
                hospital: "Hospital Regional de Antofagasta"
            },
            {
                date: "2024-09-20",
                procedure: "Biopsia de ganglio centinela",
                hospital: "Hospital Regional de Antofagasta"
            }
        ],
        treatmentSummary: "Paciente en tratamiento hormonal post-quirúrgico. Responde favorablemente a terapia con Tamoxifeno. Control trimestral programado.",
        assignedDoctor: "Dr. Juan Pérez Morales",
        qrCode: "QR-p001-2024"
    },
    {
        id: "p002",
        name: "Pedro Soto Vargas",
        age: 62,
        rut: "9.876.543-2",
        photo: "https://i.pravatar.cc/150?img=12",
        diagnosis: "Adenocarcinoma gástrico",
        stage: "IIIB",
        cancerType: "gastric",
        allergies: ["Sulfamidas"],
        currentMedications: [
            "Cisplatino (quimioterapia)",
            "Ondansetrón 8mg (antiemético)",
            "Pantoprazol 40mg"
        ],
        emergencyContacts: [
            {
                name: "Rosa Vargas",
                relationship: "Esposa",
                phone: "+56 9 7654 3210"
            }
        ],
        operations: [
            {
                date: "2024-07-10",
                procedure: "Gastrectomía subtotal",
                hospital: "Hospital Regional de Antofagasta"
            }
        ],
        treatmentSummary: "Post-gastrectomía en tratamiento quimioterápico adyuvante. Ciclo 3 de 6. Tolerancia moderada.",
        assignedDoctor: "Dr. Juan Pérez Morales",
        qrCode: "QR-p002-2024"
    },
    {
        id: "p003",
        name: "Luis Ramírez Torres",
        age: 58,
        rut: "15.234.567-8",
        photo: "https://i.pravatar.cc/150?img=33",
        diagnosis: "Adenocarcinoma de próstata",
        stage: "IIB",
        cancerType: "prostate",
        allergies: [],
        currentMedications: [
            "Leuprolide (inyección mensual)",
            "Finasteride 5mg"
        ],
        emergencyContacts: [
            {
                name: "Carmen Torres",
                relationship: "Hija",
                phone: "+56 9 6543 2109"
            }
        ],
        operations: [],
        treatmentSummary: "Bajo tratamiento hormonal. PSA en descenso. No requiere cirugía por ahora.",
        assignedDoctor: "Dr. Juan Pérez Morales",
        qrCode: "QR-p003-2024"
    },
    {
        id: "p004",
        name: "Sofía Martínez Díaz",
        age: 38,
        rut: "18.765.432-1",
        photo: "https://i.pravatar.cc/150?img=10",
        diagnosis: "Carcinoma de células escamosas",
        stage: "IB",
        cancerType: "cervical",
        allergies: ["Yodo"],
        currentMedications: [
            "Paracetamol 500mg (según necesidad)",
            "Ácido fólico 1mg"
        ],
        emergencyContacts: [
            {
                name: "Roberto Martínez",
                relationship: "Hermano",
                phone: "+56 9 5432 1098"
            }
        ],
        operations: [
            {
                date: "2024-10-05",
                procedure: "Conización cervical",
                hospital: "Hospital Regional de Antofagasta"
            }
        ],
        treatmentSummary: "Post-conización con márgenes libres. En seguimiento cada 6 meses. Pronóstico favorable.",
        assignedDoctor: "Dra. Patricia Morales Vega",
        qrCode: "QR-p004-2024"
    },
    {
        id: "p005",
        name: "Carlos Fernández Castro",
        age: 70,
        rut: "7.654.321-0",
        photo: "https://i.pravatar.cc/150?img=52",
        diagnosis: "Carcinoma pulmonar de células no pequeñas",
        stage: "IIIA",
        cancerType: "lung",
        allergies: ["Contraste yodado"],
        currentMedications: [
            "Carboplatin (quimioterapia)",
            "Paclitaxel (quimioterapia)",
            "Oxígeno suplementario según necesidad",
            "Salbutamol inhalador"
        ],
        emergencyContacts: [
            {
                name: "Elena Castro",
                relationship: "Esposa",
                phone: "+56 9 4321 0987"
            },
            {
                name: "Andrés Fernández",
                relationship: "Hijo",
                phone: "+56 9 4321 0988"
            }
        ],
        operations: [],
        treatmentSummary: "En tratamiento quimioterápico. Ciclo 2 de 4. Requiere oxigenoterapia domiciliaria. Monitoreo constante de saturación.",
        assignedDoctor: "Dra. Patricia Morales Vega",
        qrCode: "QR-p005-2024"
    }
];

// ============================================
// NOTAS DE PACIENTES (Mock Data)
// ============================================
export const MOCK_NOTES: PatientNote[] = [
    {
        id: "n001",
        title: "Efectos secundarios de Tamoxifeno",
        content: "Hoy experimenté algunos sofocos leves durante la tarde. Duró aproximadamente 15 minutos. Nada preocupante.",
        date: "2025-01-10",
        patientId: "p001",
        authorId: "u002",
        authorName: "María González López"
    },
    {
        id: "n002",
        title: "Control post-operatorio",
        content: "Cicatrización progresando adecuadamente. Sin signos de infección. Movilidad del brazo mejorando día a día.",
        date: "2025-01-08",
        patientId: "p001",
        authorId: "u001",
        authorName: "Dr. Juan Pérez Morales"
    },
    {
        id: "n003",
        title: "Náuseas después de quimioterapia",
        content: "El Ondansetrón ha ayudado, pero aún tengo náuseas leves por la mañana. Tomando líquidos frecuentemente.",
        date: "2025-01-11",
        patientId: "p002",
        authorId: "u005",
        authorName: "Pedro Soto Vargas"
    }
];

// ============================================
// DOCUMENTOS DE PACIENTES (Mock Data)
// ============================================
export const MOCK_DOCUMENTS: PatientDocument[] = [
    {
        id: "d001",
        title: "Receta - Tamoxifeno 20mg",
        type: "receta",
        url: "/mock/prescriptions/tamoxifen-p001.pdf",
        uploadDate: "2024-09-25",
        patientId: "p001",
        uploaderId: "u001",
        description: "Tratamiento hormonal post-quirúrgico"
    },
    {
        id: "d002",
        title: "Mamografía - Septiembre 2024",
        type: "examen",
        url: "/mock/results/mammography-p001-sept2024.pdf",
        uploadDate: "2024-09-15",
        patientId: "p001",
        uploaderId: "u001",
        description: "Control post-operatorio"
    },
    {
        id: "d003",
        title: "Biopsia Ganglio Centinela",
        type: "examen",
        url: "/mock/results/biopsy-p001.pdf",
        uploadDate: "2024-09-22",
        patientId: "p001",
        uploaderId: "u001",
        description: "Análisis histopatológico"
    },
    {
        id: "d004",
        title: "Consentimiento Mastectomía",
        type: "consentimiento",
        url: "/mock/consent/mastectomy-p001.pdf",
        uploadDate: "2024-08-10",
        patientId: "p001",
        uploaderId: "u001",
        description: "Consentimiento informado cirugía"
    },
    {
        id: "d005",
        title: "Informe Quirúrgico - Mastectomía Parcial",
        type: "cirugia",
        url: "/mock/surgery/mastectomy-report-p001.pdf",
        uploadDate: "2024-08-15",
        patientId: "p001",
        uploaderId: "u001",
        description: "Procedimiento quirúrgico exitoso"
    },
    {
        id: "d006",
        title: "TAC Abdominal con Contraste",
        type: "examen",
        url: "/mock/images/ct-scan-p002.jpg",
        uploadDate: "2024-07-08",
        patientId: "p002",
        uploaderId: "u001",
        description: "Estadificación pre-quirúrgica"
    },
    {
        id: "d007",
        title: "Protocolo Quimioterapia - Cisplatino",
        type: "quimioterapia",
        url: "/mock/chemo/protocol-p002.pdf",
        uploadDate: "2024-07-15",
        patientId: "p002",
        uploaderId: "u001",
        description: "Ciclo 1-6, cada 21 días"
    },
    {
        id: "d008",
        title: "Receta - Ondansetrón 8mg",
        type: "receta",
        url: "/mock/prescriptions/ondansetron-p002.pdf",
        uploadDate: "2024-08-01",
        patientId: "p002",
        uploaderId: "u001",
        description: "Antiemético para quimioterapia"
    },
    {
        id: "d009",
        title: "Informe Gastrectomía Subtotal",
        type: "cirugia",
        url: "/mock/surgery/gastrectomy-p002.pdf",
        uploadDate: "2024-07-10",
        patientId: "p002",
        uploaderId: "u001",
        description: "Resección tumoral exitosa"
    },
    {
        id: "d010",
        title: "Hemograma Control Quimioterapia",
        type: "examen",
        url: "/mock/labs/hemogram-p002.pdf",
        uploadDate: "2024-08-20",
        patientId: "p002",
        uploaderId: "u004",
        description: "Control hematológico"
    }
];

// ============================================
// USUARIOS DE PRUEBA (Tipados según rol)
// ============================================
const MOCK_USERS: User[] = [
    // Doctor
    {
        id: "u001",
        name: "Dr. Juan Pérez Morales",
        email: "doctor@ucn.cl",
        role: "doctor",
        scanHistory: [
            {
                patientId: "p001",
                scannedAt: new Date("2025-01-10T09:30:00")
            },
            {
                patientId: "p002",
                scannedAt: new Date("2025-01-10T11:15:00")
            },
            {
                patientId: "p001",
                scannedAt: new Date("2025-01-12T14:00:00")
            }
        ]
    } as DoctorUser,

    // Paciente (María González)
    {
        id: "u002",
        name: "María González López",
        email: "paciente@ucn.cl",
        role: "patient",
        patientId: "p001"
    } as PatientUser,

    // Guardian/Cuidador (Esposo de María)
    {
        id: "u003",
        name: "Carlos Rodríguez Muñoz",
        email: "guardian@ucn.cl",
        role: "guardian",
        patientIds: ["p001"] // Tiene acceso a la ficha de María
    } as GuardianUser,

    // Enfermera
    {
        id: "u004",
        name: "Ana Silva Rojas",
        email: "enfermera@ucn.cl",
        role: "nurse",
        scanHistory: [
            {
                patientId: "p002",
                scannedAt: new Date("2025-01-11T08:45:00")
            },
            {
                patientId: "p003",
                scannedAt: new Date("2025-01-11T10:30:00")
            }
        ]
    } as NurseUser,

    // Paciente adicional (Pedro Soto)
    {
        id: "u005",
        name: "Pedro Soto Vargas",
        email: "pedro.soto@ucn.cl",
        role: "patient",
        patientId: "p002"
    } as PatientUser,

    // Guardian adicional (Hija de Luis Ramírez)
    {
        id: "u006",
        name: "Carmen Torres",
        email: "carmen.torres@gmail.com",
        role: "guardian",
        patientIds: ["p003"]
    } as GuardianUser,

    // Doctora adicional
    {
        id: "u007",
        name: "Dra. Patricia Morales Vega",
        email: "patricia.morales@ucn.cl",
        role: "doctor",
        scanHistory: [
            {
                patientId: "p004",
                scannedAt: new Date("2025-01-09T10:00:00")
            },
            {
                patientId: "p005",
                scannedAt: new Date("2025-01-09T14:30:00")
            }
        ]
    } as DoctorUser,

    // Paciente adicional (Sofía Martínez)
    {
        id: "u008",
        name: "Sofía Martínez Díaz",
        email: "sofia.martinez@ucn.cl",
        role: "patient",
        patientId: "p004"
    } as PatientUser,

    // Paciente adicional (Carlos Fernández)
    {
        id: "u009",
        name: "Carlos Fernández Castro",
        email: "carlos.fernandez@ucn.cl",
        role: "patient",
        patientId: "p005"
    } as PatientUser
];

// Simula un delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
    login: async (email: string, _password: string) => {
        await delay(800); // Simula latencia de red

        // Para desarrollo, cualquier contraseña funciona (por eso _password no se usa)
        const user = MOCK_USERS.find(u => u.email === email);
        
        if (!user) {
            throw new Error("Usuario no encontrado. Usa uno de los correos de prueba.");
        }

        // Simula un token JWT (en realidad es solo un string random)
        const token = `mock-token-${user.id}-${Date.now()}`;

        return {
            token,
            user,
        };
    },

    checkAuthStatus: async (token: string) => {
        await delay(300);

        // Extraer el ID del usuario del token mock
        const userId = token.split('-')[2];
        const user = MOCK_USERS.find(u => u.id === userId);

        if (!user) {
            throw new Error("Token inválido");
        }

        return user;
    },

    register: async (userData: any) => {
        await delay(800);

        const newUserId = `u${String(MOCK_USERS.length + 1).padStart(3, '0')}`;

        // Crear usuario según su rol
        let newUser: User;

        switch (userData.role) {
            case 'patient':
                const newPatientId = `p${String(MOCK_PATIENTS.length + 1).padStart(3, '0')}`;
                newUser = {
                    id: newUserId,
                    name: userData.name,
                    email: userData.email,
                    role: 'patient',
                    patientId: newPatientId
                } as PatientUser;

                // Crear también el registro de paciente
                const newPatient: Patient = {
                    id: newPatientId,
                    name: userData.name,
                    age: userData.age || 0,
                    rut: userData.rut || "",
                    diagnosis: "Pendiente de diagnóstico",
                    stage: "N/A",
                    cancerType: "breast", // Default, se actualizará después
                    allergies: [],
                    currentMedications: [],
                    emergencyContacts: [],
                    operations: [],
                    treatmentSummary: "Paciente recién registrado",
                    assignedDoctor: "Sin asignar",
                    qrCode: `QR-${newPatientId}-2025`
                };
                MOCK_PATIENTS.push(newPatient);
                break;

            case 'guardian':
                newUser = {
                    id: newUserId,
                    name: userData.name,
                    email: userData.email,
                    role: 'guardian',
                    patientIds: []
                } as GuardianUser;
                break;

            case 'doctor':
                newUser = {
                    id: newUserId,
                    name: userData.name,
                    email: userData.email,
                    role: 'doctor',
                    scanHistory: []
                } as DoctorUser;
                break;

            case 'nurse':
                newUser = {
                    id: newUserId,
                    name: userData.name,
                    email: userData.email,
                    role: 'nurse',
                    scanHistory: []
                } as NurseUser;
                break;

            default:
                throw new Error("Rol de usuario no válido");
        }

        MOCK_USERS.push(newUser);

        return {
            message: "Usuario registrado exitosamente",
            user: newUser,
        };
    },

    // Función adicional para simular escaneo de QR
    scanPatientQR: async (userId: string, patientId: string) => {
        await delay(500);

        const user = MOCK_USERS.find(u => u.id === userId);
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);

        if (!user || !patient) {
            throw new Error("Usuario o paciente no encontrado");
        }

        if (user.role !== 'doctor' && user.role !== 'nurse') {
            throw new Error("Solo doctores y enfermeras pueden escanear QR");
        }

        // Agregar el registro de escaneo
        const scanRecord = {
            patientId,
            scannedAt: new Date()
        };

        if (user.role === 'doctor') {
            (user as DoctorUser).scanHistory = [
                ...(user as DoctorUser).scanHistory || [],
                scanRecord
            ];
        } else if (user.role === 'nurse') {
            (user as NurseUser).scanHistory = [
                ...(user as NurseUser).scanHistory || [],
                scanRecord
            ];
        }

        return {
            message: "QR escaneado exitosamente",
            patient
        };
    }
};

// ============================================
// FUNCIONES AUXILIARES - Acceso a datos mock
// ============================================

/**
 * Obtiene la lista de usuarios de prueba para mostrar en la UI de login
 */
export const getMockUsers = () => MOCK_USERS;

/**
 * Obtiene la lista de pacientes de prueba
 */
export const getMockPatients = () => MOCK_PATIENTS;

/**
 * Obtiene un paciente específico por su ID
 */
export const getPatientById = (patientId: string): Patient | undefined => {
    return MOCK_PATIENTS.find(p => p.id === patientId);
};

/**
 * Obtiene los datos del paciente asociado a un usuario
 * Útil cuando un usuario de tipo 'patient' inicia sesión
 */
export const getPatientByUserId = (userId: string): Patient | undefined => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user && user.role === 'patient') {
        return MOCK_PATIENTS.find(p => p.id === (user as PatientUser).patientId);
    }
    return undefined;
};

/**
 * Obtiene todos los pacientes a cargo de un guardian
 */
export const getPatientsByGuardian = (guardianUserId: string): Patient[] => {
    const user = MOCK_USERS.find(u => u.id === guardianUserId);
    if (user && user.role === 'guardian') {
        const patientIds = (user as GuardianUser).patientIds;
        return MOCK_PATIENTS.filter(p => patientIds.includes(p.id));
    }
    return [];
};

/**
 * Obtiene todos los pacientes asignados a un doctor
 */
export const getPatientsByDoctor = (doctorName: string): Patient[] => {
    return MOCK_PATIENTS.filter(p => p.assignedDoctor === doctorName);
};

/**
 * Obtiene todas las notas de un paciente específico
 */
export const getNotesByPatientId = (patientId: string): PatientNote[] => {
    return MOCK_NOTES.filter(n => n.patientId === patientId);
};

/**
 * Obtiene todos los documentos de un paciente específico
 */
export const getDocumentsByPatientId = (patientId: string): PatientDocument[] => {
    return MOCK_DOCUMENTS.filter(d => d.patientId === patientId);
};

/**
 * Crea una nueva nota para un paciente
 */
export const createNote = async (noteData: Omit<PatientNote, 'id' | 'date'>): Promise<PatientNote> => {
    await delay(500);
    
    const newNote: PatientNote = {
        id: `n${String(MOCK_NOTES.length + 1).padStart(3, '0')}`,
        ...noteData,
        date: new Date().toISOString().split('T')[0]
    };
    
    MOCK_NOTES.push(newNote);
    return newNote;
};

/**
 * Actualiza una nota existente
 */
export const updateNote = async (noteId: string, updates: Partial<PatientNote>): Promise<PatientNote> => {
    await delay(500);
    
    const noteIndex = MOCK_NOTES.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
        throw new Error("Nota no encontrada");
    }
    
    MOCK_NOTES[noteIndex] = { ...MOCK_NOTES[noteIndex], ...updates };
    return MOCK_NOTES[noteIndex];
};

/**
 * Elimina una nota
 */
export const deleteNote = async (noteId: string): Promise<boolean> => {
    await delay(500);
    
    const noteIndex = MOCK_NOTES.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
        throw new Error("Nota no encontrada");
    }
    
    MOCK_NOTES.splice(noteIndex, 1);
    return true;
};

/**
 * Sube un nuevo documento para un paciente
 */
export const uploadDocument = async (docData: Omit<PatientDocument, 'id' | 'uploadDate'>): Promise<PatientDocument> => {
    await delay(800);
    
    const newDoc: PatientDocument = {
        id: `d${String(MOCK_DOCUMENTS.length + 1).padStart(3, '0')}`,
        ...docData,
        uploadDate: new Date().toISOString().split('T')[0]
    };
    
    MOCK_DOCUMENTS.push(newDoc);
    return newDoc;
};

/**
 * Elimina un documento
 */
export const deleteDocument = async (docId: string): Promise<boolean> => {
    await delay(500);
    
    const docIndex = MOCK_DOCUMENTS.findIndex(d => d.id === docId);
    if (docIndex === -1) {
        throw new Error("Documento no encontrado");
    }
    
    MOCK_DOCUMENTS.splice(docIndex, 1);
    return true;
};

/**
 * Actualiza información de un paciente
 */
export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<Patient> => {
    await delay(600);
    
    const patientIndex = MOCK_PATIENTS.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
        throw new Error("Paciente no encontrado");
    }
    
    MOCK_PATIENTS[patientIndex] = { ...MOCK_PATIENTS[patientIndex], ...updates };
    return MOCK_PATIENTS[patientIndex];
};

/**
 * Busca pacientes por nombre (útil para búsquedas)
 */
export const searchPatientsByName = (query: string): Patient[] => {
    const lowerQuery = query.toLowerCase();
    return MOCK_PATIENTS.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.rut.includes(query)
    );
};

/**
 * Obtiene estadísticas generales de un paciente
 */
export const getPatientStats = (patientId: string) => {
    const notes = getNotesByPatientId(patientId);
    const documents = getDocumentsByPatientId(patientId);
    const patient = getPatientById(patientId);
    
    return {
        totalNotes: notes.length,
        totalDocuments: documents.length,
        totalMedications: patient?.currentMedications.length || 0,
        totalOperations: patient?.operations.length || 0,
        totalAllergies: patient?.allergies.length || 0,
        emergencyContactsCount: patient?.emergencyContacts.length || 0
    };
};

/**
 * Obtiene la información completa de acceso para desarrollo/debug
 */
export const getLoginCredentials = () => {
    return MOCK_USERS.map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
        password: "cualquier contraseña funciona"
    }));
};
