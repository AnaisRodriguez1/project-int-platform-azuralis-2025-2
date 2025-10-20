import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('patient_notes')
export class PatientNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: Descomentar después de ejecutar update-patient-notes-table.sql
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  createdAt: Date;

  @Column()
  patientId: string; // FK explícita, útil para queries rápidas

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  // TODO: Descomentar después de ejecutar update-patient-notes-table.sql
  @Column({ nullable: true })
  authorRole: string; // Rol del autor (patient, doctor, nurse, guardian)

  // Relaciones (opcional, para TypeORM)
  @ManyToOne(() => Patient, (patient) => patient.notes, { onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  author: User;
}
