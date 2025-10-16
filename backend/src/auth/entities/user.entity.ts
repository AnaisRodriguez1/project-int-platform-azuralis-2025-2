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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  profilePhoto?: string;

  @OneToMany(() => PatientNote, (note) => note.author)
  notesAuthored: PatientNote[];

  @OneToMany(() => PatientDocument, (doc) => doc.uploader)
  documentsUploaded: PatientDocument[];
}
