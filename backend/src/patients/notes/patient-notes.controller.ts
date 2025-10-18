import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { PatientNotesService } from './patient-notes.service';
import { PatientNote } from '../entities/patient-note.entity';

@Controller('patient-notes')
export class PatientNotesController {
  constructor(private readonly notesService: PatientNotesService) {}

  @Post()
  async create(@Body() noteData: Partial<PatientNote>) {
    // El authorRole debería venir en el noteData desde el frontend
    // Si no viene, se puede inferir o dejarlo null
    return this.notesService.create(noteData);
  }

  @Get()
  async findAll() {
    return this.notesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() noteData: Partial<PatientNote>) {
    return this.notesService.update(id, noteData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
