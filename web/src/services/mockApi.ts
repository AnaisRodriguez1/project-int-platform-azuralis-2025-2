import type { User, Patient, DoctorUser, PatientUser, GuardianUser, NurseUser } from "@/types/medical";

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
        assignedDoctor: "Dr. Juan Pérez",
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
        assignedDoctor: "Dr. Juan Pérez",
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
        assignedDoctor: "Dr. Juan Pérez",
        qrCode: "QR-p003-2024"
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
    } as GuardianUser
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
