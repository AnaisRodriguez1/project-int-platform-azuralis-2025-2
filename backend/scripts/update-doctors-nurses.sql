-- Script para actualizar doctores y enfermeras con información profesional

-- Actualizar Dr. Carlos Mendoza
UPDATE users 
SET 
    specialization = 'Oncología',
    license = 'MED-12345'
WHERE email = 'carlos.mendoza@hospital.cl';

-- Actualizar Dra. María González  
UPDATE users
SET
    specialization = 'Oncología Pediátrica',
    license = 'MED-23456'
WHERE email = 'maria.gonzalez@hospital.cl';

-- Actualizar Enfermera Ana Pérez
UPDATE users
SET
    department = 'Oncología',
    license = 'ENF-34567'
WHERE email = 'ana.perez@hospital.cl';

-- Actualizar Enfermero José Silva
UPDATE users
SET
    department = 'Cuidados Intensivos',
    license = 'ENF-45678'
WHERE email = 'jose.silva@hospital.cl';

-- Verificar las actualizaciones
SELECT 
    name,
    email,
    role,
    specialization,
    department,
    license
FROM users
WHERE role IN ('doctor', 'nurse')
ORDER BY role, name;
