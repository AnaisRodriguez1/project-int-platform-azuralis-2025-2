import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  relationship: string;

  @Column()
  phone: string;

  @ManyToOne(() => Patient, (patient) => patient.emergencyContacts, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
