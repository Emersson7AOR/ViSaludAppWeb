import * as cornerstone from 'cornerstone-core';
import { ToolHandler } from './tool-handler.interface';
import { jsPDF } from 'jspdf';

export enum DownloadFormat {
  JPG = 'jpg',
  PNG = 'png',
  PDF = 'pdf'
}

export class DownloadHandler implements ToolHandler {
  getName(): string {
    return 'Download';
  }

  getCursor(): string {
    return 'pointer';
  }

  isCompatibleWith(toolName: string): boolean {
    return true; // Compatible con todas las herramientas
  }

  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener } {
    // No necesitamos manejadores de eventos para esta herramienta
    return {};
  }

  /**
   * Descarga la imagen actual en el formato especificado
   * @param element Elemento HTML que contiene la imagen DICOM
   * @param format Formato de descarga (jpg, png, pdf)
   * @param filename Nombre del archivo sin extensión
   */
  downloadImage(element: HTMLElement, format: DownloadFormat, filename: string = 'dicom-image'): void {
    if (!element) {
      console.error('Elemento no disponible para descarga');
      return;
    }

    try {
      // Obtener la imagen renderizada del elemento
      const enabledElement = cornerstone.getEnabledElement(element);
      if (!enabledElement || !enabledElement.canvas) {
        console.error('No se encontró un canvas válido');
        return;
      }

      const canvas = enabledElement.canvas;
      
      // Crear un nuevo canvas con fondo blanco para evitar transparencia en JPG
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        console.error('No se pudo crear el contexto del canvas');
        return;
      }
      
      // Fondo blanco (solo para JPG)
      if (format === DownloadFormat.JPG) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }
      
      // Dibujar la imagen DICOM en el canvas temporal
      ctx.drawImage(canvas, 0, 0);

      // Manejar la descarga según el formato
      switch (format) {
        case DownloadFormat.JPG:
        case DownloadFormat.PNG:
          this.downloadCanvasAsImage(tempCanvas, format, filename);
          break;
        case DownloadFormat.PDF:
          this.downloadCanvasAsPDF(tempCanvas, filename);
          break;
        default:
          console.error('Formato de descarga no soportado');
      }
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  }

  private downloadCanvasAsImage(canvas: HTMLCanvasElement, format: DownloadFormat, filename: string): void {
    const mimeType = format === DownloadFormat.JPG ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.92); // 0.92 es la calidad para JPG
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private downloadCanvasAsPDF(canvas: HTMLCanvasElement, filename: string): void {
    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    });
    
    // Convertir el canvas a una imagen para el PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    
    // Calcular las dimensiones para ajustar la imagen al PDF
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    
    // Añadir la imagen al PDF
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    
    // Guardar el PDF
    pdf.save(`${filename}.pdf`);
  }
}