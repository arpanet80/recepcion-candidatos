export interface UsuarioInfo {
    idfuncionario: number,
    usuario: string,
    nombre: string,
    sistema: string,
    unidad: string,
    cargo: string,
    roles: number,
    foto?: string
    permisos: PermisoUsuario[]
  }
  
  export interface PermisoUsuario {
    idrol: number,
    nombreRol: string,
  }