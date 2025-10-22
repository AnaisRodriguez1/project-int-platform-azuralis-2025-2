import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfilePicture } from './entities/user-profile-picture.entity';
import { R2StorageService } from '../shared/r2-storage.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfilePicture)
    private userProfilePictureRepository: Repository<UserProfilePicture>,
    private r2StorageService: R2StorageService,
  ) {}

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    // Generar nombre único para el archivo
    const fileName = `${Date.now()}-${file.originalname}`;
    const containerName = 'user-profiles';
    
    // Subir archivo a R2
    const url = await this.r2StorageService.uploadFile(
      containerName,
      `profiles/${userId}/${fileName}`,
      file.buffer,
      file.mimetype,
    );

    // Eliminar foto anterior si existe
    const existing = await this.userProfilePictureRepository.findOne({ where: { userId } });
    if (existing) {
      const oldKey = await this.r2StorageService.generateSignedUrl(existing.url);
      await this.r2StorageService.deleteFile(containerName, `profiles/${userId}/${fileName}`);
      await this.userProfilePictureRepository.remove(existing);
    }

    // Crear nueva entrada
    const profile = this.userProfilePictureRepository.create({ userId, url, uploadDate: new Date() });
    const savedProfile = await this.userProfilePictureRepository.save(profile);

    // Generar URL firmada para devolver al frontend (válida por 24 horas)
    const signedUrl = await this.r2StorageService.generateSignedUrl(url, 60 * 24);
    return { ...savedProfile, url: signedUrl };
  }

  async getProfilePicture(userId: string) {
    try {
      const profile = await this.userProfilePictureRepository.findOne({ where: { userId } });
      if (!profile) return null;

      // Generar URL firmada válida por 24 horas
      const signedUrl = await this.r2StorageService.generateSignedUrl(profile.url, 60 * 24);
      return { ...profile, url: signedUrl };
    } catch (error) {
      console.error('Error in getProfilePicture service:', error);
      throw error;
    }
  }

  async deleteProfilePicture(userId: string) {
    const profile = await this.userProfilePictureRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile picture not found');

    // Extraer información del archivo desde la URL para eliminarlo de R2
    const containerName = 'user-profiles';
    await this.r2StorageService.deleteFile(containerName, `profiles/${userId}`);
    await this.userProfilePictureRepository.remove(profile);
    return { message: 'Profile picture deleted' };
  }
}