$body = @{
    name = "María González"
    age = 45
    rut = "12345678-9"
    diagnosis = "Cáncer de Mama"
    stage = "Estadio II"
    cancerType = "MAMA"
    allergies = '["Penicilina"]'
    currentMedications = '["Tamoxifeno"]'
    treatmentSummary = "Paciente en tratamiento de quimioterapia"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/patients" -Method POST -ContentType "application/json" -Body $body

Write-Host "✅ Paciente creado con éxito!" -ForegroundColor Green
Write-Host "ID: $($response.id)" -ForegroundColor Cyan
Write-Host "QR disponible en: http://localhost:3000/patients/$($response.id)/qr" -ForegroundColor Yellow
Write-Host ""
Write-Host "Abre esta URL en tu navegador para ver el QR Code 👆" -ForegroundColor Magenta

$response
