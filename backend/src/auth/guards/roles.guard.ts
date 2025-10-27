import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../shared/enums/user-role.enum';
import { PERMISSIONS_BY_ROLE } from '../permissions/permissions.config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Obtiene el rol requerido desde el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no define roles, se permite por defecto
    if (!requiredRoles) return true;

    // 2️⃣ Obtiene el usuario del request (ya validado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3️⃣ Verifica que el rol del usuario esté dentro de los roles permitidos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Acceso denegado para el rol: ${user.role}`);
    }

    return true;
  }
}
