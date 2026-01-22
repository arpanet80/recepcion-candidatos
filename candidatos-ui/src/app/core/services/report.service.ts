import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ReportParams } from '../models/report-params..model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject( HttpClient );
  private readonly baseUrl: string = environment.reportsUrl;

  url  = `${ this.baseUrl }generate-pdf-parameters?reportName=reports/`;

  constructor() { }

  private readonly ReportName = {
    judiciales: 'Votantes/certificado-judiciales.trdp',
    generales: 'Votantes/certificado-generales.trdp',
    generales2v: 'Votantes/certificado-generales-2v.trdp'
  };

  generaFormRequisitosPDF(type: 'generales', params: ReportParams) {
    const reportName = this.ReportName[type];

    return this.http.get(`${this.url}${reportName}
        &parameters[votoLiteral]=${params.votoLiteral}
        &parameters[nombrecompleto]=${params.nombrecompleto}
        &parameters[documento]=${params.documento}
        &parameters[mesa]=${params.mesa}
        &parameters[recinto]=${params.recinto}
        &parameters[pais]=${params.pais}
        &parameters[departamento]=${params.departamento}
        &parameters[localidad]=${params.localidad}
        &parameters[fecha]=${params.fecha}
      `
      , {observe:'response',responseType:'blob'});

  }

}
