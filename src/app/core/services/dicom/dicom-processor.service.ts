import { Injectable } from '@angular/core';
import { DicomTag, FilterTagsPipe } from '../../../pipes/filter-tags.pipe';
import * as dicomParser from 'dicom-parser';

@Injectable({
  providedIn: 'root'
})
export class DicomProcessorService {
  constructor() { }
  
  // Extract all DICOM tags from a dataset
  extractAllDicomTags(dataSet: any): DicomTag[] {
    const allTags: DicomTag[] = [];
    const elements = dataSet.elements;
    
    try {
      Object.keys(elements).forEach(tag => {
        try {
          // Skip pixel data as it's too large
          if (tag === 'x7fe00010') return;
          
          // Normalize tag to lowercase for consistent lookup
          const normalizedTag = tag.toLowerCase();
          
          let value = '';
          
          // Try to get the value as a string
          try {
            value = dataSet.string(tag) || '';
            
            // Format patient name by replacing ^ with spaces
            if (normalizedTag === 'x00100010') {
              value = value.replace(/\^/g, ' ');
            }
            
            // Format dates (YYYYMMDD to DD/MM/YYYY)
            if (['x00080020', 'x00100030'].includes(normalizedTag) && value.length === 8) {
              const year = value.substring(0, 4);
              const month = value.substring(4, 6);
              const day = value.substring(6, 8);
              value = `${day}/${month}/${year}`;
            }
            
            // Format times (HHMMSS to HH:MM:SS)
            if (normalizedTag === 'x00080030' && value.length >= 6) {
              const hour = value.substring(0, 2);
              const minute = value.substring(2, 4);
              const second = value.substring(4, 6);
              value = `${hour}:${minute}:${second}`;
            }
          } catch (e) {
            // If we can't get it as a string, try to describe the element
            value = '[Datos binarios]';
          }
          
          // Add the tag and its value to our list with description and category
          allTags.push({
            tag: normalizedTag,
            value,
            description: FilterTagsPipe.getTagDescription(normalizedTag),
            category: FilterTagsPipe.getTagCategory(normalizedTag)
          });
        } catch (e) {
          console.warn(`Error al leer tag ${tag}:`, e);
        }
      });
    } catch (e) {
      console.error('Error al extraer todos los tags DICOM:', e);
    }
    
    return allTags;
  }
  
  // Parse a DICOM file and extract metadata
  parseDicomFile(arrayBuffer: ArrayBuffer): { isValid: boolean; dataSet?: any; error: string } {
    try {
      const byteArray = new Uint8Array(arrayBuffer);
      const dicmHeader = new TextDecoder().decode(byteArray.slice(128, 132));
      
      if (dicmHeader !== 'DICM') {
        return { isValid: false, error: 'El archivo seleccionado no es un DICOM válido.' };
      }
      
      const dataSet = dicomParser.parseDicom(byteArray);
      return { isValid: true, dataSet, error: '' };
    } catch (error: any) {
      return { 
        isValid: false, 
        error: 'Error al procesar el archivo DICOM: ' + (error.message || 'Error desconocido') 
      };
    }
  }
}