import * as cornerstone from 'cornerstone-core';

export interface ToolHandler {
  /**
   * Devuelve el nombre de la herramienta
   */
  getName(): string;
  
  /**
   * Devuelve el estilo de cursor CSS a usar cuando esta herramienta está activa
   */
  getCursor(): string;
  
  /**
   * Verifica si esta herramienta es compatible con otra herramienta
   * @param toolName El nombre de la otra herramienta para verificar compatibilidad
   */
  isCompatibleWith(toolName: string): boolean;
  
  /**
   * Devuelve los manejadores de eventos para esta herramienta
   * @param element El elemento habilitado para cornerstone
   */
  getEventHandlers(element: HTMLElement): { [eventType: string]: EventListener };
}