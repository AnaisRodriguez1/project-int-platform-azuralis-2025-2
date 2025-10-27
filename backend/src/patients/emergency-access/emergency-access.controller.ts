import { Controller, Post, Param, Body } from '@nestjs/common';
import { EmergencyAccessService } from './emergency-access.service';
import { EmergencyAccessDto } from '../dto/emergency-access.dto';

@Controller('emergency-access')
export class EmergencyAccessController {
  constructor(
    private readonly emergencyAccessService: EmergencyAccessService,
  ) {}

  @Post(':qrCode')
  async registerAccess(
    @Param('qrCode') qrCode: string,
    @Body() emergencyAccessDto: EmergencyAccessDto,
  ) {
    return this.emergencyAccessService.registerEmergencyAccess(
      qrCode,
      emergencyAccessDto,
    );
  }
}
