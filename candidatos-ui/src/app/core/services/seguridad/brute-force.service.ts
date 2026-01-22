import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionService } from '../notificacion.service';
import { LoggerService } from './logger.service';

export interface AttemptInfo {
  count: number;
  lastAttempt: Date;
  blockedUntil?: Date;
  username?: string; // ✅ NUEVO: Trackear por usuario
}
 ''
@Injectable({
  providedIn: 'root'
})
export class BruteForceProtectionService {
  private router = inject(Router);
  private notificacionService = inject(NotificacionService);
  private logger = inject(LoggerService); // ✅ NUEVO
  
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_TIME = 15 * 60 * 1000; // 15 minutos
  private readonly ATTEMPTS_KEY = 'login_attempts';
  
  // ✅ NUEVO: Escalamiento exponencial de bloqueo
  private readonly BLOCK_MULTIPLIERS = [1, 2, 4, 8, 24]; // En horas

  constructor() {
    this.cleanupExpiredAttempts();
  }

  // ✅ NUEVO: Limpiar intentos expirados al iniciar
  private cleanupExpiredAttempts(): void {
    try {
      const attempts = this.getAttempts();
      const now = new Date();
      let cleaned = false;

      for (const ip in attempts) {
        const attempt = attempts[ip];
        
        // Limpiar intentos de hace más de 24 horas
        if (attempt.lastAttempt) {
          const hoursSinceLastAttempt = (now.getTime() - new Date(attempt.lastAttempt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastAttempt > 24) {
            delete attempts[ip];
            cleaned = true;
          }
        }
      }

      if (cleaned) {
        this.saveAttempts(attempts);
        this.logger.debug('Intentos expirados limpiados');
      }
    } catch (error) {
      this.logger.error('Error limpiando intentos expirados', error);
    }
  }

  // Registrar intento fallido
  recordFailedAttempt(ip: string = 'default'): void {
    try {
      const attempts = this.getAttempts();
      const now = new Date();
      
      if (!attempts[ip]) {
        attempts[ip] = { 
          count: 0, 
          lastAttempt: now 
        };
      }

      attempts[ip].count++;
      attempts[ip].lastAttempt = now;

      // ✅ NUEVO: Escalamiento exponencial del tiempo de bloqueo
      if (attempts[ip].count >= this.MAX_ATTEMPTS) {
        const blockIndex = Math.min(
          Math.floor(attempts[ip].count / this.MAX_ATTEMPTS) - 1,
          this.BLOCK_MULTIPLIERS.length - 1
        );
        const blockHours = this.BLOCK_MULTIPLIERS[blockIndex];
        const blockTime = blockHours * 60 * 60 * 1000; // Convertir a milisegundos
        
        attempts[ip].blockedUntil = new Date(now.getTime() + blockTime);
        
        this.logger.security('Cuenta bloqueada por intentos excesivos', {
          ip: ip,
          attempts: attempts[ip].count,
          blockHours: blockHours,
          timestamp: now.toISOString()
        });
        
        this.notificacionService.showWarning(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${blockHours} hora(s).`,
          'Cuenta Bloqueada'
        );
      } else {
        // ✅ NUEVO: Advertencia progresiva
        const remaining = this.MAX_ATTEMPTS - attempts[ip].count;
        if (remaining <= 2) {
          this.logger.warn(`Quedan ${remaining} intentos antes del bloqueo`);
        }
      }

      this.saveAttempts(attempts);
    } catch (error) {
      this.logger.error('Error registrando intento fallido', error);
    }
  }

  // Verificar si está bloqueado
  isBlocked(ip: string = 'default'): boolean {
    try {
      const attempts = this.getAttempts();
      const attempt = attempts[ip];
      
      if (!attempt || !attempt.blockedUntil) {
        return false;
      }

      const now = new Date();
      const blockedUntilDate = new Date(attempt.blockedUntil);
      
      if (now < blockedUntilDate) {
        return true;
      }

      // Si el bloqueo expiró, limpiar pero mantener contador reducido
      attempt.count = Math.floor(attempt.count / 2); // ✅ Reducir a la mitad
      delete attempt.blockedUntil;
      this.saveAttempts(attempts);
      
      this.logger.debug('Bloqueo expirado, intentos reducidos', { ip, newCount: attempt.count });
      return false;
    } catch (error) {
      this.logger.error('Error verificando bloqueo', error);
      return false;
    }
  }

  // Obtener tiempo restante de bloqueo
  getRemainingBlockTime(ip: string = 'default'): number {
    try {
      const attempts = this.getAttempts();
      const attempt = attempts[ip];
      
      if (!attempt?.blockedUntil) return 0;

      const now = new Date();
      const blockedUntilDate = new Date(attempt.blockedUntil);
      return Math.max(0, blockedUntilDate.getTime() - now.getTime());
    } catch (error) {
      this.logger.error('Error obteniendo tiempo de bloqueo', error);
      return 0;
    }
  }

  // Resetear intentos (éxito de login)
  resetAttempts(ip: string = 'default'): void {
    try {
      const attempts = this.getAttempts();
      
      if (attempts[ip]) {
        this.logger.info('Intentos reseteados después de login exitoso', { ip });
      }
      
      delete attempts[ip];
      this.saveAttempts(attempts);
    } catch (error) {
      this.logger.error('Error reseteando intentos', error);
    }
  }

  // Obtener número de intentos actual
  getAttemptCount(ip: string = 'default'): number {
    try {
      const attempts = this.getAttempts();
      return attempts[ip]?.count || 0;
    } catch (error) {
      this.logger.error('Error obteniendo contador de intentos', error);
      return 0;
    }
  }

  // ✅ NUEVO: Obtener información completa de intentos
  getAttemptInfo(ip: string = 'default'): AttemptInfo | null {
    try {
      const attempts = this.getAttempts();
      return attempts[ip] || null;
    } catch (error) {
      this.logger.error('Error obteniendo información de intentos', error);
      return null;
    }
  }

  private getAttempts(): { [ip: string]: AttemptInfo } {
    try {
      // ✅ Cambiar a sessionStorage para mayor seguridad
      const stored = sessionStorage.getItem(this.ATTEMPTS_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      
      // Convertir fechas de string a Date
      for (const ip in parsed) {
        if (parsed[ip].lastAttempt) {
          parsed[ip].lastAttempt = new Date(parsed[ip].lastAttempt);
        }
        if (parsed[ip].blockedUntil) {
          parsed[ip].blockedUntil = new Date(parsed[ip].blockedUntil);
        }
      }
      
      return parsed;
    } catch (error) {
      this.logger.error('Error obteniendo intentos', error);
      return {};
    }
  }

  private saveAttempts(attempts: { [ip: string]: AttemptInfo }): void {
    try {
      // ✅ Cambiar a sessionStorage
      sessionStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      this.logger.error('Error guardando intentos', error);
    }
  }

  // Limpiar todos los intentos (para administración)
  clearAllAttempts(): void {
    try {
      sessionStorage.removeItem(this.ATTEMPTS_KEY);
      this.logger.info('Todos los intentos limpiados');
    } catch (error) {
      this.logger.error('Error limpiando todos los intentos', error);
    }
  }

  // ✅ NUEVO: Obtener estadísticas
  getStatistics(): {
    totalIPs: number;
    blockedIPs: number;
    totalAttempts: number;
  } {
    try {
      const attempts = this.getAttempts();
      const now = new Date();
      let blocked = 0;
      let totalAttempts = 0;

      for (const ip in attempts) {
        totalAttempts += attempts[ip].count;
        if (attempts[ip].blockedUntil && now < new Date(attempts[ip].blockedUntil)) {
          blocked++;
        }
      }

      return {
        totalIPs: Object.keys(attempts).length,
        blockedIPs: blocked,
        totalAttempts: totalAttempts
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas', error);
      return { totalIPs: 0, blockedIPs: 0, totalAttempts: 0 };
    }
  }
}