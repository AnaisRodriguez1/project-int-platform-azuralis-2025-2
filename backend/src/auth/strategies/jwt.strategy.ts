import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-clave-secreta-super-segura', // Debe coincidir con el secret en auth.module
    });
  }

  async validate(payload: any) {
    // El payload es el objeto que se firmó en el JWT (con sub, email, role)
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role,
      sub: payload.sub // Mantener sub para compatibilidad
    };
  }
}
