import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Req, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';

@Controller('users/:userId/profile-picture')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (req.user.sub.toLowerCase() !== userId.toLowerCase()) {
      throw new ForbiddenException('No puedes cambiar la foto de perfil de otro usuario');
    }
    return this.profileService.uploadProfilePicture(userId, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async get(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.sub.toLowerCase() !== userId.toLowerCase()) {
      throw new ForbiddenException('No puedes ver la foto de perfil de otro usuario');
    }
    try {
      return await this.profileService.getProfilePicture(userId);
    } catch (error) {
      console.error('Error getting profile picture:', error);
      throw error;
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async delete(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.sub.toLowerCase() !== userId.toLowerCase()) {
      throw new ForbiddenException('No puedes eliminar la foto de perfil de otro usuario');
    }
    return this.profileService.deleteProfilePicture(userId);
  }
}