import { Controller, Post, Get, Param, Body, Delete, Put } from '@nestjs/common';
import { CareTeamService } from './care-team.service';
import { CareTeamMember } from '../entities/care-team-member.entity';

@Controller('care-team')
export class CareTeamController {
  constructor(private readonly careTeamService: CareTeamService) {}

  // Crear un miembro del equipo médico
  @Post()
  async addMember(@Body() data: Partial<CareTeamMember>) {
    return this.careTeamService.addMember(data);
  }

  // Obtener todos los miembros
  @Get()
  async findAll() {
    return this.careTeamService.findAll();
  }

  // Obtener miembros de un paciente específico
  @Get('by-patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    return this.careTeamService.findByPatient(patientId);
  }

  // Actualizar rol o estado de un miembro
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CareTeamMember>) {
    return this.careTeamService.update(id, data);
  }

  // Eliminar un miembro del equipo
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.careTeamService.remove(id);
  }
}
