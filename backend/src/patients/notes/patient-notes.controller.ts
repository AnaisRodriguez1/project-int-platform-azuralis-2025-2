import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { PatientNotesService } from './patient-notes.service';
import { PatientNote } from '../entities/patient-note.entity';

@Controller('patient-notes')
export class PatientNotesController {
  constructor(private readonly notesService: PatientNotesService) {}

  @Post()
  async create(@Body() noteData: Partial<PatientNote>) {
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
