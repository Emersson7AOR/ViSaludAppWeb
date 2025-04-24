import { Injectable } from '@angular/core';
import { ToolHandler } from './tool-handler.interface';
import { WindowLevelHandler } from './window-level-handler';
import { ZoomHandler } from './zoom-handler';
import { PanHandler } from './pan-handler';
import { LengthHandler } from './length-handler';
import { OrientationHandler } from './orientation-handler';
import { DownloadHandler } from './download-handler';
import { MeasurementToolHandler } from './measurement-tool-handler';

@Injectable({
  providedIn: 'root'
})
export class ToolHandlerService {
  private handlers: Map<string, ToolHandler> = new Map();

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Existing handlers
    this.handlers.set('Wwwc', new WindowLevelHandler());
    this.handlers.set('Pan', new PanHandler());
    this.handlers.set('Zoom', new ZoomHandler());
    this.handlers.set('Length', new LengthHandler());
    this.handlers.set('Orientation', new OrientationHandler());
    
    // Add the new download handler
    this.handlers.set('Download', new DownloadHandler());
    
    // Measurement tools
    this.handlers.set('Length', new MeasurementToolHandler('Length'));
    this.handlers.set('EllipticalRoi', new MeasurementToolHandler('EllipticalRoi'));
    this.handlers.set('RectangleRoi', new MeasurementToolHandler('RectangleRoi'));
    this.handlers.set('CircleRoi', new MeasurementToolHandler('CircleRoi'));
    this.handlers.set('SquareRoi', new MeasurementToolHandler('SquareRoi'));
    this.handlers.set('SquareRoi', new MeasurementToolHandler('SquareRoi'));
  }

  getHandler(toolName: string): ToolHandler | undefined {
    return this.handlers.get(toolName);
  }

  getAllHandlers(): Map<string, ToolHandler> {
    return this.handlers;
  }

  checkToolCompatibility(toolNames: string[]): { compatible: boolean; conflicts: string[][] } {
    const conflicts: string[][] = [];
    
    // Verificar cada par de herramientas
    for (let i = 0; i < toolNames.length; i++) {
      const tool1 = toolNames[i];
      const handler1 = this.getHandler(tool1);
      
      if (!handler1) continue;
      
      for (let j = i + 1; j < toolNames.length; j++) {
        const tool2 = toolNames[j];
        const handler2 = this.getHandler(tool2);
        
        if (!handler2) continue;
        
        // Verificar compatibilidad en ambas direcciones
        if (!handler1.isCompatibleWith(tool2) || !handler2.isCompatibleWith(tool1)) {
          conflicts.push([tool1, tool2]);
        }
      }
    }
    
    return {
      compatible: conflicts.length === 0,
      conflicts
    };
  }

  // Add these methods to your ToolHandlerService class
  
  /**
   * Gets handlers for the specified tool names
   */
  /**
   * Obtiene los manejadores de eventos para las herramientas especificadas
   * @param toolNames Nombres de las herramientas
   * @param element Elemento HTML donde se aplicarán los manejadores
   */
  getHandlersForTools(toolNames: string[], element: HTMLElement): { [key: string]: { [eventType: string]: EventListener } } {
    const result: { [key: string]: { [eventType: string]: EventListener } } = {};
    
    toolNames.forEach(toolName => {
      const handler = this.getHandler(toolName);
      if (handler) {
        result[toolName] = handler.getEventHandlers(element);
      }
    });
    
    return result;
  }
  
  /**
   * Verifica si hay herramientas incompatibles en la lista proporcionada
   * Devuelve el primer par de herramientas incompatibles encontrado, o un array vacío si no hay conflictos
   */
  checkForIncompatibleTools(toolNames: string[]): string[] {
    const compatibility = this.checkToolCompatibility(toolNames);
    
    if (!compatibility.compatible && compatibility.conflicts.length > 0) {
      // Devolver el primer conflicto encontrado
      return compatibility.conflicts[0];
    }
    
    return [];
  }
}