# Azure Blob Storage - Configuración para Documentos de Pacientes

## 📋 Descripción

Este sistema permite a los usuarios subir documentos médicos (recetas, exámenes, informes, etc.) que se almacenan en **Azure Blob Storage** y la URL se guarda en la base de datos.

## 🔧 Configuración

### 1. Variables de Entorno

Asegúrate de tener la siguiente variable en tu archivo `.env`:

```env
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=azuralisdocs;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net"
```

**Importante:** La cadena de conexión debe incluir:
- `DefaultEndpointsProtocol=https`
- `AccountName` (nombre de tu cuenta de Storage)
- `AccountKey` (clave de acceso)
- `EndpointSuffix=core.windows.net`

### 2. Crear la Cuenta de Azure Storage

Si aún no tienes una cuenta de Azure Storage:

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Busca "Storage accounts" y crea una nueva
3. Configura:
   - **Nombre:** azuralisdocs (o el que prefieras)
   - **Región:** Chile Central o la más cercana
   - **Performance:** Standard
   - **Redundancy:** LRS (Locally-redundant storage) para desarrollo
4. Una vez creada, ve a "Access keys" y copia la Connection String

### 3. Crear el Contenedor

El contenedor `patient-documents` se crea automáticamente cuando inicias la aplicación, pero también puedes crearlo manualmente:

1. En tu Storage Account, ve a "Containers"
2. Crea un nuevo contenedor llamado `patient-documents`
3. Configura el nivel de acceso como **Blob** (acceso público anónimo a los blobs)

## 🏗️ Arquitectura

### Backend (NestJS)

```
src/
├── shared/
│   └── services/
│       └── azure-storage.service.ts    # Servicio para manejar Azure Storage
└── patients/
    ├── documents/
    │   ├── patient-documents.controller.ts  # Recibe archivos
    │   └── patient-documents.service.ts     # Sube a Azure y guarda en DB
    └── entities/
        └── patient-document.entity.ts       # Almacena la URL de Azure
```

### Flujo de Subida de Documentos

1. **Frontend:** Usuario selecciona un archivo
2. **Frontend:** Se envía como `FormData` con el archivo y metadatos
3. **Backend Controller:** Recibe el archivo usando `@UseInterceptors(FileInterceptor('file'))`
4. **Azure Storage Service:** Sube el archivo a Azure Blob Storage
5. **Backend Service:** Guarda la URL pública en la base de datos
6. **Frontend:** Muestra el documento usando la URL de Azure

### Flujo de Eliminación de Documentos

1. **Frontend:** Usuario solicita eliminar un documento
2. **Backend Service:** 
   - Obtiene la URL del documento desde la DB
   - Elimina el archivo de Azure Storage
   - Elimina el registro de la DB
3. **Frontend:** Actualiza la lista de documentos

## 📝 Uso en el Código

### Subir un Documento

```typescript
// Frontend (React)
const file = event.target.files[0];
await apiService.documents.create({
  title: 'Mi Receta',
  type: 'receta',
  patientId: 'PATIENT_ID',
  uploaderId: user.id,
}, file);
```

### Eliminar un Documento

```typescript
// Frontend (React)
await apiService.documents.delete(documentId);
```

El servicio automáticamente:
- Elimina el archivo de Azure Storage
- Elimina el registro de la base de datos

## 🔒 Seguridad

- Los archivos se almacenan con nombres únicos: `{patientId}/{timestamp}-{random}.{ext}`
- Solo usuarios autenticados pueden subir documentos
- Solo el uploader, doctores y enfermeras pueden eliminar documentos
- La conexión a Azure usa HTTPS

## 📦 Estructura de Archivos en Azure

```
patient-documents/
├── RUT-PACIENTE-1/
│   ├── 1634567890123-abc123.pdf
│   ├── 1634567890456-def456.jpg
│   └── ...
├── RUT-PACIENTE-2/
│   └── ...
```

## 🚀 Validaciones

### Tipos de Archivo Permitidos
- Imágenes: JPG, JPEG, PNG, GIF
- Documentos: PDF

### Tamaño Máximo
- **10 MB** por archivo

## 🐛 Troubleshooting

### Error: "Azure Storage no está configurado"
- Verifica que la variable `AZURE_STORAGE_CONNECTION_STRING` esté en el `.env`
- Reinicia el servidor del backend

### Error: "Error al subir el archivo"
- Verifica que el contenedor `patient-documents` exista
- Verifica que la cuenta de Storage tenga acceso público habilitado
- Revisa los logs del servidor para más detalles

### Las imágenes no se cargan
- Verifica que el nivel de acceso del contenedor sea **Blob**
- Verifica que la URL en la base de datos sea correcta
- Prueba acceder directamente a la URL desde el navegador

## 📊 Monitoreo

Puedes ver los archivos subidos en:
1. Portal de Azure → Tu Storage Account → Containers → patient-documents
2. Usa Azure Storage Explorer para una mejor visualización

## 💰 Costos

Azure Storage es muy económico:
- **Almacenamiento:** ~$0.02 USD por GB/mes
- **Transacciones:** ~$0.01 USD por 10,000 operaciones
- Para un MVP con ~100 usuarios y 1GB de archivos: **~$2-5 USD/mes**

## 🔄 Migración de Datos Existentes

Si ya tienes documentos con URLs de Unsplash o mock data:

```sql
-- Eliminar documentos de prueba
DELETE FROM patient_documents 
WHERE url LIKE '%unsplash%' OR url LIKE '%mock%';
```

Los usuarios tendrán que volver a subir sus documentos reales.
