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

import * as path from 'path';
import * as fs from 'fs';

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

  @Get(':id/name')
  async getPatientName(@Param('id') id: string) {
    const name = await this.patientsService.getPatientName(id);
    return { name };
  }

  // ✅ Nuevo endpoint: devuelve el QR físico (.png)
  @Get(':id/qr')
  async getQRCode(@Param('id') id: string, @Res() res: Response) {
    const { buffer, path: filePath } = await this.patientsService.getQRCodeImage(id);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.send(buffer);
  }


  @Get(':id/notes')
  async getPatientNotes(@Param('id') id: string) {
    return this.patientsService.findPatientNotes(id);
  }

  @Get(':id/documents')
  async getPatientDocuments(@Param('id') id: string) {
    return this.patientsService.findPatientDocuments(id);
  }

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