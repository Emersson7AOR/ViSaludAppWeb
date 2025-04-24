export abstract class DicomTool {
  abstract name: string;
  abstract cursor: string;
  abstract createHandlers(element: HTMLElement): { [eventType: string]: EventListener };
  
  isCompatibleWith(otherTool: string): boolean {
    // Lógica de compatibilidad entre herramientas
    return true;
  }
}