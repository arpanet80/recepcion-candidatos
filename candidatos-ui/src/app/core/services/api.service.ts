import { NotificacionService } from './notificacion.service';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, map, Observable, throwError } from 'rxjs';
import { Candidato } from '../models/candidato.model';
import { Ciudadano } from '../models/ciudadano.model';
import { Partido } from '../models/partido.model';
import { DatosActa } from '../models/datos-acta.interface';


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private http = inject( HttpClient );
  private api = `${environment.apiUrl}`;
  private apiPadron = `${environment.apiPadron}`;
  private notificacionService = inject( NotificacionService );

  constructor() {   }

  /////////////// SPINNER ///////////////////////
  /* ---------- Spinner global ---------- */
  private readonly loading$$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loading$$.asObservable();

  private setLoading(value: boolean): void {
    this.loading$$.next(value);
  }

  /* ---------- Petición genérica con spinner y error centralizado ---------- */
  private request<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: any): Observable<T>{
  // private request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Observable<T> {
    this.setLoading(true);
    return this.http.request<T>(method, url, { body }).pipe(
      finalize(() => this.setLoading(false)),
      catchError((res: HttpErrorResponse) => {
        const msg = res.error?.message || res.statusText || 'Error desconocido';
        this.notificacionService.showError(msg, 'Error');
        return throwError(() => res);
      })
    );
  }


  /////////////////// PADRON ////////////////////////////////////

  getCiudadanoGenerales(ci: string): Observable<Ciudadano> {

    return this.http.get<Ciudadano>(`${this.apiPadron}ciudadanos/${ci}`).pipe(
      map((data) => {
        return data;
      }),
      catchError(error => {
        console.log('🔍 Error en búsqueda de ciudadano:', error.code);
        
        // Solo manejar 404 específicamente, otros errores que los maneje el interceptor
        if (error.code === 'NOT_FOUND') {
          return throwError(() => 'NoPadron');
        }
        
        // Para otros errores, dejar que el interceptor los maneje
        return throwError(() => error);
      })
    );
  }


  /////////////////// CANDIDATOS ////////////////////////////////////
  listarCandidatos(): Observable<Candidato[]> {
    return this.request<Candidato[]>('GET', `${this.api}candidatos/`);
  }

  verCandidato(id: number): Observable<Candidato> {
    return this.http.get<Candidato>(`${this.api}candidatos/${id}`).pipe(
      // catchError(this.handleError('ver'))
    );
  }

  crearCandidato(payload: Candidato): Observable<Candidato> {
    return this.http.post<Candidato>(`${this.api}candidatos/`, payload).pipe(
      // catchError(this.handleError('crear'))
    );
  }

  actualizarCandidatos(id: number, payload: Candidato): Observable<Candidato> {
    return this.http.put<Candidato>(`${this.api}candidatos/${id}`, payload).pipe(
      // catchError(this.handleError('actualizar'))
    );
  }

  eliminarCandidatos(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}candidatos/${id}`).pipe(
      // catchError(this.handleError('eliminar'))
    );
  }

  marcarCandidatoSustituido(id: number, sustituido: boolean): Observable<void> {
    return this.request<void>('PATCH', `${this.api}candidatos/${id}/sustituido`, { sustituido });
  }

  /* ---------- IMPORTAR EXCEL ---------- */
  importarExcel(file: File): Observable<{ count: number; message: string }> {
    const form = new FormData();
    form.append('file', file);

    return this.http.post<{ count: number; message: string }>(
      `${this.api}candidatos/importar`,
      form
    ).pipe(
      // catchError(this.handleError('importarExcel'))
    );
  }

  /////////////////// PARTIDOS ////////////////////////////////////

  /* ---------- PARTIDOS ---------- */
listarPartidos(): Observable<Partido[]> {
  return this.request<Partido[]>('GET', `${this.api}partidos/`);
}

///////////////////////// SUSTITUTO /////////////////////////

  listarSustituto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}sustitutos/`);
  }

  verSustituto(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}sustitutos/${id}`);
  }

  createSustituto(payload: any): Observable<any> {
    return this.http.post<any>(`${this.api}sustitutos/`, payload);
  }

  updateSustituto(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.api}sustitutos/${id}`, payload);
  }

  eliminarSustituto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}sustitutos/${id}`);
  }

  existeSustitutoPorCI(ci: string): Observable<boolean> {
    return this.request<boolean>('GET', `${this.api}sustitutos/existe/${ci}`);
  }

///////////////////////// REQUISITO /////////////////////////

  listarRequisito(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}requisitos/`);
  }

  verRequisito(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}requisitos/${id}`);
  }

  createRequisito(payload: any): Observable<any> {
    return this.http.post<any>(`${this.api}requisitos/`, payload);
  }

  updateRequisito(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.api}requisitos/${id}`, payload);
  }

  eliminarRequisito(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}requisitos/${id}`);
  }

  ////////////////////////////////////////////////////////////

  /**
 * Descarga reporte Word de un sustituto (abre en nueva pestaña)
 * @param id  id del sustituto
 * @param plantilla  nombre de la plantilla (ej: 'sustituto')
 * @returns  URL completa lista para window.open()
 */
  descargarWord(id: number, plantilla: string = 'sustituto'): string {
    // solo arma la URL; el navegador hará la petición GET al abrir la pestaña
    // return `${this.api}reportes/sustituto/${plantilla}/${id}`;
    return `${this.api}reportes/sustituto/${id}/word`;
  }

  generarActaWord(datos: DatosActa): Observable<Blob> {
    return this.http.post(`${this.api}reportes/acta/word`, datos, {
      responseType: 'blob', // ← importante
    });
  }

  // descargarActaWord(datos: DatosActa): Observable<DatosActa> {
  //   return this.http.post<DatosActa>(`${this.api}reportes/acta/word/`, datos);
  // }

}
