import * as cornerstone from 'cornerstone-core';
import { ToolHandler } from './tool-handler.interface';

export class WindowLevelHandler implements ToolHandler {
  private isAdjusting = false;
  private lastPoint: { x: number, y: number } | null = null;

  getName(): string {
    return 'Wwwc';
  }

  getCursor(): string {
    return 'move';
  }

  isCompatibleWith(toolName: string): boolean {
    // No es compatible con Pan ni con Length (medición)
    return toolName !== 'Pan' && toolName !== 'Length';
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    const handlers: { [eventType: string]: EventListener } = {};
    
    handlers['mousedown'] = (event: Event) => {
      const e = event as MouseEvent;
      // Solo procesar si se presiona el botón izquierdo
      if (e.button !== 0) return;
      
      this.isAdjusting = true;
      this.lastPoint = { x: e.clientX, y: e.clientY };
      console.log('WindowLevel: mouseDown activado', this.lastPoint);
    };

    handlers['mousemove'] = (event: Event) => {
      const e = event as MouseEvent;
      
      // Si estamos ajustando, establecer el cursor y prevenir eventos predeterminados
      if (this.isAdjusting) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.lastPoint) return;
        
        try {
          const enabledElement = cornerstone.getEnabledElement(element);
          if (!enabledElement || !enabledElement.image) return;
          
          const viewport = cornerstone.getViewport(element);
          
          // Calcular cambios en window width y window center
          const deltaX = e.clientX - this.lastPoint.x;
          const deltaY = e.clientY - this.lastPoint.y;
          
          // Ajustar sensibilidad basada en los valores actuales
          const wwBase = Math.max(viewport.voi.windowWidth, 1);
          const wcBase = Math.max(Math.abs(viewport.voi.windowCenter), 1);
          
          const wwSensitivity = wwBase * 0.01;
          const wcSensitivity = wcBase * 0.01;
          
          viewport.voi.windowWidth += (deltaX * wwSensitivity);
          viewport.voi.windowCenter -= (deltaY * wcSensitivity);
          
          if (viewport.voi.windowWidth < 1) {
            viewport.voi.windowWidth = 1;
          }
          
          viewport.voiLUT = undefined;
          
          cornerstone.setViewport(element, viewport);
          cornerstone.updateImage(element);
          
          this.lastPoint = { x: e.clientX, y: e.clientY };
        } catch (error) {
          console.warn('WindowLevel error:', error);
        }
      }
    };

    handlers['mouseup'] = (event: Event) => {
      if (!this.isAdjusting) return;
      
      this.isAdjusting = false;
      this.lastPoint = null;
      console.log('WindowLevel: mouseUp, ajuste finalizado');
    };

    handlers['mouseleave'] = (event: Event) => {
      if (!this.isAdjusting) return;
      
      this.isAdjusting = false;
      this.lastPoint = null;
      console.log('WindowLevel: mouseLeave, ajuste finalizado');
    };
    
    return handlers;
  }
}