import { Routes } from '@angular/router';
import { MainLayout } from './layouts/keen-layout/main-layout/main-layout';
import { Home } from './dashboard/pages/home/home';
import { AuthLayout } from './layouts/auth-layout/auth-layout/auth-layout';
import { LoginComponent } from './auth/pages/login/login.component';
import { Importar } from './dashboard/configuracion/importar/importar';
import { Role } from './auth/enums/rol.enum';
import { loguedGuard } from './auth/guards/logued.guard';
import { notLoguedGuard } from './auth/guards/not-logued.guard';
import { roleGuard } from './auth/guards/role.guard';
import { RecepcionCandidatos } from './dashboard/pages/recepcion-candidatos/recepcion-candidatos';
import { ActaRecepcion } from './dashboard/pages/acta-recepcion/acta-recepcion';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [notLoguedGuard],
    component: AuthLayout,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
    ]
  },
  {
    path: 'dashboard',
    canActivate: [loguedGuard],
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home', 
        component: Home,
        data: { titulo: 'Inicio', subtitulo: 'Página principal' }
      },
      
      ////////////////// RECEPCION DE DANDIDATOS ////////////////////////////////////

      { 
        path: 'recepcion', 
        component: RecepcionCandidatos,
        canActivate: [roleGuard], 
        data: { 
          roles: [Role.Admin, Role.Usuario],
          titulo: 'Recepcion de dandidatos', 
          subtitulo: 'Recepción de requisitos de candidatos', 
          rutaBreadcrumbs: 'Recepcion'
        }
      },
      { 
        path: 'acta-recepcion', 
        component: ActaRecepcion,
        canActivate: [roleGuard], 
        data: { 
          roles: [Role.Admin, Role.Usuario],
          titulo: 'Acta de Recepcion', 
          subtitulo: 'Acta de Recepción de requisitos de candidatos', 
          rutaBreadcrumbs: 'Acta'
        }
      },

      ///////////// CONFIGURACION //////////////////////////////
      { 
        path: 'configuracion/importar', 
        component: Importar,
        canActivate: [roleGuard], 
        data: { 
          roles: [Role.Admin],
          titulo: 'Importar Base de Datos', 
          subtitulo: 'Importart data desde excel', 
          rutaBreadcrumbs: 'Configuracion'
        }
      },
      { 
        path: 'configuracion/parametros', 
        component: Importar,
        canActivate: [roleGuard], 
        data: { 
          roles: [Role.Admin],
          titulo: 'Configurar aplicacion', 
          subtitulo: 'Configuracion de parametros de la aplicacion', 
          rutaBreadcrumbs: 'Configuracion'
        }
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard/home'
  }
];