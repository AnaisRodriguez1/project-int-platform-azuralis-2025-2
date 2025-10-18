-- Script para verificar las URLs de documentos en la base de datos

-- Ver todos los documentos con sus URLs
SELECT 
    id,
    title,
    type,
    url,
    patientId,
    uploadDate
FROM patient_documents
ORDER BY uploadDate DESC;

-- Verificar el formato de las URLs
-- Formato esperado: https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf
-- Ejemplo: https://famedstorage.blob.core.windows.net/patient-documents/1760788598979-148x1eb.pdf

-- Si las URLs NO tienen el formato UUID/archivo.pdf, hay un problema

-- Ver solo las URLs
SELECT url FROM patient_documents;
