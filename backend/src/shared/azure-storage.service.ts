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
  private readonly containerName = 'user-profiles'; // Cambiado para perfiles
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
      throw new Error('Azure Storage no está configurado');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // Subir el archivo
      const uploadResponse = await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      if (uploadResponse._response.status !== 201) {
        throw new Error('Error al subir el archivo a Azure Storage');
      }

      console.log('✅ Archivo subido a Azure:', fileName);
      return blockBlobClient.url;
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo de Azure Blob Storage
   * @param fileName - Nombre del archivo a eliminar
   */
  async deleteFile(fileName: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error('Azure Storage no está configurado');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      const deleteResponse = await blockBlobClient.deleteIfExists();

      if (deleteResponse.succeeded) {
        console.log('🗑️ Archivo eliminado de Azure:', fileName);
      } else {
        console.warn('⚠️ Archivo no encontrado en Azure para eliminar:', fileName);
      }
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Extrae el nombre del archivo de una URL de Azure
   * @param url - URL completa del archivo
   * @returns Nombre del archivo
   */
  extractFileNameFromUrl(url: string): string {
    try {
      // La URL completa es: https://account.blob.core.windows.net/container/fileName
      // Necesitamos extraer todo después del nombre del contenedor
      const containerIndex = url.indexOf(this.containerName);
      if (containerIndex === -1) {
        console.error('❌ Container name not found in URL:', url);
        return '';
      }

      // Extraer todo después del nombre del contenedor
      const fileNameWithSlash = url.substring(containerIndex + this.containerName.length);
      // Remover el slash inicial
      const fileName = fileNameWithSlash.startsWith('/') ? fileNameWithSlash.substring(1) : fileNameWithSlash;

      console.log('📁 Extracted fileName from URL:', fileName);
      return fileName;
    } catch (error) {
      console.error('❌ Error al extraer nombre del archivo de la URL:', error);
      return '';
    }
  }

  /**
   * Genera una URL temporal con SAS token para descargar/ver un documento
   * @param fileName - Nombre del archivo en Azure
   * @param expiresInMinutes - Minutos para expirar el token (por defecto 60)
   * @returns URL con SAS token
   */
  async generateSasUrl(fileName: string, expiresInMinutes: number = 60): Promise<string> {
    if (!this.containerClient || !this.accountName || !this.accountKey) {
      throw new Error('Azure Storage no está configurado');
    }

    try {
      const blobClient = this.containerClient.getBlobClient(fileName);

      const expiresOn = new Date();
      expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);

      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName: fileName,
          permissions: BlobSASPermissions.parse('r'), // Solo lectura
          expiresOn,
          version: '2024-08-04', // Usar versión actual de API
        },
        new StorageSharedKeyCredential(this.accountName, this.accountKey)
      ).toString();

      const sasUrl = `${blobClient.url}?${sasToken}`;
      console.log('🔐 SAS URL generada para:', fileName, '(expira en', expiresInMinutes, 'minutos)');
      return sasUrl;
    } catch (error) {
      console.error('❌ Error al generar SAS URL:', error);
      throw new Error(`Error al generar URL de acceso: ${error.message}`);
    }
  }
}