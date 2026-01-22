import { Component, inject } from '@angular/core';
import { Base64Pipe } from '../../../core/pipes/base64.pipe';
import { RouterLink } from '@angular/router';
import { EstadosService } from '../../../core/services/estados.service';
import { AuthService } from '../../../core/services/seguridad/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Base64Pipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  public authService = inject(AuthService );
  private estadosService = inject(EstadosService );
  estadoUsuario = this.estadosService.estadoUsuario;


}
