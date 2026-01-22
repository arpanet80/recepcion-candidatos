import { JuradoEncontrado } from "./jurado-encontrado.model";

export interface Ciudadano {
    id: number;
    Ciudadano: number;
    MesaCiudadano: number;
    IdPerson: number;
    appat: string;
    apmat: string;
    apesp: string;
    nombres: string;
    Sexo: string;
    FechaNac: string;
    TipoDocumentoIdentidad: string;
    DocumentoIdentidad: string;
    ComplementoDocumentoIdentidad: string;
    GradoInstruccion: string;
    Dom1: string,
    Dom2: string,
    IdEstadoRegistro: number;
    EstadoRegistro: string;
    TipoRegistro: string;
    Jurado: string;             // Jurado => Si es jurado;   " " => Si no lo es
    Vot: string;
    NumeroMesaCiudadano: number;
    FechaInscripcion: string;
    IdPais: number;
    NomPais: string;
    Dep: number;
    NomDep: string;
    NomProv: string;
    NomMun: string;
    NomLoc: string;
    NomReci: string;
    NomZona: string;
    CodigoMesa: string;
    Voto: boolean;
    numerocorrelativo: string;
    numeropagina: string;
    meesaRecinto: string;
    juradoEncontrado?: JuradoEncontrado
}
