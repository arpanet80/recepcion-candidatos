import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { LoggerService } from './logger.service';

/**
 * Directiva para sanitizar inputs y prevenir XSS
 * Uso: <input appInputSanitizer [sanitizeType]="'alphanumeric'">
 */
@Directive({
  selector: '[appInputSanitizer]',
  standalone: true
})
export class InputSanitizerDirective {
  private el = inject(ElementRef);
  private control = inject(NgControl, { optional: true });
  private logger = inject(LoggerService);

  @Input() sanitizeType: 'alphanumeric' | 'numeric' | 'text' | 'email' | 'username' = 'text';
  @Input() maxLength: number = 255;
  @Input() allowSpaces: boolean = true;

  // Patrones de sanitización
  private readonly patterns = {
    alphanumeric: /[^a-zA-Z0-9]/g,
    numeric: /[^0-9]/g,
    text: /[<>]/g, // Eliminar < y > para prevenir XSS básico
    email: /[^a-zA-Z0-9@._-]/g,
    username: /[^a-zA-Z0-9._-]/g
  };

  // Patrones sospechosos (posible XSS o SQL injection)
  private readonly suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /--/,  // SQL comment
    /;.*drop/i,
    /union.*select/i,
    /'\s*or\s*'1'\s*=\s*'1/i
  ];

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Verificar patrones sospechosos
    if (this.containsSuspiciousPattern(value)) {
      this.logger.security('Input sospechoso detectado y bloqueado', {
        type: this.sanitizeType,
        originalLength: value.length,
        timestamp: new Date().toISOString()
      });

      // Limpiar completamente el valor
      value = '';
      input.value = '';
      
      if (this.control?.control) {
        this.control.control.setValue('');
      }
      
      return;
    }

    // Aplicar sanitización según el tipo
    const sanitized = this.sanitize(value);

    if (sanitized !== value) {
      this.logger.debug('Input sanitizado', {
        type: this.sanitizeType,
        originalLength: value.length,
        sanitizedLength: sanitized.length
      });

      input.value = sanitized;
      
      if (this.control?.control) {
        this.control.control.setValue(sanitized);
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Verificar y sanitizar texto pegado
    if (this.containsSuspiciousPattern(pastedText)) {
      this.logger.security('Paste con contenido sospechoso bloqueado', {
        timestamp: new Date().toISOString()
      });
      return;
    }

    const sanitized = this.sanitize(pastedText);
    const input = event.target as HTMLInputElement;
    
    // Insertar texto sanitizado
    input.value = sanitized;
    
    if (this.control?.control) {
      this.control.control.setValue(sanitized);
    }
  }

  /**
   * Sanitizar valor según el tipo
   */
  private sanitize(value: string): string {
    if (!value) return value;

    let sanitized = value;

    // Aplicar patrón según tipo
    const pattern = this.patterns[this.sanitizeType];
    if (pattern) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Eliminar espacios si no están permitidos
    if (!this.allowSpaces) {
      sanitized = sanitized.replace(/\s/g, '');
    }

    // Aplicar límite de longitud
    if (sanitized.length > this.maxLength) {
      sanitized = sanitized.substring(0, this.maxLength);
    }

    // Trim espacios al inicio y final
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Verificar si contiene patrones sospechosos
   */
  private containsSuspiciousPattern(value: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(value));
  }
}