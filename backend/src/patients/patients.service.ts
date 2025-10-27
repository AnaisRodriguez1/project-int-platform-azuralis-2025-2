import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { PatientNote } from './entities/patient-note.entity';
import { PatientDocument } from './entities/patient-document.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import * as QRCode from 'qrcode';

import * as fs from 'fs';
import * as path from 'path';

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

    // 1️⃣ Guardar paciente para obtener ID
    const newPatient = this.patientRepo.create(processedData);
    const savedPatient = await this.patientRepo.save(newPatient);

    // 2️⃣ Generar QR Code con la URL al frontend
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrData = `${frontendBaseUrl}/patient/${savedPatient.id}`;

    // Crear carpeta de destino si no existe
    const qrDir = path.join(__dirname, '../../uploads/qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const qrFileName = `patient-${savedPatient.id}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);

    // 3️⃣ Generar archivo físico del QR
    await QRCode.toFile(qrFilePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // 4️⃣ Guardar la ruta del archivo en la BD
    const relativePath = `/uploads/qr/${qrFileName}`;
    savedPatient.qrCode = relativePath;
    await this.patientRepo.save(savedPatient);

    // 5️⃣ Devolver al frontend (sin JSON strings rotos)
    return this.parsePatientData(savedPatient);
  }


  async findAll() {
    const patients = await this.patientRepo
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.careTeam', 'careTeamMember', 'careTeamMember.status = :status', { status: 'active' })
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .getMany();

    return patients.map((p) => this.parsePatientData(p));
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
    return this.parsePatientData(patient);
  }

// 6️⃣ Endpoint auxiliar para servir el QR
  async getQRCodeImage(id: string): Promise<{ buffer: Buffer; path: string }> {
    const patient = await this.findOne(id);
    if (!patient.qrCode) {
      throw new NotFoundException('QR no encontrado');
    }

    const qrPath = path.join(__dirname, '../../', patient.qrCode);
    if (!fs.existsSync(qrPath)) {
      throw new NotFoundException('Archivo QR no existe en el servidor');
    }

    const buffer = fs.readFileSync(qrPath);
    return { buffer, path: qrPath };
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
    
    // Usar variable de entorno según el ambiente
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = isProduction 
      ? (process.env.FRONTEND_URL_PROD || 'https://frontend-azuralis-project-int-platform.onrender.com')
      : (process.env.FRONTEND_URL || 'http://localhost:5173');
    
    const emergencyUrl = `${frontendUrl}/emergency/${patient.qrCode}`;
    
    // Generar QR Code con la URL de emergencia
    const qrCodeDataURL = await QRCode.toDataURL(emergencyUrl, {
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

  async getScanHistory(patientId: string) {
    // TODO: Implementar sin ScanHistory entity
    return [];
  }

  async getPatientName(patientId: string): Promise<string> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
      select: ['name'],
    });
    
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    
    return patient.name;
  }
}