import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';
import { NotificacionService } from '../notificacion.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificacionService = inject(NotificacionService);
  private logger = inject(LoggerService);

  // ✅ Configuración de tiempos
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  private readonly WARNING_BEFORE_LOGOUT = 5 * 60 * 1000; // 5 minutos antes
  private readonly CHECK_INTERVAL = 60 * 1000; // Verificar cada minuto

  private lastActivity: Date = new Date();
  private inactivityTimer: any;
  private warningShown = false;
  private destroy$ = new Subject<void>();
  private isActive = false;

  constructor() {}

  /**
   * Iniciar monitoreo de inactividad
   */
  startMonitoring(): void {
    if (this.isActive) {
      this.logger.warn('Monitoreo de inactividad ya está activo');
      return;
    }

    this.isActive = true;
    this.lastActivity = new Date();
    this.warningShown = false;

    // Escuchar eventos de actividad del usuario
    const userActivity$ = merge(
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'click')
    );

    // Actualizar última actividad con debounce
    userActivity$
      .pipe(
        debounceTime(1000), // Evitar actualizar en cada evento
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActivity();
      });

    // Verificar inactividad periódicamente
    this.startInactivityTimer();

    this.logger.info('Monitoreo de inactividad iniciado');
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring(): void {
    this.isActive = false;
    this.clearInactivityTimer();
    this.destroy$.next();
    this.logger.info('Monitoreo de inactividad detenido');
  }

  /**
   * Actualizar última actividad
   */
  private updateActivity(): void {
    if (!this.isActive || !this.authService.isAuthenticated()) {
      return;
    }

    this.lastActivity = new Date();
    this.warningShown = false;

    this.logger.debug('Actividad de usuario detectada');
  }

  /**
   * Iniciar timer de verificación
   */
  private startInactivityTimer(): void {
    this.clearInactivityTimer();

    this.inactivityTimer = setInterval(() => {
      this.checkInactivity();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Limpiar timer
   */
  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Verificar inactividad
   */
  private checkInactivity(): void {
    if (!this.authService.isAuthenticated()) {
      this.stopMonitoring();
      return;
    }

    const now = new Date();
    const inactiveTime = now.getTime() - this.lastActivity.getTime();

    // Mostrar advertencia
    if (inactiveTime >= (this.INACTIVITY_TIMEOUT - this.WARNING_BEFORE_LOGOUT) && !this.warningShown) {
      this.showInactivityWarning();
      this.warningShown = true;
    }

    // Cerrar sesión por inactividad
    if (inactiveTime >= this.INACTIVITY_TIMEOUT) {
      this.logoutDueToInactivity();
    }
  }

  /**
   * Mostrar advertencia de inactividad
   */
  private showInactivityWarning(): void {
    const minutesLeft = Math.ceil(this.WARNING_BEFORE_LOGOUT / 60000);
    
    this.logger.security('Usuario inactivo - advertencia mostrada', {
      inactiveMinutes: Math.floor((new Date().getTime() - this.lastActivity.getTime()) / 60000),
      timestamp: new Date().toISOString()
    });

    this.notificacionService.showWarning(
      `Su sesión expirará en ${minutesLeft} minutos debido a inactividad. Realice cualquier acción para mantener su sesión activa.`,
      'Advertencia de Inactividad'
    );
  }

  /**
   * Cerrar sesión por inactividad
   */
  private logoutDueToInactivity(): void {
    const inactiveMinutes = Math.floor((new Date().getTime() - this.lastActivity.getTime()) / 60000);
    
    this.logger.security('Sesión cerrada por inactividad', {
      inactiveMinutes: inactiveMinutes,
      timestamp: new Date().toISOString()
    });

    this.notificacionService.showWarning(
      'Su sesión ha sido cerrada debido a inactividad prolongada.',
      'Sesión Expirada'
    );

    this.stopMonitoring();
    this.authService.logout();
  }

  /**
   * Obtener tiempo de inactividad actual
   */
  getInactivityTime(): number {
    const now = new Date();
    return now.getTime() - this.lastActivity.getTime();
  }

  /**
   * Obtener tiempo restante antes del logout
   */
  getTimeUntilLogout(): number {
    const inactiveTime = this.getInactivityTime();
    return Math.max(0, this.INACTIVITY_TIMEOUT - inactiveTime);
  }

  /**
   * Verificar si el usuario está inactivo
   */
  isUserInactive(): boolean {
    return this.getInactivityTime() >= this.INACTIVITY_TIMEOUT;
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
    this.destroy$.complete();
  }
}