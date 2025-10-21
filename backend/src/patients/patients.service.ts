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
    const patients = await this.patientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.careTeam', 'careTeamMember', 'careTeamMember.status = :status', { status: 'active' })
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .getMany();
    
    // Convertir JSON strings a arrays para el frontend
    return patients.map(patient => this.parsePatientData(patient));
  }

  async findMyCareTeamPatients(userId: string) {
    // Obtener pacientes donde el usuario está en el careTeam activo
    // Usamos dos aliases diferentes: uno para filtrar (myMembership) y otro para cargar todos (allMembers)
    const patients = await this.patientRepo
      .createQueryBuilder('patient')
      .innerJoin('patient.careTeam', 'myMembership', 'myMembership.userId = :userId AND myMembership.status = :status', { userId, status: 'active' })
      .leftJoinAndSelect('patient.careTeam', 'allMembers', 'allMembers.status = :activeStatus', { activeStatus: 'active' })
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .getMany();
    
    return patients.map(patient => this.parsePatientData(patient));
  }

  async findOne(id: string) {
    const patient = await this.patientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.careTeam', 'careTeamMember', 'careTeamMember.status = :status', { status: 'active' })
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .where('patient.id = :id', { id })
      .getOne();
      
    if (!patient) throw new NotFoundException('Patient not found');
    // Convertir JSON strings a arrays para el frontend
    return this.parsePatientData(patient);
  }

  async findByRut(rut: string) {
    // Normalizar RUT para búsqueda (quitar puntos y convertir a minúsculas)
    const normalizedRut = rut.replace(/\./g, '').toLowerCase();
    
    const patients = await this.patientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.careTeam', 'careTeamMember', 'careTeamMember.status = :status', { status: 'active' })
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .getMany();
    
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
      operations: [], 
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
    console.log('🔍 UPDATE - Received data:', JSON.stringify(data, null, 2));
    console.log('🔍 UPDATE - Patient ID:', id);
    
    try {
      // Convertir arrays a JSON strings - SOLO los que vienen en data
      const processedData = { ...data };
      
      if ('allergies' in processedData && Array.isArray(processedData.allergies)) {
        processedData.allergies = processedData.allergies.length > 0 
          ? JSON.stringify(processedData.allergies) as any
          : '[]' as any;
        console.log('🔄 Converted allergies to:', processedData.allergies);
      }
      
      if ('currentMedications' in processedData && Array.isArray(processedData.currentMedications)) {
        processedData.currentMedications = processedData.currentMedications.length > 0
          ? JSON.stringify(processedData.currentMedications) as any
          : '[]' as any;
        console.log('🔄 Converted currentMedications to:', processedData.currentMedications);
      }
      
      // Construir UPDATE SQL manualmente
      const fields = Object.keys(processedData).filter(key => key !== 'id' && key !== 'emergencyContacts' && key !== 'operations' && key !== 'careTeam');
      
      if (fields.length > 0) {
        const setClause = fields.map((field, idx) => `[${field}] = @${idx}`).join(', ');
        const values = fields.map(field => processedData[field]);
        
        const sql = `UPDATE [patients] SET ${setClause} WHERE [id] = @${fields.length}`;
        console.log('🔧 SQL:', sql);
        console.log('🔧 Values:', values);
        
        await this.patientRepo.query(sql, [...values, id]);
        console.log('✅ Raw SQL update successful');
      }
      
      // Ahora cargar el paciente actualizado para retornarlo
      const result = await this.findOne(id);
      console.log('✅ Patient reloaded');
      
      return result;
    } catch (error) {
      console.error('❌ Error in update:', error);
      throw error;
    }
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

  async saveScanHistory(patientId: string, patientRut: string) {
    const patient = await this.findOne(patientId);
    return {
      patientId,
      patientRut: patientRut.toUpperCase(),
      patientName: patient.name,
      searchedAt: new Date(),
    };
  }

  async findPatientNotes(patientId: string) {
    // Normalizar patientId a mayúsculas para búsqueda
    const normalizedId = patientId.toUpperCase();
    console.log('🔍 findPatientNotes - Buscando notas para patientId:', normalizedId);
    
    // Buscar todas las notas del paciente ordenadas por fecha
    const notes = await this.notesRepo.find({
      where: { patientId: normalizedId },
      order: { createdAt: 'DESC' },
    });
    
    console.log('✅ findPatientNotes - Notas encontradas:', notes.length);
    return notes;
  }

  async findPatientDocuments(patientId: string) {
    // Normalizar patientId a mayúsculas para búsqueda
    const normalizedId = patientId.toUpperCase();
    console.log('🔍 findPatientDocuments - Buscando documentos para patientId:', normalizedId);
    
    // Buscar todos los documentos del paciente ordenados por fecha
    const documents = await this.documentsRepo.find({
      where: { patientId: normalizedId },
      order: { uploadDate: 'DESC' },
    });
    
    console.log('✅ findPatientDocuments - Documentos encontrados:', documents.length);
    return documents;
  }

  async getPatientName(patientId: string): Promise<string> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId.toUpperCase() }, // Convertir a MAYÚSCULAS para buscar en BD
      select: ['name'],
    });
    
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    
    return patient.name;
  }
}
