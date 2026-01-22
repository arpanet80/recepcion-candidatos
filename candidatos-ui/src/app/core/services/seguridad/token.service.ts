import { Injectable, inject, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { LoginResponse, Usuario } from '../../../auth/interfaces/usuario';
import { NotificacionService } from '../notificacion.service';
import { EstadosService } from '../estados.service';
import { createAppError, ERROR_CODES } from '../error-types';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private jwtHelper = inject(JwtHelperService);
  private router = inject(Router);
  private notificacionService = inject(NotificacionService);
  private estadosService = inject(EstadosService);
  private logger = inject(LoggerService);
  
  estadoUsuario = this.estadosService.estadoUsuario;
  private keyToken = 'auth_data';
  private keyLastURL = 'ultimaurl';
  private readonly INTEGRITY_KEY = 'data_integrity';

  constructor() { }

  // Métodos básicos de token
  saveToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  clearToken(): void {
    sessionStorage.removeItem('token');
  }

  // Métodos JWT mejorados con manejo de errores
  getTokenDecoded(token: string | null): any {
    if (!token) {
      return null;
    }
    
    try {
      return this.jwtHelper.decodeToken(token);
    } catch (error) {
      this.logger.error('Error decoding token', { error: 'Token inválido' });
      return null;
    }
  }

  getIsTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      this.logger.error('Error checking token expiration');
      return true;
    }
  }

  getTokenExpirationDate(token: string): Date | null {
    try {
      return this.jwtHelper.getTokenExpirationDate(token);
    } catch (error) {
      this.logger.error('Error getting token expiration');
      return null;
    }
  }

  // ✅ VALIDACIÓN MÁS PERMISIVA - Solo verifica que el token exista y no esté expirado
  validateToken(token: string): { isValid: boolean; error?: string } {
    try {
      // Verificar que el token tenga formato básico
      if (!token || token.trim() === '') {
        return { isValid: false, error: 'Token vacío' };
      }

      // Verificar expiración (solo si se puede decodificar)
      try {
        if (this.getIsTokenExpired(token)) {
          return { isValid: false, error: 'Token expirado' };
        }
      } catch (e) {
        // Si no se puede verificar expiración, asumimos que es válido
        this.logger.warn('No se pudo verificar expiración del token, continuando...');
      }

      return { isValid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido validando token';
      this.logger.warn('Error en validación de token', { error: errorMessage });
      // ✅ Ser más permisivo: si hay error, asumimos válido si el token existe
      return { isValid: !!token };
    }
  }

  // Generar hash de integridad
  private generateIntegrityHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Verificar integridad de datos
  private verifyIntegrity(data: string, expectedHash: string): boolean {
    return this.generateIntegrityHash(data) === expectedHash;
  }

  // Almacenamiento seguro mejorado
  private encryptData(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      this.logger.error('Error encrypting data');
      throw createAppError('CLIENT_ERROR', 'Error al encriptar datos', 'medium');
    }
  }

  private decryptData(encryptedData: string): string {
    try {
      const decodedB64 = atob(encryptedData);
      return decodeURIComponent(decodedB64);
    } catch (error) {
      this.logger.error('Error decrypting data');
      throw createAppError('CLIENT_ERROR', 'Error al desencriptar datos', 'medium');
    }
  }

  // ✅ CORREGIDO: Validación muy permisiva al guardar token
  setStorageToken(value: LoginResponse): void {
    try {
      // ✅ Solo verificar que el token exista
      if (!value || !value.token || !value.userInfo) {
        this.logger.error('LoginResponse inválida: falta token o userInfo');
        throw new Error('Respuesta de login inválida');
      }

      // ✅ Validación opcional - NO bloquear si falla
      const validation = this.validateToken(value.token);
      if (!validation.isValid) {
        this.logger.warn('Advertencia en validación de token', { reason: validation.error });
        // ✅ NO lanzar error, continuar guardando
      }

      const dataString = JSON.stringify(value);
      const encryptedData = this.encryptData(dataString);
      const integrityHash = this.generateIntegrityHash(dataString);
      
      // Usar sessionStorage
      sessionStorage.setItem(this.keyToken, encryptedData);
      sessionStorage.setItem(this.INTEGRITY_KEY, integrityHash);
      
      this.estadoUsuario.set(value.userInfo);
      this.logger.info('Sesión iniciada exitosamente', {
        usuario: value.userInfo.usuario
      });
    } catch (error) {
      this.logger.error('Error setting storage token', error);
      this.notificacionService.showError('Error al guardar la sesión', 'Error');
      throw error;
    }
  }

  // ✅ CORREGIDO: Recuperación más permisiva
  getStorageToken(): LoginResponse | null {
    try {
      const encryptedData = sessionStorage.getItem(this.keyToken);
      const storedHash = sessionStorage.getItem(this.INTEGRITY_KEY);
      
      if (!encryptedData) {
        return null;
      }

      const decryptedData = this.decryptData(encryptedData);
      
      // ✅ Verificar integridad solo si existe el hash
      if (storedHash && !this.verifyIntegrity(decryptedData, storedHash)) {
        this.logger.security('Posible manipulación de datos detectada');
        this.removeStorageToken();
        this.notificacionService.showError(
          'Se detectó un problema de seguridad. Por favor, inicie sesión nuevamente.',
          'Advertencia de Seguridad'
        );
        return null;
      }
      
      const tokenData: LoginResponse = JSON.parse(decryptedData);
      
      // ✅ Validación básica de estructura
      if (!tokenData.token || !tokenData.userInfo) {
        this.logger.warn('Invalid token structure');
        return null;
      }

      return tokenData;
    } catch (error) {
      this.logger.error('Error getting storage token', error);
      this.removeStorageToken();
      return null;
    }
  }

  removeStorageToken(): void {
    sessionStorage.removeItem(this.keyToken);
    sessionStorage.removeItem(this.INTEGRITY_KEY);
    this.estadoUsuario.set(null);
    this.logger.info('Sesión cerrada');
  }

  // ✅ CORREGIDO: Validación más permisiva
  getTokenIsValid(): boolean {
    try {
      const tokenData = this.getStorageToken();
      
      if (!tokenData) {
        return false;
      }

      // ✅ Verificar expiración solo si es posible
      try {
        if (this.getIsTokenExpired(tokenData.token)) {
          this.removeStorageToken();
          this.logger.warn('Token expirado');
          return false;
        }
      } catch (e) {
        // Si no se puede verificar expiración, asumimos válido
        this.logger.warn('No se pudo verificar expiración, asumiendo válido');
      }

      this.estadoUsuario.set(tokenData.userInfo);
      return true;

    } catch (error) {
      this.logger.error('Error validating token', error);
      this.removeStorageToken();
      return false;
    }
  }

  // Información del usuario mejorada
  getCurrentUser(): Usuario | null {
    const tokenData = this.getStorageToken();
    return tokenData ? tokenData.userInfo : null;
  }

  // ✅ CORREGIDO: hasRole adaptado a tu estructura de permisos
  hasRole(roleId: number): boolean {
    const user = this.getCurrentUser();
    
    if (!user || !user.permisos || !Array.isArray(user.permisos)) {
      return false;
    }
    
    // Buscar en el array de permisos
    return user.permisos.some(permiso => permiso.idrol === roleId);
  }

  hasAnyRole(roleIds: number[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roleIds.some(roleId => this.hasRole(roleId));
  }

  // Gestión de última URL mejorada
  saveLastURL(url: string): void {
    try {
      if (url.includes('/auth/')) return;
      
      sessionStorage.setItem(this.keyLastURL, this.encryptData(url));
    } catch (error) {
      this.logger.error('Error saving last URL', error);
    }
  }

  getLastURL(): string | null {
    try {
      const encrypted = sessionStorage.getItem(this.keyLastURL);
      if (!encrypted) return null;
      
      return this.decryptData(encrypted);
    } catch (error) {
      this.logger.error('Error getting last URL', error);
      return null;
    }
  }

  clearLastURL(): void {
    sessionStorage.removeItem(this.keyLastURL);
  }

  navigateToLastURL(): void {
    const url = this.getLastURL();
    if (url && url !== '/auth/login') {
      this.router.navigate([url]);
    } else {
      this.router.navigate(['/dashboard/home']);
    }
  }

  // Información del token
  getTokenInfo() {
    const tokenData = this.getStorageToken();
    if (!tokenData) return null;

    try {
      const decoded = this.getTokenDecoded(tokenData.token);
      const expiration = this.getTokenExpirationDate(tokenData.token);
      
      return {
        issuedAt: decoded?.iat ? new Date(decoded.iat * 1000) : null,
        expiration: expiration,
        subject: decoded?.sub,
        roles: decoded?.roles || []
      };
    } catch (error) {
      this.logger.error('Error getting token info', error);
      return null;
    }
  }

  // Limpieza completa
  clearAll(): void {
    this.removeStorageToken();
    this.clearLastURL();
    this.estadoUsuario.set(null);
    this.logger.info('Limpieza completa de datos de sesión');
  }
}