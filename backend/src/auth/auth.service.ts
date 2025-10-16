import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../shared/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    rut: string,
    role: UserRole = UserRole.PATIENT,
  ) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ name, email, rut, password: hashed, role });
    await this.usersRepo.save(user);

    return {
      message: 'Usuario registrado con éxito',
      email: user.email,
      role: user.role,
      id: user.id,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token, role: user.role };
  }

  async getProfile(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    return user || null;
  }
}
