import { Funcionario } from "./funcionario.model";
import { Permiso } from "./permiso.model";

export interface UsuarioModel {
    id?: number;
    usuario: string;
    idfuncionario: number
    contrasena:string
    activo?: boolean;
    funcionario?: Funcionario;
    permisos?: Permiso[];

    isEdit?: boolean;
    
}

export const usuarioModelColumns = [
    {
      key: 'id',
      type: 'number',
      label: 'ID',
      style: 'width:5%',
      required: true,
      disabled: true
    },
    {
      key: 'usuario',
      type: 'text',
      label: 'Usuario',
      style: 'width:10%',
      required: true,
      disabled: false
    },
    {
        key: 'funcionario',
        subkey: 'nombres',
        type: 'subnivel',
        label: 'Funcionario',
        style: 'width:30%',
        required: true,
        disabled: true
    },
    // {
    //   key: 'permisos',
    //   subkey: 'permisos',
    //   type: 'subnivel',
    //   label: 'Permisos',
    //   style: 'width:10%',
    //   required: true
    // },
    {
      key: 'isEdit',
      type: 'button',
      style: 'width:15%',
      label: 'Acciones',
    },
  
  ];