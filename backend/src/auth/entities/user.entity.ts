import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PatientNote } from '../../patients/entities/patient-note.entity';
import { PatientDocument } from '../../patients/entities/patient-document.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  rut: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  // ---- CAMPOS ESPECÍFICOS POR ROL ----

  // 🧑‍⚕️ DOCTOR/NURSE
  @Column({ nullable: true })
  specialization?: string; // doctor

  @Column({ nullable: true })
  department?: string; // nurse

  @Column({ nullable: true })
  license?: string; // ambos

  @Column('text', { array: true, nullable: true })
  assignedPatients?: string[]; // IDs de pacientes asignados

  // 🧑‍🤝‍🧑 GUARDIAN
  @Column('text', { array: true, nullable: true })
  patientIds?: string[]; // IDs de pacientes a cargo

  // 👩‍⚕️ CLÍNICO
  @Column('jsonb', { nullable: true })
  scanHistory?: { patientId: string; scannedAt: Date }[];

  // 🧑 PACIENTE
  @Column({ nullable: true })
  patientId?: string; // vínculo directo con tabla patients
}


/*  @OneToMany(() => PatientNote, (note) => note.author)
  notesAuthored: PatientNote[];

  @OneToMany(() => PatientDocument, (doc) => doc.uploader)
  documentsUploaded: PatientDocument[];
} */
