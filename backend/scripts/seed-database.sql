-- ==========================================
-- SCRIPT DE POBLACIÓN COMPLETA DE BASE DE DATOS
-- Sistema de Fichas Médicas Oncológicas AZURALIS
-- ==========================================
-- 
-- IMPORTANTE: Este script ELIMINA Y RECREA TODOS LOS DATOS
-- Incluye usuarios con RUTs válidos verificados
-- ==========================================

-- Limpiar TODOS los datos (en orden por dependencias)
DELETE FROM patient_documents;
DELETE FROM patient_notes;
DELETE FROM care_team_members;
DELETE FROM emergency_contacts;
DELETE FROM operations;
DELETE FROM patients;
DELETE FROM users;

PRINT '==========================================';
PRINT 'Base de datos limpiada completamente';
PRINT '==========================================';

-- ==========================================
-- 1. USUARIOS - DOCTORES Y ENFERMERAS
-- ==========================================

-- Password para todos: $2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy (Patient123!)

INSERT INTO users (id, name, email, password, rut, role, specialization, license, scanHistory) VALUES
-- DOCTORES
('2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza', 'carlos.mendoza@hospital.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '12.345.678-5', 'doctor', 'Oncología', 'MED-12345', NULL),
('4fcb3057-68ff-401b-b256-1d2603e3e034', 'Dra. María González', 'maria.gonzalez@hospital.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '23.456.789-6', 'doctor', 'Cirugía Oncológica', 'MED-67890', NULL);

-- ENFERMERAS
INSERT INTO users (id, name, email, password, rut, role, department, license, scanHistory) VALUES
('a47e661d-b239-4f4f-87fc-a96f4d53c549', 'Enf. Ana Pérez', 'ana.perez@hospital.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '16.789.012-1', 'nurse', 'Oncología', 'ENF-11111', NULL),
('9f97109a-9d71-4eb0-9bf1-bce6590c05cd', 'Enf. José Silva', 'jose.silva@hospital.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '17.890.123-0', 'nurse', 'Quimioterapia', 'ENF-22222', NULL);

-- ==========================================
-- 2. USUARIOS PACIENTES
-- ==========================================

INSERT INTO users (id, name, email, password, rut, role) VALUES
('080aa987-eec7-4bb3-8e5c-3b603e320d02', 'Sofía Ramírez', 'sofia.ramirez@email.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '18.234.567-9', 'patient'),
('0f517177-507f-480e-a7b4-93303295a438', 'Pedro Flores', 'pedro.flores@email.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '19.345.678-2', 'patient'),
('a1111111-1111-1111-1111-111111111111', 'Carmen López Soto', 'carmen.lopez@email.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '15.876.543-8', 'patient'),
('b2222222-2222-2222-2222-222222222222', 'Claudia Fernández Muñoz', 'claudia.fernandez@email.cl', '$2b$10$P6KNW2QkXI62032r.oYF6uSfzCNkAQAu0o.fnUGNDUV3H.h3g9oDy', '14.987.654-5', 'patient');

PRINT 'Usuarios creados exitosamente';

-- ==========================================
-- 3. PACIENTES (FICHAS MÉDICAS)
-- ==========================================

-- ==========================================
-- 2. PACIENTES (FICHAS MÉDICAS)
-- ==========================================

INSERT INTO patients (id, name, age, rut, photo, diagnosis, stage, cancerType, allergies, currentMedications, treatmentSummary, qrCode) VALUES
-- Paciente 1: Sofía Ramírez (ya existe como usuario, ahora tiene ficha completa)
('080aa987-eec7-4bb3-8e5c-3b603e320d02', 'Sofía Ramírez', 42, '18.234.567-9', NULL, 'Carcinoma ductal invasivo de mama', 'Estadio IIB', 'breast', 
 '["Penicilina", "Mariscos"]', 
 '["Tamoxifeno 20mg diario", "Letrozol 2.5mg diario", "Omeprazol 20mg"]', 
 'Paciente post-mastectomía parcial. Completó 6 ciclos de quimioterapia AC-T. Actualmente en hormonoterapia adyuvante. Próximo control mamográfico en 3 meses.', 
 'PATIENT:080aa987-eec7-4bb3-8e5c-3b603e320d02'),

-- Paciente 2: Pedro Flores (ya existe como usuario, ahora tiene ficha completa)
('0f517177-507f-480e-a7b4-93303295a438', 'Pedro Flores', 59, '19.345.678-2', NULL, 'Adenocarcinoma de colon ascendente', 'Estadio IIIC', 'colorectal',
 '[]',
 '["Capecitabina 1500mg", "Bevacizumab 5mg/kg", "Loperamida 2mg PRN"]',
 'Post-hemicolectomía derecha laparoscópica. Completó 8 ciclos FOLFOX. Actualmente en tratamiento de mantenimiento con Bevacizumab. CEA en descenso.',
 'PATIENT:0f517177-507f-480e-a7b4-93303295a438'),

-- Paciente 3: Nuevo paciente - Cáncer Gástrico
('a1111111-1111-1111-1111-111111111111', 'Carmen López Soto', 64, '15.876.543-8', NULL, 'Adenocarcinoma gástrico difuso', 'Estadio IVA', 'gastric',
 '["Contraste yodado", "Morfina"]',
 '["Cisplatino 75mg/m²", "Capecitabina 1000mg", "Metoclopramida 10mg", "Tramadol 50mg"]',
 'Paciente en quimioterapia paliativa esquema XP. Manejo del dolor con analgesia escalonada. Soporte nutricional con suplementos hipercalóricos.',
 'PATIENT:a1111111-1111-1111-1111-111111111111'),

-- Paciente 4: Nuevo paciente - Cáncer Cervicouterino
('b2222222-2222-2222-2222-222222222222', 'Claudia Fernández Muñoz', 39, '14.987.654-5', NULL, 'Carcinoma escamoso de cérvix', 'Estadio IIB', 'cervical',
 '[]',
 '["Cisplatino 40mg/m²", "Ácido fólico 5mg", "Ondansetrón 8mg", "Complejo B"]',
 'En quimiorradioterapia concurrente. Completó 22/28 sesiones de radioterapia pélvica. Tolera adecuadamente el tratamiento. Control ginecológico mensual.',
 'PATIENT:b2222222-2222-2222-2222-222222222222');


-- ==========================================
-- 3. CONTACTOS DE EMERGENCIA
-- ==========================================

INSERT INTO emergency_contacts (id, name, relationship, phone, patientId) VALUES
-- Contactos Paciente Sofía Ramírez
(NEWID(), 'Ricardo Ramírez', 'Esposo', '+56912345001', '080aa987-eec7-4bb3-8e5c-3b603e320d02'),
(NEWID(), 'Valentina Ramírez', 'Hija', '+56912345002', '080aa987-eec7-4bb3-8e5c-3b603e320d02'),

-- Contactos Paciente Pedro Flores
(NEWID(), 'Elena Flores', 'Esposa', '+56912345003', '0f517177-507f-480e-a7b4-93303295a438'),
(NEWID(), 'Diego Flores', 'Hijo', '+56912345004', '0f517177-507f-480e-a7b4-93303295a438'),

-- Contactos Paciente Carmen López
(NEWID(), 'Miguel López', 'Hermano', '+56912345005', 'a1111111-1111-1111-1111-111111111111'),
(NEWID(), 'Patricia López', 'Hermana', '+56912345006', 'a1111111-1111-1111-1111-111111111111'),

-- Contactos Paciente Claudia Fernández
(NEWID(), 'Luis Fernández', 'Esposo', '+56912345007', 'b2222222-2222-2222-2222-222222222222'),
(NEWID(), 'Sofía Fernández', 'Hija', '+56912345008', 'b2222222-2222-2222-2222-222222222222');

-- ==========================================
-- 4. OPERACIONES
-- ==========================================

INSERT INTO operations (id, date, name, description, patientId) VALUES
-- Operaciones Sofía Ramírez (Cáncer de Mama)
(NEWID(), '2024-05-15', 'Mastectomía parcial + Biopsia ganglio centinela', 'Cirugía conservadora de mama izquierda con biopsia de ganglio centinela. Procedimiento sin complicaciones realizado en Hospital Regional de Concepción.', '080aa987-eec7-4bb3-8e5c-3b603e320d02'),

-- Operaciones Pedro Flores (Cáncer Colorrectal)
(NEWID(), '2024-06-20', 'Hemicolectomía derecha laparoscópica', 'Resección laparoscópica de colon ascendente con anastomosis primaria. Procedimiento realizado en Hospital Regional de Concepción.', '0f517177-507f-480e-a7b4-93303295a438'),
(NEWID(), '2024-07-10', 'Colocación de catéter port-a-cath', 'Instalación de catéter venoso central tipo port-a-cath para administración de quimioterapia. Hospital Regional de Concepción.', '0f517177-507f-480e-a7b4-93303295a438'),

-- Operaciones Carmen López (Cáncer Gástrico)
(NEWID(), '2024-03-10', 'Gastrostomía endoscópica percutánea (PEG)', 'Colocación de sonda de gastrostomía por vía endoscópica para soporte nutricional. Hospital Regional de Concepción.', 'a1111111-1111-1111-1111-111111111111');

-- ==========================================
-- 5. EQUIPO DE CUIDADOS (CARE TEAM)
-- ==========================================

-- Paciente Sofía Ramírez (Cáncer de Mama)
INSERT INTO care_team_members (id, userId, name, role, assignedAt, status, patientId) VALUES
(NEWID(), '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza', 'oncologo_principal', '2024-05-01', 'active', '080aa987-eec7-4bb3-8e5c-3b603e320d02'),
(NEWID(), '4fcb3057-68ff-401b-b256-1d2603e3e034', 'Dra. María González', 'cirujano', '2024-05-01', 'active', '080aa987-eec7-4bb3-8e5c-3b603e320d02'),
(NEWID(), 'a47e661d-b239-4f4f-87fc-a96f4d53c549', 'Enf. Ana Pérez', 'enfermera_jefe', '2024-05-01', 'active', '080aa987-eec7-4bb3-8e5c-3b603e320d02');

-- Paciente Pedro Flores (Cáncer Colorrectal)
INSERT INTO care_team_members (id, userId, name, role, assignedAt, status, patientId) VALUES
(NEWID(), '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza', 'oncologo_principal', '2024-06-01', 'active', '0f517177-507f-480e-a7b4-93303295a438'),
(NEWID(), '4fcb3057-68ff-401b-b256-1d2603e3e034', 'Dra. María González', 'cirujano', '2024-06-01', 'active', '0f517177-507f-480e-a7b4-93303295a438'),
(NEWID(), '9f97109a-9d71-4eb0-9bf1-bce6590c05cd', 'Enf. José Silva', 'enfermera_jefe', '2024-06-01', 'active', '0f517177-507f-480e-a7b4-93303295a438');

-- Paciente Carmen López (Cáncer Gástrico)
INSERT INTO care_team_members (id, userId, name, role, assignedAt, status, patientId) VALUES
(NEWID(), '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza', 'oncologo_principal', '2024-03-01', 'active', 'a1111111-1111-1111-1111-111111111111'),
(NEWID(), 'a47e661d-b239-4f4f-87fc-a96f4d53c549', 'Enf. Ana Pérez', 'enfermera_jefe', '2024-03-01', 'active', 'a1111111-1111-1111-1111-111111111111');

-- Paciente Claudia Fernández (Cáncer Cervicouterino)
INSERT INTO care_team_members (id, userId, name, role, assignedAt, status, patientId) VALUES
(NEWID(), '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza', 'oncologo_principal', '2024-08-01', 'active', 'b2222222-2222-2222-2222-222222222222'),
(NEWID(), '9f97109a-9d71-4eb0-9bf1-bce6590c05cd', 'Enf. José Silva', 'enfermera_jefe', '2024-08-01', 'active', 'b2222222-2222-2222-2222-222222222222');

-- ==========================================
-- 6. NOTAS MÉDICAS
-- ==========================================

INSERT INTO patient_notes (id, content, createdAt, patientId, authorId, authorName) VALUES
-- Notas Sofía Ramírez
(NEWID(), 'Control Post-Operatorio: Paciente evoluciona favorablemente post-mastectomía parcial. Herida quirúrgica sin signos de infección. Inicia tratamiento hormonal con Tamoxifeno. Educación sobre efectos adversos y autoexamen.', '2024-05-25', '080aa987-eec7-4bb3-8e5c-3b603e320d02', '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza'),
(NEWID(), 'Inicio Hormonoterapia: Paciente tolera bien Tamoxifeno. Sin efectos adversos significativos. Marcadores tumorales en rango normal. Próximo control en 3 meses con mamografía bilateral.', '2024-07-10', '080aa987-eec7-4bb3-8e5c-3b603e320d02', '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza'),

-- Notas Pedro Flores
(NEWID(), 'Post-Hemicolectomía: Paciente post-operatorio inmediato sin complicaciones. Tránsito intestinal restaurado. Se inicia preparación para quimioterapia adyuvante FOLFOX.', '2024-06-25', '0f517177-507f-480e-a7b4-93303295a438', '4fcb3057-68ff-401b-b256-1d2603e3e034', 'Dra. María González'),
(NEWID(), 'Ciclo 4 FOLFOX: Paciente completó ciclo 4 de FOLFOX. Tolera adecuadamente quimioterapia. Neuropatía periférica grado 1. CEA: 12.5 ng/ml (previo: 45 ng/ml). Respuesta favorable al tratamiento.', '2024-09-15', '0f517177-507f-480e-a7b4-93303295a438', '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza'),

-- Notas Carmen López
(NEWID(), 'Evaluación Inicial: Paciente con adenocarcinoma gástrico estadio IVA. Metástasis peritoneales. Se propone quimioterapia paliativa esquema XP. Colocada gastrostomía para soporte nutricional. Manejo integral del dolor iniciado.', '2024-03-15', 'a1111111-1111-1111-1111-111111111111', '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza'),
(NEWID(), 'Control Paliativo: Paciente con dolor controlado con Tramadol. Alimentación por gastrostomía sin complicaciones. Familia informada sobre pronóstico. Soporte psicológico iniciado. Manejo multidisciplinario activo.', '2024-08-20', 'a1111111-1111-1111-1111-111111111111', 'a47e661d-b239-4f4f-87fc-a96f4d53c549', 'Enf. Ana Pérez'),

-- Notas Claudia Fernández
(NEWID(), 'Sesión 22 Radioterapia: Paciente tolera bien quimiorradioterapia concurrente. Radiodermatitis grado 2 en región pélvica, se indica crema protectora y analgesia. Restan 6 sesiones. Evolución favorable al tratamiento combinado.', '2024-09-25', 'b2222222-2222-2222-2222-222222222222', '2f7f5f73-3592-419b-b97d-fdcde91ffb43', 'Dr. Carlos Mendoza');

-- ==========================================
-- 7. DOCUMENTOS MÉDICOS
-- ==========================================

INSERT INTO patient_documents (id, title, type, url, uploadDate, patientId, uploaderId) VALUES
-- Documentos Sofía Ramírez
(NEWID(), 'Mamografía Bilateral - BIRADS 5', 'examen', 'https://azuralis-docs.blob.core.windows.net/sofia/mamografia-2024-04.pdf', '2024-04-10', '080aa987-eec7-4bb3-8e5c-3b603e320d02', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'Biopsia Core - Carcinoma ductal invasivo grado II', 'examen', 'https://azuralis-docs.blob.core.windows.net/sofia/biopsia-2024-04.pdf', '2024-04-15', '080aa987-eec7-4bb3-8e5c-3b603e320d02', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'Protocolo Quirúrgico Mastectomía', 'cirugia', 'https://azuralis-docs.blob.core.windows.net/sofia/protocolo-cx-2024-05.pdf', '2024-05-15', '080aa987-eec7-4bb3-8e5c-3b603e320d02', '4fcb3057-68ff-401b-b256-1d2603e3e034'),

-- Documentos Pedro Flores
(NEWID(), 'Colonoscopía - Lesión estenosante colon ascendente', 'examen', 'https://azuralis-docs.blob.core.windows.net/pedro/colonoscopia-2024-05.pdf', '2024-05-20', '0f517177-507f-480e-a7b4-93303295a438', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'TAC Abdomen-Pelvis - Estadificación T3N2M0', 'examen', 'https://azuralis-docs.blob.core.windows.net/pedro/tac-2024-06.pdf', '2024-06-05', '0f517177-507f-480e-a7b4-93303295a438', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'Protocolo FOLFOX - 12 ciclos', 'quimioterapia', 'https://azuralis-docs.blob.core.windows.net/pedro/protocolo-folfox.pdf', '2024-07-20', '0f517177-507f-480e-a7b4-93303295a438', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),

-- Documentos Carmen López
(NEWID(), 'Endoscopía Digestiva Alta - Adenocarcinoma gástrico', 'examen', 'https://azuralis-docs.blob.core.windows.net/carmen/endoscopia-2024-02.pdf', '2024-02-20', 'a1111111-1111-1111-1111-111111111111', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'TAC Tórax-Abdomen-Pelvis - Metástasis peritoneales', 'examen', 'https://azuralis-docs.blob.core.windows.net/carmen/tac-2024-03.pdf', '2024-03-01', 'a1111111-1111-1111-1111-111111111111', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),

-- Documentos Claudia Fernández
(NEWID(), 'RNM Pelvis - Carcinoma escamoso cérvix IIB', 'examen', 'https://azuralis-docs.blob.core.windows.net/claudia/rnm-2024-07.pdf', '2024-07-15', 'b2222222-2222-2222-2222-222222222222', '2f7f5f73-3592-419b-b97d-fdcde91ffb43'),
(NEWID(), 'Plan Radioterapia - 28 sesiones + quimio concurrente', 'radioterapia', 'https://azuralis-docs.blob.core.windows.net/claudia/plan-rt-2024-08.pdf', '2024-08-01', 'b2222222-2222-2222-2222-222222222222', '2f7f5f73-3592-419b-b97d-fdcde91ffb43');

-- ==========================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==========================================

DECLARE @UserCount INT = (SELECT COUNT(*) FROM users);
DECLARE @PatientCount INT = (SELECT COUNT(*) FROM patients);
DECLARE @ContactCount INT = (SELECT COUNT(*) FROM emergency_contacts);
DECLARE @OperationCount INT = (SELECT COUNT(*) FROM operations);
DECLARE @CareTeamCount INT = (SELECT COUNT(*) FROM care_team_members);
DECLARE @NoteCount INT = (SELECT COUNT(*) FROM patient_notes);
DECLARE @DocumentCount INT = (SELECT COUNT(*) FROM patient_documents);

PRINT '==========================================';
PRINT 'RESUMEN DE DATOS - AZURALIS';
PRINT '==========================================';
PRINT 'Usuarios: ' + CAST(@UserCount AS VARCHAR);
PRINT 'Pacientes: ' + CAST(@PatientCount AS VARCHAR);
PRINT 'Contactos de Emergencia: ' + CAST(@ContactCount AS VARCHAR);
PRINT 'Operaciones: ' + CAST(@OperationCount AS VARCHAR);
PRINT 'Equipo de Cuidados: ' + CAST(@CareTeamCount AS VARCHAR);
PRINT 'Notas Médicas: ' + CAST(@NoteCount AS VARCHAR);
PRINT 'Documentos: ' + CAST(@DocumentCount AS VARCHAR);
PRINT '==========================================';
PRINT 'SCRIPT COMPLETADO EXITOSAMENTE';
PRINT '==========================================';

-- ==========================================
-- CREDENCIALES DE ACCESO
-- ==========================================
-- TODOS los usuarios tienen la misma contraseña: Patient123!
--
-- DOCTORES:
-- Dr. Carlos Mendoza - carlos.mendoza@hospital.cl / Patient123! - RUT: 12.345.678-5
-- Dra. María González - maria.gonzalez@hospital.cl / Patient123! - RUT: 23.456.789-6
-- 
-- ENFERMERAS:
-- Enf. Ana Pérez - ana.perez@hospital.cl / Patient123! - RUT: 16.789.012-1
-- Enf. José Silva - jose.silva@hospital.cl / Patient123! - RUT: 17.890.123-0
-- 
-- PACIENTES:
-- Sofía Ramírez - sofia.ramirez@email.cl / Patient123! - RUT: 18.234.567-9
-- Pedro Flores - pedro.flores@email.cl / Patient123! - RUT: 19.345.678-2
-- Carmen López - carmen.lopez@email.cl / Patient123! - RUT: 15.876.543-8
-- Claudia Fernández - claudia.fernandez@email.cl / Patient123! - RUT: 14.987.654-5
-- ==========================================
