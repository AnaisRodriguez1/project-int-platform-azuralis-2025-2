import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(nombre: string, email: string, password: string, rol: string = 'PACIENTE') {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ nombre, email, password: hashed, rol });
    await this.usersRepo.save(user);
    return { message: 'Usuario registrado con éxito', email: user.email, rol: user.rol };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    const token = this.jwtService.sign(payload);
    return { access_token: token, rol: user.rol };
  }

  async getProfile(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    return user ? { id: user.id, nombre: user.nombre, rol: user.rol } : null;
  }
}
