import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'PACIENTE' })
  rol: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;
}
