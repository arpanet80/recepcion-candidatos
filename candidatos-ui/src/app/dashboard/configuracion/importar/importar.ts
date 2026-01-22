import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ApiService } from '../../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-importar',
  imports: [NgIf],
  templateUrl: './importar.html',
  styleUrl: './importar.css',
})
export class Importar {
  private notificacionService = inject( NotificacionService );
  private apiService = inject( ApiService );
  
  file: File | null = null;
  loading = false;

  onFileSelected(event: any) {
    const f = event.target.files[0];
    if (f && f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.file = f;
    } else {
      this.notificacionService.showWarning('Seleccione un archivo Excel válido (.xlsx)', 'Advertencia!!!');
    }
  }

  upload() {
    if (!this.file) return;
    this.loading = true;

    this.apiService.importarExcel(this.file)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => this.notificacionService.showSuccess(`${res.count} candidatos importados`, 'Exito!!!'),
        error: () => this.notificacionService.showError('Falló la importación', 'Error!!!')
      });
  }
}
