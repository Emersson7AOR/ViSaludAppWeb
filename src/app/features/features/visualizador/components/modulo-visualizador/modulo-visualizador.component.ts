import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import { DicomProcessorService } from '../../../../core/services/dicom/dicom-processor.service';

import { DicomUploaderComponent } from '../dicom-uploader/dicom-uploader.component';
import { DicomViewerComponent } from '../dicom-viewer/dicom-viewer.component';
import { DicomToolsComponent } from '../dicom-tools/dicom-tools.component';
import { DicomMetadataComponent } from '../dicom-metadata/dicom-metadata.component';
import { CornerstoneService } from '../../../../core/services/cornerstone/cornerstone.service';
import { DownloadDialogComponent } from '../download-dialog/download-dialog.component';
import { DownloadFormat } from '../dicom-viewer/handlers/download-handler';

interface WindowWithHammer extends Window {
  Hammer?: any;
}

@Component({
  selector: 'app-modulo-visualizador',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    DicomUploaderComponent,
    DicomViewerComponent,
    DicomToolsComponent,
    DicomMetadataComponent,
  ],
  templateUrl: './modulo-visualizador.component.html',
  styleUrls: ['./modulo-visualizador.component.css']
})
export class ModuloVisualizadorComponent implements OnInit {
  @ViewChild(DicomViewerComponent) dicomViewer!: DicomViewerComponent;

  imageLoaded = false;
  metadata: any[] = [];
  fileError: string | null = null;
  currentImageId: string | null = null;

  // Nuevo estado como arreglo
  activeToolNames: string[] = [];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      try {
        // Use the service instead of duplicating initialization
        this.cornerstoneService.inicializar();
        console.log('✅ Cornerstone y herramientas inicializadas');
      } catch (error) {
        console.error('❌ Error en inicialización Cornerstone:', error);
      }
    }
  }

  processFile(file: File): void {
    this.fileError = null;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = this.dicomProcessor.parseDicomFile(arrayBuffer);

        if (!result.isValid) {
          this.fileError = result.error;
          return;
        }

        this.metadata = this.dicomProcessor.extractAllDicomTags(result.dataSet);
        this.metadata.sort((a, b) => a.tag.localeCompare(b.tag));

        const byteArray = new Uint8Array(arrayBuffer);
        const blob = new Blob([byteArray]);
        this.currentImageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);

        this.imageLoaded = true;
        this.cdr.detectChanges();
      } catch (error: any) {
        console.error('❌ Error al procesar archivo DICOM:', error);
        this.fileError = 'Error al procesar archivo: ' + (error.message || 'Error desconocido');
        this.cdr.detectChanges();
      }
    };

    reader.onerror = (error: any) => {
      console.error('❌ Error al leer archivo:', error);
      this.fileError = 'Error al leer el archivo.';
      this.cdr.detectChanges();
    };

    reader.readAsArrayBuffer(file);
  }

  // Nuevo enfoque para herramientas independientes
  onZoomToggled(active: boolean): void {
    this.activeTools.zoom = active;
    this.syncActiveTools();
  }

  onPanToggled(active: boolean): void {
    this.activeTools.pan = active;
    this.syncActiveTools();
  }

  onWindowLevelToggled(active: boolean): void {
    this.activeTools.windowLevel = active;
    this.syncActiveTools();
  }

  // Añadir un nuevo método para manejar el toggle de la herramienta de medición
  onMeasureToggled(active: boolean): void {
    this.activeTools.measure = active;
    this.syncActiveTools();
  }

  // Update the activeTools object
  activeTools = {
    zoom: false,
    pan: false,
    windowLevel: false,
    measure: false,
    measureEllipse: false,
    measureRectangle: false,
    measureCircle: false,
    measureSquare: false,  // Add this missing property
    orientation: false,
    download: false
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private dicomProcessor: DicomProcessorService,
    private cornerstoneService: CornerstoneService,
    private dialog: MatDialog // Asegúrate de que MatDialog esté inyectado
  ) {}

  // Add a new method to handle orientation tool toggle
  onOrientationToggled(active: boolean): void {
    this.activeTools.orientation = active;
    this.syncActiveTools();
  }
  
  // Update the syncActiveTools method to include the orientation tool
  // Update the syncActiveTools method to include all measurement tools
  // Update the syncActiveTools method to include the measureSquare property
  syncActiveTools(): void {
    this.activeToolNames = [];
    
    if (this.activeTools.zoom) this.activeToolNames.push('Zoom');
    if (this.activeTools.pan) this.activeToolNames.push('Pan');
    if (this.activeTools.windowLevel) this.activeToolNames.push('Wwwc');
    
    // Solo agregar una herramienta de medición a la vez
    if (this.activeTools.measure) this.activeToolNames.push('Length');
    else if (this.activeTools.measureEllipse) this.activeToolNames.push('EllipticalRoi');
    else if (this.activeTools.measureRectangle) this.activeToolNames.push('RectangleRoi');
    else if (this.activeTools.measureCircle) this.activeToolNames.push('CircleRoi');
    else if (this.activeTools.measureSquare) this.activeToolNames.push('SquareRoi');  // Add this line
    
    if (this.activeTools.orientation) this.activeToolNames.push('Orientation');
    if (this.activeTools.download) this.activeToolNames.push('Download');
    
    // Update the dicom viewer with the active tools
    if (this.dicomViewer) {
      this.dicomViewer.setToolActive(this.activeToolNames);
    }
  }
  
  // Update the onToolsChanged method to include the orientation tool
  // Update the onToolsChanged method to include the measureSquare property
  onToolsChanged(tools: string[]): void {
    this.activeToolNames = tools;
    
    // Update the activeTools object to match the new tool state
    this.activeTools = {
      zoom: tools.includes('Zoom'),
      pan: tools.includes('Pan'),
      windowLevel: tools.includes('Wwwc'),
      measure: tools.includes('Length'),
      measureEllipse: tools.includes('EllipticalRoi'),
      measureRectangle: tools.includes('RectangleRoi'),
      measureCircle: tools.includes('CircleRoi'),
      measureSquare: tools.includes('SquareRoi'),  // Add this line
      orientation: tools.includes('Orientation'),
      download: tools.includes('Download')
    };
    
    // Force change detection
    this.cdr.detectChanges();
  }

  // Add this method to handle the reset request
  onResetRequested(): void {
    // Check if dicomViewer exists before calling resetZoom
    if (this.dicomViewer) {
      this.dicomViewer.resetView();
    }
  }

  // Add these methods to the ModuloVisualizadorComponent class
  
  onRotateLeftRequested(): void {
    if (this.dicomViewer) {
      this.dicomViewer.rotateLeft();
    }
  }
  
  onRotateRightRequested(): void {
    if (this.dicomViewer) {
      this.dicomViewer.rotateRight();
    }
  }
  
  onFlipHorizontalRequested(): void {
    if (this.dicomViewer) {
      this.dicomViewer.flipHorizontal();
    }
  }
  
  onFlipVerticalRequested(): void {
    if (this.dicomViewer) {
      this.dicomViewer.flipVertical();
    }
  }
  
  private getActiveToolNames(): string[] {
    const toolNames: string[] = [];
    
    if (this.activeTools.zoom) toolNames.push('Zoom');
    if (this.activeTools.pan) toolNames.push('Pan');
    if (this.activeTools.windowLevel) toolNames.push('Wwwc');
    if (this.activeTools.measure) toolNames.push('Length');
    if (this.activeTools.measureEllipse) toolNames.push('EllipticalRoi');
    if (this.activeTools.measureRectangle) toolNames.push('RectangleRoi');
    if (this.activeTools.measureCircle) toolNames.push('CircleRoi');
    if (this.activeTools.measureSquare) toolNames.push('SquareRoi');  // Add this line
    if (this.activeTools.orientation) toolNames.push('Orientation');
    
    return toolNames;
  }
  
  // Añadir este método para manejar la solicitud de descarga
  onDownloadRequested(): void {
    const dialogRef = this.dialog.open(DownloadDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.dicomViewer) {
        this.dicomViewer.downloadImage(result);
      }
    });
  }

  // In the parent component's class
onLengthMeasureRequested(): void {
  this.dicomViewer.activateLengthMeasure();
  this.activeTools = { 
    ...this.activeTools, 
    measure: true,
    // Desactivar otras herramientas de medición
    measureEllipse: false,
    measureRectangle: false,
    measureCircle: false
  };
}

onEllipseMeasureRequested(): void {
  this.dicomViewer.activateEllipseMeasure();
  this.activeTools = { 
    ...this.activeTools, 
    measure: false,
    measureEllipse: true,
    measureRectangle: false,
    measureCircle: false
  };
}

onRectangleMeasureRequested(): void {
  this.dicomViewer.activateRectangleMeasure();
  this.activeTools = { 
    ...this.activeTools, 
    measure: false,
    measureEllipse: false,
    measureRectangle: true,
    measureCircle: false
  };
}

onCircleMeasureRequested(): void {
  this.dicomViewer.activateCircleMeasure();
  this.activeTools = { 
    ...this.activeTools, 
    measure: false,
    measureEllipse: false,
    measureRectangle: false,
    measureCircle: true
  };
}

onClearMeasurementsRequested(): void {
  this.dicomViewer.clearMeasurements();
}
}
