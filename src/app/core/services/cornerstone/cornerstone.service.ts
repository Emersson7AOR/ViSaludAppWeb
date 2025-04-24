import { Injectable } from '@angular/core';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

// Interfaz para la ventana con propiedad Hammer
interface VentanaConHammer extends Window {
  Hammer?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CornerstoneService {
  
  // Add this property to track if we've patched the mouseMove handler
  private mouseMovePatchApplied = false;
  
  constructor() { }
  
  /**
   * Inicializa las bibliotecas de Cornerstone
   */
  inicializar(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Configurar dependencias externas para Cornerstone Tools
      cornerstoneTools.external.cornerstone = cornerstone;
      
      // Verificar si Hammer.js está disponible
      const ventanaConHammer = window as VentanaConHammer;
      if (ventanaConHammer.Hammer) {
        cornerstoneTools.external.Hammer = ventanaConHammer.Hammer;
      } else {
        console.warn('Hammer.js no está disponible. Algunas interacciones táctiles podrían no funcionar.');
      }
      
      // Apply the patch to prevent the error
      this.patchCornerstoneToolsMouseMove();
      
      // Configure Cornerstone WADO Image Loader first
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
      cornerstoneWADOImageLoader.configure({ beforeSend: () => {} });
      
      // Configure Web Workers for WADO Image Loader
      if (cornerstoneWADOImageLoader.webWorkerManager) {
        cornerstoneWADOImageLoader.webWorkerManager.initialize({
          maxWebWorkers: navigator.hardwareConcurrency || 1,
          startWebWorkersOnDemand: true,
          taskConfiguration: {
            decodeTask: { usePDFJS: false }
          }
        });
      }
      
      // Initialize with proper configuration to prevent segmentation warnings
      cornerstoneTools.init({
        mouseEnabled: false,
        touchEnabled: false,
        globalToolSyncEnabled: false,
        showSVGCursors: true,
        // Add this to prevent colorLUT warnings
        segmentation: {
          maxSegmentations: 1,
          segmentsPerLabelmap: 255 // Reduce from default 65535
        }
      });
      
      // Register all tools we'll need to prevent "Unable to find tool" errors
      this.registerAllTools();
      
      // Add event after initialization
      cornerstone.events.addEventListener('cornerstoneimageloaded', (evento: any) => {
        console.log('Imagen cargada en el elemento:', evento.detail.element);
      });
      
      console.log('✅ Cornerstone y Cornerstone Tools inicializados correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Cornerstone:', error);
    }
  }

  /**
   * Register all tools that will be used in the application
   */
  private registerAllTools(): void {
    try {
      // Register all tools we'll use
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      cornerstoneTools.addTool(cornerstoneTools.LengthTool);
      cornerstoneTools.addTool(cornerstoneTools.PanMultiTouchTool);
      cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);
      cornerstoneTools.addTool(cornerstoneTools.ProbeTool);
      cornerstoneTools.addTool(cornerstoneTools.AngleTool);
      cornerstoneTools.addTool(cornerstoneTools.RectangleRoiTool);
      cornerstoneTools.addTool(cornerstoneTools.EllipticalRoiTool);
      
      console.log('✅ All Cornerstone tools registered successfully');
    } catch (error) {
      console.error('❌ Error registering Cornerstone tools:', error);
    }
  }

  /**
   * Patch the mouseMove handler in CornerstoneTools to prevent the error
   */
  private patchCornerstoneToolsMouseMove(): void {
    if (this.mouseMovePatchApplied) return;
    
    try {
      // Find the mouseInput object
      if (cornerstoneTools.mouseInput) {
        // Store the original mouseMove function
        const originalMouseMove = cornerstoneTools.mouseInput.mouseMove;
        
        // Replace it with our safe version
        cornerstoneTools.mouseInput.mouseMove = function safeMouseMove(evt: any) {
          try {
            // Check if we have all required properties before proceeding
            if (evt && evt.detail && evt.detail.currentPoints && 
                evt.detail.currentPoints.image && evt.detail.currentPoints.image.point) {
              return originalMouseMove.call(this, evt);
            }
            // Otherwise just return without doing anything
            return false;
          } catch (error) {
            console.warn('Prevented CornerstoneTools mouseMove error:', error);
            return false;
          }
        };
        
        console.log('✅ CornerstoneTools mouseMove handler patched successfully');
        this.mouseMovePatchApplied = true;
      }
    } catch (error) {
      console.error('❌ Error patching CornerstoneTools mouseMove handler:', error);
    }
  }

  habilitarElemento(elemento: HTMLElement): void {
    try {
      if (elemento.hasAttribute('data-cornerstone-enabled')) {
        try {
          cornerstone.disable(elemento);
        } catch (e) {
          console.warn('No se pudo deshabilitar el elemento:', e);
        }
      }

      elemento.style.width = '100%';
      elemento.style.height = '512px';
      elemento.style.backgroundColor = '#000';

      if (!window.hasOwnProperty('PointerEvent')) {
        console.log('⚠️ PointerEvent no disponible, usando polyfill...');
        (window as any).PointerEvent = (window as any).MouseEvent;
      }

      cornerstone.enable(elemento);
      
      // Add a capture phase event listener to prevent the error
      elemento.addEventListener('mousemove', this.preventCornerstoneToolsErrors, true);
      
    } catch (error) {
      console.error('Error al habilitar elemento:', error);
      throw error;
    }
  }

  /**
   * Event handler to prevent CornerstoneTools errors
   */
  private preventCornerstoneToolsErrors = (event: Event): void => {
    // Check if we're using our custom handlers
    if ((event.target as HTMLElement).hasAttribute('data-custom-handler')) {
      // Stop propagation to prevent CornerstoneTools from handling it
      event.stopPropagation();
    }
  };

  cargarYMostrarImagen(elemento: HTMLElement, imageId: string): Promise<void> {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        cornerstone.loadImage(imageId).then((imagen: any) => {
          console.log('✅ Imagen cargada correctamente');
          try {
            if (!elemento || !document.body.contains(elemento)) {
              rechazar(new Error('El elemento ya no es válido'));
              return;
            }
            cornerstone.displayImage(elemento, imagen);
            resolver();
          } catch (error) {
            console.error('❌ Error al mostrar la imagen:', error);
            rechazar(error);
          }
        }).catch((err: any) => {
          console.error('❌ Error al cargar imagen:', err);
          rechazar(err);
        });
      }, 500);
    });
  }

  inicializarHerramientas(elemento: HTMLElement): void {
    try {
      const elementoHabilitado = cornerstone.getEnabledElement(elemento);
      if (!elementoHabilitado) {
        console.error('❌ El elemento no está habilitado para Cornerstone');
        return;
      }
      
      // Primero, desactivar completamente los manejadores de entrada
      try {
        // Desactivar todos los manejadores de eventos de mouse
        if (cornerstoneTools.mouseInput && typeof cornerstoneTools.mouseInput.disable === 'function') {
          cornerstoneTools.mouseInput.disable(elemento);
        }
        // Desactivar todos los manejadores de eventos de rueda
        if (cornerstoneTools.mouseWheelInput && typeof cornerstoneTools.mouseWheelInput.disable === 'function') {
          cornerstoneTools.mouseWheelInput.disable(elemento);
        }
        // Desactivar todos los manejadores de eventos táctiles
        if (cornerstoneTools.touchInput && typeof cornerstoneTools.touchInput.disable === 'function') {
          cornerstoneTools.touchInput.disable(elemento);
        }
        // Desactivar todos los manejadores de eventos de teclado
        if (cornerstoneTools.keyboardInput && typeof cornerstoneTools.keyboardInput.disable === 'function') {
          cornerstoneTools.keyboardInput.disable(elemento);
        }
      } catch (e) {
        console.warn('No se pudieron desactivar los manejadores de entrada:', e);
      }
      
      // Limpiar el estado de todas las herramientas
      const nombresHerramientas = ['Zoom', 'Pan', 'Wwwc', 'PanMultiTouch', 'Length', 'Magnify', 'Probe', 'Angle', 'RectangleRoi', 'EllipticalRoi'];
      
      // Desactivar explícitamente todas las herramientas
      nombresHerramientas.forEach(nombre => {
        try {
          // Use setToolDisabled instead of trying to remove tools
          cornerstoneTools.setToolDisabled(nombre, {});
          
          // Limpiar el estado de la herramienta
          try {
            cornerstoneTools.clearToolState(elemento, nombre);
          } catch (e) {}
        } catch (e) {
          console.warn(`No se pudo desactivar la herramienta ${nombre}:`, e);
        }
      });
      
      // Solo activar PanMultiTouch para interacciones táctiles, pero con mouseButtonMask: 0
      try {
        cornerstoneTools.setToolActive('PanMultiTouch', { mouseButtonMask: 0 });
      } catch (e) {
        console.warn('No se pudo activar PanMultiTouch:', e);
      }
      
      // Importante: actualizar la imagen para reflejar los cambios
      cornerstone.updateImage(elemento);
      
      console.log('✅ Herramientas inicializadas correctamente (modo desactivado)');
    } catch (error) {
      console.error('❌ Error al inicializar herramientas:', error);
    }
  }

  restablecerZoom(elemento: HTMLElement): number {
    try {
      const elementoHabilitado = cornerstone.getEnabledElement(elemento);
      if (!elementoHabilitado) {
        console.error('❌ El elemento no está habilitado para Cornerstone');
        return 1.0;
      }
      const viewport = cornerstone.getDefaultViewport(elementoHabilitado.canvas, elementoHabilitado.image);
      cornerstone.setViewport(elemento, viewport);
      console.log('🔄 Zoom restablecido a valores predeterminados');
      return 1.0;
    } catch (error) {
      console.error('❌ Error al restablecer zoom:', error);
      return 1.0;
    }
  }

  activarZoom(elemento: HTMLElement, manejadorRueda: (evento: WheelEvent) => boolean): void {
    try {
      // Mark the element as using our custom handler
      elemento.setAttribute('data-custom-handler', 'zoom');
      
      // First, disable all tools to prevent conflicts
      this.desactivarTodasLasHerramientas(elemento);
      
      elemento.addEventListener('wheel', manejadorRueda, { passive: false });
    } catch (error) {
      console.error('❌ Error al activar zoom:', error);
    }
  }

  activarDesplazamiento(
    elemento: HTMLElement, 
    manejadorMouseDown: (evento: MouseEvent) => boolean,
    manejadorMouseMove: (evento: MouseEvent) => boolean,
    manejadorMouseUp: (evento: MouseEvent) => boolean
  ): void {
    try {
      // Mark the element as using our custom handler
      elemento.setAttribute('data-custom-handler', 'pan');
      
      // First, disable all tools to prevent conflicts
      this.desactivarTodasLasHerramientas(elemento);
      
      elemento.addEventListener('mousedown', manejadorMouseDown, { capture: true });
      elemento.addEventListener('mousemove', manejadorMouseMove, { capture: true });
      elemento.addEventListener('mouseup', manejadorMouseUp, { capture: true });
    } catch (error) {
      console.error('❌ Error al activar desplazamiento:', error);
    }
  }

  activarNivelVentana(elemento: HTMLElement): void {
    try {
      // Primero desactivar cualquier herramienta activa
      this.desactivarTodasLasHerramientas(elemento);
      // Luego activar la herramienta de nivel de ventana
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
    } catch (error) {
      console.error('❌ Error al activar nivel de ventana:', error);
    }
  }

  desactivarNivelVentana(): void {
    try {
      cornerstoneTools.setToolDisabled('Wwwc');
    } catch (error) {
      console.error('❌ Error al desactivar nivel de ventana:', error);
    }
  }
  
  /**
   * Desactiva todas las herramientas de cornerstone en el elemento
   */
  desactivarTodasLasHerramientas(elemento: HTMLElement): void {
    try {
      console.log('Desactivando todas las herramientas de cornerstone');
      const nombresHerramientas = ['Zoom', 'Pan', 'Wwwc', 'PanMultiTouch', 'Length', 'Magnify', 'Probe', 'Angle', 'RectangleRoi', 'EllipticalRoi'];
      
      nombresHerramientas.forEach(nombre => {
        try {
          cornerstoneTools.setToolDisabled(nombre, {});
        } catch (e) {
          // Silently ignore errors for individual tools
        }
      });
      
      // Actualizar la imagen para reflejar los cambios
      cornerstone.updateImage(elemento);
    } catch (error) {
      console.error('❌ Error al desactivar todas las herramientas:', error);
    }
  }
}
