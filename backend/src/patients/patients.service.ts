import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { PatientNote } from './entities/patient-note.entity';
import { PatientDocument } from './entities/patient-document.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(PatientNote)
    private readonly notesRepo: Repository<PatientNote>,
    @InjectRepository(PatientDocument)
    private readonly documentsRepo: Repository<PatientDocument>,
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
    const patients = await this.patientRepo.find({
      relations: ['careTeam', 'emergencyContacts'],
    });
    // Convertir JSON strings a arrays para el frontend
    return patients.map(patient => this.parsePatientData(patient));
  }

  async findMyCareTeamPatients(userId: string) {
    // Obtener pacientes donde el usuario está en el careTeam activo
    const patients = await this.patientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.careTeam', 'careTeamMember')
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .where('careTeamMember.userId = :userId', { userId })
      .andWhere('careTeamMember.status = :status', { status: 'active' })
      .getMany();
    
    return patients.map(patient => this.parsePatientData(patient));
  }

  async findOne(id: string) {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['careTeam', 'emergencyContacts'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    // Convertir JSON strings a arrays para el frontend
    return this.parsePatientData(patient);
  }

  async findByRut(rut: string) {
    // Normalizar RUT para búsqueda (quitar puntos y convertir a minúsculas)
    const normalizedRut = rut.replace(/\./g, '').toLowerCase();
    
    const patients = await this.patientRepo.find({
      relations: ['careTeam', 'emergencyContacts'],
    });
    
    const patient = patients.find(p => {
      const patientRut = p.rut.replace(/\./g, '').toLowerCase();
      return patientRut === normalizedRut;
    });
    
    if (!patient) {
      throw new NotFoundException('No se encontró ningún paciente con ese RUT');
    }
    
    return this.parsePatientData(patient);
  }

  private parsePatientData(patient: Patient): any {
    return {
      ...patient,
      allergies: this.parseJsonString(patient.allergies),
      currentMedications: this.parseJsonString(patient.currentMedications),
      careTeam: patient.careTeam || [], // Asegurar que careTeam siempre sea un array
      emergencyContacts: patient.emergencyContacts || [], // Asegurar array
      operations: [], // TODO: Implementar operations en la BD
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

  async findPatientNotes(patientId: string) {
    // Buscar todas las notas del paciente ordenadas por fecha
    const notes = await this.notesRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
    return notes;
  }

  async findPatientDocuments(patientId: string) {
    // Buscar todos los documentos del paciente ordenados por fecha
    const documents = await this.documentsRepo.find({
      where: { patientId },
      order: { uploadDate: 'DESC' },
    });
    return documents;
  }
}
