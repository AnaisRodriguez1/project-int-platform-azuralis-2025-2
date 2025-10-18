import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Delete, 
  Put, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientDocumentsService } from './patient-documents.service';
import { PatientDocument } from '../entities/patient-document.entity';

@Controller('patient-documents')
export class PatientDocumentsController {
  constructor(private readonly docsService: PatientDocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() docData: Partial<PatientDocument>,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado un archivo');
    }
    return this.docsService.create(docData, file);
  }

  @Get()
  async findAll() {
    return this.docsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.docsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() docData: Partial<PatientDocument>) {
    return this.docsService.update(id, docData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.docsService.delete(id);
  }

  @Get(':id/download-url')
  async getDownloadUrl(@Param('id') id: string) {
    return this.docsService.generateDownloadUrl(id);
  }
}
