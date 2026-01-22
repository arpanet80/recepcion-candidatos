import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { NotificacionService } from '../../core/services/notificacion.service';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { LoggerService } from '../../core/services/seguridad/logger.service';
import { TokenService } from '../../core/services/seguridad/token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const notificacionService = inject(NotificacionService);
  const logger = inject(LoggerService); // ✅ NUEVO

  if (!authService.isAuthenticated()) {
    logger.warn('Usuario no autenticado intentando acceder a ruta protegida');
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as number[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = tokenService.getCurrentUser();
  if (!currentUser) {
    logger.error('No se pudo obtener información del usuario');
    authService.logout();
    return false;
  }

  const hasRequiredRole = requiredRoles.some(role => 
    tokenService.hasRole(role)
  );

  if (hasRequiredRole) {
    logger.debug('Acceso permitido para rol autorizado');
    return true;
  } else {
    // ✅ Log de seguridad sin exponer datos sensibles
    logger.security('Intento de acceso no autorizado por rol', {
      url: state.url,
      requiredRoles: requiredRoles,
      timestamp: new Date().toISOString()
    });
    
    notificacionService.showError(
      'No tiene los permisos necesarios para acceder a esta sección.', 
      'Acceso Denegado'
    );
    router.navigate(['/dashboard/home']);
    return false;
  }
};