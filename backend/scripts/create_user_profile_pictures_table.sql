-- Script para crear la tabla user_profile_pictures
-- Ejecutar en Azure SQL Database

CREATE TABLE user_profile_pictures (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    url NVARCHAR(500) NOT NULL,
    uploadDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_user_profile_pictures_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índice para mejorar rendimiento
CREATE INDEX IX_user_profile_pictures_userId ON user_profile_pictures(userId);

-- Verificar que se creó la tabla
SELECT TABLE_NAME, TABLE_SCHEMA
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'user_profile_pictures';

PRINT 'Tabla user_profile_pictures creada exitosamente';