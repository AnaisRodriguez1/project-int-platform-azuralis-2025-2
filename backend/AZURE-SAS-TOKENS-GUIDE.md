# 🔐 Guía de SAS Tokens para Azure Blob Storage

## 🚨 Problema Resuelto

### ❌ **Antes: Error al abrir archivos**
```xml
<Error>
  <Code>PublicAccessNotPermitted</Code>
  <Message>Public access is not permitted on this storage account</Message>
</Error>
```

### ✅ **Ahora: Acceso seguro con SAS Tokens**
Los archivos se pueden abrir sin problemas usando URLs temporales con firma digital.

---

## 📚 ¿Qué son los SAS Tokens?

**SAS (Shared Access Signature)** es un token de acceso temporal que permite acceder a recursos de Azure de forma segura sin hacer el contenedor público.

### Beneficios:
- 🔒 **Seguridad:** El contenedor permanece privado
- ⏰ **Temporal:** Los enlaces expiran automáticamente
- 🎯 **Granular:** Puedes dar solo permisos de lectura
- 📊 **Auditable:** Azure registra todos los accesos

---

## 🛠️ Cómo Funciona

### 1. Usuario hace clic en "Ver Documento"
```typescript
// Frontend: PatientRecord.tsx o EditablePatientRecord.tsx
const handleOpenDocument = async (docId: string) => {
  const { url } = await apiService.documents.getDownloadUrl(docId);
  window.open(url, "_blank");
};
```

### 2. Frontend solicita URL temporal
```typescript
// Frontend: api.ts
getDownloadUrl: async (id: string) => {
  const { data } = await api.get(`/patient-documents/${id}/download-url`);
  return data;
}
```

### 3. Backend genera SAS Token
```typescript
// Backend: patient-documents.service.ts
async generateDownloadUrl(id: string) {
  const doc = await this.docsRepo.findOne({ where: { id } });
  const fileName = this.azureStorageService.extractFileNameFromUrl(doc.url);
  const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 60);
  
  return {
    id: doc.id,
    fileName: doc.title,
    url: sasUrl, // URL con SAS token
    expiresIn: 60, // minutos
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  };
}
```

### 4. Azure genera URL firmada
```typescript
// Backend: azure-storage.service.ts
async generateSasUrl(blobName: string, expiresInMinutes: number = 60) {
  const permissions = new BlobSASPermissions();
  permissions.read = true; // Solo lectura
  
  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
  
  const sasToken = generateBlobSASQueryParameters({
    containerName: this.containerName,
    blobName: blobName,
    permissions: permissions,
    expiresOn: expiresOn,
  }, sharedKeyCredential).toString();
  
  return `${blockBlobClient.url}?${sasToken}`;
}
```

### 5. Usuario puede ver el archivo
La URL resultante se ve así:
```
https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf?
  sv=2021-12-02&
  se=2025-10-18T12%3A56%3A46Z&
  sr=b&
  sp=r&
  sig=ABC123...
```

---

## 🔍 Estructura de un SAS Token

| Parámetro | Significado | Ejemplo |
|-----------|-------------|---------|
| `sv` | Storage Version | `2021-12-02` |
| `se` | Signed Expiry | `2025-10-18T12:56:46Z` |
| `sr` | Signed Resource | `b` (blob) |
| `sp` | Signed Permissions | `r` (read) |
| `sig` | Signature | Hash criptográfico |

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=famedstorage;AccountKey=...;EndpointSuffix=core.windows.net
```

El servicio extrae automáticamente:
- `AccountName`: `famedstorage`
- `AccountKey`: Para generar la firma criptográfica

---

## 📊 Endpoint de la API

### **GET** `/patient-documents/:id/download-url`

**Descripción:** Genera una URL temporal para acceder a un documento

**Respuesta:**
```json
{
  "id": "uuid-del-documento",
  "fileName": "Resultado de Examen",
  "url": "https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf?sv=2021-12-02&se=2025-10-18T12%3A56%3A46Z&sr=b&sp=r&sig=ABC123...",
  "expiresIn": 60,
  "expiresAt": "2025-10-18T12:56:46.000Z"
}
```

**Uso en Frontend:**
```typescript
const { url } = await apiService.documents.getDownloadUrl(docId);
window.open(url, "_blank");
```

---

## ⏰ Expiración de URLs

### Por defecto: **60 minutos**

Puedes cambiar la duración modificando el parámetro en el servicio:

```typescript
// 30 minutos
const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 30);

// 2 horas
const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 120);

// 24 horas
const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 1440);
```

### Límites de Azure:
- Máximo recomendado: **7 días**
- Después de ese tiempo, la URL deja de funcionar automáticamente

---

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas:

1. **Solo lectura:** Los SAS tokens solo tienen permiso de lectura (`sp=r`)
2. **Temporales:** Expiran automáticamente después de 1 hora
3. **Container privado:** El contenedor no es accesible públicamente
4. **Generación bajo demanda:** Solo se genera cuando el usuario lo solicita
5. **Autenticación requerida:** El endpoint requiere JWT token válido

### ⚠️ Consideraciones:

- Una vez generado, el SAS token es válido hasta que expire (no se puede revocar antes)
- Si alguien obtiene el link completo, puede usarlo hasta que expire
- Para máxima seguridad, usa duraciones cortas (15-30 minutos)

---

## 🧪 Pruebas

### 1. Subir un archivo
```bash
# Frontend: Selecciona archivo y presiona "Guardar"
# Backend: Archivo se sube a Azure con URL como:
# https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf
```

### 2. Intentar abrir directamente (❌ Falla)
```bash
curl https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf
# Error: Public access is not permitted
```

### 3. Obtener SAS URL
```bash
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://localhost:3001/patient-documents/DOC_ID/download-url
```

### 4. Abrir con SAS Token (✅ Funciona)
```bash
# Copia la URL del response anterior
curl "https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf?sv=...&sig=..."
# Descarga exitosa
```

---

## 📝 Logs de Ejemplo

### Generación exitosa:
```
🔐 SAS URL generada para: UUID/archivo.pdf (expira en 60 minutos)
```

### Error de generación:
```
❌ Error al generar SAS URL: Azure Storage no está configurado correctamente
```

---

## 🚀 Próximos Pasos (Opcional)

### 1. Cache de URLs
Para evitar generar SAS tokens repetidamente, podrías cachear URLs que aún no han expirado:

```typescript
// Ejemplo conceptual (no implementado)
const cache = new Map<string, { url: string, expiresAt: Date }>();

if (cache.has(docId) && cache.get(docId).expiresAt > new Date()) {
  return cache.get(docId);
}
```

### 2. Auditoría de accesos
Registrar cada vez que se genera un SAS token:

```typescript
await this.auditRepo.save({
  userId: currentUser.id,
  documentId: docId,
  action: 'DOWNLOAD_URL_GENERATED',
  timestamp: new Date()
});
```

### 3. Políticas de acceso
Para más control, usa **Stored Access Policies** de Azure en lugar de SAS ad-hoc.

---

## 📚 Referencias

- [Azure SAS Documentation](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [@azure/storage-blob npm](https://www.npmjs.com/package/@azure/storage-blob)
- [Best practices for SAS](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview#best-practices-when-using-sas)

---

## ✅ Resumen

| Aspecto | Solución |
|---------|----------|
| **Problema** | Azure bloqueaba acceso público a archivos |
| **Causa** | Storage Account con `allowBlobPublicAccess = false` |
| **Solución** | SAS Tokens para acceso temporal |
| **Seguridad** | Container privado + URLs firmadas |
| **Duración** | 60 minutos por defecto |
| **Permisos** | Solo lectura (`read`) |
| **Endpoint** | `GET /patient-documents/:id/download-url` |

🎉 **¡Ahora los documentos se pueden abrir sin problemas!**
