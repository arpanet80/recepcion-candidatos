import { Sustituto } from "src/sustituto/entities/sustituto.entity";

export interface DatosActa {
  fecha: string,
  hora: string,
  fechaTexto: string,
  nombre_del_partido: string,
  sigla: string,
  nombre_delagado: string,
  cedula_delegado: string,
  sustituto?: Sustituto[]
}
