# 🧪 Usuarios de Prueba - Mock API

Este documento lista los usuarios de prueba disponibles para desarrollo mientras el backend no esté implementado :3

## 📋 Usuarios Disponibles

### 👨‍⚕️ Doctor
- **Email:** `doctor@ucn.cl`
- **Contraseña:** cualquiera
- **Redirige a:** `/dashboard-doctor`

### 🤒 Paciente
- **Email:** `paciente@ucn.cl`
- **Contraseña:** cualquiera
- **Redirige a:** `/dashboard-patient`

### 👨‍👩‍👧 Cuidador/Guardian
- **Email:** `guardian@ucn.cl`
- **Contraseña:** cualquiera
- **Redirige a:** `/dashboard-guardian`

### 👩‍⚕️ Enfermera
- **Email:** `enfermera@ucn.cl`
- **Contraseña:** cualquiera
- **Redirige a:** `/dashboard-nurse`

## 🔧 Configuración

Para cambiar entre API mock y API real, edita el archivo `src/context/AuthContext.tsx`:

```typescript
const USE_MOCK_API = true; // Cambia a false cuando el backend esté listo
```

## 📝 Notas

- La API mock simula un delay de 800ms para el login
- Cualquier contraseña es válida en modo mock
- Los tokens generados son strings aleatorios (no JWT reales)
- Los datos persisten solo en memoria (se pierden al recargar)

## 🚀 Próximos Pasos

Cuando el backend esté listo:
1. Cambiar `USE_MOCK_API` a `false` en `AuthContext.tsx`
2. Actualizar la URL del backend en `src/services/api.ts`
3. Probar con usuarios reales del backend
