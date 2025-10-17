# 🏗️ ARQUITECTURA DE DATOS - AZURALIS

Este documento explica la arquitectura de datos entre el frontend (TypeScript) y el backend (NestJS + Azure SQL).

---

## 📊 SEPARACIÓN DE RESPONSABILIDADES

### Tabla `users` - Información de Autenticación
**Propósito**: Almacenar credenciales y datos básicos de TODOS los usuarios del sistema.

**Campos principales**:
- `id`: UUID único
- `name`: Nombre completo
- `email`: Email (único, para login)
- `password`: Contraseña hasheada con bcrypt
- `rut`: RUT chileno (único, formato: 12.345.678-9)
- `role`: Tipo de usuario (`patient`, `doctor`, `nurse`, `guardian`)

**Campos específicos por rol**:
- **Doctor**: `specialization`, `license`, `assignedPatients`
- **Nurse**: `department`, `license`, `assignedPatients`
- **Guardian**: `patientIds` (lista de pacientes a cargo)
- **Patient**: `patientId` (vínculo con tabla `patients`)

### Tabla `patients` - Información Médica de Pacientes
**Propósito**: Almacenar el historial médico completo y datos clínicos de pacientes.

**Campos principales**:
```typescript
{
  id: string;              // UUID único
  name: string;            // Nombre completo (puede diferir de user.name)
  age: number;             // Edad
  rut: string;             // RUT (ÚNICO, vincula con users.rut)
  photo?: string;          // URL de foto de perfil
  diagnosis: string;       // Diagnóstico principal
  stage: string;           // Etapa del cáncer (ej: "Etapa II")
  cancerType: CancerType;  // Tipo de cáncer (enum)
  allergies: string[];     // Array de alergias
  currentMedications: string[];  // Array de medicamentos actuales
  treatmentSummary: string;      // Resumen de tratamiento
  qrCode: string;          // Identificador del QR (formato: "PATIENT:{uuid}")
}
```

**Relaciones OneToMany**:
- `emergencyContacts`: Contactos de emergencia
- `operations`: Historial de cirugías
- `careTeam`: Equipo médico asignado
- `notes`: Notas clínicas
- `documents`: Documentos médicos

---

## 🔄 FLUJO DE ONBOARDING

### 1. Usuario se Registra
```typescript
POST /auth/register
Body: {
  name: "Sofía Ramírez",
  email: "sofia.ramirez@email.cl",
  password: "Patient123!",
  rut: "56.789.012-3",
  role: "patient"
}
```
**Resultado**: Se crea registro en tabla `users` con `patientId = null`

### 2. Usuario Inicia Sesión
```typescript
POST /auth/login
Body: {
  email: "sofia.ramirez@email.cl",
  password: "Patient123!"
}
```
**Resultado**: JWT token generado, usuario autenticado

### 3. Frontend Detecta Falta de Datos Médicos
```typescript
// En Home.tsx
const patients = await apiService.patients.getAll();
const patient = patients.find(p => p.rut === user.rut);

if (!patient) {
  // Mostrar formulario de onboarding
  return <CompleteProfileForm onComplete={handleProfileComplete} />;
}
```

### 4. Usuario Completa Onboarding
```typescript
POST /patients
Body: {
  name: "Sofía Ramírez",
  rut: "56.789.012-3",  // Mismo RUT del user
  age: 45,
  diagnosis: "Cáncer de Mama",
  stage: "Etapa II",
  cancerType: "breast",
  allergies: ["Penicilina", "Ibuprofeno"],
  currentMedications: ["Tamoxifeno 20mg"],
  treatmentSummary: "Quimioterapia adyuvante..."
}
```

**Resultado**: 
- Se crea registro en tabla `patients`
- Se genera QR Code con formato `PATIENT:{uuid}`
- Backend devuelve el paciente con arrays parseados (no JSON strings)

### 5. Vinculación Automática
El frontend busca pacientes por RUT:
```typescript
const patient = patients.find(p => p.rut === user.rut);
```
Esto vincula automáticamente el `User` con el `Patient`.

---

## 🔧 CONVERSIÓN DE DATOS

### Backend → Frontend
**En Azure SQL**: Los arrays se guardan como TEXT con JSON strings:
```sql
allergies: '["Penicilina","Ibuprofeno"]'
currentMedications: '["Tamoxifeno 20mg"]'
```

**El servicio parsea automáticamente**:
```typescript
// patients.service.ts
private parsePatientData(patient: Patient): any {
  return {
    ...patient,
    allergies: JSON.parse(patient.allergies),        // → string[]
    currentMedications: JSON.parse(patient.currentMedications),  // → string[]
  };
}
```

**Frontend recibe**:
```typescript
{
  allergies: ["Penicilina", "Ibuprofeno"],
  currentMedications: ["Tamoxifeno 20mg"]
}
```

### Frontend → Backend
**Frontend envía arrays**:
```typescript
{
  allergies: ["Penicilina"],
  currentMedications: ["Paracetamol"]
}
```

**Backend convierte a JSON strings**:
```typescript
// patients.service.ts
const processedData = {
  ...createPatientDto,
  allergies: JSON.stringify(createPatientDto.allergies),  // → '["Penicilina"]'
  currentMedications: JSON.stringify(createPatientDto.currentMedications)
};
```

---

## 🎨 ALINEACIÓN CON TYPES

### Frontend (`web/src/types/medical.ts`)
```typescript
export interface Patient {
  id: string;
  name: string;
  age: number;
  rut: string;
  photo?: string;
  diagnosis: string;
  stage: string;
  cancerType: CancerType;
  allergies: string[];              // ← Array
  currentMedications: string[];     // ← Array
  emergencyContacts: EmergencyContact[];
  operations: Operation[];
  treatmentSummary: string;
  careTeam: CareTeamMember[];
  qrCode: string;
}
```

### Backend (`backend/src/patients/dto/create-patient.dto.ts`)
```typescript
export class CreatePatientDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  rut: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  diagnosis: string;

  @IsString()
  stage: string;

  @IsEnum(CancerType)
  cancerType: CancerType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];             // ← Array validado

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];    // ← Array validado

  @IsOptional()
  @IsString()
  treatmentSummary?: string;
}
```

### Backend Entity (`backend/src/patients/entities/patient.entity.ts`)
```typescript
@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ unique: true })
  rut: string;

  @Column({ nullable: true })
  photo?: string;

  @Column()
  diagnosis: string;

  @Column({ nullable: true })
  stage: string;

  @Column({ type: 'varchar', length: 50 })
  cancerType: CancerType;

  @Column('text', { nullable: true, default: '[]' })
  allergies: string;  // ← JSON string en DB, parseado en servicio

  @Column('text', { nullable: true, default: '[]' })
  currentMedications: string;  // ← JSON string en DB, parseado en servicio

  @OneToMany(() => EmergencyContact, contact => contact.patient, { cascade: true })
  emergencyContacts: EmergencyContact[];

  @OneToMany(() => Operation, operation => operation.patient, { cascade: true })
  operations: Operation[];

  @Column({ type: 'text', nullable: true })
  treatmentSummary: string;

  @OneToMany(() => CareTeamMember, ctm => ctm.patient, { cascade: true })
  careTeam: CareTeamMember[];

  @Column({ nullable: true })
  qrCode?: string;

  @OneToMany(() => PatientNote, note => note.patient, { cascade: true })
  notes?: PatientNote[];

  @OneToMany(() => PatientDocument, doc => doc.patient, { cascade: true })
  documents?: PatientDocument[];
}
```

---

## 🔐 QR CODE - GENERACIÓN DINÁMICA

### En Base de Datos
Solo se guarda el identificador:
```
qrCode: "PATIENT:a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Endpoint para Obtener QR
```typescript
GET /patients/:id/qr
```

**Respuesta**: Imagen PNG generada dinámicamente con librería `qrcode`:
```typescript
async generateQRCode(id: string): Promise<string> {
  const patient = await this.findOne(id);
  const qrData = patient.qrCode || `PATIENT:${patient.id}`;
  
  return await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });
}
```

### Uso en Frontend
```typescript
// En Home.tsx
const qrImageUrl = apiService.patients.getQRCode(patient.id);
// → "http://localhost:3000/patients/{id}/qr"

<img src={qrImageUrl} alt="QR Code del Paciente" />
```

---

## 📝 VALIDACIONES

### En el DTO (Backend)
```typescript
@IsInt()
@Min(0)
@Max(150)
age: number;  // Edad entre 0-150

@IsEnum(CancerType)
cancerType: CancerType;  // Solo valores del enum

@IsArray()
@IsString({ each: true })
allergies?: string[];  // Array de strings
```

### En el Frontend
```typescript
// CompleteProfileForm.tsx
const [formData, setFormData] = useState({
  age: '',
  diagnosis: '',
  stage: '',
  cancerType: '' as CancerType,
  allergies: '',  // CSV: "Penicilina, Ibuprofeno"
  currentMedications: '',  // CSV: "Tamoxifeno, Paracetamol"
  treatmentSummary: '',
});

// Al enviar
const patientData = {
  ...formData,
  age: parseInt(formData.age),
  allergies: formData.allergies 
    ? formData.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
    : [],
  currentMedications: formData.currentMedications 
    ? formData.currentMedications.split(',').map(m => m.trim()).filter(m => m.length > 0)
    : []
};
```

---

## 🚀 ENDPOINTS PRINCIPALES

### Autenticación
- `POST /auth/register` - Crear usuario (tabla `users`)
- `POST /auth/login` - Login y obtener JWT
- `GET /auth/me` - Obtener datos del usuario autenticado

### Pacientes (Tabla `patients`)
- `POST /patients` - **Crear paciente (onboarding)**
- `GET /patients` - Listar todos
- `GET /patients/:id` - Obtener uno por ID
- `GET /patients/:id/qr` - Generar QR dinámicamente
- `PUT /patients/:id` - Actualizar
- `DELETE /patients/:id` - Eliminar

### Notas Clínicas
- `POST /patient-notes` - Crear nota
- `GET /patient-notes` - Listar todas
- `GET /patient-notes/:id` - Obtener por ID
- `DELETE /patient-notes/:id` - Eliminar

### Documentos
- `POST /patient-documents` - Subir documento
- `GET /patient-documents` - Listar todos
- `GET /patient-documents/:id` - Obtener por ID
- `DELETE /patient-documents/:id` - Eliminar

---

## 🎯 RESUMEN CLAVE

1. **Tabla `users`**: Autenticación y datos básicos de TODOS los usuarios
2. **Tabla `patients`**: Información médica SOLO de pacientes
3. **Vinculación**: Por campo `rut` (único en ambas tablas)
4. **Onboarding**: Crea registro en `patients` después del registro en `users`
5. **Arrays**: JSON strings en DB, parseados automáticamente por el servicio
6. **QR Code**: Guardado como string "PATIENT:{id}", generado dinámicamente como imagen
7. **Validación**: DTOs con decoradores de class-validator
8. **CORS**: Configurado para puertos 5173 y 5174

---

**Última actualización**: 17 de Octubre, 2025  
**Estado**: ✅ Backend y Frontend alineados con `medical.ts`
