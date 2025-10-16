import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientNote } from '../entities/patient-note.entity';

@Injectable()
export class PatientNotesService {
  constructor(
    @InjectRepository(PatientNote)
    private notesRepo: Repository<PatientNote>,
  ) {}

  async create(noteData: Partial<PatientNote>) {
    const note = this.notesRepo.create(noteData);
    return this.notesRepo.save(note);
  }

  async findAll() {
    return this.notesRepo.find();
  }

  async findOne(id: string) {
    return this.notesRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    const note = await this.notesRepo.findOne({ where: { id } });
    if (!note) return { message: 'Nota no encontrada' };
    await this.notesRepo.remove(note);
    return { message: 'Nota eliminada correctamente' };
  }
}
