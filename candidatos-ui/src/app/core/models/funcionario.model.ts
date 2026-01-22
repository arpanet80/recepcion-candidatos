import { Cargo } from "./cargo.model";
import { Formacion } from "./formacion.model";
import { TipoFuncionario } from "./tipo-funcionario.model";

export interface Funcionario {
    id?: number;
    nombres: string;
    paterno?: string;
    materno: string;
    documento: number;
    celular: number;
    fechanacimiento: string;
    correo: string;
    idcargo: number;
    idformacion: number;
    citememorandum: string;
    fechaingreso: string;
    idtipofuncionario: number;
    foto?: string;

    activo?: boolean,
    
    tipofuncionario?: TipoFuncionario
    formacion?: Formacion;
    cargo?: Cargo;

    isSelected?: boolean;
    isEdit?: boolean;
    
}

export const FuncionarioColumns = [
    {
      key: 'id',
      type: 'number',
      label: 'ID',
      style: 'width:2%',
      required: true,
      disabled: true
    },
    {
      key: 'nombres',
      type: 'avatar',
      label: 'Nombres',
      style: 'width:20%',
      required: true,
      disabled: true
    },
    // {
    //   key: 'nombres',
    //   type: 'text',
    //   label: 'Nombres',
    //   required: true,
    //   disabled: true
    // },
    // {
    //   key: 'paterno',
    //   type: 'text',
    //   label: 'Paterno',
    //   required: true
    // },
    // {
    //   key: 'materno',
    //   type: 'text',
    //   label: 'Materno',
    //   required: true
    // },
    {
      key: 'tipofuncionario',
      subkey: 'descripcion',
      type: 'subnivel',
      label: 'Tipo',
      style: 'width:10%',
      required: true
    },
    {
      key: 'documento',
      type: 'number',
      label: 'Documento',
      style: 'width:10%',
      required: true
    },
    {
      key: 'celular',
      type: 'number',
      label: 'Celular',
      style: 'width:10%',
      required: true
    },
    {
      key: 'fechaingreso',
      type: 'date',
      label: 'Ingreso',
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