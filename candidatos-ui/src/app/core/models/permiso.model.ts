import { Usuario } from "../../auth/interfaces/usuario";
import { Rol } from "./rol.model";
import { Sistema } from "./sistema.model";

export interface Permiso {
    id?: number;
    idusuario: number;
    idrol: number
    idsistema:number
    activo?: boolean;
    usuario?: Usuario;
    sistema?: Sistema;
    rol?: Rol;

    isEdit?: boolean;

}

export const permisoColumns = [
    {
      key: 'id',
      type: 'number',
      label: 'ID',
      style: 'width:2%',
      required: true,
      disabled: true
    },
    {
      key: 'idusuario',
      type: 'number',
      label: 'idUsuario',
      style: 'width:10%',
      required: true,
      disabled: true,
      hidden: true
  },
    {
        key: 'usuario',
        subkey: 'usuario',
        type: 'usuario',
        label: 'Usuario',
        style: 'width:10%',
        required: true,
        disabled: true
    },
    {
      key: 'idrol',
      type: 'rol',
      label: 'Rol',
      style: 'width:10%',
      required: true
    },
    {
      key: 'isEdit',
      type: 'button',
      style: 'width:10%',
      label: 'Acciones',
    },
  
  ];