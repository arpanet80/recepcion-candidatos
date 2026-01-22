import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { createAppError, getErrorMessage } from '../../core/services/error-types';
import { NotificacionService } from '../../core/services/notificacion.service';
import { AuthService } from '../../core/services/seguridad/auth.service';
import { LoggerService } from '../../core/services/seguridad/logger.service';

function getClientErrorMessage(error: HttpErrorResponse): string {
  if (error.error instanceof ErrorEvent) {
    return `Error del cliente: ${error.error.message}`;
  }
  return 'Error de conexión. Verifique su conexión a internet.';
}

function getServerErrorMessage(error: HttpErrorResponse): string {
  const backendMessage = error.error?.message || error.error?.error;
  
  if (backendMessage) {
    return `${backendMessage} (Error ${error.status})`;
  }
  
  switch (error.status) {
    case 0: return 'No se pudo conectar con el servidor. Verifique su conexión.';
    case 400: return 'Solicitud incorrecta.';
    case 401: return 'No autorizado.';
    case 403: return 'Acceso denegado.';
    case 404: return 'Recurso no encontrado.';
    case 408: return 'Tiempo de espera agotado.';
    case 429: return 'Demasiadas solicitudes.';
    case 500: return 'Error interno del servidor.';
    case 502: return 'Error de gateway.';
    case 503: return 'Servicio no disponible.';
    case 504: return 'Gateway timeout.';
    default: return `Error del servidor: ${error.status} ${error.statusText}`;
  }
}

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificacionService = inject(NotificacionService);
  const logger = inject(LoggerService); // ✅ NUEVO
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "";
      let showNotification = true;
      let appError;

      if (error.error instanceof ErrorEvent) {
        errorMessage = getClientErrorMessage(error);
        appError = createAppError('NETWORK_ERROR', errorMessage, 'medium', {
          url: req.url,
          method: req.method
        });
        logger.error('Client-side error', { // ✅ Sin exponer datos sensibles
          url: req.url,
          method: req.method,
          message: errorMessage
        });
      } else {
        errorMessage = getServerErrorMessage(error);
        
        switch (error.status) {
          case 400:
            appError = createAppError('VALIDATION_ERROR', 'Solicitud incorrecta', 'low', error.error);
            logger.warn('Bad request', { url: req.url, status: error.status });
            break;
            
          case 401:
            errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
            appError = createAppError('AUTH_EXPIRED', errorMessage, 'high');
            logger.security('Sesión expirada o no autorizada', { // ✅ Log de seguridad
              url: req.url,
              timestamp: new Date().toISOString()
            });
            authService.logout();
            showNotification = true;
            break;
            
          case 403:
            errorMessage = 'No tiene permisos para realizar esta acción.';
            appError = createAppError('FORBIDDEN', errorMessage, 'medium');
            logger.security('Acceso denegado (403)', {
              url: req.url,
              timestamp: new Date().toISOString()
            });
            showNotification = true;
            break;
            
          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            appError = createAppError('NOT_FOUND', errorMessage, 'low');
            showNotification = false;
            break;
            
          case 408:
            errorMessage = 'La solicitud ha tardado demasiado tiempo. Intente nuevamente.';
            appError = createAppError('REQUEST_TIMEOUT', errorMessage, 'medium');
            break;
            
          case 429:
            errorMessage = 'Demasiadas solicitudes. Por favor, espere un momento.';
            appError = createAppError('RATE_LIMITED', errorMessage, 'medium');
            logger.security('Rate limit alcanzado', {
              url: req.url,
              timestamp: new Date().toISOString()
            });
            break;
            
          case 500:
            errorMessage = 'Error interno del servidor. Por favor, contacte al administrador.';
            appError = createAppError('SERVER_ERROR', errorMessage, 'high');
            logger.error('Server error', { url: req.url, status: error.status });
            break;
            
          case 503:
            errorMessage = 'El servicio no está disponible temporalmente. Intente más tarde.';
            appError = createAppError('SERVICE_UNAVAILABLE', errorMessage, 'high');
            break;
            
          default:
            errorMessage = `Error inesperado: ${error.status} ${error.statusText}`;
            appError = createAppError('CLIENT_ERROR', errorMessage, 'medium');
        }
      }

      if (showNotification && errorMessage) {
        const finalMessage = appError ? getErrorMessage(appError) : errorMessage;
        notificacionService.showError(finalMessage, "Error");
      }

      // ✅ Log estructurado SIN datos sensibles
      logger.error('HTTP Error intercepted', {
        url: req.url,
        method: req.method,
        status: error.status,
        message: errorMessage
      });

      return throwError(() => appError || error);
    })
  );
};