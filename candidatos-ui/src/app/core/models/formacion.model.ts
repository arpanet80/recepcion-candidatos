import { Nivelformacion } from "./nivel-formacion.model";

export interface Formacion {
    id?: number;
    titulo: string;
    prefijo?: string;
    idnivelformacion: number;
    activo?: boolean;
    nivelformacion?: Nivelformacion;
}