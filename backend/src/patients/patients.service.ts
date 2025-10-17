import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import * as QRCode from 'qrcode';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(data: Partial<Patient>) {
    // Convertir arrays a JSON strings si vienen como arrays
    const processedData = {
      ...data,
      allergies: Array.isArray(data.allergies) 
        ? JSON.stringify(data.allergies) 
        : data.allergies || '[]',
      currentMedications: Array.isArray(data.currentMedications) 
        ? JSON.stringify(data.currentMedications) 
        : data.currentMedications || '[]',
      qrCode: 'PLACEHOLDER', // Placeholder temporal para evitar NULL
    };

    // Crear y guardar el paciente primero
    const newPatient = this.patientRepo.create(processedData);
    const savedPatient = await this.patientRepo.save(newPatient);
    
    // Actualizar con el identificador del QR real
    savedPatient.qrCode = `PATIENT:${savedPatient.id}`;
    return await this.patientRepo.save(savedPatient);
  }


  async findAll() {
    return await this.patientRepo.find();
  }

  async findOne(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
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

  async generateQRCode(id: string): Promise<string> {
    const patient = await this.findOne(id);
    
    // Generar QR Code dinámicamente
    const qrData = patient.qrCode || `PATIENT:${patient.id}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrCodeDataURL;
  }
}
