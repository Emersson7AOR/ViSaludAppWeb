import * as cornerstone from 'cornerstone-core';
import { ToolHandler } from './tool-handler.interface';

export class PanHandler implements ToolHandler {
  private isPanning = false;
  private lastPoint: { x: number, y: number } | null = null;

  getName(): string {
    return 'Pan';
  }

  getCursor(): string {
    return 'grab';
  }

  isCompatibleWith(toolName: string): boolean {
    // No es compatible con Window Level ni con Length (medición)
    return toolName !== 'Wwwc' && toolName !== 'Length';
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    const handlers: { [eventType: string]: EventListener } = {};
    
    handlers['mousedown'] = (event: Event) => {
      const e = event as MouseEvent;
      // Solo procesar si se presiona el botón izquierdo
      if (e.button !== 0) return;
      
      this.isPanning = true;
      this.lastPoint = { x: e.clientX, y: e.clientY };
      console.log('Pan: mouseDown activado', this.lastPoint);
    };

    handlers['mousemove'] = (event: Event) => {
      const e = event as MouseEvent;
      
      if (this.isPanning) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.lastPoint) return;
        
        try {
          const viewport = cornerstone.getViewport(element);
          const dx = e.clientX - this.lastPoint.x;
          const dy = e.clientY - this.lastPoint.y;
          
          viewport.translation.x += dx / viewport.scale;
          viewport.translation.y += dy / viewport.scale;
          
          cornerstone.setViewport(element, viewport);
          cornerstone.updateImage(element);
          
          this.lastPoint = { x: e.clientX, y: e.clientY };
        } catch (error) {
          console.warn('Pan error:', error);
        }
      }
    };

    handlers['mouseup'] = (event: Event) => {
      if (!this.isPanning) return;
      
      this.isPanning = false;
      this.lastPoint = null;
      console.log('Pan: mouseUp, pan desactivado');
    };

    handlers['mouseleave'] = (event: Event) => {
      if (!this.isPanning) return;
      
      this.isPanning = false;
      this.lastPoint = null;
      console.log('Pan: mouseLeave, pan desactivado');
    };
    
    return handlers;
  }
}