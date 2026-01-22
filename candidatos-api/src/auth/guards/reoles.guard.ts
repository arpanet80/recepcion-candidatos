import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/rol.enum';

@Injectable()
export class ReolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean  {

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    
    const { usuario } = context.switchToHttp().getRequest();

    if (!requiredRoles.some( (role) => usuario.roles.map(o => o.idrol)?.includes(role) )) {
      throw new UnauthorizedException("No tiene permisos para esta peticion")
    }
    
    return true;
    // return requiredRoles.some( (role) => usuario.roles.map(o => o.idrol)?.includes(role) );
  }
}
