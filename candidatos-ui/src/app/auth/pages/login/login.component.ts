import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/seguridad/auth.service';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { BruteForceProtectionService } from '../../../core/services/seguridad/brute-force.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private bruteForceService = inject(BruteForceProtectionService);
  
  private destroy$ = new Subject<void>();
  private blockTimer$?: Subscription;
  
  loading: boolean = false;
  errorMessage: string = "";
  isBlocked: boolean = false;
  remainingTime: number = 0;

  public myForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.checkBlockStatus();
    
    // Verificar estado de bloqueo cada segundo
    this.blockTimer$ = interval(1000).subscribe(() => {
      this.checkBlockStatus();
      this.updateFormControlsState();
    });
  }

  private updateFormControlsState(): void {
    if (this.isBlocked) {
      this.myForm.get('usuario')?.disable();
      this.myForm.get('contrasena')?.disable();
    } else {
      this.myForm.get('usuario')?.enable();
      this.myForm.get('contrasena')?.enable();
    }
  }

  private checkBlockStatus(): void {
    this.isBlocked = this.bruteForceService.isBlocked();
    if (this.isBlocked) {
      this.remainingTime = this.bruteForceService.getRemainingBlockTime();
    } else {
      this.remainingTime = 0;
    }
  }

  login(): void {
    if (this.myForm.valid && !this.isBlocked) {
      this.loading = true;
      this.errorMessage = "";

      const idsistema = 2;      /// ID del sistema en base de datos sistemas

      const { usuario, contrasena } = this.myForm.value;

      this.authService.login(usuario, contrasena, idsistema)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            this.loading = false;
            console.log('Login exitoso, redirigiendo...');
            
            this.router.navigate(['/dashboard/home'])
              .then(success => {
                if (!success) {
                  console.error('Error en redirección después del login');
                }
              });
          },
          error: (error) => {
            this.loading = false;
            this.myForm.get('contrasena')?.reset();
            
            // Actualizar estado de bloqueo
            this.checkBlockStatus();
            this.updateFormControlsState();
            
            if (error.error?.message) {
              this.errorMessage = error.error.message;
            }
            
            console.error('Error en login:', error);
          }
        });
    } else {
      this.myForm.markAllAsTouched();
    }
  }

  getRemainingTimeText(): string {
    if (!this.isBlocked) return '';
    
    const minutes = Math.ceil(this.remainingTime / 60000);
    return `Tiempo restante: ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  getAttemptsCount(): number {
    return this.bruteForceService.getAttemptCount();
  }

  // Método para limpiar errores cuando el usuario empiece a escribir
  onInputChange(): void {
    this.errorMessage = "";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.blockTimer$?.unsubscribe();
  }
}