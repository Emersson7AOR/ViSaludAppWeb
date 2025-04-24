import { ToolHandler } from './tool-handler.interface';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';

export class MeasurementToolHandler implements ToolHandler {
  private toolType: string;
  
  constructor(toolType: string) {
    this.toolType = toolType;
  }

  getName(): string {
    return this.toolType;
  }

  getCursor(): string {
    return 'crosshair';
  }

  isCompatibleWith(toolName: string): boolean {
    // No es compatible con Window Level (contraste) ni con Pan
    return toolName !== 'Wwwc' && toolName !== 'Pan';
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    const handlers: { [eventType: string]: EventListener } = {};
    
    // Activar la herramienta de medición correspondiente
    try {
      switch (this.toolType) {
        case 'Length':
          this.activateLengthTool(element);
          break;
        case 'EllipticalRoi':
          this.activateEllipticalRoiTool(element);
          break;
        case 'RectangleRoi':
          this.activateRectangleRoiTool(element);
          break;
        case 'CircleRoi':
          this.activateCircleRoiTool(element);
          break;
        case 'SquareRoi':
          this.activateSquareRoiTool(element);
          break;
      }
    } catch (error) {
      console.error(`Error al activar la herramienta ${this.toolType}:`, error);
    }
    
    // Manejadores de eventos básicos para prevenir comportamientos predeterminados
    handlers['mousedown'] = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    
    handlers['mousemove'] = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    
    handlers['mouseup'] = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    
    return handlers;
  }
  
  // Método para activar la herramienta de medición de longitud
  private activateLengthTool(element: HTMLElement): void {
    try {
      // Asegurarse de que la herramienta esté inicializada
      if (!cornerstoneTools.getToolForElement(element, 'Length')) {
        cornerstoneTools.addTool(cornerstoneTools.LengthTool);
      }
      
      // Activar la herramienta
      cornerstoneTools.setToolActive('Length', { mouseButtonMask: 1 });
      console.log('Herramienta de longitud activada');
    } catch (error) {
      console.error('Error al activar la herramienta de longitud:', error);
    }
  }
  
  // Método para activar la herramienta de medición de elipse
  private activateEllipticalRoiTool(element: HTMLElement): void {
    try {
      // Asegurarse de que la herramienta esté inicializada
      if (!cornerstoneTools.getToolForElement(element, 'EllipticalRoi')) {
        cornerstoneTools.addTool(cornerstoneTools.EllipticalRoiTool);
      }
      
      // Activar la herramienta
      cornerstoneTools.setToolActive('EllipticalRoi', { mouseButtonMask: 1 });
      console.log('Herramienta de elipse activada');
    } catch (error) {
      console.error('Error al activar la herramienta de elipse:', error);
    }
  }
  
  // Método para activar la herramienta de medición de rectángulo
  private activateRectangleRoiTool(element: HTMLElement): void {
    try {
      // Asegurarse de que la herramienta esté inicializada
      if (!cornerstoneTools.getToolForElement(element, 'RectangleRoi')) {
        cornerstoneTools.addTool(cornerstoneTools.RectangleRoiTool);
      }
      
      // Activar la herramienta
      cornerstoneTools.setToolActive('RectangleRoi', { mouseButtonMask: 1 });
      console.log('Herramienta de rectángulo activada');
    } catch (error) {
      console.error('Error al activar la herramienta de rectángulo:', error);
    }
  }
  
  // Método para activar la herramienta de medición de círculo
  private activateCircleRoiTool(element: HTMLElement): void {
    try {
      // Asegurarse de que la herramienta esté inicializada
      if (!cornerstoneTools.getToolForElement(element, 'CircleRoi')) {
        cornerstoneTools.addTool(cornerstoneTools.CircleRoiTool);
      }
      
      // Activar la herramienta
      cornerstoneTools.setToolActive('CircleRoi', { mouseButtonMask: 1 });
      console.log('Herramienta de círculo activada');
    } catch (error) {
      console.error('Error al activar la herramienta de círculo:', error);
    }
  }
  
  // Método para activar la herramienta de medición de cuadrado
  private activateSquareRoiTool(element: HTMLElement): void {
    try {
      // Asegurarse de que la herramienta esté inicializada
      if (!cornerstoneTools.getToolForElement(element, 'RectangleRoi')) {
        cornerstoneTools.addTool(cornerstoneTools.RectangleRoiTool);
      }
      
      // Para el cuadrado, usamos la misma herramienta de rectángulo pero con una configuración especial
      // que mantiene la relación de aspecto 1:1
      cornerstoneTools.setToolActive('RectangleRoi', { 
        mouseButtonMask: 1,
        configuration: {
          keepAspectRatio: true
        }
      });
      console.log('Herramienta de cuadrado activada');
    } catch (error) {
      console.error('Error al activar la herramienta de cuadrado:', error);
    }
  }
  
  // Método para limpiar todas las mediciones
  public static clearMeasurements(element: HTMLElement): void {
    try {
      // Lista de herramientas de medición
      const measurementTools = ['Length', 'EllipticalRoi', 'RectangleRoi', 'CircleRoi', 'SquareRoi'];
      
      // Limpiar cada herramienta
      measurementTools.forEach(toolName => {
        try {
          cornerstoneTools.clearToolState(element, toolName);
        } catch (error) {
          console.warn(`Error al limpiar la herramienta ${toolName}:`, error);
        }
      });
      
      // Actualizar la visualización
      cornerstone.updateImage(element);
      console.log('Mediciones limpiadas correctamente');
    } catch (error) {
      console.error('Error al limpiar las mediciones:', error);
    }
  }
}