import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDocument } from '../entities/patient-document.entity';
import { AzureStorageService } from '../../shared/services/azure-storage.service';

@Injectable()
export class PatientDocumentsService {
  constructor(
    @InjectRepository(PatientDocument)
    private docsRepo: Repository<PatientDocument>,
    private azureStorageService: AzureStorageService,
  ) {}

  async create(docData: Partial<PatientDocument>, file: Express.Multer.File) {
    // Normalizar patientId a mayúsculas si existe
    if (docData.patientId) {
      docData.patientId = docData.patientId.toUpperCase();
    }
    
    // Asegurar que uploadDate tenga un valor
    if (!docData.uploadDate) {
      docData.uploadDate = new Date().toISOString();
    }

    // Generar nombre único para el archivo en Azure
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${docData.patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    try {
      // Subir archivo a Azure Blob Storage
      console.log('📤 Intentando subir archivo a Azure:', uniqueFileName);
      const azureUrl = await this.azureStorageService.uploadFile(file, uniqueFileName);
      console.log('✅ Archivo subido a Azure:', azureUrl);
      
      // Guardar la URL de Azure en la base de datos
      docData.url = azureUrl;
      
      console.log('📄 Creating document with patientId:', docData.patientId);
      const doc = this.docsRepo.create(docData);
      const saved = await this.docsRepo.save(doc);
      console.log('✅ Document created:', saved.id);
      return saved;
    } catch (error) {
      console.error('❌ Error al crear documento:', error);
      console.error('❌ Detalles del error:', error.message);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Error al subir el documento: ${error.message}`);
    }
  }

  async findAll() {
    return this.docsRepo.find();
  }

  async findOne(id: string) {
    return this.docsRepo.findOne({ where: { id } });
  }

  async update(id: string, docData: Partial<PatientDocument>) {
    const doc = await this.docsRepo.findOne({ where: { id } });
    if (!doc) {
      throw new Error('Documento no encontrado');
    }
    
    // Actualizar solo los campos proporcionados
    Object.assign(doc, docData);
    return this.docsRepo.save(doc);
  }

  async delete(id: string) {
    const doc = await this.docsRepo.findOne({ where: { id } });
    if (!doc) return { message: 'Documento no encontrado' };
    
    // Eliminar archivo de Azure Storage si existe
    if (doc.url) {
      const fileName = this.azureStorageService.extractFileNameFromUrl(doc.url);
      if (fileName) {
        try {
          await this.azureStorageService.deleteFile(fileName);
        } catch (error) {
          console.error('⚠️ Error al eliminar archivo de Azure (continuando):', error);
        }
      }
    }
    
    await this.docsRepo.remove(doc);
    return { message: 'Documento eliminado correctamente' };
  }

  /**
   * Genera una URL temporal con SAS token para descargar/ver un documento
   * @param id - ID del documento en la base de datos
   * @returns Objeto con la URL temporal (válida por 1 hora)
   */
  async generateDownloadUrl(id: string) {
    console.log('🔍 Generando URL de descarga para documento:', id);
    
    const doc = await this.docsRepo.findOne({ where: { id } });
    if (!doc) {
      throw new Error('Documento no encontrado');
    }

    console.log('📄 Documento encontrado:', { id: doc.id, title: doc.title, url: doc.url });

    if (!doc.url) {
      throw new Error('El documento no tiene una URL asociada');
    }

    // Extraer el nombre del archivo desde la URL
    const fileName = this.azureStorageService.extractFileNameFromUrl(doc.url);
    console.log('📁 Nombre de archivo extraído:', fileName);
    
    if (!fileName) {
      throw new Error('No se pudo extraer el nombre del archivo desde la URL');
    }

    try {
      // Generar URL con SAS token (válida por 60 minutos)
      const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 60);
      
      console.log('✅ SAS URL generada exitosamente');
      
      return {
        id: doc.id,
        fileName: doc.title || fileName,
        url: sasUrl,
        expiresIn: 60, // minutos
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('❌ Error al generar URL de descarga:', error);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Error al generar URL de descarga: ${error.message}`);
    }
  }
}
