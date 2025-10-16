import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { PatientDocumentsService } from './patient-documents.service';
import { PatientDocument } from '../entities/patient-document.entity';

@Controller('patient-documents')
export class PatientDocumentsController {
  constructor(private readonly docsService: PatientDocumentsService) {}

  @Post()
  async create(@Body() docData: Partial<PatientDocument>) {
    return this.docsService.create(docData);
  }

  @Get()
  async findAll() {
    return this.docsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.docsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.docsService.delete(id);
  }
}
