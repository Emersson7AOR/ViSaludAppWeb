import * as cornerstone from 'cornerstone-core';
import { ToolHandler } from './tool-handler.interface';

export class OrientationHandler implements ToolHandler {
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private rotationAngle = 0;
  private isFlippedHorizontally = false;
  private isFlippedVertically = false;

  getName(): string {
    return 'Orientation';
  }

  getCursor(): string {
    return 'move';
  }

  isCompatibleWith(toolName: string): boolean {
    // Compatible with all tools except Pan
    return toolName !== 'Pan';
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    const handlers: { [eventType: string]: EventListener } = {};
    
    handlers['mousedown'] = (event: Event) => {
      const e = event as MouseEvent;
      if (e.button !== 0) return; // Solo botón izquierdo
      
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    handlers['mousemove'] = (event: Event) => {
      const e = event as MouseEvent;
      
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.lastX;
      const deltaY = e.clientY - this.lastY;
      
      // Usar deltaX para rotación
      if (Math.abs(deltaX) > 5) {
        this.rotateImage(element, deltaX > 0 ? 1 : -1);
        this.lastX = e.clientX;
      }
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    handlers['mouseup'] = (event: Event) => {
      this.isDragging = false;
    };
    
    handlers['mouseleave'] = (event: Event) => {
      this.isDragging = false;
    };
    
    handlers['dblclick'] = (event: Event) => {
      // Doble clic para restablecer la orientación
      this.resetOrientation(element);
      
      event.preventDefault();
      event.stopPropagation();
    };
    
    // Teclas para voltear la imagen
    handlers['keydown'] = (event: Event) => {
      const e = event as KeyboardEvent;
      
      if (e.key === 'h' || e.key === 'H') {
        // Voltear horizontalmente
        this.flipHorizontally(element);
        e.preventDefault();
      } else if (e.key === 'v' || e.key === 'V') {
        // Voltear verticalmente
        this.flipVertically(element);
        e.preventDefault();
      } else if (e.key === 'r' || e.key === 'R') {
        // Rotar 90 grados
        this.rotate90(element);
        e.preventDefault();
      }
    };
    
    return handlers;
  }
  
  private rotateImage(element: HTMLElement, direction: number): void {
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Rotar 5 grados en la dirección especificada
      this.rotationAngle += direction * 5;
      viewport.rotation = this.rotationAngle;
      
      cornerstone.setViewport(element, viewport);
      cornerstone.updateImage(element);
      
      console.log(`Imagen rotada a ${this.rotationAngle} grados`);
    } catch (error) {
      console.error('Error al rotar la imagen:', error);
    }
  }
  
  private rotate90(element: HTMLElement): void {
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Rotar 90 grados
      this.rotationAngle = (this.rotationAngle + 90) % 360;
      viewport.rotation = this.rotationAngle;
      
      cornerstone.setViewport(element, viewport);
      cornerstone.updateImage(element);
      
      console.log(`Imagen rotada a ${this.rotationAngle} grados`);
    } catch (error) {
      console.error('Error al rotar la imagen 90 grados:', error);
    }
  }
  
  private flipHorizontally(element: HTMLElement): void {
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Cambiar el estado de volteo horizontal
      this.isFlippedHorizontally = !this.isFlippedHorizontally;
      viewport.hflip = this.isFlippedHorizontally;
      
      cornerstone.setViewport(element, viewport);
      cornerstone.updateImage(element);
      
      console.log(`Volteo horizontal: ${this.isFlippedHorizontally}`);
    } catch (error) {
      console.error('Error al voltear horizontalmente la imagen:', error);
    }
  }
  
  private flipVertically(element: HTMLElement): void {
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Cambiar el estado de volteo vertical
      this.isFlippedVertically = !this.isFlippedVertically;
      viewport.vflip = this.isFlippedVertically;
      
      cornerstone.setViewport(element, viewport);
      cornerstone.updateImage(element);
      
      console.log(`Volteo vertical: ${this.isFlippedVertically}`);
    } catch (error) {
      console.error('Error al voltear verticalmente la imagen:', error);
    }
  }
  
  private resetOrientation(element: HTMLElement): void {
    try {
      const viewport = cornerstone.getViewport(element);
      
      // Restablecer todos los parámetros de orientación
      this.rotationAngle = 0;
      this.isFlippedHorizontally = false;
      this.isFlippedVertically = false;
      
      viewport.rotation = 0;
      viewport.hflip = false;
      viewport.vflip = false;
      
      cornerstone.setViewport(element, viewport);
      cornerstone.updateImage(element);
      
      console.log('Orientación de imagen restablecida');
    } catch (error) {
      console.error('Error al restablecer la orientación de la imagen:', error);
    }
  }
}