// Script para crear el contenedor de Azure Blob Storage
import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ AZURE_STORAGE_CONNECTION_STRING no está configurada');
  process.exit(1);
}

async function createContainer() {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString!);
    const containerName = 'patient-documents';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    console.log(`📦 Creando contenedor: ${containerName}...`);
    
    const createResponse = await containerClient.create();
    
    console.log('✅ Contenedor creado exitosamente');
    console.log('📊 Request ID:', createResponse.requestId);
    console.log('🔗 URL:', containerClient.url);
    console.log('\n🎉 Ahora puedes subir documentos!');
  } catch (error: any) {
    if (error.code === 'ContainerAlreadyExists') {
      console.log('ℹ️ El contenedor ya existe');
    } else {
      console.error('❌ Error al crear contenedor:', error.message);
      console.error('Detalles:', error);
    }
  }
}

createContainer();
