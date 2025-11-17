import { Diagram } from '@/types/Diagram';
import { saveAttachment, getAttachment, getAllAttachments } from './indexedDB';
import { isValidUrl } from './validation';
import { DiagramSchema } from './diagramSchema';
import { z } from 'zod';

const STORAGE_KEY = 'red-team-diagram';

export const saveDiagram = (diagram: Diagram): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram));
  } catch (error) {
    console.error('Failed to save diagram:', error);
  }
};

export const loadDiagram = async (): Promise<Diagram | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const diagram = JSON.parse(stored) as Diagram;
    
    // Don't load image data here - will be lazy loaded when viewed
    // Image attachments will have metadata (id, name, type, createdAt) but no data field
    
    return diagram;
  } catch (error) {
    console.error('Failed to load diagram:', error);
    return null;
  }
};

export const exportDiagram = async (diagram: Diagram): Promise<void> => {
  // Create a copy with embedded image data
  const exportDiagram = JSON.parse(JSON.stringify(diagram));
  
  // Embed image attachments for export
  for (const node of exportDiagram.nodes) {
    if (node.data.attachments) {
      for (const attachment of node.data.attachments) {
        if (attachment.type === 'image' && !attachment.data) {
          const data = await getAttachment(attachment.id);
          if (data) {
            attachment.data = data;
          }
        }
      }
    }
  }

  const dataStr = JSON.stringify(exportDiagram, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `attack-diagram-${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importDiagram = (file: File): Promise<Diagram> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Parse JSON
        const rawData = JSON.parse(e.target?.result as string);
        
        // Validate against schema
        let diagram: Diagram;
        try {
          diagram = DiagramSchema.parse(rawData) as Diagram;
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Format validation errors for user
            const errorMessages = error.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join('; ');
            reject(new Error(`Invalid diagram format: ${errorMessages}`));
            return;
          }
          throw error;
        }
        
        // Additional security validation for link URLs
        for (const node of diagram.nodes) {
          if (node.data.attachments) {
            // Filter out attachments with invalid URLs
            node.data.attachments = node.data.attachments.filter((attachment) => {
              // Validate link URLs for security
              if (attachment.type === 'link') {
                if (!attachment.url || !isValidUrl(attachment.url)) {
                  console.warn(`Unsafe URL protocol in attachment ${attachment.id}, removing`);
                  return false;
                }
              }
              
              // Save valid image attachments to IndexedDB
              if (attachment.type === 'image' && attachment.data) {
                saveAttachment(attachment.id, node.id, attachment.data).catch((err) => {
                  console.error(`Failed to save attachment ${attachment.id}:`, err);
                });
              }
              
              return true;
            });
            
            // Clean up empty attachments array
            if (node.data.attachments.length === 0) {
              node.data.attachments = undefined;
            }
          }
        }
        
        resolve(diagram);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON file: file is not valid JSON'));
        } else if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Failed to import diagram'));
        }
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
