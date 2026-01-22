import { Component, computed, inject, input, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { opcionSimple } from '../interfaces/menu.interface';

@Component({
  selector: 'app-menu-simple',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './menu-simple.component.html',
  styleUrl: './menu-simple.component.css'
})

export class MenuSimpleComponent {
  // private authService = inject( AuthService );
  

  menusimple = input.required<opcionSimple>();
  // permiso = computed(()  => this.authService.verificaArrayRoles(this.menusimple().roles,this.authService.estadoUsuario()?.permisos.map(o => o.idrol)) )

}
