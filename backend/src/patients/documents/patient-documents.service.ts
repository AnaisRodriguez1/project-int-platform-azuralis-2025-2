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
    const doc = this.docsRepo.create(docData);
    return this.docsRepo.save(doc);
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
