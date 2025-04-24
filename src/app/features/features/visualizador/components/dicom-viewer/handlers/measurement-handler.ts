import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';

export class MeasurementHandler {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  // Método para activar la herramienta de medición de longitud
  activateLengthTool(): void {
    cornerstoneTools.setToolActive('Length', { mouseButtonMask: 1 });
  }

  // Método para activar la herramienta de medición de elipse
  activateEllipticalRoiTool(): void {
    cornerstoneTools.setToolActive('EllipticalRoi', { mouseButtonMask: 1 });
  }

  // Método para activar la herramienta de medición de rectángulo
  activateRectangleRoiTool(): void {
    cornerstoneTools.setToolActive('RectangleRoi', { mouseButtonMask: 1 });
  }

  // Método para activar la herramienta de medición de círculo
  activateCircleRoiTool(): void {
    cornerstoneTools.setToolActive('CircleRoi', { mouseButtonMask: 1 });
  }

  // Método para limpiar todas las mediciones
  clearMeasurements(): void {
    const toolStateManager = cornerstoneTools.getElementToolStateManager(this.element);
    
    // Limpiar mediciones de longitud
    toolStateManager.clear(this.element, 'Length');
    
    // Limpiar mediciones de elipse
    toolStateManager.clear(this.element, 'EllipticalRoi');
    
    // Limpiar mediciones de rectángulo
    toolStateManager.clear(this.element, 'RectangleRoi');
    
    // Limpiar mediciones de círculo
    toolStateManager.clear(this.element, 'CircleRoi');
    
    // Actualizar la visualización
    cornerstone.updateImage(this.element);
  }

  // Método para obtener todas las mediciones actuales
  getMeasurements(): any[] {
    const toolStateManager = cornerstoneTools.getElementToolStateManager(this.element);
    const measurements: any[] = [];
    
    // Obtener mediciones de longitud
    const lengthState = toolStateManager.get(this.element, 'Length');
    if (lengthState && lengthState.data) {
      lengthState.data.forEach((data: any) => {
        measurements.push({
          type: 'Length',
          data: data
        });
      });
    }
    
    // Obtener mediciones de elipse
    const ellipseState = toolStateManager.get(this.element, 'EllipticalRoi');
    if (ellipseState && ellipseState.data) {
      ellipseState.data.forEach((data: any) => {
        measurements.push({
          type: 'EllipticalRoi',
          data: data
        });
      });
    }
    
    // Obtener mediciones de rectángulo
    const rectangleState = toolStateManager.get(this.element, 'RectangleRoi');
    if (rectangleState && rectangleState.data) {
      rectangleState.data.forEach((data: any) => {
        measurements.push({
          type: 'RectangleRoi',
          data: data
        });
      });
    }
    
    // Obtener mediciones de círculo
    const circleState = toolStateManager.get(this.element, 'CircleRoi');
    if (circleState && circleState.data) {
      circleState.data.forEach((data: any) => {
        measurements.push({
          type: 'CircleRoi',
          data: data
        });
      });
    }
    
    return measurements;
  }
}