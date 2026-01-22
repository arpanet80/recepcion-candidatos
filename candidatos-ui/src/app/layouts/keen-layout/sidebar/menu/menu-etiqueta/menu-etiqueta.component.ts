import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-menu-etiqueta',
  standalone: true,
  imports: [],
  templateUrl: './menu-etiqueta.component.html',
  styleUrl: './menu-etiqueta.component.css'
})
export class MenuEtiquetaComponent {
  // @Input() etiqueta!: string;
  etiqueta = input.required<string>();

}
