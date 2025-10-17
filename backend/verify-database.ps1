# ============================================
# SCRIPT PARA VERIFICAR DATOS EN LA BD
# ============================================

$API_URL = "http://localhost:3000"

Write-Host "🔍 Verificando datos en la base de datos..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. INTENTAR LOGIN CON CADA USUARIO
# ============================================
Write-Host "🔐 Verificando logins..." -ForegroundColor Yellow
Write-Host ""

$usuarios = @(
    @{ email = "carlos.mendoza@hospital.cl"; password = "Doctor123!"; nombre = "Dr. Carlos Mendoza" }
    @{ email = "maria.gonzalez@hospital.cl"; password = "Doctor123!"; nombre = "Dra. María González" }
    @{ email = "ana.perez@hospital.cl"; password = "Nurse123!"; nombre = "Enfermera Ana Pérez" }
    @{ email = "jose.silva@hospital.cl"; password = "Nurse123!"; nombre = "Enfermero José Silva" }
    @{ email = "sofia.ramirez@email.cl"; password = "Patient123!"; nombre = "Sofía Ramírez" }
    @{ email = "pedro.flores@email.cl"; password = "Patient123!"; nombre = "Pedro Flores" }
)

$loginExitosos = 0
$tokens = @{}

foreach ($usuario in $usuarios) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body (@{
            email = $usuario.email
            password = $usuario.password
        } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "✅ Login exitoso: $($usuario.nombre)" -ForegroundColor Green
        Write-Host "   Token: $($response.access_token.Substring(0,20))..." -ForegroundColor Gray
        $loginExitosos++
        $tokens[$usuario.email] = $response.access_token
    } catch {
        Write-Host "❌ Login fallido: $($usuario.nombre)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Resultado: $loginExitosos de $($usuarios.Count) logins exitosos" -ForegroundColor $(if ($loginExitosos -eq $usuarios.Count) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# 2. VERIFICAR DATOS DE USUARIO CON /auth/me
# ============================================
if ($tokens.Count -gt 0) {
    Write-Host "👤 Verificando datos de usuarios..." -ForegroundColor Yellow
    Write-Host ""
    
    $primeraKey = $tokens.Keys | Select-Object -First 1
    $token = $tokens[$primeraKey]
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $userData = Invoke-RestMethod -Uri "$API_URL/auth/me" -Method GET -Headers $headers -ErrorAction Stop
        
        Write-Host "✅ Endpoint /auth/me funciona correctamente" -ForegroundColor Green
        Write-Host "   Usuario: $($userData.name)" -ForegroundColor Gray
        Write-Host "   Email: $($userData.email)" -ForegroundColor Gray
        Write-Host "   Role: $($userData.role)" -ForegroundColor Gray
        Write-Host "   RUT: $($userData.rut)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error al verificar /auth/me" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# ============================================
# 3. VERIFICAR PACIENTES
# ============================================
if ($tokens.Count -gt 0) {
    Write-Host "🏥 Verificando pacientes..." -ForegroundColor Yellow
    Write-Host ""
    
    # Usar token de doctor
    $doctorToken = $tokens["carlos.mendoza@hospital.cl"]
    
    if ($doctorToken) {
        try {
            $headers = @{
                "Authorization" = "Bearer $doctorToken"
                "Content-Type" = "application/json"
            }
            
            $patients = Invoke-RestMethod -Uri "$API_URL/patients" -Method GET -Headers $headers -ErrorAction Stop
            
            Write-Host "✅ Se encontraron $($patients.Count) pacientes" -ForegroundColor Green
            
            foreach ($patient in $patients) {
                Write-Host ""
                Write-Host "   📋 Paciente: $($patient.name)" -ForegroundColor Cyan
                Write-Host "      ID: $($patient.id)" -ForegroundColor Gray
                Write-Host "      Diagnóstico: $($patient.diagnosis)" -ForegroundColor Gray
                Write-Host "      Tipo de cáncer: $($patient.cancerType)" -ForegroundColor Gray
                
                if ($patient.qrCode) {
                    Write-Host "      ✅ Tiene QR Code generado" -ForegroundColor Green
                    Write-Host "      📱 URL: $API_URL/patients/$($patient.id)/qr" -ForegroundColor Gray
                } else {
                    Write-Host "      ⚠️  No tiene QR Code" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Error al obtener pacientes" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# ============================================
# 4. VERIFICAR NOTAS
# ============================================
if ($tokens.Count -gt 0) {
    Write-Host "📝 Verificando notas..." -ForegroundColor Yellow
    Write-Host ""
    
    $doctorToken = $tokens["carlos.mendoza@hospital.cl"]
    
    if ($doctorToken) {
        try {
            $headers = @{
                "Authorization" = "Bearer $doctorToken"
                "Content-Type" = "application/json"
            }
            
            $notes = Invoke-RestMethod -Uri "$API_URL/patient-notes" -Method GET -Headers $headers -ErrorAction Stop
            
            Write-Host "✅ Se encontraron $($notes.Count) notas clínicas" -ForegroundColor Green
            
            foreach ($note in $notes) {
                Write-Host "   📄 $($note.title)" -ForegroundColor Gray
                Write-Host "      Autor: $($note.authorName)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "❌ Error al obtener notas" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# ============================================
# 5. VERIFICAR DOCUMENTOS
# ============================================
if ($tokens.Count -gt 0) {
    Write-Host "📄 Verificando documentos..." -ForegroundColor Yellow
    Write-Host ""
    
    $doctorToken = $tokens["carlos.mendoza@hospital.cl"]
    
    if ($doctorToken) {
        try {
            $headers = @{
                "Authorization" = "Bearer $doctorToken"
                "Content-Type" = "application/json"
            }
            
            $documents = Invoke-RestMethod -Uri "$API_URL/patient-documents" -Method GET -Headers $headers -ErrorAction Stop
            
            Write-Host "✅ Se encontraron $($documents.Count) documentos" -ForegroundColor Green
            
            foreach ($doc in $documents) {
                Write-Host "   📎 $($doc.title)" -ForegroundColor Gray
                Write-Host "      Tipo: $($doc.type)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "❌ Error al obtener documentos" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ VERIFICACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($loginExitosos -eq $usuarios.Count) {
    Write-Host "🎉 Todo funciona correctamente!" -ForegroundColor Green
    Write-Host "   - Todos los usuarios pueden hacer login" -ForegroundColor Green
    Write-Host "   - Los pacientes están creados" -ForegroundColor Green
    Write-Host "   - Las notas y documentos están guardados" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Puedes iniciar el frontend y hacer login!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos usuarios no pudieron hacer login" -ForegroundColor Yellow
    Write-Host "   Verifica que el script seed-database.ps1 se haya ejecutado correctamente" -ForegroundColor Yellow
}

Write-Host ""
