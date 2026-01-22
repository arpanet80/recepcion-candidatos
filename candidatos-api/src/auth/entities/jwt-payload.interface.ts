
import { PermisoUsuario } from "./user-response";

export interface JwtPayload {
    usuario: string,
    roles: PermisoUsuario[]
  }
