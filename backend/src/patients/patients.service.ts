import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(data: Partial<Patient>) {
    const newPatient = this.patientRepo.create(data);
    return this.patientRepo.save(newPatient);
  }


  async findAll() {
    return await this.patientRepo.find({
      relations: ['emergencyContacts', 'operations', 'notes', 'documents'],
    });
  }

  async findOne(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['emergencyContacts', 'operations', 'notes', 'documents'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, data: Partial<Patient>) {
    const patient = await this.findOne(id);
    Object.assign(patient, data);
    return await this.patientRepo.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    return await this.patientRepo.remove(patient);
  }
}
