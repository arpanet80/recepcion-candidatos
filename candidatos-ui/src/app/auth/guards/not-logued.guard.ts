import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { TokenService } from '../../core/services/seguridad/token.service';
import { LoggerService } from '../../core/services/seguridad/logger.service';

export const notLoguedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const logger = inject(LoggerService); // ✅ NUEVO

  if (!authService.isAuthenticated()) {
    logger.debug('Usuario no autenticado, acceso permitido a login');
    return true;
  } else {
    logger.debug('Usuario ya autenticado, redirigiendo al dashboard');
    
    const lastUrl = tokenService.getLastURL();
    if (lastUrl && lastUrl !== '/auth/login') {
      router.navigateByUrl(lastUrl);
    } else {
      router.navigateByUrl('/dashboard/home');
    }
    
    return false;
  }
};