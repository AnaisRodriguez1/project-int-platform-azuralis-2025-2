# 🎨 Personalización de Color + 📸 Optimización de Imágenes

## 📋 Resumen de Cambios

### 1️⃣ **Personalización de Color por Paciente**
Permite que cada paciente elija el color de su aplicación, independiente de su tipo de cáncer.

### 2️⃣ **Optimización Automática de Imágenes**
Todas las imágenes se optimizan automáticamente antes de subirlas:
- ✅ Compresión inteligente
- ✅ Conversión a formato WebP (más eficiente)
- ✅ Redimensionamiento automático
- ✅ Reducción de hasta 70-80% del tamaño

---

## 🗄️ Cambios en Base de Datos

### Nueva Columna: `selectedColor`

**Ejecutar en Supabase SQL Editor:**

```sql
-- Agregar columna para color personalizado
ALTER TABLE patients 
ADD COLUMN "selectedColor" varchar(50);

-- (Opcional) Establecer color por defecto
UPDATE patients 
SET "selectedColor" = "cancerType"
WHERE "selectedColor" IS NULL;
```

**Archivo SQL:** `backend/scripts/add_selectedcolor_column.sql`

---

## 🎨 Cómo Funciona la Personalización

### Backend
- **Entidad:** `patient.entity.ts` - Nueva columna `selectedColor?: CancerType`
- **DTO:** `create-patient.dto.ts` - Validación con `@IsEnum(CancerType)`
- **API:** El endpoint `PATCH /patients/:id` acepta `selectedColor`

### Frontend
- **Tipo:** `medical.ts` - Interface `Patient` incluye `selectedColor?: CancerType`
- **Componente:** `EditableProfile.tsx` - Selector de color interactivo
- **Lógica:** Usa `patient.selectedColor || patient.cancerType` para mostrar el color

### Ejemplo de Uso
```typescript
// El paciente tiene cáncer de mama (rosa) pero prefiere el color azul (próstata)
const patient = {
  cancerType: 'breast',      // Rosa (#ec4899)
  selectedColor: 'prostate'  // Azul (#3b82f6)
};

// La app mostrará azul en lugar de rosa
const currentColor = cancerColors[patient.selectedColor || patient.cancerType];
```

---

## 📸 Optimización de Imágenes

### Nuevas Utilidades
**Archivo:** `web/src/common/helpers/ImageOptimizer.ts`

#### Funciones Disponibles

1. **`optimizeImage(file, options)`** - Función general
   ```typescript
   const optimized = await optimizeImage(file, {
     maxWidth: 1024,
     maxHeight: 1024,
     quality: 0.85,
     format: 'webp'
   });
   ```

2. **`optimizeProfilePicture(file)`** - Para fotos de perfil
   ```typescript
   // 512x512px, calidad 90%, formato WebP
   const optimized = await optimizeProfilePicture(file);
   ```

3. **`optimizeMedicalDocument(file)`** - Para documentos médicos
   ```typescript
   // 1920x1920px, calidad 85%, formato WebP
   const optimized = await optimizeMedicalDocument(file);
   ```

### Componentes Actualizados

1. **`EditableProfile.tsx`**
   - Las fotos de perfil se optimizan a 512x512px, WebP, 90% calidad
   - Reducción típica: 2-3 MB → 100-200 KB

2. **`EditablePatientRecord.tsx`**
   - Los documentos médicos (imágenes) se optimizan a 1920x1920px, WebP, 85% calidad
   - PDFs se suben sin modificar
   - Reducción típica: 5-10 MB → 500KB - 1.5MB

### Ejemplo de Logs
```
📸 Imagen original: 2.45 MB
✨ Imagen optimizada: 187.23 KB
✅ Foto de perfil actualizada correctamente
```

---

## 🎯 Beneficios

### Personalización de Color
- ✅ Mejor experiencia de usuario
- ✅ Permite personalización sin cambiar datos médicos
- ✅ Mantiene coherencia visual
- ✅ Color predeterminado basado en diagnóstico

### Optimización de Imágenes
- ✅ **Ahorro de almacenamiento:** Hasta 80% menos espacio en R2
- ✅ **Carga más rápida:** Imágenes pesan mucho menos
- ✅ **Ahorro de ancho de banda:** Menos datos transferidos
- ✅ **Mejor rendimiento:** App más ágil y responsiva
- ✅ **Formato moderno:** WebP soportado en todos los navegadores actuales

---

## 🧪 Cómo Probar

### Personalización de Color
1. Iniciar sesión como paciente
2. Ir a "Mi Perfil"
3. Scroll hasta "Personalización de Color"
4. Click en cualquier color
5. El cambio se guarda automáticamente
6. Toda la app se actualiza con el nuevo color

### Optimización de Imágenes
1. Subir una foto de perfil o documento médico
2. Revisar la consola del navegador (F12)
3. Ver los logs de optimización:
   ```
   📸 Imagen original: X.XX MB
   ✨ Imagen optimizada: XXX.XX KB
   ```
4. Verificar que la imagen se vea bien después de subir

---

## 🔧 Migración de Base de Datos

### Opción 1: SQL Manual (Recomendado)
```bash
# 1. Ir a Supabase Dashboard > SQL Editor
# 2. Ejecutar: backend/scripts/add_selectedcolor_column.sql
```

### Opción 2: TypeORM Synchronize
```typescript
// En app.module.ts, temporalmente cambiar:
synchronize: true  // Solo en desarrollo

// Luego ejecutar:
npm run start:prod

// Cambiar de vuelta a:
synchronize: false
```

---

## 📦 Archivos Modificados

### Backend
- ✅ `src/patients/entities/patient.entity.ts`
- ✅ `src/patients/dto/create-patient.dto.ts`
- ✅ `scripts/add_selectedcolor_column.sql` (nuevo)

### Frontend
- ✅ `src/types/medical.ts`
- ✅ `src/pages/Patient/EditableProfile.tsx`
- ✅ `src/components/EditablePatientRecord.tsx`
- ✅ `src/common/helpers/ImageOptimizer.ts` (nuevo)

---

## ⚠️ Notas Importantes

### Compatibilidad de WebP
- ✅ Chrome, Edge, Firefox, Safari (iOS 14+)
- ✅ Soportado en 95%+ de navegadores actuales
- ⚠️ Internet Explorer no soportado (pero ya está obsoleto)

### Tamaños de Optimización
- **Fotos de perfil:** 512x512px máximo
- **Documentos médicos:** 1920x1920px máximo (preserva detalles)
- **PDFs:** No se modifican

### Calidad
- **Fotos de perfil:** 90% (casi imperceptible vs original)
- **Documentos médicos:** 85% (balance entre calidad y tamaño)

---

## 🚀 Próximos Pasos

1. ✅ Ejecutar migración SQL en Supabase
2. ✅ Rebuild del backend: `npm run build`
3. ✅ Reiniciar backend: `npm run start:prod`
4. ✅ Probar personalización de color
5. ✅ Probar subida de imágenes optimizadas
6. ✅ Verificar logs en consola
7. ✅ Validar que las imágenes se vean correctamente

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs del backend
2. Revisa la consola del navegador (F12)
3. Verifica que la columna `selectedColor` existe en Supabase
4. Asegúrate de que el backend esté actualizado
