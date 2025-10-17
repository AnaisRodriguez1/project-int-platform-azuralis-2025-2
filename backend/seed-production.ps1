# ============================================
# SCRIPT PARA POBLAR BASE DE DATOS DE PRODUCCIÓN (AZURE SQL)
# ============================================

Write-Host "🚀 POBLANDO BASE DE DATOS DE PRODUCCIÓN (Azure SQL)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend esté corriendo en modo producción
Write-Host "⚠️  IMPORTANTE: Asegúrate de que el backend esté corriendo con:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run prod" -ForegroundColor White
Write-Host ""

$continue = Read-Host "¿El backend está corriendo en modo producción? (s/n)"
if ($continue -ne "s" -and $continue -ne "S") {
    Write-Host "❌ Abortando. Por favor inicia el backend primero." -ForegroundColor Red
    exit
}

Write-Host ""

$API_URL = "http://localhost:3000"

# ============================================
# FUNCIÓN AUXILIAR PARA HACER REQUESTS
# ============================================
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "   Request: $Method $Endpoint" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body $jsonBody -ErrorAction Stop
        } else {
            Write-Host "   Request: $Method $Endpoint" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -ErrorAction Stop
        }
        return $response
    } catch {
        Write-Host "❌ Error en $Method $Endpoint" -ForegroundColor Red
        Write-Host "   Detalle: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Respuesta: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# ============================================
# 1. REGISTRAR MÉDICOS
# ============================================
Write-Host "👨‍⚕️  Registrando médicos..." -ForegroundColor Yellow
Write-Host ""

$doctor1 = @{
    name = "Dr. Carlos Mendoza"
    email = "carlos.mendoza@hospital.cl"
    password = "Doctor123!"
    rut = "12.345.678-9"
    role = "doctor"
}

$doctor2 = @{
    name = "Dra. María González"
    email = "maria.gonzalez@hospital.cl"
    password = "Doctor123!"
    rut = "23.456.789-0"
    role = "doctor"
}

$doc1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $doctor1
if ($doc1Response) {
    Write-Host "✅ Médico creado: Dr. Carlos Mendoza (ID: $($doc1Response.id))" -ForegroundColor Green
    $doctor1Id = $doc1Response.id
} else {
    Write-Host "⚠️  Dr. Carlos Mendoza ya existe o hubo un error" -ForegroundColor Yellow
    # Intentar obtener el ID haciendo login
    $loginDoc1 = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
        email = $doctor1.email
        password = $doctor1.password
    }
    if ($loginDoc1) {
        Write-Host "   ℹ️  Usuario ya existe, obteniendo datos..." -ForegroundColor Cyan
    }
}

$doc2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $doctor2
if ($doc2Response) {
    Write-Host "✅ Médico creado: Dra. María González (ID: $($doc2Response.id))" -ForegroundColor Green
    $doctor2Id = $doc2Response.id
} else {
    Write-Host "⚠️  Dra. María González ya existe o hubo un error" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 2. REGISTRAR ENFERMERAS
# ============================================
Write-Host "👩‍⚕️  Registrando enfermeras..." -ForegroundColor Yellow
Write-Host ""

$nurse1 = @{
    name = "Enfermera Ana Pérez"
    email = "ana.perez@hospital.cl"
    password = "Nurse123!"
    rut = "34.567.890-1"
    role = "nurse"
}

$nurse2 = @{
    name = "Enfermero José Silva"
    email = "jose.silva@hospital.cl"
    password = "Nurse123!"
    rut = "45.678.901-2"
    role = "nurse"
}

$nurse1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $nurse1
if ($nurse1Response) {
    Write-Host "✅ Enfermera creada: Ana Pérez (ID: $($nurse1Response.id))" -ForegroundColor Green
    $nurse1Id = $nurse1Response.id
}

$nurse2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $nurse2
if ($nurse2Response) {
    Write-Host "✅ Enfermero creado: José Silva (ID: $($nurse2Response.id))" -ForegroundColor Green
    $nurse2Id = $nurse2Response.id
}

Write-Host ""

# ============================================
# 3. LOGIN COMO MÉDICO PARA CREAR PACIENTES
# ============================================
Write-Host "🔐 Haciendo login como Dr. Carlos Mendoza..." -ForegroundColor Yellow
Write-Host ""

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "carlos.mendoza@hospital.cl"
    password = "Doctor123!"
}

if (-not $loginResponse) {
    Write-Host "❌ No se pudo hacer login. Abortando..." -ForegroundColor Red
    exit 1
}

$token = $loginResponse.access_token
Write-Host "✅ Login exitoso! Token obtenido" -ForegroundColor Green
Write-Host ""

# Obtener datos del médico
$meResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $token
if ($meResponse) {
    Write-Host "✅ Datos del médico obtenidos:" -ForegroundColor Green
    Write-Host "   Nombre: $($meResponse.name)" -ForegroundColor Gray
    Write-Host "   Email: $($meResponse.email)" -ForegroundColor Gray
    Write-Host "   Role: $($meResponse.role)" -ForegroundColor Gray
    $doctor1Id = $meResponse.id
}

Write-Host ""

# ============================================
# 4. CREAR PACIENTES
# ============================================
Write-Host "👤 Creando pacientes..." -ForegroundColor Yellow
Write-Host ""

$patient1 = @{
    name = "Sofía Ramírez"
    age = 45
    rut = "56.789.012-3"
    photo = "https://i.pravatar.cc/150?img=1"
    diagnosis = "Cáncer de Mama"
    stage = "Etapa II"
    cancerType = "breast"
    allergies = '["Penicilina","Ibuprofeno"]'
    currentMedications = '["Tamoxifeno 20mg - cada 12 horas","Paracetamol 500mg - según necesidad"]'
    treatmentSummary = "Paciente diagnosticada con cáncer de mama en estadio II. Se realizó mastectomía parcial seguida de quimioterapia adyuvante. Actualmente en terapia hormonal con Tamoxifeno. Pronóstico favorable."
}

$patient2 = @{
    name = "Pedro Flores"
    age = 62
    rut = "67.890.123-4"
    photo = "https://i.pravatar.cc/150?img=12"
    diagnosis = "Linfoma de Hodgkin"
    stage = "Etapa III"
    cancerType = "other"
    allergies = '["Aspirina"]'
    currentMedications = '["Doxorrubicina 50mg IV - cada 21 días","Prednisona 40mg - diario","Ondansetrón 8mg - según necesidad"]'
    treatmentSummary = "Paciente con Linfoma de Hodgkin estadio III. En tratamiento con quimioterapia combinada (esquema ABVD). Tolera bien el tratamiento con efectos secundarios controlables. Respuesta parcial favorable después de 4 ciclos."
}

$pat1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patients" -Body $patient1 -Token $token

if ($pat1Response) {
    Write-Host "✅ Paciente creado: Sofía Ramírez" -ForegroundColor Green
    Write-Host "   ID: $($pat1Response.id)" -ForegroundColor Gray
    Write-Host "   Diagnóstico: $($pat1Response.diagnosis)" -ForegroundColor Gray
    Write-Host "   📱 QR Code: $API_URL/patients/$($pat1Response.id)/qr" -ForegroundColor Cyan
    $patient1Id = $pat1Response.id
}

Write-Host ""

$pat2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patients" -Body $patient2 -Token $token

if ($pat2Response) {
    Write-Host "✅ Paciente creado: Pedro Flores" -ForegroundColor Green
    Write-Host "   ID: $($pat2Response.id)" -ForegroundColor Gray
    Write-Host "   Diagnóstico: $($pat2Response.diagnosis)" -ForegroundColor Gray
    Write-Host "   📱 QR Code: $API_URL/patients/$($pat2Response.id)/qr" -ForegroundColor Cyan
    $patient2Id = $pat2Response.id
}

Write-Host ""

# ============================================
# 5. REGISTRAR USUARIOS PACIENTES
# ============================================
Write-Host "🔑 Registrando usuarios para los pacientes..." -ForegroundColor Yellow
Write-Host ""

$patientUser1 = @{
    name = "Sofía Ramírez"
    email = "sofia.ramirez@email.cl"
    password = "Patient123!"
    rut = "56.789.012-3"
    role = "patient"
}

$patientUser2 = @{
    name = "Pedro Flores"
    email = "pedro.flores@email.cl"
    password = "Patient123!"
    rut = "67.890.123-4"
    role = "patient"
}

$patUser1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $patientUser1
if ($patUser1Response) {
    Write-Host "✅ Usuario paciente creado: sofia.ramirez@email.cl" -ForegroundColor Green
}

$patUser2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $patientUser2
if ($patUser2Response) {
    Write-Host "✅ Usuario paciente creado: pedro.flores@email.cl" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 6. CREAR NOTAS CLÍNICAS
# ============================================
if ($patient1Id -and $doctor1Id) {
    Write-Host "📝 Creando notas clínicas..." -ForegroundColor Yellow
    Write-Host ""
    
    $note1 = @{
        title = "Consulta de seguimiento post-cirugía"
        content = "Paciente acude a control post-operatorio. Herida quirúrgica en buen estado, sin signos de infección. Retiro de puntos programado para próxima semana. Paciente refiere dolor leve controlado con analgésicos. Se inicia protocolo de quimioterapia adyuvante."
        patientId = $patient1Id
        authorId = $doctor1Id
        authorName = "Dr. Carlos Mendoza"
    }
    
    $note1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patient-notes" -Body $note1 -Token $token
    
    if ($note1Response) {
        Write-Host "✅ Nota clínica creada: $($note1.title)" -ForegroundColor Green
    }
}

if ($patient2Id -and $doctor1Id) {
    $note2 = @{
        title = "Evaluación pre-quimioterapia"
        content = "Paciente en condiciones para inicio de quimioterapia. Hemograma dentro de parámetros aceptables. Función renal y hepática normales. Se programa primer ciclo de ABVD para esta semana. Paciente orientado sobre cuidados y posibles efectos adversos."
        patientId = $patient2Id
        authorId = $doctor1Id
        authorName = "Dr. Carlos Mendoza"
    }
    
    $note2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patient-notes" -Body $note2 -Token $token
    
    if ($note2Response) {
        Write-Host "✅ Nota clínica creada: $($note2.title)" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# 7. CREAR DOCUMENTOS
# ============================================
if ($patient1Id -and $doctor1Id) {
    Write-Host "📄 Creando documentos médicos..." -ForegroundColor Yellow
    Write-Host ""
    
    $doc1 = @{
        title = "Biopsia de mama - Resultado histopatológico"
        type = "examen"
        url = "https://example.com/documents/biopsia-pat001.pdf"
        patientId = $patient1Id
        uploaderId = $doctor1Id
        description = "Resultado de biopsia confirmando diagnóstico"
    }
    
    $doc1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patient-documents" -Body $doc1 -Token $token
    
    if ($doc1Response) {
        Write-Host "✅ Documento creado: $($doc1.title)" -ForegroundColor Green
    }
}

if ($patient2Id -and $doctor1Id) {
    $doc2 = @{
        title = "TAC de tórax - Evaluación inicial"
        type = "examen"
        url = "https://example.com/documents/tac-pat002.pdf"
        patientId = $patient2Id
        uploaderId = $doctor1Id
        description = "TAC para evaluación inicial del linfoma"
    }
    
    $doc2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/patient-documents" -Body $doc2 -Token $token
    
    if ($doc2Response) {
        Write-Host "✅ Documento creado: $($doc2.title)" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ POBLACIÓN DE BASE DE DATOS COMPLETADA" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 CREDENCIALES DE ACCESO (PRODUCCIÓN - AZURE SQL):" -ForegroundColor Yellow
Write-Host ""
Write-Host "👨‍⚕️  MÉDICOS:" -ForegroundColor Cyan
Write-Host "   📧 carlos.mendoza@hospital.cl" -ForegroundColor White
Write-Host "   🔑 Doctor123!" -ForegroundColor White
Write-Host ""
Write-Host "   📧 maria.gonzalez@hospital.cl" -ForegroundColor White
Write-Host "   🔑 Doctor123!" -ForegroundColor White
Write-Host ""
Write-Host "👩‍⚕️  ENFERMERAS:" -ForegroundColor Cyan
Write-Host "   📧 ana.perez@hospital.cl" -ForegroundColor White
Write-Host "   🔑 Nurse123!" -ForegroundColor White
Write-Host ""
Write-Host "   📧 jose.silva@hospital.cl" -ForegroundColor White
Write-Host "   🔑 Nurse123!" -ForegroundColor White
Write-Host ""
Write-Host "👤 PACIENTES:" -ForegroundColor Cyan
Write-Host "   📧 sofia.ramirez@email.cl" -ForegroundColor White
Write-Host "   🔑 Patient123!" -ForegroundColor White
Write-Host ""
Write-Host "   📧 pedro.flores@email.cl" -ForegroundColor White
Write-Host "   🔑 Patient123!" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Siguiente paso:" -ForegroundColor Yellow
Write-Host "   Ejecuta: .\verify-database.ps1" -ForegroundColor White
Write-Host "   Para verificar que todo se guardó correctamente" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Luego inicia el frontend:" -ForegroundColor Yellow
Write-Host "   cd ..\web" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
