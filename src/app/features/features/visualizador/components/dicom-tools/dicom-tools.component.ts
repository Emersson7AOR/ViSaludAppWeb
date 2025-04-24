import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-dicom-tools',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDivider,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './dicom-tools.component.html',
  styleUrls: ['./dicom-tools.component.css']
})
export class DicomToolsComponent {
  // Update the activeTools Input to include the square measurement property
  @Input() activeTools: {
    zoom: boolean;
    pan: boolean;
    windowLevel: boolean;
    measure: boolean;
    measureEllipse: boolean;
    measureRectangle: boolean;
    measureCircle: boolean;
    measureSquare: boolean;
    orientation: boolean;
    download: boolean;
  } = {
    zoom: false,
    pan: false,
    windowLevel: false,
    measure: false,
    measureEllipse: false,
    measureRectangle: false,
    measureCircle: false,
    measureSquare: false,
    orientation: false,
    download: false
  };

  @Input() imageLoaded: boolean = false;
  
  @Output() zoomToggled = new EventEmitter<boolean>();
  @Output() panToggled = new EventEmitter<boolean>();
  @Output() windowLevelToggled = new EventEmitter<boolean>();
  @Output() measureToggled = new EventEmitter<boolean>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() orientationToggled = new EventEmitter<boolean>();
  
  // Eventos para las operaciones de orientación
  @Output() rotateLeftRequested = new EventEmitter<void>();
  @Output() rotateRightRequested = new EventEmitter<void>();
  @Output() flipHorizontalRequested = new EventEmitter<void>();
  @Output() flipVerticalRequested = new EventEmitter<void>();
  
  // Eventos para las herramientas de medición
  @Output() lengthMeasureRequested = new EventEmitter<void>();
  @Output() ellipseMeasureRequested = new EventEmitter<void>();
  @Output() rectangleMeasureRequested = new EventEmitter<void>();
  @Output() circleMeasureRequested = new EventEmitter<void>();
  @Output() clearMeasurementsRequested = new EventEmitter<void>();
  
  // Evento para la descarga
  @Output() downloadRequested = new EventEmitter<void>();

  // Métodos para toggle de herramientas
  toggleZoom(): void {
    if (!this.imageLoaded) return;
    this.zoomToggled.emit(!this.activeTools.zoom);
  }

  togglePan(): void {
    if (!this.imageLoaded) return;
    this.panToggled.emit(!this.activeTools.pan);
  }

  toggleWindowLevel(): void {
    if (!this.imageLoaded) return;
    this.windowLevelToggled.emit(!this.activeTools.windowLevel);
  }

  toggleMeasure(): void {
    if (!this.imageLoaded) return;
    this.measureToggled.emit(!this.activeTools.measure);
  }

  resetZoom(): void {
    if (!this.imageLoaded) return;
    this.resetRequested.emit();
  }

  requestDownload(): void {
    if (!this.imageLoaded) return;
    this.downloadRequested.emit();
  }
  
  // Métodos para las herramientas de medición
  requestLengthMeasure(): void {
    if (!this.imageLoaded) return;
    this.lengthMeasureRequested.emit();
  }
  
  requestEllipseMeasure(): void {
    if (!this.imageLoaded) return;
    this.ellipseMeasureRequested.emit();
  }
  
  requestRectangleMeasure(): void {
    if (!this.imageLoaded) return;
    this.rectangleMeasureRequested.emit();
  }
  
  requestCircleMeasure(): void {
    if (!this.imageLoaded) return;
    this.circleMeasureRequested.emit();
  }
  
  requestClearMeasurements(): void {
    if (!this.imageLoaded) return;
    this.clearMeasurementsRequested.emit();
  }
  
  // Add the new output for square measurement
  @Output() squareMeasureRequested = new EventEmitter<void>();
  
  // Add the new method for square measurement
  requestSquareMeasure(): void {
    if (!this.imageLoaded) return;
    this.squareMeasureRequested.emit();
  }
}
