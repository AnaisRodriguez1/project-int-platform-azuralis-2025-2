import { Body, Controller, Get, Param, Put, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(id, updateData);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id/search-history')
  @UseGuards(JwtAuthGuard)
  async addSearchHistory(
    @Param('id') id: string,
    @Body() body: { patientId: string; patientRut: string }
  ) {
    return this.usersService.addSearchHistory(id, body.patientId, body.patientRut);
  }
}
