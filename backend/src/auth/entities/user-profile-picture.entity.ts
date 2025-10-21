import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_profile_pictures')
export class UserProfilePicture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  url: string;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  uploadDate: Date;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}