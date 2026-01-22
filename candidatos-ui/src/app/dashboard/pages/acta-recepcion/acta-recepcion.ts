import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Partido } from '../../../core/models/partido.model';
import { SpinnerComponent } from '../../../core/components/spinner/spinner.component';
import { Ciudadano } from '../../../core/models/ciudadano.model';
import { CommonModule } from '@angular/common';
import { DatosActa } from '../../../core/models/datos-acta.interface';
type Option = string;

@Component({
  selector: 'app-acta-recepcion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './acta-recepcion.html',
  styleUrl: './acta-recepcion.css',
})
export class ActaRecepcion implements OnInit {
  public apiService = inject(ApiService);
  private notificacionService = inject(NotificacionService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  @ViewChild('selectPartido', { static: false }) selectPartido!: ElementRef<HTMLSelectElement>;

  // partidoSel = signal<Option>('');
  partidoSel = signal<Partido | null>(null);
  public partidos = signal<Partido[]>([]);
  public habilitarBuscar$   = signal<boolean>(false);
  public habilitarGenerar$  = signal<boolean>(false);

  ngOnInit(): void {
    this.buildForms();
    this.cargarPartidos();
  }

  private cargarPartidos() {
    this.apiService.listarPartidos()
      .subscribe({
        next: data => this.partidos.set(data),
        error: () => this.notificacionService.showError('No se pudieron cargar los partidos', 'Error')
      });
  }

  private buildForms(): void {
    this.form = this.fb.group({
      nombre_completo: ['', Validators.required],
      nro_documento: ['', Validators.required],
    });
  }

  onChangePartido(evt: Event): void {
    const id = (evt.target as HTMLSelectElement).value;
    if (!id) {
      this.partidoSel.set(null);
      this.habilitarBuscar$.set(false);
      this.habilitarGenerar$.set(false);
      return;
    }
    const partido = this.partidos().find(p => p.id === Number(id));
    this.partidoSel.set(partido ?? null);
    this.habilitarBuscar$.set(true);        // ← habilita BUSCAR
    this.habilitarGenerar$.set(false);      // ← mantiene GENERAR apagado
  }

  buscarCiudadano(): void {
    const ci = this.form.get('nro_documento')?.value?.trim();

    if (!ci) {
      this.notificacionService.showError('Introduzca un número de CI', 'Error');
      return;
    }

    this.apiService.getCiudadanoGenerales(ci).subscribe({
      next: (data: Ciudadano) => {
        this.form.patchValue({
          nombre_completo: data.apesp
            ? `${data.nombres} ${data.appat} ${data.apmat} ${data.apesp}`.trim()
            : `${data.nombres} ${data.appat} ${data.apmat}`,
          nro_documento: data.DocumentoIdentidad,
        });
        this.habilitarGenerar$.set(true)   // ← habilita GENERAR
        this.notificacionService.showSuccess('Datos del ciudadano cargados', 'OK');
      },
      error: err => {
        this.habilitarGenerar$.set(false); 
        if (err === 'NoPadron') {
          this.notificacionService.showError('Ciudadano no encontrado en el padrón', 'Error');
        } else {
          this.notificacionService.showError('Error al consultar el padrón', 'Error');
        }
      }
    });
  }

  onSave(): void {
    const info: DatosActa = {
      fecha: new Date().toLocaleDateString('es-ES'),
      hora: (new Date()).toLocaleTimeString('es-ES', {hour: '2-digit',minute: '2-digit',hour12: false}),
      nombre_del_partido: this.partidoSel()?.nombre ?? '',
      sigla: this.partidoSel()?.sigla ?? '',
      nombre_delagado: this.form.get('nombre_completo')?.value,
      cedula_delegado: this.form.get('nro_documento')?.value,
    };

    // 1. Generar acta (POST + Blob)
    this.apiService.generarActaWord(info).subscribe({
      next: (blob: Blob) => {
        // 2. Crear URL temporal y abrir en nueva pestaña
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        // 3. Opcional: limpiar memoria
        setTimeout(() => window.URL.revokeObjectURL(url), 100);

        this.notificacionService.showSuccess('Acta generada y abierta', 'Éxito');

        // 4. Reset del formulario
        this.form.reset();
        this.partidoSel.set(null);
        this.habilitarBuscar$.set(false);
        this.habilitarGenerar$.set(false);
        this.selectPartido.nativeElement.value = '';
      },
      error: () => this.notificacionService.showError('Error al generar acta', 'Error')
    });
  }
}
