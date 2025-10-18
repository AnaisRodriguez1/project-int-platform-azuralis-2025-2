# 🐛 Error: BlobNotFound - El archivo no existe en Azure

## 🚨 Error Actual

```xml
<Error>
  <Code>BlobNotFound</Code>
  <Message>The specified blob does not exist.</Message>
</Error>
```

---

## 🔍 Causa del Problema

El método `extractFileNameFromUrl()` estaba extrayendo **solo el nombre del archivo** (ej: `archivo.pdf`) en lugar del **path completo** (ej: `UUID/archivo.pdf`).

### ❌ Antes:
```typescript
extractFileNameFromUrl(url: string) {
  const pathParts = urlObj.pathname.split('/');
  return pathParts[pathParts.length - 1]; // Solo último elemento
}
```

Si la URL era:
```
https://famedstorage.blob.core.windows.net/patient-documents/1760788598979-148x1eb.pdf
```

Extraía: `1760788598979-148x1eb.pdf` ✅ (correcto, sin subdirectorio)

Pero si la URL era:
```
https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf
```

Extraía: `archivo.pdf` ❌ (incorrecto, falta UUID/)

---

## ✅ Solución Implementada

### Nuevo Método:
```typescript
extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Encontrar el índice del container
    const containerIndex = pathParts.indexOf(this.containerName);
    
    if (containerIndex === -1) {
      console.error('❌ No se encontró el container en la URL:', url);
      return null;
    }
    
    // Retornar TODO después del container
    const blobPath = pathParts.slice(containerIndex + 1).join('/');
    console.log('📁 Blob path extraído:', blobPath);
    return blobPath;
  } catch (error) {
    console.error('❌ Error al extraer nombre del archivo:', error);
    return null;
  }
}
```

### Ejemplo:
```
URL: https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf

pathParts = ['', 'patient-documents', 'UUID', 'archivo.pdf']
containerIndex = 1 (posición de 'patient-documents')
blobPath = pathParts.slice(2).join('/') = 'UUID/archivo.pdf' ✅
```

---

## 🧪 Cómo Verificar

### 1. Reinicia el backend
```bash
cd backend
npm run start:dev
```

### 2. Intenta abrir un documento
- Abre la consola del navegador (F12)
- Ve a la ficha de paciente
- Click en "Ver Documento"

### 3. Verifica los logs en el backend:
```
🔍 Generando URL de descarga para documento: abc-123-uuid
📄 Documento encontrado: { id: '...', title: '...', url: 'https://...' }
📁 Blob path extraído: UUID/archivo.pdf
🔐 SAS URL generada para: UUID/archivo.pdf (expira en 60 minutos)
✅ SAS URL generada exitosamente
```

### 4. Verifica los logs en el frontend:
```
📄 Solicitando URL para documento: abc-123-uuid
✅ URL con SAS token obtenida: https://famedstorage.blob.core.windows.net/...
✅ Documento abierto en nueva pestaña
```

---

## 🔍 Diagnóstico Adicional

### Verificar URLs en la Base de Datos

Ejecuta este query en tu base de datos:
```sql
SELECT id, title, url 
FROM patient_documents 
ORDER BY uploadDate DESC;
```

Las URLs deberían verse así:

**✅ Formato Correcto (sin subdirectorio):**
```
https://famedstorage.blob.core.windows.net/patient-documents/1760788598979-148x1eb.pdf
```

**✅ Formato Correcto (con subdirectorio):**
```
https://famedstorage.blob.core.windows.net/patient-documents/UUID/archivo.pdf
```

**❌ Formato Incorrecto:**
```
https://famedstorage.blob.core.windows.net/patient-documents
(sin nombre de archivo)
```

---

## 🔧 Si el Problema Persiste

### Opción 1: Verificar el Archivo en Azure Portal

1. Ve a https://portal.azure.com
2. Busca "famedstorage"
3. Ve a Containers → patient-documents
4. **Copia el nombre exacto del blob** (incluye todo el path)
5. Ejemplo: `1760788598979-148x1eb.pdf` o `UUID/archivo.pdf`

### Opción 2: Probar Manualmente la URL con SAS

```bash
# En PowerShell:
$url = "URL_COMPLETA_AQUI"
Invoke-WebRequest -Uri $url -OutFile "test.pdf"
```

Si esto funciona, el problema está en el código de extracción.
Si esto falla, el archivo realmente no existe en Azure.

---

## 📝 Logs Mejorados

Ahora el sistema muestra:

### Backend:
```
🔍 Generando URL de descarga para documento: [docId]
📄 Documento encontrado: { id, title, url }
📁 Blob path extraído: [blobPath]
🔐 SAS URL generada para: [blobPath] (expira en 60 minutos)
✅ SAS URL generada exitosamente
```

### En caso de error:
```
❌ No se encontró el container en la URL: [url]
❌ Error al extraer nombre del archivo: [error]
❌ Error al generar URL de descarga: [error]
❌ Stack: [stackTrace]
```

---

## 🎯 Próximos Pasos

1. **Reinicia el backend** para que los cambios tomen efecto
2. **Intenta abrir un documento** desde la app
3. **Revisa los logs** en la terminal del backend
4. **Si sigue fallando**, copia el log completo y lo revisamos

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Extracción | Solo último elemento | Path completo desde container |
| Logs | Básicos | Detallados con cada paso |
| Manejo de errores | Silencioso | Explicativo con stack trace |
| Compatibilidad | Solo archivos sin subdirectorio | Con y sin subdirectorio |

---

**Estado:** ✅ Código actualizado, esperando reinicio del backend para probar
