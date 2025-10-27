import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyAccess } from '../entities/emergency-access.entity';
import { Patient } from '../entities/patient.entity';
import { EmergencyAccessDto } from '../dto/emergency-access.dto';

@Injectable()
export class EmergencyAccessService {
  constructor(
    @InjectRepository(EmergencyAccess)
    private emergencyAccessRepository: Repository<EmergencyAccess>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  /**
   * Validates Chilean RUT using modulo 11 algorithm
   */
  private validateRut(rut: string): boolean {
    // Remove dots and hyphens
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    // Extract number and verifier digit
    const rutNumber = cleanRut.slice(0, -1);
    const verifierDigit = cleanRut.slice(-1);

    // Validate format
    if (!/^\d+$/.test(rutNumber)) {
      return false;
    }

    // Calculate expected verifier digit using modulo 11
    let sum = 0;
    let multiplier = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedVerifier = 11 - remainder;

    let expectedVerifier: string;
    if (calculatedVerifier === 11) {
      expectedVerifier = '0';
    } else if (calculatedVerifier === 10) {
      expectedVerifier = 'K';
    } else {
      expectedVerifier = calculatedVerifier.toString();
    }

    return verifierDigit === expectedVerifier;
  }

  /**
   * Register emergency access and return patient data
   */
  async registerEmergencyAccess(
    qrCode: string,
    emergencyAccessDto: EmergencyAccessDto,
  ) {
    // Validate RUT
    if (!this.validateRut(emergencyAccessDto.rut)) {
      throw new BadRequestException('RUT inválido. Verifica el formato y dígito verificador.');
    }

    // Find patient by QR code or by ID (extract UUID if qrCode format is PATIENT:uuid)
    let patient = await this.patientRepository.findOne({
      where: { qrCode },
      relations: ['emergencyContacts', 'careTeam'],
    });

    // If not found by qrCode, try extracting UUID and searching by ID
    if (!patient && qrCode.startsWith('PATIENT:')) {
      const patientId = qrCode.replace('PATIENT:', '');
      patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['emergencyContacts', 'careTeam'],
      });
    }

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado con este código QR');
    }

    // Register emergency access
    const emergencyAccess = this.emergencyAccessRepository.create({
      accessorRut: emergencyAccessDto.rut,
      patient,
    });

    await this.emergencyAccessRepository.save(emergencyAccess);

    // Return patient data (without emergency access logs)
    return patient;
  }
}
