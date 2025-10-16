import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    const { name, email, password, role } = body;
    return this.authService.register(name, email, password, role);
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
