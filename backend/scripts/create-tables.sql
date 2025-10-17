-- Script para crear las tablas en Azure SQL Database
-- Ejecutar este script en Azure Data Studio o el portal de Azure

-- 1. Tabla de usuarios
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    rut NVARCHAR(50) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL DEFAULT 'patient',
    specialization NVARCHAR(255) NULL,
    department NVARCHAR(255) NULL,
    license NVARCHAR(255) NULL,
    assignedPatients NVARCHAR(MAX) NULL,
    patientIds NVARCHAR(MAX) NULL,
    scanHistory NVARCHAR(MAX) NULL,
    patientId NVARCHAR(255) NULL
);

-- 2. Tabla de pacientes
CREATE TABLE patients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    age INT NOT NULL,
    rut NVARCHAR(50) NOT NULL UNIQUE,
    photo NVARCHAR(500) NULL,
    diagnosis NVARCHAR(500) NOT NULL,
    stage NVARCHAR(50) NULL,
    cancerType NVARCHAR(50) NOT NULL,
    allergies NVARCHAR(MAX) NULL DEFAULT '[]',
    currentMedications NVARCHAR(MAX) NULL DEFAULT '[]',
    treatmentSummary NVARCHAR(MAX) NULL,
    qrCode NVARCHAR(500) NOT NULL
);

-- 3. Tabla de contactos de emergencia
CREATE TABLE emergency_contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    relationship NVARCHAR(100) NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    patientId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. Tabla de operaciones
CREATE TABLE operations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    date NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NULL,
    patientId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- 5. Tabla de miembros del equipo de cuidado
CREATE TABLE care_team_members (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    assignedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    status NVARCHAR(20) NOT NULL DEFAULT 'active',
    patientId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- 6. Tabla de notas de pacientes
CREATE TABLE patient_notes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    content NVARCHAR(MAX) NOT NULL,
    createdAt NVARCHAR(50) NOT NULL,
    authorId NVARCHAR(255) NOT NULL,
    authorName NVARCHAR(255) NOT NULL,
    patientId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- 7. Tabla de documentos de pacientes
CREATE TABLE patient_documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    url NVARCHAR(500) NOT NULL,
    uploadDate NVARCHAR(50) NOT NULL,
    patientId NVARCHAR(255) NOT NULL,
    uploaderId NVARCHAR(255) NOT NULL
);

-- Verificar que las tablas se crearon correctamente
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
