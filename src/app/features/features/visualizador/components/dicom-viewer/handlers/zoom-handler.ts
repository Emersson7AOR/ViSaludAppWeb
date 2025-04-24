import * as cornerstone from 'cornerstone-core';
import { ToolHandler } from './tool-handler.interface';

export class ZoomHandler implements ToolHandler {
  getName(): string {
    return 'Zoom';
  }

  getCursor(): string {
    return 'zoom-in';
  }

  isCompatibleWith(toolName: string): boolean {
    return true; // Compatible con todas las herramientas
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    const handlers: { [eventType: string]: EventListener } = {};
    
    handlers['wheel'] = (event: Event) => {
      const e = event as WheelEvent;
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const enabledElement = cornerstone.getEnabledElement(element);
        if (!enabledElement || !enabledElement.image) return;
        
        const viewport = cornerstone.getViewport(element);
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        viewport.scale *= zoomFactor;
        
        cornerstone.setViewport(element, viewport);
        cornerstone.updateImage(element);
      } catch (err) {
        console.warn('Zoom error:', err);
      }
    };
    
    return handlers;
  }
}