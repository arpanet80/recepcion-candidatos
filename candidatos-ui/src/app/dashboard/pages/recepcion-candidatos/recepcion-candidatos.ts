import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { GenericModalComponent } from '../../../core/components/generic-modal/generic-modal';
import { SpinnerComponent } from '../../../core/components/spinner/spinner.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Candidato } from '../../../core/models/candidato.model';
import { Partido } from '../../../core/models/partido.model';
import { Ciudadano } from '../../../core/models/ciudadano.model';

type Option = string;

@Component({
  selector: 'app-recepcion-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModalComponent, SpinnerComponent],
  templateUrl: './recepcion-candidatos.html',
  styleUrls: ['./recepcion-candidatos.css'],
})
export class RecepcionCandidatos implements OnInit {
  public apiService = inject(ApiService);
  private notificacionService = inject(NotificacionService);
  private fb = inject(FormBuilder);

  private readonly guardando$$ = new BehaviorSubject<boolean>(false);
  readonly guardando$ = this.guardando$$.asObservable();

  @ViewChild('recepcionModal') recepcionModal!: GenericModalComponent;

  private readonly destroy$ = new Subject<void>();
  
  public candidatos = signal<Candidato[]>([]);
  public partidos = signal<Partido[]>([]);

  formSustituto!: FormGroup;
  formRequisito!: FormGroup;
  ciInput = signal<string>('');

  partidoSel = signal<Option>('');
  provinciaSel = signal<Option>('');
  municipioSel = signal<Option>('');
  candidatoSel = signal<Option>('');
  soloInhabilitados = signal<boolean>(true);
  soloInhabilitadosModel = true;

  candidatoSeleccionado = signal<Candidato | null>(null);
  private candidatoBuffer: Candidato | null = null;

  provinciasOps = computed(() => {
    if (!this.partidoSel()) return [];
    const set = new Set(
      this.candidatos()
        .filter(c => c.nombre_del_partido === this.partidoSel() && c.provincia)
        .map(c => c.provincia!.trim())
    );
    return Array.from(set).sort();
  });

  municipiosOps = computed(() => {
    if (!this.provinciaSel()) return [];
    const set = new Set(
      this.candidatos()
        .filter(c => c.nombre_del_partido === this.partidoSel() &&
                     c.provincia === this.provinciaSel() &&
                     c.municipio)
        .map(c => c.municipio!.trim())
    );
    return Array.from(set).sort();
  });

  candidatosOps = computed(() => {
    const lista = this.partidoSel()
      ? this.candidatos().filter(c => c.nombre_del_partido === this.partidoSel())
      : this.candidatos();
    const set = new Set(lista.map(c => c.candidato.trim()));
    return Array.from(set).sort();
  });

  candidatosFiltrados = computed(() => {
    let lista = this.candidatos();
    if (!lista.length) return [];

    if (this.partidoSel())   lista = lista.filter(c => c.nombre_del_partido?.trim() === this.partidoSel());
    if (this.provinciaSel()) lista = lista.filter(c => c.provincia?.trim()  === this.provinciaSel());
    if (this.municipioSel()) lista = lista.filter(c => c.municipio?.trim()  === this.municipioSel());
    if (this.candidatoSel()) lista = lista.filter(c => c.candidato?.trim()   === this.candidatoSel());

    if (this.soloInhabilitados()) {
      lista = lista.filter(c => c.estado?.trim() === 'Inhabilitado');
    }
    return lista;
  });

  private buildForms(): void {
    this.formSustituto = this.fb.group({
      nombre_del_partido: ['', Validators.required],
      departamento: ['Potosí', Validators.required],
      provincia: [''],
      municipio: [''],
      candidato: ['', Validators.required],
      posicion: ['', [Validators.required, Validators.min(1)]],
      titularidad: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      nro_documento: ['', Validators.required],
      genero: ['', Validators.required],
      edad: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      descripcion: [''],
      observaciones: [''],
      usuario: ['', Validators.required],
      estado: ['ACTIVO', Validators.required],
      // activo: [true, Validators.required]
    });

    this.formRequisito = this.fb.group({
      // idsustituto: [0, Validators.required],
      certificadonac: [true],
      certificadonacobs: [''],
      cedulacopia: [true],
      cedulacopiaobs: [''],
      libretamilitarcopia: [true],
      libretamilitarcopiaobs: [''],
      solvenciafiscal: [true],
      solvenciafiscalobs: [''],
      rejap: [true],
      rejapobs: [''],
      declaracionnotarial: [true],
      declaracionnotarialobs: [''],
      padron: [true],
      padronobs: [''],
      certidiomas: [true],
      certidiomasobs: [''],
      cenvi: [true],
      cenviobs: [''],
      declaraciondomicilio:  [true],
      declaraciondomicilioobs: [''],
      whastapp: ['']
    });
  }

  ngOnInit(): void {
    this.buildForms();
    this.soloInhabilitados.set(true);
    this.soloInhabilitadosModel = true;
    this.cargarPartidos();
    this.cargarCandidatos();
  }

  private cargarPartidos() {
    this.apiService.listarPartidos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.partidos.set(data),
        error: () => this.notificacionService.showError('No se pudieron cargar los partidos', 'Error')
      });
  }

  private cargarCandidatos() {
    this.apiService.listarCandidatos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          console.log("🚀 ~ RecepcionCandidatos ~ cargarCandidatos ~ data:", data)
          
          this.candidatos.set(data);
        } ,
        error: () => this.notificacionService.showError('No se pudieron cargar los candidatos', 'Error')
      });
  }

  onChangePartido(val: Option) {
    this.partidoSel.set(val);
    this.provinciaSel.set('');
    this.municipioSel.set('');
    this.candidatoSel.set('');
  }

  onChangeProvincia(val: Option) {
    this.provinciaSel.set(val);
    this.municipioSel.set('');
    this.candidatoSel.set('');
  }

  onChangeMunicipio(val: Option) {
    this.municipioSel.set(val);
    this.candidatoSel.set('');
  }

  onToggleInhabilitados(check: boolean) {
    this.soloInhabilitadosModel = check;
    this.soloInhabilitados.set(check);
  }

  abrirModalRecibir(c: Candidato): void {
    this.candidatoBuffer = c;                      // backup para búsqueda
    this.candidatoSeleccionado.set(c);             // opcional (template)

    // formSustituto → datos del candidato
    this.formSustituto.reset({
      ...c,
      nro_documento: '',
      edad: String(c.edad),
      fecha_nacimiento: c.fecha_nacimiento.split('T')[0],
    });

    // formRequisito → SIEMPRE todos los checkboxes activados
    this.formRequisito.reset(this.getRequisitosTrue());

    this.recepcionModal.open();
  }

  buscarCiudadano(): void {
    const ci = this.formSustituto.get('nro_documento')?.value?.trim();
    if (!ci) {
      this.notificacionService.showError('Introduzca un número de CI', 'Error');
      return;
    }

    // 1. Verificar si ya existe como sustituto
    this.apiService.existeSustitutoPorCI(ci)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: yaRegistrado => {
          if (yaRegistrado) {
            this.notificacionService.showError(
              'Esta cédula ya fue registrada como sustituto.',
              'Duplicado'
            );
            return; // ⛔ No continúa
          }

          // 2. Sí está permitido → cargar datos del padron
          const c = this.candidatoBuffer;
          if (!c) {
            this.notificacionService.showError('No se ha seleccionado un candidato', 'Error');
            return;
          }

          this.apiService.getCiudadanoGenerales(ci)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data: Ciudadano) => {
                this.formSustituto.patchValue({
                  nombre_del_partido: c.nombre_del_partido,
                  departamento: c.departamento,
                  provincia: c.provincia,
                  municipio: c.municipio,
                  candidato: c.candidato,
                  posicion: c.posicion,
                  titularidad: c.titularidad,
                  nombre_completo: data.apesp
                    ? `${data.nombres} ${data.appat} ${data.apmat} ${data.apesp}`.trim()
                    : `${data.nombres} ${data.appat} ${data.apmat}`,
                  nro_documento: data.DocumentoIdentidad,
                  genero: data.Sexo,
                  edad: this.calcularEdad(data.FechaNac),
                  fecha_nacimiento: data.FechaNac,
                  descripcion: c.descripcion,
                  observaciones: c.observaciones,
                  usuario: c.usuario,
                  estado: c.estado,
                });
                this.notificacionService.showSuccess('Datos del ciudadano cargados', 'OK');
              },
              error: err => {
                if (err === 'NoPadron') {
                  this.notificacionService.showError('Ciudadano no encontrado en el padrón', 'Error');
                } else {
                  this.notificacionService.showError('Error al consultar el padrón', 'Error');
                }
              }
            });
        },
        error: () => this.notificacionService.showError('Error al verificar duplicado', 'Error')
      });
  }

  onCerrarModal(): void {
    this.candidatoBuffer = null;
    this.formSustituto.reset();
    this.formRequisito.reset();
  }

  private logInvalidControls(form: FormGroup, formName: string): void {
    const invalid: string[] = [];
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid) {
        invalid.push(`${key} (${control.errors})`);
      }
    });
    if (invalid.length) {
      console.warn(`❌ ${formName} inválido:`, invalid);
    } else {
      console.log(`✅ ${formName} OK`);
    }
  }

  onSaveCandidato(): void {
    // diagnóstico rápido (opcional)
    this.logInvalidControls(this.formSustituto, 'formSustituto');
    this.logInvalidControls(this.formRequisito, 'formRequisito');

    // indicador de carga ON
    this.guardando$$.next(true);

    // normaliza campos críticos
    const sustitutoPayload = this.prepararPayloadSustituto(this.formSustituto.value);

    // 1. guardar sustituto
    this.apiService.createSustituto(sustitutoPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: sustitutoCreado => {
          const idSustituto = sustitutoCreado.id;

          // 2. guardar requisitos con el id obtenido
          const requisitoPayload = { ...this.formRequisito.value, idsustituto: idSustituto };

          this.apiService.createRequisito(requisitoPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                // 3. Notificar éxito
                this.notificacionService.showSuccess(
                  'Sustituto y requisitos guardados correctamente',
                  'Éxito'
                );

                // 4. Marcar candidato como sustituido
                const candidatoId = this.candidatoBuffer?.id;
                if (candidatoId) {
                  this.apiService.marcarCandidatoSustituido(candidatoId, true)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: () => {
                        // lista local refleja cambio inmediato
                        this.candidatos.update(list =>
                          list.map(c =>
                            c.id === candidatoId ? { ...c, sustituido: true } : c
                          )
                        );

                        this.cargarCandidatos();

                        // Abrir Word en nueva pestaña
                        // Abrir Word en nueva pestaña
                        const urlWord = this.apiService.descargarWord(sustitutoCreado.id);
                        window.open(urlWord, '_blank');

                        // resto de tu lógica...
                      },
                      error: () =>
                        this.notificacionService.showError(
                          'Error al marcar candidato como sustituido',
                          'Error'
                        )
                    });
                }

                // 5. Cerrar modal y limpiar
                this.recepcionModal.close();
                this.formSustituto.reset();
                // NO reseteamos formRequisito para que los checkboxes
                // permanezcan marcados para la próxima vez
                this.guardando$$.next(false);
                this.candidatoBuffer = null;
              },
              error: () => {
                this.notificacionService.showError('Error al guardar requisitos', 'Error');
                this.guardando$$.next(false);
              }
            });
        },
        error: () => {
          this.notificacionService.showError('Error al guardar sustituto', 'Error');
          this.guardando$$.next(false);
        }
      });
  }

  private prepararPayloadSustituto(raw: any): any {
    return {
      ...raw,
      edad: String(raw.edad),
      fecha_nacimiento: new Date(raw.fecha_nacimiento).toISOString().split('T')[0],
      activo: raw.activo ?? true,
    };
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mesDiff = hoy.getMonth() - nac.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  private getRequisitosTrue(): any {
    return {
      certificadonac: true,
      certificadonacobs: '',
      cedulacopia: true,
      cedulacopiaobs: '',
      libretamilitarcopia: true,
      libretamilitarcopiaobs: '',
      solvenciafiscal: true,
      solvenciafiscalobs: '',
      rejap: true,
      rejapobs: '',
      declaracionnotarial: true,
      declaracionnotarialobs: '',
      padron: true,
      padronobs: '',
      certidiomas: true,
      certidiomasobs: '',
      cenvi: true,
      cenviobs: '',
      declaraciondomicilio: true,
      declaraciondomicilioobs: '',
      whastapp: '',
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}