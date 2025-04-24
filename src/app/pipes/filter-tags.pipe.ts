import { Pipe, PipeTransform } from '@angular/core';

// Define interfaces for better type safety
export interface DicomTag {
  tag: string;
  value: string;
  description?: string;
  category?: string;
}

export interface TagCategory {
  name: string;
  tags: string[];
}

@Pipe({
  name: 'filterTags',
  standalone: true
})
export class FilterTagsPipe implements PipeTransform {
  // Tag categories for better organization
  private static readonly TAG_CATEGORIES: TagCategory[] = [
    {
      name: 'Información del Paciente',
      tags: ['x00100010', 'x00100020', 'x00100030', 'x00100040', 'x00101010', 'x00101000']
    },
    {
      name: 'Información del Estudio',
      tags: ['x00080020', 'x00080030', 'x00080050', 'x00080090', 'x00081030', 'x0020000D', 'x00080021', 'x00080022', 'x00080023', 'x00080031', 'x00080032', 'x00080033', 'x00081040']
    },
    {
      name: 'Información de la Serie',
      tags: ['x00080060', 'x0008103E', 'x00200011', 'x0020000E', 'x00080068']
    },
    {
      name: 'Información de la Imagen',
      tags: ['x00200013', 'x00280010', 'x00280011', 'x00280030', 'x00280100', 'x00280101', 'x00280102', 'x00280103', 'x00280004', 'x00280002', 'x00280120', 'x00280121', 'x00281040', 'x00281050', 'x00281051', 'x00281052', 'x00281053', 'x00281054', 'x00281055', 'x00281056']
    },
    {
      name: 'Información del Equipo',
      tags: ['x00080070', 'x00080080', 'x00081090', 'x00181000', 'x00181020']
    },
    {
      name: 'Información de Adquisición',
      tags: ['x00180050', 'x00180088', 'x00181100', 'x00201041', 'x00180060', 'x00181110', 'x00181111', 'x00181114', 'x00181150', 'x00181151', 'x00181152', 'x00181153', 'x00181190', 'x00181191', 'x001811a0', 'x001811a2', 'x00185101']
    },
    {
      name: 'Información DICOM',
      tags: ['x00020000', 'x00020001', 'x00020002', 'x00020003', 'x00020010', 'x00020012', 'x00020013', 'x00020016', 'x00080005', 'x00080008', 'x00080016', 'x00080018']
    },
    {
      name: 'Información de Mamografía',
      tags: ['x00180015', 'x00181147', 'x00181164', 'x00181400', 'x00181401', 'x00181405', 'x00181508', 'x00181510', 'x00181700', 'x00181702', 'x00181704', 'x00181706', 'x00181708', 'x00187004', 'x00187006', 'x0018700a', 'x00187030', 'x00187032', 'x00187034', 'x00187050', 'x00187060', 'x00187062', 'x00187064', 'x00551000', 'x00551001', 'x00551008', 'x00551009']
    }
  ];

  // Standard tag descriptions
  private static readonly TAG_DESCRIPTIONS: { [tag: string]: string } = {
    // DICOM File Meta Information
    'x00020000': 'Grupo de longitud de metainformación',
    'x00020001': 'Versión de metainformación',
    'x00020002': 'UID de clase de SOP de medios',
    'x00020003': 'UID de instancia de SOP de medios',
    'x00020010': 'Sintaxis de transferencia UID',
    'x00020012': 'UID de implementación de clase',
    'x00020013': 'Versión de implementación',
    'x00020016': 'Nombre de estación de origen AE',
    
    // Patient Information
    'x00100010': 'Nombre del paciente',
    'x00100020': 'ID del paciente',
    'x00100030': 'Fecha de nacimiento',
    'x00100040': 'Sexo',
    'x00101010': 'Edad del paciente',
    'x00101000': 'Otros nombres del paciente',
    
    // Study Information
    'x00080020': 'Fecha del estudio',
    'x00080021': 'Fecha de serie',
    'x00080022': 'Fecha de adquisición',
    'x00080023': 'Fecha de contenido',
    'x00080030': 'Hora del estudio',
    'x00080031': 'Hora de serie',
    'x00080032': 'Hora de adquisición',
    'x00080033': 'Hora de contenido',
    'x00080050': 'Número de acceso',
    'x00080090': 'Médico referente',
    'x00081030': 'Descripción del estudio',
    'x00081040': 'Nombre institucional del departamento',
    'x0020000D': 'UID del estudio',
    
    // Series Information
    'x00080060': 'Modalidad',
    'x0008103E': 'Descripción de la serie',
    'x00200011': 'Número de serie',
    'x0020000E': 'UID de la serie',
    'x00080068': 'Tipo de presentación',
    
    // Image Information
    'x00200013': 'Número de instancia',
    'x00280010': 'Filas',
    'x00280011': 'Columnas',
    'x00280030': 'Espaciado de píxeles',
    'x00280100': 'Bits almacenados',
    'x00280101': 'Bits asignados',
    'x00280102': 'Bit alto',
    'x00280103': 'Representación de píxeles',
    'x00280002': 'Muestras por píxel',
    'x00280004': 'Interpretación fotométrica',
    'x00280120': 'Valor de píxel pequeño',
    'x00280121': 'Valor de píxel grande',
    'x00281040': 'Transformación de píxel',
    'x00281050': 'Ventana central',
    'x00281051': 'Ancho de ventana',
    'x00281052': 'Función de rescalado de intercepto',
    'x00281053': 'Función de rescalado de pendiente',
    'x00281054': 'Tipo de unidades de rescalado',
    'x00281055': 'Tipo de ventana',
    'x00281056': 'Función de forma de ventana',
    
    // Equipment Information
    'x00080070': 'Fabricante',
    'x00080080': 'Institución',
    'x00081090': 'Modelo del equipo',
    'x00181000': 'Número de serie del dispositivo',
    'x00181020': 'Versión de software',
    
    // Acquisition Information
    'x00180050': 'Grosor de corte',
    'x00180060': 'KVP',
    'x00180088': 'Espaciado entre cortes',
    'x00181100': 'Diámetro de reconstrucción',
    'x00201041': 'Posición del corte',
    'x00181110': 'Distancia fuente-detector',
    'x00181111': 'Distancia fuente-paciente',
    'x00181114': 'Estimación de dosis',
    'x00181150': 'Corriente de exposición',
    'x00181151': 'Tiempo de exposición',
    'x00181152': 'Exposición',
    'x00181153': 'Exposición en μAs',
    'x00181190': 'Punto focal',
    'x00181191': 'Material del ánodo',
    'x001811a0': 'Cuerpo parte de espesor',
    'x001811a2': 'Fuerza de compresión',
    
    // Mammography Specific
    'x00180015': 'Parte del cuerpo examinada',
    'x00181147': 'Campo de vista de forma',
    'x00181164': 'Tamaño de píxel del detector',
    'x00181400': 'Tipo de procesamiento de adquisición',
    'x00181401': 'Versión de procesamiento de adquisición',
    'x00181405': 'Dosis relativa de rayos X',
    'x00181508': 'Posicionador tipo',
    'x00181510': 'Ángulo del posicionador',
    'x00181700': 'Forma del colimador',
    'x00181702': 'Borde izquierdo del colimador',
    'x00181704': 'Borde derecho del colimador',
    'x00181706': 'Borde superior del colimador',
    'x00181708': 'Borde inferior del colimador',
    'x00185101': 'Vista de posición',
    'x00187004': 'Tipo de detector',
    'x00187006': 'Descripción del detector',
    'x0018700a': 'Configuración del detector',
    'x00187030': 'Campo de vista',
    'x00187032': 'Diámetro del campo de vista',
    'x00187034': 'Filtro de campo',
    'x00187050': 'Tipo de filtro',
    'x00187060': 'Modo de control de exposición',
    'x00187062': 'Descripción del control de exposición',
    'x00187064': 'Modo de control de exposición',
    'x00551000': 'Vista de posición (Privado)',
    'x00551001': 'Dosis de exposición (Privado)',
    'x00551008': 'Espesor de compresión (Privado)',
    'x00551009': 'Ancho de región de interés (Privado)',
    
    // Additional tags from your list
    'x00080005': 'Conjunto de caracteres específico',
    'x00080008': 'Tipo de imagen',
    'x00080016': 'UID de clase SOP',
    'x00080018': 'UID de instancia SOP',
    'x00081010': 'Nombre de la estación',
    'x00081032': 'Código de procedimiento',
    'x00081050': 'Médico que realiza el estudio',
    'x00081070': 'Operador',
    'x00081111': 'Secuencia de referencia',
    'x00081250': 'Secuencia de estudios relacionados',
    'x00082112': 'Secuencia de códigos de origen',
    'x00082218': 'Secuencia de códigos anatómicos',
    'x00200010': 'ID del estudio',
    'x00200020': 'Orientación del paciente',
    'x00200062': 'Lateralidad de imagen',
    'x00280300': 'Calidad de imagen',
    'x00280301': 'Estado de quemado',
    'x00281300': 'Estado de implante',
    'x00282110': 'Función de LUT',
    'x00283010': 'Secuencia de LUT',
    'x00321033': 'Solicitante',
    'x00400254': 'Tipo de examen realizado',
    'x00400275': 'Secuencia de solicitud',
    'x00400306': 'Distancia',
    'x00400316': 'Dosis de órgano',
    'x00400318': 'Órgano expuesto',
    'x00400555': 'Número de adquisición',
    'x00408302': 'Dosis de entrada',
    'x00540220': 'Secuencia de vista',
    'x00550010': 'Etiqueta privada',
    'x0055100a': 'Altura de región de interés (Privado)',
    'x0055100b': 'Posición X de región de interés (Privado)',
    'x0055100c': 'Posición Y de región de interés (Privado)',
    'x0055100d': 'Valor de pre-exposición (Privado)',
    'x0055100e': 'Valor de exposición principal (Privado)',
    'x00551010': 'Tipo de paleta (Privado)',
    'x00551012': 'Densidad de tejido (Privado)',
    'x00551013': 'Umbral bajo (Privado)',
    'x00551014': 'Umbral alto (Privado)',
    'x00551015': 'Valor bajo (Privado)',
    'x00551016': 'Valor alto (Privado)',
    'x00551017': 'Modo de procesamiento (Privado)',
    'x00551018': 'Modo de filtro (Privado)',
    'x00551019': 'Nivel de filtro (Privado)',
    'x0055101a': 'Dosis de pre-exposición (Privado)',
    'x0055101b': 'Composición de tejido (Privado)',
    'x0055101c': 'Modo de compresión (Privado)',
    'x20500020': 'Presentación LUT secuencia'
  };

  // Main transform method for filtering
  transform(items: { tag: string; value: string }[], searchText: string): DicomTag[] {
    if (!items) {
      return [];
    }
    
    // Convert to DicomTag objects with descriptions and categories
    const dicomTags = items.map(item => this.enrichTag(item));
    
    // Apply search filter if provided
    if (searchText) {
      searchText = searchText.toLowerCase();
      return dicomTags.filter(item => {
        return item.tag.toLowerCase().includes(searchText) || 
               item.value.toLowerCase().includes(searchText) ||
               (item.description && item.description.toLowerCase().includes(searchText));
      });
    }
    
    return dicomTags;
  }
  
  // Static method to get tag description
  static getTagDescription(tag: string): string {
    return this.TAG_DESCRIPTIONS[tag.toLowerCase()] || 'Tag desconocido';
  }
  
  // Static method to get tag category
  static getTagCategory(tag: string): string {
    const tagLower = tag.toLowerCase();
    for (const category of this.TAG_CATEGORIES) {
      if (category.tags.some(t => t.toLowerCase() === tagLower)) {
        return category.name;
      }
    }
    return 'Otros';
  }
  
  // Static method to get all categories
  static getAllCategories(): string[] {
    return this.TAG_CATEGORIES.map(category => category.name).concat(['Otros']);
  }
  
  // Helper method to enrich a tag with description and category
  private enrichTag(item: { tag: string; value: string }): DicomTag {
    return {
      tag: item.tag,
      value: item.value,
      description: FilterTagsPipe.getTagDescription(item.tag),
      category: FilterTagsPipe.getTagCategory(item.tag)
    };
  }
}