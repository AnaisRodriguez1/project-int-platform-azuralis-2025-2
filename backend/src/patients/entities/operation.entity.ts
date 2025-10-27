import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @Column()
  procedure: string;

  @Column()
  hospital: string;

  @ManyToOne(() => Patient, (patient) => patient.operations, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
