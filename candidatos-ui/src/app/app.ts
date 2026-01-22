

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { EstadosService } from './core/services/estados.service';
import { KeenInitializerService } from './core/services/keen-initializer.service';
import { AuthService } from './core/services/seguridad/auth.service';
import { environment } from '../environments/environment'; // ✅ NUEVO
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InactivityService } from './core/services/seguridad/inactivity.service';
import { LoggerService } from './core/services/seguridad/logger.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private estadosService = inject(EstadosService);
  private keenInitializer = inject(KeenInitializerService);
  private authService = inject(AuthService);
  private inactivityService = inject(InactivityService); // ✅ NUEVO
  private logger = inject(LoggerService); // ✅ NUEVO
  private router = inject(Router); // ✅ NUEVO
  
  protected readonly title = signal('Sistema de Votantes');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeApp();
    this.setupRouterLogging();
    this.setupInactivityMonitoring();
    this.setupSecurityHeaders();
  }

  /**
   * Inicializar aplicación
   */
  private initializeApp(): void {
    this.logger.info('Aplicación inicializada', {
      version: '1.0.0',
      environment: environment.production ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });

    // Verificar si hay sesión activa
    if (this.authService.isAuthenticated()) {
      this.logger.info('Sesión activa detectada');
    }
  }

  /**
   * Configurar logging de navegación
   */
  private setupRouterLogging(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.logger.debug('Navegación completada', {
          url: event.urlAfterRedirects,
          timestamp: new Date().toISOString()
        });
      });
  }

  /**
   * Configurar monitoreo de inactividad
   */
  private setupInactivityMonitoring(): void {
    if (!environment.security.enableInactivityMonitoring) {
      return;
    }

    // Iniciar monitoreo solo si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.inactivityService.startMonitoring();
      this.logger.info('Monitoreo de inactividad iniciado');
    }

    // Escuchar cambios de autenticación
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.authService.isAuthenticated()) {
          if (!this.inactivityService['isActive']) {
            this.inactivityService.startMonitoring();
          }
        } else {
          this.inactivityService.stopMonitoring();
        }
      });
  }

  /**
   * Configurar headers de seguridad
   */
  private setupSecurityHeaders(): void {
    if (!environment.features.enableSecurityHeaders) {
      return;
    }

    // Verificar que las meta tags de seguridad estén presentes
    this.verifySecurityHeaders();
  }

  /**
   * Verificar headers de seguridad en el HTML
   */
  private verifySecurityHeaders(): void {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy'
    ];

    const missingHeaders = requiredHeaders.filter(header => {
      const meta = document.querySelector(`meta[http-equiv="${header}"]`);
      return !meta;
    });

    if (missingHeaders.length > 0) {
      this.logger.warn('Headers de seguridad faltantes en HTML', {
        missing: missingHeaders
      });
    } else {
      this.logger.debug('Headers de seguridad verificados correctamente');
    }
  }

  /**
   * Prevenir apertura de devtools en producción
   */
  private preventDevToolsInProduction(): void {
    if (!environment.production) {
      return;
    }

    // Detectar si las devtools están abiertas
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.logger.security('DevTools detectadas en producción');
        // Opcional: Tomar acciones adicionales
      }
    });

    console.log(element);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.inactivityService.stopMonitoring();
    this.logger.info('Aplicación destruida');
  }
}