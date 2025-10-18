import 'dotenv/config';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

console.log('🔍 Verificando configuración de Azure Storage...\n');

if (!connectionString) {
  console.error('❌ ERROR: AZURE_STORAGE_CONNECTION_STRING no está definida en .env');
  process.exit(1);
}

// Verificar que la cadena de conexión tenga el formato correcto
const requiredParts = [
  'DefaultEndpointsProtocol',
  'AccountName',
  'AccountKey',
  'EndpointSuffix'
];

const missingParts = requiredParts.filter(part => !connectionString.includes(part));

if (missingParts.length > 0) {
  console.error('❌ ERROR: La cadena de conexión está incompleta.');
  console.error('   Faltan los siguientes componentes:', missingParts.join(', '));
  console.error('\n   Formato esperado:');
  console.error('   DefaultEndpointsProtocol=https;AccountName=NOMBRE;AccountKey=CLAVE;EndpointSuffix=core.windows.net');
  process.exit(1);
}

// Extraer información de la cadena de conexión
const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1];
const protocol = connectionString.match(/DefaultEndpointsProtocol=([^;]+)/)?.[1];

console.log('✅ Cadena de conexión encontrada y válida');
console.log(`📦 Cuenta de Storage: ${accountName}`);
console.log(`🔒 Protocolo: ${protocol}`);
console.log(`📁 Contenedor: patient-documents`);
console.log('\n✨ Todo listo! Puedes iniciar el servidor.');
