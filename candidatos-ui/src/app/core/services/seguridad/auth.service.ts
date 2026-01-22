import { inject, Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { NotificacionService } from '../notificacion.service';
import { catchError, delay, map, Observable, tap, throwError, timeout } from 'rxjs';
import { LoginResponse } from '../../../auth/interfaces/usuario';
import { LoginUser } from '../../../auth/interfaces/login-user';
import { EstadosService } from '../estados.service';
import { Subject } from 'rxjs';
import { BruteForceProtectionService } from './brute-force.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly baseUrl: string = environment.apiUsuarios;
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private notificacionService = inject(NotificacionService);
  private estadosService = inject(EstadosService);
  private bruteForceService = inject(BruteForceProtectionService);
  private logger = inject(LoggerService);
  
  private tokenRefreshTimeout: any;
  private destroy$ = new Subject<void>();
  private readonly REQUEST_TIMEOUT = 15000;

  estadoUsuario = this.estadosService.estadoUsuario;

  login(usuario: string, contrasena: string, idsistema: number): Observable<boolean> {
    // Verificar protección brute force
    if (this.bruteForceService.isBlocked()) {
      const remainingTime = this.bruteForceService.getRemainingBlockTime();
      const minutes = Math.ceil(remainingTime / 60000);
      
      this.logger.security('Login bloqueado por brute force', {
        usuario: usuario,
        remainingTime: minutes,
        timestamp: new Date().toISOString()
      });
      
      this.notificacionService.showError(
        `Demasiados intentos fallidos. Intente nuevamente en ${minutes} minutos.`,
        'Acceso Bloqueado'
      );
      return throwError(() => new Error('BLOCKED_BY_BRUTE_FORCE_PROTECTION'));
    }

    const url = `${this.baseUrl}auth/login`;
    
    const credenciales: LoginUser = {
      usuario: usuario,
      contrasena: contrasena,
      idsistema: idsistema
    };

    // Delay progresivo basado en intentos fallidos
    const attemptCount = this.bruteForceService.getAttemptCount();
    const delayTime = Math.min(attemptCount * 1000, 5000);

    this.logger.info('Intentando login', { usuario });

    return this.http.post<LoginResponse>(url, credenciales)
      .pipe(
        delay(delayTime),
        timeout(this.REQUEST_TIMEOUT),
        tap((response) => {
          this.logger.debug('Respuesta del servidor recibida', {
            hasToken: !!response.token,
            hasUserInfo: !!response.userInfo,
            usuario: response.userInfo?.usuario
          });
          
          // ✅ VALIDACIÓN BÁSICA: solo verificar que existan los campos necesarios
          if (response && response.token && response.userInfo) {
            try {
              this.tokenService.setStorageToken(response);
              this.setupTokenRefresh();
              this.bruteForceService.resetAttempts();
              
              this.logger.info('Login exitoso', {
                usuario: response.userInfo.usuario,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              this.logger.error('Error al guardar token', error);
              throw error;
            }
          } else {
            this.logger.error('Respuesta de login inválida', {
              hasToken: !!response?.token,
              hasUserInfo: !!response?.userInfo
            });
            throw new Error('Respuesta de login inválida');
          }
        }),
        map(() => true),
        catchError((error: HttpErrorResponse) => {
          this.bruteForceService.recordFailedAttempt();
          
          this.logger.security('Login fallido', {
            usuario: usuario,
            status: error.status,
            attemptCount: this.bruteForceService.getAttemptCount(),
            timestamp: new Date().toISOString()
          });
          
          const errorMessage = this.getLoginErrorMessage(error);
          this.notificacionService.showError(errorMessage, "Error de Autenticación");
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<boolean> {
    const currentToken = this.tokenService.getStorageToken();
    if (!currentToken) {
      this.logger.warn('No token available for refresh');
      this.logout();
      return throwError(() => new Error('No token available'));
    }

    const url = `${this.baseUrl}auth/refresh`;
    return this.http.post<LoginResponse>(url, { 
      token: currentToken.token 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap((response) => {
        if (response && response.token && response.userInfo) {
          this.tokenService.setStorageToken(response);
          this.logger.debug('Token refreshed successfully');
        }
      }),
      map(() => true),
      catchError((error) => {
        this.logger.warn('Error refreshing token', { status: error.status });
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private setupTokenRefresh(): void {
    if (this.tokenRefreshTimeout) {
      clearInterval(this.tokenRefreshTimeout);
    }

    // Verificar cada 30 segundos si el token está por expirar
    this.tokenRefreshTimeout = setInterval(() => {
      if (this.isTokenExpiringSoon(10)) {
        this.logger.debug('Token expiring soon, refreshing...');
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      }
    }, 30000);
  }

  isTokenExpiringSoon(minutes: number = 10): boolean {
    const tokenData = this.tokenService.getStorageToken();
    if (!tokenData) return true;

    try {
      const expiration = this.tokenService.getTokenExpirationDate(tokenData.token);
      if (!expiration) return false; // ✅ Si no se puede obtener, no refrescar

      const now = new Date();
      const timeUntilExpiry = expiration.getTime() - now.getTime();
      return timeUntilExpiry < (minutes * 60 * 1000);
    } catch (e) {
      this.logger.warn('No se pudo verificar expiración del token');
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.tokenService.getTokenIsValid();
  }

  logout(): void {
    if (this.tokenRefreshTimeout) {
      clearInterval(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }

    const currentUser = this.tokenService.getCurrentUser();
    
    this.tokenService.removeStorageToken();
    this.estadoUsuario.set(null);
    this.destroy$.next();

    this.logger.info('Logout exitoso', {
      usuario: currentUser?.usuario,
      timestamp: new Date().toISOString()
    });

    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (this.tokenRefreshTimeout) {
      clearInterval(this.tokenRefreshTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    if (this.bruteForceService.isBlocked()) {
      const remainingTime = this.bruteForceService.getRemainingBlockTime();
      const minutes = Math.ceil(remainingTime / 60000);
      return `Cuenta temporalmente bloqueada. Intente en ${minutes} minutos.`;
    }

    // ✅ Mensajes genéricos sin revelar intentos
    if (error.status === 0) {
      return 'Error de conexión. Verifique su conexión a internet.';
    } else if (error.status === 401) {
      return 'Credenciales incorrectas. Por favor, verifique sus datos.';
    } else if (error.status === 429) {
      return 'Demasiados intentos fallidos. Intente más tarde.';
    } else {
      return `${error.error?.message || 'Error desconocido'} (Error ${error.status})`;
    }
  }
}