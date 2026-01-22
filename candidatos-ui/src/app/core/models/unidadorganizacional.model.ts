import { Cargo } from "./cargo.model";

export interface Unidadorganizacional {
    id: number;
    unidad: string;
    abreviacion: string;
    activo?: boolean;
    cargos: Cargo[];
}
