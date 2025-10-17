# 🔐 CREDENCIALES DE USUARIOS - AZURALIS

Este documento contiene todas las credenciales de los usuarios creados en la base de datos de producción (Azure SQL).

---

## 👨‍⚕️ MÉDICOS (Doctores)

### Dr. Carlos Mendoza
```
Email: carlos.mendoza@hospital.cl
Password: Doctor123!
RUT: 12.345.678-9
Rol: doctor
Especialización: Oncología
Licencia: MED-12345
Estado: ✅ Perfil completo
```

### Dra. María González
```
Email: maria.gonzalez@hospital.cl
Password: Doctor123!
RUT: 23.456.789-0
Rol: doctor
Especialización: Oncología Pediátrica
Licencia: MED-23456
Estado: ✅ Perfil completo
```

---

## 👩‍⚕️ ENFERMERAS (Nurses)

### Enfermera Ana Pérez
```
Email: ana.perez@hospital.cl
Password: Nurse123!
RUT: 34.567.890-1
Rol: nurse
Departamento: Oncología
Licencia: ENF-34567
Estado: ✅ Perfil completo
```

### Enfermero José Silva
```
Email: jose.silva@hospital.cl
Password: Nurse123!
RUT: 45.678.901-2
Rol: nurse
Departamento: Cuidados Intensivos
Licencia: ENF-45678
Estado: ✅ Perfil completo
```

---

## 👤 PACIENTES (Patients)

### Sofía Ramírez
```
Email: sofia.ramirez@email.cl
Password: Patient123!
RUT: 56.789.012-3
Rol: patient
Estado: Usuario creado, requiere completar onboarding
```

### Pedro Flores
```
Email: pedro.flores@email.cl
Password: Patient123!
RUT: 67.890.123-4
Rol: patient
Estado: Usuario creado, requiere completar onboarding
```

---

## 🎯 INSTRUCCIONES DE USO

### Para Probar el Onboarding de Pacientes:

1. **Inicia sesión** en http://localhost:5174
2. **Usa las credenciales de cualquier paciente** (por ejemplo: `sofia.ramirez@email.cl` / `Patient123!`)
3. **Completa el formulario de onboarding** (3 pasos):
   - Paso 1: Información básica (edad, diagnóstico, etapa, tipo de cáncer)
   - Paso 2: Tratamiento y medicación (alergias, medicamentos, resumen)
   - Paso 3: Contacto de emergencia (opcional)
4. **Después de completar**, verás tu dashboard con código QR generado automáticamente

### Para Médicos y Enfermeras:

- Los médicos y enfermeras pueden iniciar sesión directamente
- Tendrán acceso a las funcionalidades de su rol correspondiente
- Pueden ver y gestionar pacientes una vez creados

---

## 📊 ESTADO DE LA BASE DE DATOS

### Tabla `users` (Usuarios):
- ✅ 6 usuarios creados (2 doctores, 2 enfermeras, 2 pacientes)
- ✅ Todos pueden hacer login correctamente
- ✅ JWT authentication funcionando

### Tabla `patients` (Pacientes):
- ⚠️ NO hay registros de pacientes todavía
- 📝 Se crearán cuando los usuarios pacientes completen el onboarding
- 🔗 Se vincularán por RUT (Patient.rut = User.rut)

---

## 🚀 ENDPOINTS DISPONIBLES

### Autenticación:
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener datos del usuario autenticado (requiere JWT)

### Pacientes:
- `POST /patients` - Crear nuevo paciente
- `GET /patients` - Listar todos los pacientes
- `GET /patients/:id` - Obtener paciente por ID
- `GET /patients/:id/qr` - Obtener código QR del paciente (generado dinámicamente)
- `PUT /patients/:id` - Actualizar paciente
- `DELETE /patients/:id` - Eliminar paciente

### Notas Clínicas:
- `POST /patient-notes` - Crear nota
- `GET /patient-notes` - Listar notas
- `GET /patient-notes/:id` - Obtener nota por ID
- `DELETE /patient-notes/:id` - Eliminar nota

### Documentos:
- `POST /patient-documents` - Crear documento
- `GET /patient-documents` - Listar documentos
- `GET /patient-documents/:id` - Obtener documento por ID
- `DELETE /patient-documents/:id` - Eliminar documento

### Equipo de Cuidado:
- `POST /care-team` - Agregar miembro al equipo
- `GET /care-team` - Listar todos
- `GET /care-team/by-patient/:patientId` - Obtener equipo de un paciente
- `PUT /care-team/:id` - Actualizar miembro
- `DELETE /care-team/:id` - Eliminar miembro

---

## 🔒 SEGURIDAD

- **Contraseñas**: Hasheadas con bcrypt (salt rounds: 10)
- **Tokens JWT**: Expiran en 24 horas
- **CORS**: Configurado para localhost:5173 y localhost:5174
- **Validación**: Todos los DTOs tienen validación automática

---

## 💾 CONEXIÓN A BASE DE DATOS

```
Servidor: azuralis-server-v2.database.windows.net
Base de datos: azuralis-famed
Usuario: azuralisteam@gmail.com@azuralis-server-v2
Motor: Azure SQL (Microsoft SQL Server)
```

---

## 📝 NOTAS IMPORTANTES

1. **RUT Format**: Los RUTs deben estar en formato `12.345.678-9` (con puntos y guión)
2. **QR Codes**: Se generan dinámicamente con formato `PATIENT:{uuid}`
3. **Arrays en Azure SQL**: Se guardan como JSON strings (`'["item1","item2"]'`)
4. **Onboarding**: Los pacientes DEBEN completar el onboarding antes de usar la aplicación

---

## 🐛 TROUBLESHOOTING

### Error: "No se encontraron datos del paciente"
- **Causa**: El usuario existe pero no hay registro en la tabla `patients`
- **Solución**: Completar el formulario de onboarding

### Error: "Network Error" o "Connection Refused"
- **Causa**: Backend no está corriendo
- **Solución**: `cd backend && npm run prod`

### Error: CORS
- **Causa**: Puerto del frontend no está en la lista de CORS
- **Solución**: Verificar que `main.ts` incluya el puerto correcto (5173 o 5174)

---

**Última actualización**: 17 de Octubre, 2025
**Base de datos**: Azure SQL (Producción)
**Estado**: ✅ Operativo
