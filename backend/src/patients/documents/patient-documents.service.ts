import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDocument } from '../entities/patient-document.entity';

@Injectable()
export class PatientDocumentsService {
  constructor(
    @InjectRepository(PatientDocument)
    private docsRepo: Repository<PatientDocument>,
  ) {}

  async create(docData: Partial<PatientDocument>) {
    // Normalizar patientId a mayúsculas si existe
    if (docData.patientId) {
      docData.patientId = docData.patientId.toUpperCase();
    }
    
    // Asegurar que uploadDate tenga un valor
    if (!docData.uploadDate) {
      docData.uploadDate = new Date().toISOString();
    }
    
    console.log('📄 Creating document with patientId:', docData.patientId);
    const doc = this.docsRepo.create(docData);
    const saved = await this.docsRepo.save(doc);
    console.log('✅ Document created:', saved.id);
    return saved;
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
    await this.docsRepo.remove(doc);
    return { message: 'Documento eliminado correctamente' };
  }
}
