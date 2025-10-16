import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// --- Entidades relacionadas ---
import { EmergencyContact } from './emergency-contact.entity';
import { Operation } from './operation.entity';
import { PatientNote } from './patient-note.entity';
import { PatientDocument } from './patient-document.entity';
import { CareTeamMember } from './care-team-member.entity';
import { CancerType } from '../../shared/enums/cancer-type.enum';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ unique: true })
  rut: string;

  @Column({ nullable: true })
  photo?: string;

  @Column()
  diagnosis: string;

  @Column({ nullable: true })
  stage: string;

  @Column({
    type: 'enum',
    enum: CancerType,
  })
  cancerType: CancerType;

  @Column('text', { array: true, default: '{}' })
  allergies: string[];

  @Column('text', { array: true, default: '{}' })
  currentMedications: string[];

  @OneToMany(() => EmergencyContact, (contact) => contact.patient, {
    cascade: true,
  })
  emergencyContacts: EmergencyContact[];

  @OneToMany(() => Operation, (operation) => operation.patient, {
    cascade: true,
  })
  operations: Operation[];

  @Column({ type: 'text', nullable: true })
  treatmentSummary: string;

  @OneToMany(() => CareTeamMember, (ctm) => ctm.patient, { cascade: true })
  careTeam: CareTeamMember[];

  @Column({ nullable: false })
  qrCode: string;

  @OneToMany(() => PatientNote, (note) => note.patient, { cascade: true })
  notes?: PatientNote[];

  @OneToMany(() => PatientDocument, (doc) => doc.patient, { cascade: true })
  documents?: PatientDocument[];

}
