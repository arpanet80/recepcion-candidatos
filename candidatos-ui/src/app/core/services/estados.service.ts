import { inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../../auth/interfaces/usuario';
import { Funcionario } from '../models/funcionario.model';
import { Unidadorganizacional } from '../models/unidadorganizacional.model';
import { TipoFuncionario } from '../models/tipo-funcionario.model';
import { Formacion } from '../models/formacion.model';
import { Cargo } from '../models/cargo.model';
import { ApiService } from './api.service';
import { Nivelformacion } from '../models/nivel-formacion.model';
import { Sistema } from '../models/sistema.model';
import { Permiso } from '../models/permiso.model';
import { Rol } from '../models/rol.model';
import { UsuarioModel } from '../models/usuario.model';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {
  // private apiService = inject ( ApiService );

  public estadoUsuario = signal<Usuario | null>(null)
  
  public funcionarios = signal<Funcionario[] | null>(null)
  public unidadorganizacional = signal<Unidadorganizacional[] | null>(null)
  public tipofuncionario = signal<TipoFuncionario[] | null>(null)
  public formacion = signal<Formacion[] | null>(null)
  public cargo = signal<Cargo[] | null>(null)
  public nivelformacion = signal<Nivelformacion[] | null>(null)
  
  public sistema = signal<Sistema[] | null>(null)
  public permiso = signal<Permiso[] | null>(null)
  public rol = signal<Rol[] | null>(null)
  public usuario = signal<UsuarioModel[] | null>(null)
  
  verificaArrayRoles(rolesSistema: number[] | undefined, rolesUsuario: number[] | undefined): boolean {

    if (rolesSistema?.some( rol => rolesUsuario?.includes(rol) )) {
      return true;
    }
    else
      return false;
  }
  
}
