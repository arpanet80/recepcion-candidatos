import { Component } from '@angular/core';
import { MenuEtiquetaComponent } from '../menu-etiqueta/menu-etiqueta.component';
import { MenuPrimerNivelComponent } from '../menu-primer-nivel/menu-primer-nivel.component';
import { MenuSimpleComponent } from '../menu-simple/menu-simple.component';
import { menuDeOpcionesDos, menuPrincipal } from '../interfaces/menu-opcionex-sidebar';


@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [MenuSimpleComponent, MenuEtiquetaComponent, MenuPrimerNivelComponent],
  templateUrl: './menu-principal.component.html',
})
export class MenuPrincipalComponent {
  
  menuPrincipal = menuPrincipal;
  menuDeOpcionesDos = menuDeOpcionesDos;

}
