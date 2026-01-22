import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { LoggerService } from '../../core/services/seguridad/logger.service';
import { TokenService } from '../../core/services/seguridad/token.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService); // ✅ NUEVO

  // Excluir endpoints de autenticación y recursos públicos
  if (req.url.includes('/auth/') || 
      req.url.includes('/assets/') || 
      req.url.includes('.json')) {
    return next(req);
  }

  const tokenData = tokenService.getStorageToken();
  
  if (!tokenData?.token) {
    logger.warn('No authentication token available');
    authService.logout();
    return throwError(() => new Error('No authentication token'));
  }

  // Verificar si el token está expirado
  if (tokenService.getIsTokenExpired(tokenData.token)) {
    logger.warn('Token expired, logging out');
    authService.logout();
    return throwError(() => new Error('Token expired'));
  }

  // Clonar la request con el header de autorización
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${tokenData.token}`,
      'X-Application-Name': 'Sistema-Votantes-Jurados'
    }
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        logger.security('Authentication error', { // ✅ Log de seguridad
          status: error.status,
          url: req.url,
          timestamp: new Date().toISOString()
        });
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};