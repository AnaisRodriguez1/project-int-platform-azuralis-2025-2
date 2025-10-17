# Script para actualizar doctores y enfermeras con información profesional
# Requiere que el backend esté corriendo en http://localhost:3000

$baseUrl = "http://localhost:3000"

# Función para hacer login y obtener token
function Get-AuthToken {
    param($email, $password)
    
    $loginData = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        return $response.access_token
    } catch {
        Write-Host "Error al hacer login con $email : $_" -ForegroundColor Red
        return $null
    }
}

# Función para actualizar usuario
function Update-User {
    param($userId, $token, $updateData)
    
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $body = $updateData | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Headers $headers -Body $body
        return $response
    } catch {
        Write-Host "Error al actualizar usuario: $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n=== ACTUALIZANDO DOCTORES Y ENFERMERAS ===" -ForegroundColor Cyan

# 1. Dr. Carlos Mendoza
Write-Host "`n1. Actualizando Dr. Carlos Mendoza..." -ForegroundColor Yellow
$token = Get-AuthToken -email "carlos.mendoza@hospital.cl" -password "Doctor123!"
if ($token) {
    # Obtener datos del usuario para conseguir el ID
    $headers = @{ Authorization = "Bearer $token" }
    $userData = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
    
    $updateData = @{
        specialization = "Oncología"
        license = "MED-12345"
    }
    
    $result = Update-User -userId $userData.id -token $token -updateData $updateData
    if ($result) {
        Write-Host "✓ Dr. Carlos Mendoza actualizado: Especialización=$($result.specialization), Licencia=$($result.license)" -ForegroundColor Green
    }
}

# 2. Dra. María González
Write-Host "`n2. Actualizando Dra. María González..." -ForegroundColor Yellow
$token = Get-AuthToken -email "maria.gonzalez@hospital.cl" -password "Doctor123!"
if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    $userData = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
    
    $updateData = @{
        specialization = "Oncología Pediátrica"
        license = "MED-23456"
    }
    
    $result = Update-User -userId $userData.id -token $token -updateData $updateData
    if ($result) {
        Write-Host "✓ Dra. María González actualizada: Especialización=$($result.specialization), Licencia=$($result.license)" -ForegroundColor Green
    }
}

# 3. Enfermera Ana Pérez
Write-Host "`n3. Actualizando Enfermera Ana Pérez..." -ForegroundColor Yellow
$token = Get-AuthToken -email "ana.perez@hospital.cl" -password "Nurse123!"
if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    $userData = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
    
    $updateData = @{
        department = "Oncología"
        license = "ENF-34567"
    }
    
    $result = Update-User -userId $userData.id -token $token -updateData $updateData
    if ($result) {
        Write-Host "✓ Enfermera Ana Pérez actualizada: Departamento=$($result.department), Licencia=$($result.license)" -ForegroundColor Green
    }
}

# 4. Enfermero José Silva
Write-Host "`n4. Actualizando Enfermero José Silva..." -ForegroundColor Yellow
$token = Get-AuthToken -email "jose.silva@hospital.cl" -password "Nurse123!"
if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    $userData = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
    
    $updateData = @{
        department = "Cuidados Intensivos"
        license = "ENF-45678"
    }
    
    $result = Update-User -userId $userData.id -token $token -updateData $updateData
    if ($result) {
        Write-Host "✓ Enfermero José Silva actualizado: Departamento=$($result.department), Licencia=$($result.license)" -ForegroundColor Green
    }
}

Write-Host "`n=== ACTUALIZACIÓN COMPLETADA ===" -ForegroundColor Cyan
Write-Host "Ahora los doctores y enfermeras tienen sus datos profesionales completos." -ForegroundColor Green
Write-Host "Pueden iniciar sesión directamente sin necesidad de onboarding.`n" -ForegroundColor Green
