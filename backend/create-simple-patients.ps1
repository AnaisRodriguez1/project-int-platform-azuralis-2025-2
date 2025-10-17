# Script simple para crear pacientes en la base de datos de producción

Write-Host "👤 Creando pacientes en Azure SQL..." -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3000"

# Login como doctor
Write-Host "🔐 Login como doctor..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body (@{
    email = "carlos.mendoza@hospital.cl"
    password = "Doctor123!"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.access_token
Write-Host "✅ Token obtenido" -ForegroundColor Green
Write-Host ""

# Crear pacientes con datos simples
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Paciente 1 - Sofía
Write-Host "Creando paciente: Sofía Ramírez..." -ForegroundColor Yellow
$patient1 = @{
    name = "Sofía Ramírez"
    age = 45
    rut = "56.789.012-3"
    diagnosis = "Cáncer de Mama"
    stage = "Etapa II"
    cancerType = "breast"
    allergies = "[]"
    currentMedications = "[]"
    treatmentSummary = "Paciente diagnosticada con cáncer de mama en estadio II."
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$API_URL/patients" -Method POST -Headers $headers -Body $patient1
    Write-Host "✅ Paciente creado: Sofía Ramírez" -ForegroundColor Green
    Write-Host "   ID: $($response1.id)" -ForegroundColor Gray
    Write-Host "   QR: $API_URL/patients/$($response1.id)/qr" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Detalle: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Paciente 2 - Pedro
Write-Host "Creando paciente: Pedro Flores..." -ForegroundColor Yellow
$patient2 = @{
    name = "Pedro Flores"
    age = 62
    rut = "67.890.123-4"
    diagnosis = "Linfoma de Hodgkin"
    stage = "Etapa III"
    cancerType = "other"
    allergies = "[]"
    currentMedications = "[]"
    treatmentSummary = "Paciente con Linfoma de Hodgkin estadio III."
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$API_URL/patients" -Method POST -Headers $headers -Body $patient2
    Write-Host "✅ Paciente creado: Pedro Flores" -ForegroundColor Green
    Write-Host "   ID: $($response2.id)" -ForegroundColor Gray
    Write-Host "   QR: $API_URL/patients/$($response2.id)/qr" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Detalle: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Proceso completado!" -ForegroundColor Green
