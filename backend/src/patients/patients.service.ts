import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    // Convertir arrays a JSON strings para Azure SQL
    const processedData = {
      ...createPatientDto,
      allergies: Array.isArray(createPatientDto.allergies) 
        ? JSON.stringify(createPatientDto.allergies) 
        : '[]',
      currentMedications: Array.isArray(createPatientDto.currentMedications) 
        ? JSON.stringify(createPatientDto.currentMedications) 
        : '[]',
      qrCode: 'PLACEHOLDER', // Placeholder temporal para evitar NULL
    };

    // Crear y guardar el paciente primero
    const newPatient = this.patientRepo.create(processedData);
    const savedPatient = await this.patientRepo.save(newPatient);
    
    // Actualizar con el identificador del QR real
    savedPatient.qrCode = `PATIENT:${savedPatient.id}`;
    const finalPatient = await this.patientRepo.save(savedPatient);
    
    // Devolver con arrays parseados
    return this.parsePatientData(finalPatient);
  }


  async findAll() {
    const patients = await this.patientRepo.find();
    // Convertir JSON strings a arrays para el frontend
    return patients.map(patient => this.parsePatientData(patient));
  }

  async findOne(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    // Convertir JSON strings a arrays para el frontend
    return this.parsePatientData(patient);
  }

  private parsePatientData(patient: Patient): any {
    return {
      ...patient,
      allergies: this.parseJsonString(patient.allergies),
      currentMedications: this.parseJsonString(patient.currentMedications),
    };
  }

  private parseJsonString(value: string): string[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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
