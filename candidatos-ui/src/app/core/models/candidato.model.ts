export interface Candidato {
  id?: number;
  nombre_del_partido: string;
  departamento: string;
  provincia?: string;
  municipio?: string;
  candidato: string;
  posicion: number;
  titularidad: string;
  nombre_completo: string;
  nro_documento: string;
  genero: string;
  edad: number;
  fecha_nacimiento: string;
  descripcion?: string;
  observaciones?: string;
  usuario: string;
  fecha_registro: string;
  estado: string;
  sustituido:boolean;
  deletedAt?: string;
}