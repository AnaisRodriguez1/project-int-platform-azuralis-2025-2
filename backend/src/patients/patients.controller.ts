import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './entities/patient.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('my-care-team/patients')
  @UseGuards(JwtAuthGuard)
  findMyCareTeamPatients(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.patientsService.findMyCareTeamPatients(userId);
  }

  @Get('search/by-rut/:rut')
  findByRut(@Param('rut') rut: string) {
    return this.patientsService.findByRut(rut);
  }

  // Specific routes with :id must come before the generic :id route
  @Get(':id/name')
  async getPatientName(@Param('id') id: string) {
    const name = await this.patientsService.getPatientName(id);
    return { name };
  }

  @Get(':id/qr')
  async getQRCode(@Param('id') id: string, @Res() res: Response) {
    const qrCodeImage = await this.patientsService.generateQRCode(id);
    
    // Convertir Data URL a Buffer
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Devolver como imagen PNG
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    res.send(imageBuffer);
  }

  @Get(':id/notes')
  async getPatientNotes(@Param('id') id: string) {
    return this.patientsService.findPatientNotes(id);
  }

  @Get(':id/documents')
  async getPatientDocuments(@Param('id') id: string) {
    return this.patientsService.findPatientDocuments(id);
  }

  // Generic :id route must come last
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Patient>) {
    return this.patientsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
