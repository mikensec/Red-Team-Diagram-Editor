import { Diagram } from '@/types/Diagram';

const STORAGE_KEY = 'red-team-diagram';

export const saveDiagram = (diagram: Diagram): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram));
  } catch (error) {
    console.error('Failed to save diagram:', error);
  }
};

export const loadDiagram = (): Diagram | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Diagram;
  } catch (error) {
    console.error('Failed to load diagram:', error);
    return null;
  }
};

export const exportDiagram = (diagram: Diagram): void => {
  const dataStr = JSON.stringify(diagram, null, 2);
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
    reader.onload = (e) => {
      try {
        const diagram = JSON.parse(e.target?.result as string) as Diagram;
        resolve(diagram);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
