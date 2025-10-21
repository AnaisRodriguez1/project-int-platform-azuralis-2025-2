import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { PatientNote } from './entities/patient-note.entity';
import { PatientDocument } from './entities/patient-document.entity';
import { PatientNotesController } from './notes/patient-notes.controller';
import { PatientNotesService } from './notes/patient-notes.service';
import { PatientDocumentsController } from './documents/patient-documents.controller';
import { PatientDocumentsService } from './documents/patient-documents.service';
import { Operation } from './entities/operation.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CareTeamMember } from './entities/care-team-member.entity';
import { CareTeamController } from './care-team/care-team.controller';
import { CareTeamService } from './care-team/care-team.service';
import { AzureStorageService } from './documents/azure-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      EmergencyContact,
      Operation,
      PatientNote,
      PatientDocument,
      CareTeamMember,
    ]),
  ],
  controllers: [PatientsController, PatientNotesController, PatientDocumentsController, CareTeamController],
  providers: [PatientsService, PatientNotesService, PatientDocumentsService, CareTeamService, AzureStorageService],
})
export class PatientsModule {}
