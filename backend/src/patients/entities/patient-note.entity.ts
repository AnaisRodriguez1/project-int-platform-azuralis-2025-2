import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('patient_notes')
export class PatientNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  patientId: string; // FK explícita, útil para queries rápidas

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  // Relaciones (opcional, para TypeORM)
  @ManyToOne(() => Patient, (patient) => patient.notes, { onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  author: User;
}
