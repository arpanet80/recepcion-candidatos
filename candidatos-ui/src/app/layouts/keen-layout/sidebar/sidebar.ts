import { Component, inject } from '@angular/core';
import { MenuPrincipalComponent } from './menu/menu-principal/menu-principal.component';
import { AuthService } from '../../../core/services/seguridad/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [MenuPrincipalComponent, CommonModule ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private authService = inject(AuthService );
  estadoUsuario = this.authService.estadoUsuario;

  rol = (this.estadoUsuario() && this.estadoUsuario()?.permisos ) ? this.estadoUsuario()?.permisos[0].nombreRol : '';


}
