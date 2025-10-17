import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { CareTeamRole } from '../../shared/enums/care-team-role.enum';

@Entity('care_team_members')
export class CareTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // ID del médico/enfermero (User.id)

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  role: CareTeamRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: string;

  @ManyToOne(() => Patient, (patient) => patient.careTeam, { onDelete: 'CASCADE' })
  patient: Patient;
}
