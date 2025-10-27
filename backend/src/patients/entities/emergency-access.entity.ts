import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity('emergency_accesses')
export class EmergencyAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accessorRut: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  patient: Patient;

  @Column()
  patientId: number;

  @CreateDateColumn()
  accessedAt: Date;
}
