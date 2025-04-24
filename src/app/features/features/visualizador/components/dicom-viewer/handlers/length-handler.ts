import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { ToolHandler } from './tool-handler.interface';

export class LengthHandler implements ToolHandler {
  private isMeasuring = false;
  private startPoint: { x: number, y: number, imageX: number, imageY: number } | null = null;
  private currentPoint: { x: number, y: number, imageX: number, imageY: number } | null = null;
  private measurementLine: any = null;

  getName(): string {
    return 'Length';
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
    
    // Función para convertir coordenadas de pantalla a coordenadas de imagen
    const getImageCoordinates = (element: HTMLElement, clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const pageX = clientX - rect.left;
      const pageY = clientY - rect.top;
      
      try {
        const pt = cornerstone.pageToPixel(element, pageX, pageY);
        return { x: pt.x, y: pt.y };
      } catch (error) {
        console.warn('Error al convertir coordenadas:', error);
        return { x: 0, y: 0 };
      }
    };
    
    // Función para calcular la distancia entre dos puntos
    const calculateDistance = (point1: { x: number, y: number }, point2: { x: number, y: number }) => {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Función para dibujar la línea de medición
    const drawMeasurementLine = () => {
      if (!this.startPoint || !this.currentPoint) return;
      
      // Obtener el contexto de dibujo
      const enabledElement = cornerstone.getEnabledElement(element);
      if (!enabledElement || !enabledElement.canvas) return;
      
      // Limpiar cualquier dibujo anterior
      cornerstone.updateImage(element);
      
      // Obtener el contexto y configurar el estilo
      const context = enabledElement.canvas.getContext('2d');
      if (!context) return;
      
      // Convertir coordenadas de imagen a coordenadas de pantalla
      const startCanvas = cornerstone.pixelToCanvas(element, this.startPoint);
      const endCanvas = cornerstone.pixelToCanvas(element, this.currentPoint);
      
      // Dibujar la línea
      context.beginPath();
      context.moveTo(startCanvas.x, startCanvas.y);
      context.lineTo(endCanvas.x, endCanvas.y);
      context.strokeStyle = 'yellow';
      context.lineWidth = 2;
      context.stroke();
      
      // Calcular la distancia en píxeles de la imagen
      const distanceInPixels = calculateDistance(
        { x: this.startPoint.imageX, y: this.startPoint.imageY },
        { x: this.currentPoint.imageX, y: this.currentPoint.imageY }
      );
      
      // Mostrar la medición
      const midPoint = {
        x: (startCanvas.x + endCanvas.x) / 2,
        y: (startCanvas.y + endCanvas.y) / 2
      };
      
      context.font = '14px Arial';
      context.fillStyle = 'yellow';
      context.textAlign = 'center';
      context.fillText(`${distanceInPixels.toFixed(2)} px`, midPoint.x, midPoint.y - 5);
      
      // Guardar la medición para referencia
      this.measurementLine = {
        start: this.startPoint,
        end: this.currentPoint,
        distance: distanceInPixels
      };
    };

    handlers['mousedown'] = (event: Event) => {
      const e = event as MouseEvent;
      // Solo procesar si se presiona el botón izquierdo
      if (e.button !== 0) return;
      
      this.isMeasuring = true;
      
      // Obtener coordenadas de imagen
      const imageCoords = getImageCoordinates(element, e.clientX, e.clientY);
      
      this.startPoint = {
        x: e.clientX,
        y: e.clientY,
        imageX: imageCoords.x,
        imageY: imageCoords.y
      };
      
      this.currentPoint = { ...this.startPoint };
      console.log('Medición: inicio en', this.startPoint);
    };

    handlers['mousemove'] = (event: Event) => {
      const e = event as MouseEvent;
      
      if (this.isMeasuring) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.startPoint) return;
        
        // Obtener coordenadas de imagen
        const imageCoords = getImageCoordinates(element, e.clientX, e.clientY);
        
        this.currentPoint = {
          x: e.clientX,
          y: e.clientY,
          imageX: imageCoords.x,
          imageY: imageCoords.y
        };
        
        // Dibujar la línea de medición
        drawMeasurementLine();
      }
    };

    handlers['mouseup'] = (event: Event) => {
      if (!this.isMeasuring) return;
      
      if (this.startPoint && this.currentPoint) {
        // Finalizar la medición
        try {
          // Guardar la medición en el estado de la herramienta
          if (this.measurementLine) {
            console.log('Medición completada:', this.measurementLine.distance.toFixed(2), 'px');
            
            // Opcional: Añadir la medición al estado de cornerstone
            try {
              const toolState = cornerstoneTools.getToolState(element, 'length') || {};
              if (!toolState.data) {
                toolState.data = [];
              }
              toolState.data.push(this.measurementLine);
              cornerstoneTools.addToolState(element, 'length', this.measurementLine);
            } catch (error) {
              console.warn('Error al guardar la medición:', error);
            }
          }
          
          // Mantener la línea visible
          drawMeasurementLine();
        } catch (error) {
          console.warn('Error al finalizar la medición:', error);
        }
      }
      
      this.isMeasuring = false;
    };

    handlers['mouseleave'] = (event: Event) => {
      if (!this.isMeasuring) return;
      
      this.isMeasuring = false;
      console.log('Medición: mouseLeave, medición finalizada');
    };
    
    return handlers;
  }
}