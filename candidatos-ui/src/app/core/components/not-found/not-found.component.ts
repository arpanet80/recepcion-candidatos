// src/app/shared/not-found/not-found.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../services/seguridad/auth.service';
import { TokenService } from '../../services/seguridad/token.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex flex-column flex-root">
      <div class="d-flex flex-column flex-center flex-column-fluid">
        <div class="d-flex flex-column flex-center text-center p-10">
          
          <!-- Logo -->
          <div class="card card-flush w-lg-650px py-5 mb-10">
            <div class="card-body py-15 py-lg-20">
              
              <!-- Logo/Brand -->
              <div class="mb-14">
                <a routerLink="/" class="mb-12">
                  <span class="text-primary fs-2x fw-bold">🎁</span>
                  <span class="text-gray-800 fs-2x fw-bold ms-2">Apple Store Potosí</span>
                </a>
              </div>

              <!-- Error Icon & Title -->
              <h1 class="fw-bolder text-gray-900 mb-5" style="font-size: 10rem; line-height: 1;">404</h1>
              <div class="fw-semibold fs-2x text-gray-500 mb-7">
                Página No Encontrada
              </div>
              <div class="fw-semibold fs-6 text-gray-600 mb-10">
                La página que estás buscando no existe o ha sido movida.
              </div>

              <!-- Debug Info (Development only) -->
              <div class="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6 mb-10" *ngIf="isDevelopment">
                <div class="d-flex flex-stack flex-grow-1">
                  <div class="fw-semibold">
                    <div class="fs-6 text-gray-700 mb-2">
                      <span class="fw-bold">Ruta solicitada:</span>
                      <code class="ms-2 text-danger">{{ requestedPath }}</code>
                    </div>
                    <div class="fs-7 text-gray-600">
                      <span class="fw-bold">Usuario autenticado:</span>
                      <span [class]="isLoggedIn ? 'badge badge-light-success ms-2' : 'badge badge-light-danger ms-2'">
                        {{ isLoggedIn ? 'Sí' : 'No' }}
                      </span>
                      <span *ngIf="userRole" class="ms-3">
                        <span class="fw-bold">Rol:</span>
                        <span class="badge badge-primary ms-2">{{ userRole }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Context Message -->
              <div class="notice d-flex bg-light-info rounded border-info border border-dashed p-6 mb-10">
                <i class="ki-duotone ki-information fs-2tx text-info me-4">
                  <span class="path1"></span>
                  <span class="path2"></span>
                  <span class="path3"></span>
                </i>
                <div class="d-flex flex-stack flex-grow-1">
                  <div class="fw-semibold text-start">
                    <div class="fs-6 text-gray-700 fw-bold mb-2">Posibles razones:</div>
                    <div class="fs-7 text-gray-600">
                      • La URL puede contener errores<br>
                      • La página fue eliminada o movida<br>
                      • No tienes permisos para acceder<br>
                      • Enlace externo incorrecto
                    </div>
                  </div>
                </div>
              </div>

              <!-- Role-Based Suggestions -->
              <div class="mb-10" *ngIf="isLoggedIn">
                <h3 class="text-gray-900 fw-bold mb-7">
                  Sugerencias para {{ userName }}
                </h3>
                <div class="row g-5">
                  
                  <!-- Admin Suggestion -->
                  <div class="col-md-6" *ngIf="userRole === 'admin'">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-primary text-primary">👑</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Panel Administrativo</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Accede a las herramientas de administración del sistema
                        </div>
                        <button class="btn btn-primary btn-sm" routerLink="/dashboard/admin">
                          Ir al Panel Admin
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Sales Suggestion -->
                  <div class="col-md-6" *ngIf="userRole === 'sales'">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-success text-success">💰</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Punto de Venta</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Gestiona ventas y atención al cliente
                        </div>
                        <button class="btn btn-success btn-sm" routerLink="/dashboard/sales">
                          Ir a Ventas
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Technician Suggestion -->
                  <div class="col-md-6" *ngIf="userRole === 'technician'">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-warning text-warning">🔧</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Servicio Técnico</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Gestiona reparaciones y diagnósticos
                        </div>
                        <button class="btn btn-warning btn-sm" routerLink="/dashboard/technician">
                          Ir a Técnico
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Customer Suggestion -->
                  <div class="col-md-6" *ngIf="userRole === 'customer'">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-info text-info">🛍️</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Mi Cuenta</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Revisa tus pedidos y servicios
                        </div>
                        <button class="btn btn-info btn-sm" routerLink="/dashboard/customer">
                          Ir a Mi Cuenta
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Common: Dashboard -->
                  <div class="col-md-6">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-primary text-primary">📊</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Dashboard Principal</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Ve a la página principal de tu panel
                        </div>
                        <button class="btn btn-light-primary btn-sm" routerLink="/dashboard">
                          Ir al Dashboard
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Common: Profile -->
                  <div class="col-md-6">
                    <div class="card card-bordered h-100 hover-elevate-up">
                      <div class="card-body d-flex flex-center flex-column p-9">
                        <div class="symbol symbol-65px symbol-circle mb-5">
                          <span class="symbol-label fs-2x fw-semibold bg-light-dark text-dark">👤</span>
                        </div>
                        <div class="fs-5 fw-bold text-gray-800 mb-2">Mi Perfil</div>
                        <div class="fs-7 text-gray-600 text-center mb-5">
                          Actualiza tu información personal
                        </div>
                        <button class="btn btn-light-dark btn-sm" routerLink="/dashboard/profile">
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Primary Actions -->
              <div class="mb-10">
                <div class="d-flex flex-center flex-wrap gap-3">
                  <button class="btn btn-lg btn-primary" routerLink="/dashboard" *ngIf="isLoggedIn">
                    <i class="ki-duotone ki-home fs-2">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </i>
                    Ir al Inicio
                  </button>

                  <button class="btn btn-lg btn-primary" routerLink="/login" *ngIf="!isLoggedIn">
                    <i class="ki-duotone ki-entrance-left fs-2">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </i>
                    Iniciar Sesión
                  </button>

                  <button class="btn btn-lg btn-light-primary" (click)="goBack()">
                    <i class="ki-duotone ki-arrow-left fs-2">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </i>
                    Volver Atrás
                  </button>

                  <button class="btn btn-lg btn-light" (click)="goHome()">
                    <i class="ki-duotone ki-shop fs-2">
                      <span class="path1"></span>
                      <span class="path2"></span>
                      <span class="path3"></span>
                      <span class="path4"></span>
                      <span class="path5"></span>
                    </i>
                    Página Principal
                  </button>
                </div>
              </div>

              <!-- Quick Search Tags -->
              <div class="mb-10">
                <div class="text-gray-600 fs-6 fw-semibold mb-5">¿Buscas algo específico?</div>
                <div class="d-flex flex-center flex-wrap gap-2">
                  <span class="badge badge-lg badge-light-primary cursor-pointer" (click)="navigateTo('/products')">
                    Productos
                  </span>
                  <span class="badge badge-lg badge-light-success cursor-pointer" (click)="navigateTo('/dashboard/profile')">
                    Mi Perfil
                  </span>
                  <span class="badge badge-lg badge-light-info cursor-pointer" (click)="navigateTo('/dashboard/settings')">
                    Configuración
                  </span>
                  <span class="badge badge-lg badge-light-warning cursor-pointer" (click)="navigateTo('/customer/orders')">
                    Mis Pedidos
                  </span>
                  <span class="badge badge-lg badge-light-danger cursor-pointer" (click)="navigateTo('/technician/repairs')">
                    Reparaciones
                  </span>
                  <span class="badge badge-lg badge-light-dark cursor-pointer" (click)="navigateTo('/sales/point-of-sale')">
                    Punto de Venta
                  </span>
                </div>
              </div>

              <!-- Additional Actions -->
              <div class="d-flex flex-center gap-3 mb-10">
                <button class="btn btn-sm btn-flex btn-light" (click)="searchInApp()">
                  <i class="ki-duotone ki-magnifier fs-4 me-1">
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </i>
                  Buscar en la App
                </button>
                <button class="btn btn-sm btn-flex btn-light" (click)="reportProblem()">
                  <i class="ki-duotone ki-information fs-4 me-1">
                    <span class="path1"></span>
                    <span class="path2"></span>
                    <span class="path3"></span>
                  </i>
                  Reportar Problema
                </button>
              </div>

              <!-- Contact Support -->
              <div class="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">
                <i class="ki-duotone ki-notification-bing fs-2tx text-warning me-4">
                  <span class="path1"></span>
                  <span class="path2"></span>
                  <span class="path3"></span>
                </i>
                <div class="d-flex flex-stack flex-grow-1">
                  <div class="fw-semibold">
                    <h4 class="text-gray-900 fw-bold mb-2">¿Necesitas ayuda?</h4>
                    <div class="fs-6 text-gray-700 mb-3">
                      Si crees que esto es un error, contacta a nuestro equipo de soporte:
                    </div>
                    <div class="d-flex flex-wrap gap-5">
                      <a href="mailto:soporte@applestorepotosi.com" class="text-primary text-hover-primary fw-semibold">
                        <i class="ki-duotone ki-sms fs-3 me-1">
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </i>
                        soporte@applestorepotosi.com
                      </a>
                      <a href="tel:+67924400" class="text-primary text-hover-primary fw-semibold">
                        <i class="ki-duotone ki-phone fs-3 me-1">
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </i>
                        +591 67924400
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="d-flex flex-center flex-wrap px-5">
            <div class="text-gray-600 fw-semibold fs-6 me-5">
              &copy; 2024 Apple Store Potosí. Todos los derechos reservados.
            </div>
            <div class="d-flex gap-2">
              <a (click)="refreshPage()" class="text-gray-600 text-hover-primary fw-semibold fs-7 cursor-pointer">
                Recargar página
              </a>
              <span class="text-gray-600">•</span>
              <a (click)="viewSitemap()" class="text-gray-600 text-hover-primary fw-semibold fs-7 cursor-pointer">
                Ver mapa del sitio
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      /* background-color: #f5f8fa;*/
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .hover-elevate-up {
      transition: all 0.3s ease;
    }

    .hover-elevate-up:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075);
    }

    .card-bordered {
      border: 1px solid #eff2f5;
    }

    /* Keen-style badge hover effects */
    .badge {
      transition: all 0.3s ease;
    }

    .badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    }

    /* Custom animations for Keen */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card {
      animation: fadeInUp 0.5s ease;
    }

    /* Button hover effects */
    .btn {
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    /* Notice box styling */
    .notice {
      transition: all 0.3s ease;
    }

    .notice:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.075);
    }

    /* Symbol styling */
    .symbol-label {
      transition: all 0.3s ease;
    }

    .card:hover .symbol-label {
      transform: scale(1.1);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .w-lg-650px {
        width: 100% !important;
      }
      
      h1 {
        font-size: 6rem !important;
      }

      .col-md-6 {
        width: 100%;
      }
    }
  `]
})
export class NotFoundComponent implements OnInit {
  private tokenService = inject(TokenService);
  
  requestedPath = '';
  isLoggedIn = false;
  userRole = '';
  userName = '';
  isDevelopment = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.getRequestedPath();
    this.checkEnvironment();
  }

  private loadUserData(): void {
    const user = this.tokenService.getCurrentUser();

    this.isLoggedIn = !!user;
    
    if (user) {
      this.userRole = user.roles[0].role;
      this.userName = user.nombre || 'Usuario';
    }
  }

  private getRequestedPath(): void {
    this.requestedPath = this.router.url;
    console.log(`🔍 Ruta no encontrada: ${this.requestedPath}`);
  }

  private checkEnvironment(): void {
    this.isDevelopment = !environment.production;
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  refreshPage(): void {
    window.location.reload();
  }

  searchInApp(): void {
    alert('Funcionalidad de búsqueda - Próximamente');
  }

  reportProblem(): void {
    const emailSubject = `Problema 404 - Ruta no encontrada: ${this.requestedPath}`;
    const emailBody = `Hola equipo de soporte,\n\nEncontré un error 404 al intentar acceder a: ${this.requestedPath}\n\nInformación adicional:\n- Usuario: ${this.userName || 'No autenticado'}\n- Rol: ${this.userRole || 'N/A'}\n- Navegador: ${navigator.userAgent}\n\nGracias.`;
    
    window.open(`mailto:soporte@applestorepotosi.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  viewSitemap(): void {
    alert('Mapa del sitio - Próximamente');
  }
}