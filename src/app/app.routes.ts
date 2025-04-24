import { Routes } from '@angular/router';

import { VisualizadorComponent } from './features/features/visualizador/components/visualizador/visualizador.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'visualizar',
    pathMatch: 'full',
  },
  {
    path: 'visualizar',
    component: VisualizadorComponent,
  },
];
