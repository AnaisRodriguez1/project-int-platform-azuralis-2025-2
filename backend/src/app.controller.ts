import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    const { nombre, email, password, rol } = body;
    return this.authService.register(nombre, email, password, rol);
  }

  @Post('login')
  login(@Body() body: any) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    return this.authService.getProfile(id);
  }
}