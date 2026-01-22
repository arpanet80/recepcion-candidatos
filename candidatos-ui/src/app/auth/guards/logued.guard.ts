import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { TokenService } from '../../core/services/seguridad/token.service';
import { LoggerService } from '../../core/services/seguridad/logger.service';

export const loguedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const logger = inject(LoggerService); // ✅ NUEVO

  // Guardar la URL actual para redirección después del login
  if (state.url !== '/auth/login') {
    tokenService.saveLastURL(state.url);
  }

  if (authService.isAuthenticated()) {
    logger.debug('Usuario autenticado, acceso permitido'); // ✅ Solo en desarrollo
    return true;
  } else {
    logger.warn('Usuario no autenticado, redirigiendo al login'); // ✅ Sin datos sensibles
    logger.security('Intento de acceso no autorizado', { 
      url: state.url,
      timestamp: new Date().toISOString()
    });
    tokenService.saveLastURL(state.url);
    router.navigateByUrl('/auth/login');
    return false;
  }
};