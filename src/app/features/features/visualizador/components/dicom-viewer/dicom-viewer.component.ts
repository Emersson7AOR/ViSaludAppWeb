import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { CornerstoneService } from '../../../../core/services/cornerstone/cornerstone.service';
import Swal from 'sweetalert2';
// Importar los handlers
import { ToolHandlerService } from './handlers/tool-handler.service';
import { MeasurementToolHandler } from './handlers/measurement-tool-handler';

@Component({
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dicom-viewer.component.html',
  styleUrls: ['./dicom-viewer.component.css']
})
export class DicomViewerComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('dicomElement', { static: true }) dicomElement!: ElementRef;
  @Input() imageId: string | null = null;
  @Input() activeToolNames: string[] = [];
  @Output() toolsChanged = new EventEmitter<string[]>();


  private element: HTMLElement | null = null;
  private isToolActive = false;
  private eventHandlers: { [key: string]: EventListener } = {};

  constructor(private cs: CornerstoneService,
  private toolHandlerService: ToolHandlerService
  ) {}

  ngAfterViewInit(): void {
    this.element = this.dicomElement.nativeElement;
    this.initializeElement();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageId'] && this.imageId && this.element) {
      this.loadAndDisplayImage();
    }
    if (changes['activeToolNames'] && this.element) {
      this.updateToolState();
    }
  }

  ngOnDestroy(): void {
    this.removeSafetyEventHandlers();
    if (this.element) {
      try {
        cornerstone.disable(this.element);
      } catch (error) {
        console.warn('Error disabling Cornerstone element:', error);
      }
    }
  }

  private initializeElement(): void {
    if (!this.element) return;
    try {
      this.element.style.width = '100%';
      this.element.style.height = '512px';
      this.element.style.backgroundColor = '#000';
      this.addSafetyEventHandlers();
      this.cs.habilitarElemento(this.element);
      if (this.imageId) {
        this.loadAndDisplayImage();
      }
    } catch (error) {
      console.error('Error initializing element:', error);
    }
  }

  private removeSafetyEventHandlers(): void {
    if (!this.element) return;
    Object.keys(this.eventHandlers).forEach(eventType => {
      this.element?.removeEventListener(eventType, this.eventHandlers[eventType], true);
    });
    this.eventHandlers = {};
  }

  private loadAndDisplayImage(): void {
    if (!this.element || !this.imageId) return;
    this.cs.cargarYMostrarImagen(this.element, this.imageId).then(() => {
      try {
        if (!cornerstone.getEnabledElement(this.element)) {
          cornerstone.enable(this.element!);
        }
        
        // Primero desactivar todas las herramientas para evitar conflictos
        this.disableAllCornerstoneTools();
        
        // Inicializar herramientas pero sin activarlas
        this.cs.inicializarHerramientas(this.element!);
        
        // Use a more reliable approach for event handling
        const eventHandler = () => this.updateToolState();
        
        // Store reference to the handler function
        this._imageRenderedHandler = eventHandler;
        
        // Eliminar cualquier listener existente para evitar duplicados
        cornerstone.events.removeEventListener('cornerstoneimagerendered', this._imageRenderedHandler, this.element);
        
        // Añadir el listener una sola vez
        cornerstone.events.addEventListener('cornerstoneimagerendered', this._imageRenderedHandler, this.element);
        
        // Actualizar el estado de las herramientas
        this.updateToolState();
      } catch (error) {
        console.error('Error initializing tools:', error);
      }
    }).catch(error => {
      console.error('Error loading or displaying image:', error);
    });
  }
  
  // Add this property to store the event handler reference
  private _imageRenderedHandler: any = null;

  private updateToolState(): void {
    if (!this.element) return;
    try {
      console.log('Actualizando estado de herramientas:', this.activeToolNames);
      
      // Eliminar todos los manejadores de eventos existentes
      this.removeAllCustomHandlers();
      
      // Restablecer el estado activo
      this.isToolActive = false;
      
      // Asegurar que el elemento cornerstone está habilitado
      if (!cornerstone.getEnabledElement(this.element)) {
        cornerstone.enable(this.element);
      }
      
      // Desactivar todas las herramientas primero
      this.disableAllCornerstoneTools();
      
      // Verificar compatibilidad de herramientas usando el servicio
      const compatibility = this.toolHandlerService.checkToolCompatibility(this.activeToolNames);
      
      if (!compatibility.compatible) {
        // Hay herramientas incompatibles
        const [tool1, tool2] = compatibility.conflicts[0];
        
        // Determinar cuál es la nueva herramienta que se está intentando activar
        const wasTool1Active = this.activeToolNames.includes(tool1) && !this.activeToolNames.includes(tool2);
        
        // Determinar qué herramienta eliminar
        let toolToRemove = wasTool1Active ? tool2 : tool1;
        let message = `No se puede activar ${toolToRemove} cuando ${wasTool1Active ? tool1 : tool2} está activado`;
        
        // Eliminar la herramienta incompatible
        this.activeToolNames = this.activeToolNames.filter(tool => tool !== toolToRemove);
        
        // Emitir el cambio al componente padre
        this.toolsChanged.emit([...this.activeToolNames]);
        
        // Mostrar alerta
        this.showSweetAlert(message);
      }
      
      // Activar solo las herramientas seleccionadas
      if (this.activeToolNames && this.activeToolNames.length > 0) {
        // Obtener los manejadores para las herramientas activas
        const toolHandlers: { [key: string]: { [eventType: string]: EventListener } } = {};
        
        // Recopilar manejadores de cada herramienta activa
        for (const toolName of this.activeToolNames) {
          const handler = this.toolHandlerService.getHandler(toolName);
          if (handler) {
            toolHandlers[toolName] = handler.getEventHandlers(this.element);
            this.isToolActive = true;
            console.log(`${toolName} activado`);
          }
        }
        
        // Registrar todos los manejadores recopilados
        this.registerCombinedHandlers(toolHandlers);
      }
      
      // Añadir manejadores de seguridad si no hay herramientas activas
      if (!this.isToolActive) {
        this.addSafetyEventHandlers();
        console.log('Manejadores de seguridad añadidos (sin funcionalidad de zoom)');
      }
      
      cornerstone.updateImage(this.element);
      
      // Asegurar que el cursor y las clases visuales se actualicen
      this.updateCursor();
    } catch (error) {
      console.error('Error updating tool state:', error);
    }
  }
  
  // Método para registrar los manejadores combinados de todas las herramientas
  private registerCombinedHandlers(toolHandlers: { [key: string]: { [eventType: string]: EventListener } }): void {
    if (!this.element) return;
    
    // Limpiar los manejadores existentes
    this.removeAllCustomHandlers();
    
    // Crear manejadores combinados para cada tipo de evento
    const combinedHandlers: { [eventType: string]: EventListener } = {};
    
    // Recopilar todos los tipos de eventos de todas las herramientas
    const allEventTypes = new Set<string>();
    Object.values(toolHandlers).forEach(handlers => {
      Object.keys(handlers).forEach(eventType => allEventTypes.add(eventType));
    });
    
    // Para cada tipo de evento, crear un manejador combinado
    allEventTypes.forEach(eventType => {
      combinedHandlers[eventType] = (event: Event) => {
        // Detener la propagación del evento para evitar que cornerstone lo maneje también
        event.stopPropagation();
        event.preventDefault();
        
        // Llamar a los manejadores de cada herramienta para este tipo de evento
        Object.entries(toolHandlers).forEach(([toolName, handlers]) => {
          if (handlers[eventType]) {
            try {
              handlers[eventType](event);
            } catch (error) {
              console.warn(`Error en manejador de ${toolName} para ${eventType}:`, error);
            }
          }
        });
      };
      
      // Registrar el manejador combinado con captura para asegurar que se ejecute primero
      this.eventHandlers[eventType] = combinedHandlers[eventType];
      this.element!.addEventListener(eventType, this.eventHandlers[eventType], true);
    });
    
    // Actualizar el cursor según las herramientas activas
    this.updateCursor();
  }

  // Método para actualizar el cursor según las herramientas activas
  private updateCursor(): void {
    if (!this.element) return;
    
    if (this.activeToolNames.length > 0) {
      const firstToolName = this.activeToolNames[0];
      const handler = this.toolHandlerService.getHandler(firstToolName);
      
      if (handler) {
        this.element.style.cursor = handler.getCursor();
        
        // Actualizar clases CSS
        this.element.classList.remove('tool-pan-active', 'tool-wwwc-active', 'tool-zoom-active', 'tool-length-active');
        this.element.classList.add(`tool-${handler.getName().toLowerCase()}-active`);
      } else {
        this.element.style.cursor = 'default';
        this.element.classList.remove('tool-pan-active', 'tool-wwwc-active', 'tool-zoom-active', 'tool-length-active');
      }
    } else {
      this.element.style.cursor = 'default';
      this.element.classList.remove('tool-pan-active', 'tool-wwwc-active', 'tool-zoom-active', 'tool-length-active');
    }
  }

  /**
   * Elimina todos los manejadores de eventos personalizados
   */
  private removeAllCustomHandlers(): void {
    if (!this.element) return;
    
    console.log('Eliminando todos los manejadores de eventos personalizados');
    
    // Lista de todos los tipos de eventos que podrían tener manejadores
    const events = ['wheel', 'mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    
    // Eliminar cada manejador de eventos con ambos modos de captura
    events.forEach(eventType => {
      if (this.eventHandlers[eventType]) {
        try {
          this.element?.removeEventListener(eventType, this.eventHandlers[eventType], true);
          this.element?.removeEventListener(eventType, this.eventHandlers[eventType], false);
          console.log(`Manejador de eventos ${eventType} eliminado`);
        } catch (error) {
          console.warn(`Error al eliminar manejador de eventos ${eventType}:`, error);
        }
      }
    });
    
    // Limpiar el objeto de manejadores
    this.eventHandlers = {};
    
    // Restablecer el cursor
    if (this.element) {
      this.element.style.cursor = 'default';
    }
  }
  
  /**
   * Desactiva todas las herramientas de cornerstone
   */
  private disableAllCornerstoneTools(): void {
    if (!this.element) return;
    
    try {
      console.log('Desactivando todas las herramientas de cornerstone');
      
      // Lista de todas las herramientas que podrían estar activas
      const toolNames = [
        'Wwwc', 'Pan', 'Zoom', 'Length', 'Angle', 'Probe', 
        'EllipticalRoi', 'RectangleRoi', 'FreehandRoi', 'Magnify',
        'StackScroll', 'Brush', 'Eraser', 'ArrowAnnotate'
      ];
      
      // Desactivar cada herramienta
      toolNames.forEach(toolName => {
        try {
          // Intentar desactivar la herramienta de todas las formas posibles
          try { cornerstoneTools.setToolDisabled(toolName); } catch (e) {}
          try { cornerstoneTools.setToolPassive(toolName); } catch (e) {}
          try { cornerstoneTools.setToolInactive(toolName); } catch (e) {}
          
          // Intentar eliminar la herramienta del elemento
          try {
            const toolData = cornerstoneTools.getToolForElement(this.element, toolName);
            if (toolData) {
              cornerstoneTools.removeToolForElement(this.element, toolName);
            }
          } catch (e) {}
        } catch (error) {
          console.warn(`Error al desactivar herramienta ${toolName}:`, error);
        }
      });
      
      // Importante: Desactivar todos los manejadores de eventos de cornerstone
      // Añadir verificaciones para cada manejador antes de intentar desactivarlo
      try {
        // Verificar que cada manejador exista antes de intentar desactivarlo
        if (cornerstoneTools.mouseInput && typeof cornerstoneTools.mouseInput.disable === 'function') {
          cornerstoneTools.mouseInput.disable(this.element);
        }
        
        if (cornerstoneTools.mouseWheelInput && typeof cornerstoneTools.mouseWheelInput.disable === 'function') {
          cornerstoneTools.mouseWheelInput.disable(this.element);
        }
        
        if (cornerstoneTools.touchInput && typeof cornerstoneTools.touchInput.disable === 'function') {
          cornerstoneTools.touchInput.disable(this.element);
        }
        
        if (cornerstoneTools.keyboardInput && typeof cornerstoneTools.keyboardInput.disable === 'function') {
          cornerstoneTools.keyboardInput.disable(this.element);
        }
      } catch (e) {
        console.warn('Error al desactivar manejadores de eventos de cornerstone:', e);
      }
      
    } catch (error) {
      console.error('Error al desactivar herramientas de cornerstone:', error);
    }
  }
  
  /**
   * Muestra un mensaje SweetAlert
   */
  private showSweetAlert(message: string): void {
    console.log('Intentando mostrar SweetAlert con mensaje:', message);
    
    // Usar setTimeout para asegurar que la alerta se ejecute en la zona de Angular
    setTimeout(() => {
      try {
        // Usar un enfoque más directo con menos opciones
        Swal.fire({
          title: 'Advertencia',
          text: message,
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        console.log('SweetAlert.fire() ejecutado');
      } catch (error) {
        console.error('Error al mostrar SweetAlert:', error);
        // Alerta de respaldo en caso de que SweetAlert falle
        alert(message);
      }
    }, 0);
  }
  
  /**
   * Añade manejadores de eventos de seguridad cuando no hay herramientas activas
   */
  private addSafetyEventHandlers(): void {
    if (!this.element) return;
    
    // Manejador básico de rueda para navegación (sin zoom)
    this.eventHandlers['wheel'] = (event: Event) => {
      const e = event as WheelEvent;
      e.preventDefault();
      e.stopPropagation();
      
      // No implementamos zoom aquí, solo prevenimos el comportamiento predeterminado
      // para evitar que la página se desplace
      console.log('Safety wheel handler - no zoom functionality');
    };
    
    // Registrar los manejadores de seguridad
    this.element.addEventListener('wheel', this.eventHandlers['wheel'], true);
  }
  
  /**
   * Restablece la vista de la imagen a su estado original
   */
  public resetView(): void {
    if (!this.element) return;
    
    try {
      console.log('Restableciendo vista de la imagen');
      
      // Obtener el viewport actual
      let viewport = cornerstone.getViewport(this.element);
      
      // Guardar los valores actuales de brillo/contraste
      const currentWindowWidth = viewport.voi.windowWidth;
      const currentWindowCenter = viewport.voi.windowCenter;
      
      // Restablecer los valores del viewport relacionados con la posición
      viewport.translation.x = 0; // Posición X original
      viewport.translation.y = 0; // Posición Y original
      viewport.rotation = 0; // Restablecer rotación
      viewport.hflip = false; // Restablecer volteo horizontal
      viewport.vflip = false; // Restablecer volteo vertical
      
      // Mantener los valores de brillo/contraste
      viewport.voi.windowWidth = currentWindowWidth;
      viewport.voi.windowCenter = currentWindowCenter;
      
      // Aplicar los cambios
      cornerstone.setViewport(this.element, viewport);
      
      // Usar fitToWindow para ajustar la imagen al contenedor
      cornerstone.fitToWindow(this.element);
      
      // Restaurar los valores de brillo/contraste después de fitToWindow
      viewport = cornerstone.getViewport(this.element);
      viewport.voi.windowWidth = currentWindowWidth;
      viewport.voi.windowCenter = currentWindowCenter;
      cornerstone.setViewport(this.element, viewport);
      
      // Actualizar la imagen
      cornerstone.updateImage(this.element);
      
      console.log('Vista restablecida correctamente (manteniendo brillo/contraste)');
    } catch (error) {
      console.error('Error al restablecer la vista:', error);
    }
  }

  public setToolActive(toolNames: string[] | string | null): void {
    const previousTools = [...this.activeToolNames];
    
    if (toolNames === null) {
      this.activeToolNames = [];
    } else if (Array.isArray(toolNames)) {
      this.activeToolNames = toolNames;
    } else {
      // Si se pasa un string, convertirlo a array
      this.activeToolNames = [toolNames];
    }
    
    console.log('setToolActive llamado con:', this.activeToolNames);
    
    // Si se desactivó el zoom, asegurarse de que no quede ninguna funcionalidad de zoom
    if (previousTools.includes('Zoom') && !this.activeToolNames.includes('Zoom')) {
      console.log('Zoom desactivado, eliminando funcionalidad de zoom');
    }
    
    this.updateToolState();
  }

  public setActiveTools(toolNames: string[]): void {
    console.log('setActiveTools llamado con:', toolNames);
    
    // Verificar compatibilidad de herramientas usando el servicio
    const compatibility = this.toolHandlerService.checkToolCompatibility(toolNames);
    
    if (!compatibility.compatible) {
      // Hay herramientas incompatibles
      const [tool1, tool2] = compatibility.conflicts[0];
      
      // Determinar cuál es la nueva herramienta que se está intentando activar
      const wasTool1Active = this.activeToolNames.includes(tool1);
      const wasTool2Active = this.activeToolNames.includes(tool2);
      
      let message = '';
      
      if (!wasTool1Active && toolNames.includes(tool1)) {
        // Si tool1 es la nueva herramienta, eliminarla y mostrar mensaje
        toolNames = toolNames.filter(tool => tool !== tool1);
        message = `No se puede activar ${tool1} cuando ${tool2} está activado`;
      } else if (!wasTool2Active && toolNames.includes(tool2)) {
        // Si tool2 es la nueva herramienta, eliminarla y mostrar mensaje
        toolNames = toolNames.filter(tool => tool !== tool2);
        message = `No se puede activar ${tool2} cuando ${tool1} está activado`;
      } else {
        // Si ambas estaban activas antes (caso improbable), eliminar tool1
        toolNames = toolNames.filter(tool => tool !== tool1);
        message = `No se pueden usar ${tool1} y ${tool2} al mismo tiempo`;
      }
      
      // Emitir el cambio de herramientas al componente padre
      this.toolsChanged.emit([...toolNames]);
      
      // Mostrar alerta
      this.showSweetAlert(message);
    }
    
    this.activeToolNames = toolNames;
    console.log('DicomViewer: configurando herramientas activas:', toolNames.join(', ') || 'Ninguna');
    this.updateToolState();
  }

  // Add these methods to the DicomViewerComponent class
  
  /**
   * Rota la imagen 90 grados a la izquierda
   */
  public rotateLeft(): void {
    if (!this.element) return;
    
    try {
      console.log('Rotando imagen 90 grados a la izquierda');
      
      // Obtener el viewport actual
      const viewport = cornerstone.getViewport(this.element);
      
      // Rotar 90 grados a la izquierda (equivalente a -90 grados)
      viewport.rotation = (viewport.rotation - 90) % 360;
      
      // Aplicar los cambios
      cornerstone.setViewport(this.element, viewport);
      cornerstone.updateImage(this.element);
      
      console.log('Imagen rotada a la izquierda correctamente');
    } catch (error) {
      console.error('Error al rotar la imagen a la izquierda:', error);
    }
  }
  
  /**
   * Rota la imagen 90 grados a la derecha
   */
  public rotateRight(): void {
    if (!this.element) return;
    
    try {
      console.log('Rotando imagen 90 grados a la derecha');
      
      // Obtener el viewport actual
      const viewport = cornerstone.getViewport(this.element);
      
      // Rotar 90 grados a la derecha
      viewport.rotation = (viewport.rotation + 90) % 360;
      
      // Aplicar los cambios
      cornerstone.setViewport(this.element, viewport);
      cornerstone.updateImage(this.element);
      
      console.log('Imagen rotada a la derecha correctamente');
    } catch (error) {
      console.error('Error al rotar la imagen a la derecha:', error);
    }
  }
  
  /**
   * Voltea la imagen horizontalmente
   */
  public flipHorizontal(): void {
    if (!this.element) return;
    
    try {
      console.log('Volteando imagen horizontalmente');
      
      // Obtener el viewport actual
      const viewport = cornerstone.getViewport(this.element);
      
      // Invertir el estado de volteo horizontal
      viewport.hflip = !viewport.hflip;
      
      // Aplicar los cambios
      cornerstone.setViewport(this.element, viewport);
      cornerstone.updateImage(this.element);
      
      console.log('Imagen volteada horizontalmente correctamente');
    } catch (error) {
      console.error('Error al voltear la imagen horizontalmente:', error);
    }
  }
  
  /**
   * Voltea la imagen verticalmente
   */
  public flipVertical(): void {
    if (!this.element) return;
    
    try {
      console.log('Volteando imagen verticalmente');
      
      // Obtener el viewport actual
      const viewport = cornerstone.getViewport(this.element);
      
      // Invertir el estado de volteo vertical
      viewport.vflip = !viewport.vflip;
      
      // Aplicar los cambios
      cornerstone.setViewport(this.element, viewport);
      cornerstone.updateImage(this.element);
      
      console.log('Imagen volteada verticalmente correctamente');
    } catch (error) {
      console.error('Error al voltear la imagen verticalmente:', error);
    }
  }

  // 2. Asegúrate de que el método downloadImage exista en DicomViewerComponent
  /**
   * Descarga la imagen actual en el formato especificado
   * @param format Formato de descarga (jpg, png, pdf)
   */
  public downloadImage(format: string): void {
    if (!this.element) return;
    
    try {
      console.log(`Descargando imagen en formato ${format}`);
      
      // Obtener el handler de descarga
      const downloadHandler = this.toolHandlerService.getHandler('Download') as any;
      
      if (!downloadHandler) {
        console.error('Handler de descarga no encontrado');
        return;
      }
      
      // Obtener información del estudio para el nombre del archivo
      const enabledElement = cornerstone.getEnabledElement(this.element);
      let filename = 'dicom-image';
      
      if (enabledElement && enabledElement.image && enabledElement.image.data) {
        // Intentar obtener información del paciente para el nombre del archivo
        const metadata = enabledElement.image.data;
        const patientName = metadata.string('x00100010') || '';
        const studyDate = metadata.string('x00080020') || '';
        
        if (patientName || studyDate) {
          filename = `${patientName.replace(/\^/g, '_')}_${studyDate}`.trim();
        }
      }
      
      // Llamar al método de descarga del handler
      downloadHandler.downloadImage(this.element, format, filename);
      
      console.log('Imagen descargada correctamente');
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  }

  // Add these methods to the DicomViewerComponent class
  
  /**
   * Activa la herramienta de medición de longitud
   */
  public activateLengthMeasure(): void {
    this.setToolActive(['Length']);
  }
  
  /**
   * Activa la herramienta de medición de elipse
   */
  public activateEllipseMeasure(): void {
    this.setToolActive(['EllipticalRoi']);
  }
  
  /**
   * Activa la herramienta de medición de rectángulo
   */
  public activateRectangleMeasure(): void {
    this.setToolActive(['RectangleRoi']);
  }
  
  /**
   * Activa la herramienta de medición de círculo
   */
  public activateCircleMeasure(): void {
    this.setToolActive(['CircleRoi']);
  }
  
  /**
   * Limpia todas las mediciones
   */
  public clearMeasurements(): void {
    if (!this.element) return;
    
    try {
      MeasurementToolHandler.clearMeasurements(this.element);
    } catch (error) {
      console.error('Error al limpiar las mediciones:', error);
    }
  }
}