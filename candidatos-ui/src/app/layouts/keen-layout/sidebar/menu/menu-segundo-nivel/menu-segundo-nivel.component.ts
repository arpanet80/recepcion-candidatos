import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { menuSegundoNivel } from '../interfaces/menu.interface';

@Component({
  selector: 'app-menu-segundo-nivel',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive],
  templateUrl: './menu-segundo-nivel.component.html',
  styleUrl: './menu-segundo-nivel.component.css'
})
export class MenuSegundoNivelComponent {
  // public authService = inject( AuthService );

  segundonivel = input.required<menuSegundoNivel[]>();
  // usuario = this.authService.estadoUsuario()?.permisos.map(o => o.idrol);


}
