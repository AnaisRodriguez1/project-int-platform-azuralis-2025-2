# ============================================
# SCRIPT PARA POBLAR LA BASE DE DATOS
# ============================================
# Este script crea usuarios, pacientes, notas y documentos de prueba
# en la base de datos de producción (Azure SQL)

$API_URL = "http://localhost:3000"

Write-Host "🚀 Iniciando población de base de datos..." -ForegroundColor Cyan
Write-Host ""

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
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10) -ErrorAction Stop
        return $response
    } catch {
        Write-Host "❌ Error en $Method $Endpoint : $_" -ForegroundColor Red
        Write-Host "Detalle: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# ============================================
# 1. REGISTRAR MÉDICOS
# ============================================
Write-Host "👨‍⚕️  Registrando médicos..." -ForegroundColor Yellow

$doctor1 = @{
    name = "Dr. Carlos Mendoza"
    email = "carlos.mendoza@hospital.cl"
    password = "Doctor123!"
    rut = "12345678-9"
    role = "doctor"
}

$doctor2 = @{
    name = "Dra. María González"
    email = "maria.gonzalez@hospital.cl"
    password = "Doctor123!"
    rut = "23456789-0"
    role = "doctor"
}

$doc1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $doctor1
$doc2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $doctor2

if ($doc1Response) {
    Write-Host "✅ Médico creado: Dr. Carlos Mendoza (ID: $($doc1Response.id))" -ForegroundColor Green
    $doctor1Id = $doc1Response.id
} else {
    Write-Host "⚠️  Dr. Carlos Mendoza ya existe o hubo un error" -ForegroundColor Yellow
}

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

$nurse1 = @{
    name = "Enfermera Ana Pérez"
    email = "ana.perez@hospital.cl"
    password = "Nurse123!"
    rut = "34567890-1"
    role = "nurse"
}

$nurse2 = @{
    name = "Enfermero José Silva"
    email = "jose.silva@hospital.cl"
    password = "Nurse123!"
    rut = "45678901-2"
    role = "nurse"
}

$nurse1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $nurse1
$nurse2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $nurse2

if ($nurse1Response) {
    Write-Host "✅ Enfermera creada: Ana Pérez (ID: $($nurse1Response.id))" -ForegroundColor Green
    $nurse1Id = $nurse1Response.id
} else {
    Write-Host "⚠️  Ana Pérez ya existe o hubo un error" -ForegroundColor Yellow
}

if ($nurse2Response) {
    Write-Host "✅ Enfermero creado: José Silva (ID: $($nurse2Response.id))" -ForegroundColor Green
    $nurse2Id = $nurse2Response.id
} else {
    Write-Host "⚠️  José Silva ya existe o hubo un error" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 3. LOGIN COMO MÉDICO PARA CREAR PACIENTES
# ============================================
Write-Host "🔐 Haciendo login como Dr. Carlos Mendoza..." -ForegroundColor Yellow

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

# ============================================
# 4. CREAR PACIENTES
# ============================================
Write-Host "👤 Creando pacientes..." -ForegroundColor Yellow

$patient1 = @{
    name = "Sofía Ramírez"
    age = 45
    rut = "56789012-3"
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
    rut = "67890123-4"
    photo = "https://i.pravatar.cc/150?img=12"
    diagnosis = "Linfoma de Hodgkin"
    stage = "Etapa III"
    cancerType = "other"
    allergies = '["Aspirina"]'
    currentMedications = '["Doxorrubicina 50mg IV - cada 21 días","Prednisona 40mg - diario","Ondansetrón 8mg - según necesidad"]'
    treatmentSummary = "Paciente con Linfoma de Hodgkin estadio III. En tratamiento con quimioterapia combinada (esquema ABVD). Tolera bien el tratamiento con efectos secundarios controlables. Respuesta parcial favorable después de 4 ciclos."
}

# Crear paciente 1
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$pat1Response = Invoke-RestMethod -Uri "$API_URL/patients" -Method POST -Headers $headers -Body ($patient1 | ConvertTo-Json) -ErrorAction SilentlyContinue

if ($pat1Response) {
    Write-Host "✅ Paciente creado: Sofía Ramírez (ID: $($pat1Response.id))" -ForegroundColor Green
    $patient1Id = $pat1Response.id
    Write-Host "   📱 QR Code disponible en: $API_URL/patients/$($pat1Response.id)/qr" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No se pudo crear Sofía Ramírez" -ForegroundColor Yellow
}

# Crear paciente 2
$pat2Response = Invoke-RestMethod -Uri "$API_URL/patients" -Method POST -Headers $headers -Body ($patient2 | ConvertTo-Json) -ErrorAction SilentlyContinue

if ($pat2Response) {
    Write-Host "✅ Paciente creado: Pedro Flores (ID: $($pat2Response.id))" -ForegroundColor Green
    $patient2Id = $pat2Response.id
    Write-Host "   📱 QR Code disponible en: $API_URL/patients/$($pat2Response.id)/qr" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No se pudo crear Pedro Flores" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 5. REGISTRAR USUARIOS PACIENTES
# ============================================
Write-Host "🔑 Registrando usuarios para los pacientes..." -ForegroundColor Yellow

$patientUser1 = @{
    name = "Sofía Ramírez"
    email = "sofia.ramirez@email.cl"
    password = "Patient123!"
    rut = "56789012-3"
    role = "patient"
}

$patientUser2 = @{
    name = "Pedro Flores"
    email = "pedro.flores@email.cl"
    password = "Patient123!"
    rut = "67890123-4"
    role = "patient"
}

$patUser1Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $patientUser1
$patUser2Response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $patientUser2

if ($patUser1Response) {
    Write-Host "✅ Usuario paciente creado: sofia.ramirez@email.cl" -ForegroundColor Green
}

if ($patUser2Response) {
    Write-Host "✅ Usuario paciente creado: pedro.flores@email.cl" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 6. CREAR NOTAS CLÍNICAS
# ============================================
if ($patient1Id) {
    Write-Host "📝 Creando notas clínicas..." -ForegroundColor Yellow
    
    $note1 = @{
        title = "Consulta de seguimiento post-cirugía"
        content = "Paciente acude a control post-operatorio. Herida quirúrgica en buen estado, sin signos de infección. Retiro de puntos programado para próxima semana. Paciente refiere dolor leve controlado con analgésicos. Se inicia protocolo de quimioterapia adyuvante."
        patientId = $patient1Id
        authorId = $doctor1Id
        authorName = "Dr. Carlos Mendoza"
    }
    
    $note1Response = Invoke-RestMethod -Uri "$API_URL/patient-notes" -Method POST -Headers $headers -Body ($note1 | ConvertTo-Json) -ErrorAction SilentlyContinue
    
    if ($note1Response) {
        Write-Host "✅ Nota clínica creada para Sofía Ramírez" -ForegroundColor Green
    }
}

if ($patient2Id) {
    $note2 = @{
        title = "Evaluación pre-quimioterapia"
        content = "Paciente en condiciones para inicio de quimioterapia. Hemograma dentro de parámetros aceptables. Función renal y hepática normales. Se programa primer ciclo de ABVD para esta semana. Paciente orientado sobre cuidados y posibles efectos adversos."
        patientId = $patient2Id
        authorId = $doctor2Id
        authorName = "Dra. María González"
    }
    
    $note2Response = Invoke-RestMethod -Uri "$API_URL/patient-notes" -Method POST -Headers $headers -Body ($note2 | ConvertTo-Json) -ErrorAction SilentlyContinue
    
    if ($note2Response) {
        Write-Host "✅ Nota clínica creada para Pedro Flores" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# 7. CREAR DOCUMENTOS
# ============================================
if ($patient1Id) {
    Write-Host "📄 Creando documentos médicos..." -ForegroundColor Yellow
    
    $doc1 = @{
        title = "Biopsia de mama - Resultado histopatológico"
        type = "examen"
        url = "https://example.com/documents/biopsia-pat001.pdf"
        patientId = $patient1Id
        uploaderId = $doctor1Id
        description = "Resultado de biopsia confirmando diagnóstico"
    }
    
    $doc1Response = Invoke-RestMethod -Uri "$API_URL/patient-documents" -Method POST -Headers $headers -Body ($doc1 | ConvertTo-Json) -ErrorAction SilentlyContinue
    
    if ($doc1Response) {
        Write-Host "✅ Documento creado para Sofía Ramírez" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ POBLACIÓN DE BASE DE DATOS COMPLETADA" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 CREDENCIALES DE ACCESO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "👨‍⚕️  MÉDICOS:" -ForegroundColor Cyan
Write-Host "   Email: carlos.mendoza@hospital.cl" -ForegroundColor White
Write-Host "   Password: Doctor123!" -ForegroundColor White
Write-Host ""
Write-Host "   Email: maria.gonzalez@hospital.cl" -ForegroundColor White
Write-Host "   Password: Doctor123!" -ForegroundColor White
Write-Host ""
Write-Host "👩‍⚕️  ENFERMERAS:" -ForegroundColor Cyan
Write-Host "   Email: ana.perez@hospital.cl" -ForegroundColor White
Write-Host "   Password: Nurse123!" -ForegroundColor White
Write-Host ""
Write-Host "   Email: jose.silva@hospital.cl" -ForegroundColor White
Write-Host "   Password: Nurse123!" -ForegroundColor White
Write-Host ""
Write-Host "👤 PACIENTES:" -ForegroundColor Cyan
Write-Host "   Email: sofia.ramirez@email.cl" -ForegroundColor White
Write-Host "   Password: Patient123!" -ForegroundColor White
Write-Host ""
Write-Host "   Email: pedro.flores@email.cl" -ForegroundColor White
Write-Host "   Password: Patient123!" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ahora puedes hacer login en el frontend con estas credenciales!" -ForegroundColor Green
Write-Host ""
