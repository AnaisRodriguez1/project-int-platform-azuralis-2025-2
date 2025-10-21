import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfilePicture } from './entities/user-profile-picture.entity';
import { AzureStorageService } from '../shared/azure-storage.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfilePicture)
    private profileRepo: Repository<UserProfilePicture>,
    private azureStorageService: AzureStorageService,
  ) {}

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    // Generar nombre único para el archivo
    const fileName = `profiles/${userId}/${Date.now()}-${file.originalname}`;
    const url = await this.azureStorageService.uploadFile(file, fileName);

    // Eliminar foto anterior si existe
    const existing = await this.profileRepo.findOne({ where: { userId } });
    if (existing) {
      await this.azureStorageService.deleteFile(this.azureStorageService.extractFileNameFromUrl(existing.url));
      await this.profileRepo.remove(existing);
    }

    // Crear nueva entrada
    const profile = this.profileRepo.create({ userId, url, uploadDate: new Date() });
    const savedProfile = await this.profileRepo.save(profile);

    // Generar SAS URL para devolver al frontend
    const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 60 * 24); // 24 horas
    return { ...savedProfile, url: sasUrl };
  }

  async getProfilePicture(userId: string) {
    try {
      const profile = await this.profileRepo.findOne({ where: { userId } });
      if (!profile) return null;

      const fileName = this.azureStorageService.extractFileNameFromUrl(profile.url);
      const sasUrl = await this.azureStorageService.generateSasUrl(fileName, 60 * 24); // 24 horas
      return { ...profile, url: sasUrl };
    } catch (error) {
      console.error('Error in getProfilePicture service:', error);
      throw error;
    }
  }

  async deleteProfilePicture(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile picture not found');

    await this.azureStorageService.deleteFile(this.azureStorageService.extractFileNameFromUrl(profile.url));
    await this.profileRepo.remove(profile);
    return { message: 'Profile picture deleted' };
  }
}