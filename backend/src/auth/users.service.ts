import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // No permitir actualizar password directamente (debería haber un endpoint específico)
    delete updateData.password;
    delete updateData.email; // El email tampoco debería cambiarse así
    delete updateData.rut; // El RUT tampoco

    Object.assign(user, updateData);
    const updated = await this.userRepo.save(user);
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword as User;
  }

  async addSearchHistory(userId: string, patientId: string, patientRut: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse existing search history
    let searchHistory: any[] = [];
    try {
      searchHistory = user.scanHistory ? JSON.parse(user.scanHistory) : [];
    } catch {
      searchHistory = [];
    }

    // Add new search record
    const newRecord = {
      patientId,
      patientRut,
      searchedAt: new Date().toISOString(),
    };

    // Limit to last 50 searches
    searchHistory = [newRecord, ...searchHistory].slice(0, 50);

    // Save back
    user.scanHistory = JSON.stringify(searchHistory);
    const updated = await this.userRepo.save(user);

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword as User;
  }
}
