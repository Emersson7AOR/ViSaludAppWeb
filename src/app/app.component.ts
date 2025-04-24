import { Component } from '@angular/core';
import { ModuloVisualizadorComponent } from './features/features/visualizador/components/modulo-visualizador/modulo-visualizador.component';
@Component({
  selector: 'app-root',
  imports: [ModuloVisualizadorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'VisaludWeb';
}
