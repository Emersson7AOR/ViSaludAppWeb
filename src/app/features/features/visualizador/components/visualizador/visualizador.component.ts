import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuloVisualizadorComponent } from '../modulo-visualizador/modulo-visualizador.component';

@Component({
  selector: 'app-visualizador',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    ModuloVisualizadorComponent
  ],
  templateUrl: './visualizador.component.html',
  styleUrls: ['./visualizador.component.css']
})
export class VisualizadorComponent implements OnInit {
  // Sample data - in a real app, this would come from a service
  patientInfo = {
    name: 'Carolina Tellez Mora',
    age: 64,
    studyDate: '16 de marzo de 2025',
    viewCount: 4,
    studyType: 'Mastografía',
    observations: [
      { text: 'ANOMALÍA DETECTADA' },
      { text: 'ANOMALÍA DETECTADA' }
    ]
  };

  selectedView = 'basic';

  constructor() { }

  ngOnInit(): void {
  }

  // Method to handle back button click
  goBack(): void {
    // Implement navigation logic here
    console.log('Navigate back');
  }

  // Method to handle thumbnail selection
  selectThumbnail(index: number): void {
    console.log('Selected thumbnail:', index);
    // Implement logic to change the displayed image
  }

  // Method to handle action selection
  selectAction(action: string): void {
    console.log('Selected action:', action);
    // Implement action handling logic
  }

  // Method to handle view type change
  onViewTypeChange(event: any): void {
    console.log('View type changed:', event.value);
    // Implement logic to change the view type
  }

  // Add these properties to your component class
  showActionsMenu = false;
  actions = [
    { value: 'tools', viewValue: 'Utilizar herramientas', icon: 'build' },
    { value: 'add-observation', viewValue: 'Agregar observación', icon: 'note_add' },
    { value: 'download', viewValue: 'Descargar imagen', icon: 'download' },
    { value: 'share', viewValue: 'Compartir', icon: 'share' }
  ];
  
  // Add these methods to your component class
  toggleActionsMenu() {
    this.showActionsMenu = !this.showActionsMenu;
  }
  
  onActionSelect(action: any) {
    console.log('Action selected:', action);
    // Implement your action handling logic here
    this.toggleActionsMenu();
  }
}
