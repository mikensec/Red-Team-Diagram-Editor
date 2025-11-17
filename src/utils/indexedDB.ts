// IndexedDB utilities for storing node attachments
const DB_NAME = 'RedTeamDiagramDB';
const STORE_NAME = 'attachments';
const DB_VERSION = 1;

interface AttachmentData {
  id: string;
  nodeId: string;
  data: string; // base64 encoded
  size: number;
  createdAt: number;
}

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('nodeId', 'nodeId', { unique: false });
      }
    };
  });
};

export const saveAttachment = async (
  id: string,
  nodeId: string,
  data: string
): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const attachmentData: AttachmentData = {
      id,
      nodeId,
      data,
      size: data.length,
      createdAt: Date.now(),
    };
    
    const request = store.put(attachmentData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save attachment'));
  });
};

export const getAttachment = async (id: string): Promise<string | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => {
      const result = request.result as AttachmentData | undefined;
      resolve(result?.data || null);
    };
    
    request.onerror = () => reject(new Error('Failed to retrieve attachment'));
  });
};

export const deleteAttachment = async (id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete attachment'));
  });
};

export const deleteNodeAttachments = async (nodeId: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('nodeId');
    const request = index.openCursor(IDBKeyRange.only(nodeId));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = () => reject(new Error('Failed to delete node attachments'));
  });
};

export const clearAllAttachments = async (): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear attachments'));
  });
};

export const getAllAttachments = async (): Promise<AttachmentData[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Failed to get all attachments'));
  });
};
