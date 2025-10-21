-- Script para agregar la columna 'photo' a la tabla 'users'
-- Ejecutar en Azure SQL Database

ALTER TABLE users ADD photo NVARCHAR(255) NULL;

-- Verificar que se agregó
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'photo';