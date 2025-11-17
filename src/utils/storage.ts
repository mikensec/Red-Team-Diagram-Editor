import { Diagram } from '@/types/Diagram';
import { saveAttachment, getAttachment, getAllAttachments } from './indexedDB';
import { isValidUrl } from './validation';

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
    
    // Load image attachments from IndexedDB
    for (const node of diagram.nodes) {
      if (node.data.attachments) {
        for (const attachment of node.data.attachments) {
          if (attachment.type === 'image') {
            const data = await getAttachment(attachment.id);
            if (data) {
              attachment.data = data;
            }
          }
        }
      }
    }
    
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
        const diagram = JSON.parse(e.target?.result as string) as Diagram;
        
        // Validate and sanitize imported data
        if (!diagram.nodes || !Array.isArray(diagram.nodes)) {
          reject(new Error('Invalid diagram format: missing nodes array'));
          return;
        }
        
        if (!diagram.edges || !Array.isArray(diagram.edges)) {
          reject(new Error('Invalid diagram format: missing edges array'));
          return;
        }
        
        // Save image attachments to IndexedDB and validate link URLs
        for (const node of diagram.nodes) {
          if (node.data.attachments) {
            // Validate attachments array
            if (!Array.isArray(node.data.attachments)) {
              console.warn(`Invalid attachments format for node ${node.id}, skipping`);
              node.data.attachments = [];
              continue;
            }

            // Filter out invalid attachments
            node.data.attachments = node.data.attachments.filter((attachment) => {
              // Validate link URLs for security
              if (attachment.type === 'link') {
                if (!attachment.url || !isValidUrl(attachment.url)) {
                  console.warn(`Invalid or unsafe URL in attachment ${attachment.id}, removing`);
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
          }
        }
        
        resolve(diagram);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
