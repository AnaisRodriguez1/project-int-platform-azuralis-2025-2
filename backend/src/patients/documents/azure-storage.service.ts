import { Injectable } from '@nestjs/common';
import { 
  BlobServiceClient, 
  ContainerClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureStorageService {
  private containerClient: ContainerClient;
  private readonly containerName = 'patient-documents';
  private accountName: string;
  private accountKey: string;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    
    if (!connectionString) {
      console.warn('⚠️ AZURE_STORAGE_CONNECTION_STRING no está configurado. Los documentos no se subirán a Azure.');
      return;
    }

    try {
      // Extraer accountName y accountKey del connection string
      const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
      const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
      
      if (accountNameMatch && accountKeyMatch) {
        this.accountName = accountNameMatch[1];
        this.accountKey = accountKeyMatch[1];
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = blobServiceClient.getContainerClient(this.containerName);
      this.initializeContainer();
    } catch (error) {
      console.error('❌ Error al conectar con Azure Storage:', error);
    }
  }

  private async initializeContainer() {
    try {
      // Crear el contenedor si no existe (sin especificar acceso público)
      const createResponse = await this.containerClient.createIfNotExists();
      
      if (createResponse.succeeded) {
        console.log('✅ Azure Storage Container creado:', this.containerName);
      } else {
        console.log('ℹ️ Azure Storage Container ya existe:', this.containerName);
      }
    } catch (error) {
      console.error('❌ Error al inicializar el contenedor:', error);
      console.error('⚠️ Continuando sin inicializar contenedor. Asegúrate de que el contenedor existe en Azure Portal.');
    }
  }

  /**
   * Sube un archivo a Azure Blob Storage
   * @param file - Archivo a subir
   * @param fileName - Nombre único del archivo en Azure
   * @returns URL pública del archivo subido
   */
  async uploadFile(file: Express.Multer.File, fileName: string): Promise<string> {
    if (!this.containerClient) {
      const errorMsg = 'Azure Storage no está configurado correctamente. Verifica AZURE_STORAGE_CONNECTION_STRING en .env';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('📤 Subiendo archivo a Azure...', { fileName, size: file.size, type: file.mimetype });
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      // Subir el archivo
      const uploadResponse = await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      console.log('✅ Archivo subido a Azure exitosamente:', fileName);
      console.log('📊 Response:', { 
        requestId: uploadResponse.requestId, 
        version: uploadResponse.version,
        date: uploadResponse.date 
      });
      
      // Retornar la URL pública del archivo
      const url = blockBlobClient.url;
      console.log('🔗 URL del archivo:', url);
      return url;
    } catch (error) {
      console.error('❌ Error al subir archivo a Azure:', error);
      console.error('❌ Nombre del archivo:', fileName);
      console.error('❌ Detalles del error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        name: error.name
      });
      throw new Error(`Error al subir el archivo a Azure Storage: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo de Azure Blob Storage
   * @param fileName - Nombre del archivo a eliminar
   */
  async deleteFile(fileName: string): Promise<void> {
    if (!this.containerClient) {
      console.warn('⚠️ Azure Storage no configurado, no se puede eliminar:', fileName);
      return;
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.deleteIfExists();
      console.log('✅ Archivo eliminado de Azure:', fileName);
    } catch (error) {
      console.error('❌ Error al eliminar archivo de Azure:', error);
      throw new Error('Error al eliminar el archivo de Azure Storage');
    }
  }

  /**
   * Extrae el nombre del archivo desde una URL de Azure Blob Storage
   * @param url - URL del archivo en Azure
   * @returns Nombre del archivo (incluye path completo dentro del container)
   */
  extractFileNameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Ejemplo: /patient-documents/UUID/archivo.pdf
      // Queremos: UUID/archivo.pdf (todo después del container)
      const pathParts = urlObj.pathname.split('/');
      
      // Encontrar el índice del container
      const containerIndex = pathParts.indexOf(this.containerName);
      
      if (containerIndex === -1) {
        console.error('❌ No se encontró el container en la URL:', url);
        return null;
      }
      
      // Retornar todo después del container
      const blobPath = pathParts.slice(containerIndex + 1).join('/');
      console.log('📁 Blob path extraído:', blobPath);
      return blobPath;
    } catch (error) {
      console.error('❌ Error al extraer nombre del archivo:', error);
      return null;
    }
  }

  /**
   * Genera una URL con SAS token para acceder al archivo de forma segura
   * @param blobName - Nombre del blob/archivo en Azure
   * @param expiresInMinutes - Tiempo de expiración en minutos (default: 60)
   * @returns URL con SAS token que permite acceso temporal
   */
  async generateSasUrl(blobName: string, expiresInMinutes: number = 60): Promise<string> {
    if (!this.containerClient || !this.accountName || !this.accountKey) {
      throw new Error('Azure Storage no está configurado correctamente');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Crear credenciales
      const sharedKeyCredential = new StorageSharedKeyCredential(
        this.accountName,
        this.accountKey
      );

      // Configurar permisos: solo lectura
      const permissions = new BlobSASPermissions();
      permissions.read = true;

      // Configurar tiempo de expiración
      const startsOn = new Date();
      const expiresOn = new Date(startsOn);
      expiresOn.setMinutes(startsOn.getMinutes() + expiresInMinutes);

      // Generar SAS token
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName: blobName,
          permissions: permissions,
          startsOn: startsOn,
          expiresOn: expiresOn,
        },
        sharedKeyCredential
      ).toString();

      // Retornar URL completa con SAS token
      const sasUrl = `${blockBlobClient.url}?${sasToken}`;
      console.log('🔐 SAS URL generada para:', blobName, '(expira en', expiresInMinutes, 'minutos)');
      return sasUrl;
    } catch (error) {
      console.error('❌ Error al generar SAS URL:', error);
      throw new Error(`Error al generar URL de acceso: ${error.message}`);
    }
  }
}
